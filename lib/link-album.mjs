/**
 * Decoder for album-kit link schema version 1.
 * Bytes stay in the fragment. This module never sends them anywhere.
 *
 *   u8 version = 1
 *   u8 flags (bit 0 artist, bit 1 cover reference)
 *   u8 album id length (8 or 16) + raw id bytes
 *   u8 title length + utf8 title
 *   [artist] [cover reference]
 *   u8 track count
 *   track: u8 number, title, u8 take count
 *   take: 16 byte UUID, u8 letter index, u8 media
 */

const FLAG_ARTIST = 1;
const FLAG_COVER = 2;
const VERSION = 1;
const COVER_PATTERN = /^[A-Za-z0-9_-]{1,48}$/;
const textDecoder = new TextDecoder("utf-8", { fatal: true });

export function scoreStorageKey(albumId) {
  return `album-link:${albumId}`;
}

export function takeLetter(index) {
  if (!Number.isInteger(index) || index < 1) {
    throw new Error("Take letter is out of range.");
  }
  let rest = index;
  let label = "";
  while (rest > 0) {
    rest -= 1;
    label = String.fromCharCode(65 + (rest % 26)) + label;
    rest = Math.floor(rest / 26);
  }
  return label;
}

export function mediaUrls(id, media) {
  const kind = media & 3;
  const host = media >> 2;
  const cdn = host === 0 ? 1 : host;
  const mp3 = `https://cdn${cdn}.suno.ai/${id}.mp3`;
  const mp4 = `https://cdn${cdn}.suno.ai/${id}.mp4`;
  if (kind === 2) return { url: mp4, fallbackUrl: mp3 };
  return { url: mp3, fallbackUrl: mp4 };
}

export async function decodeLinkFragment(fragment) {
  const value = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  const compressed = decodeBase64Url(value);
  if (compressed === null) return null;
  let inflated;
  try {
    const copy = new Uint8Array(compressed);
    const stream = new Blob([copy])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    inflated = new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
  try {
    return readAlbum(inflated);
  } catch {
    return null;
  }
}

export function parseScores(raw) {
  if (typeof raw !== "string" || raw.length === 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
  const scores = {};
  for (const [trackKey, takes] of Object.entries(parsed)) {
    if (!/^[1-9]\d*$/.test(trackKey)) continue;
    if (typeof takes !== "object" || takes === null || Array.isArray(takes)) continue;
    const next = {};
    for (const [takeId, score] of Object.entries(takes)) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(takeId)) {
        continue;
      }
      if (!Number.isInteger(score) || score < -99 || score > 99) continue;
      next[takeId] = score;
    }
    scores[trackKey] = next;
  }
  return scores;
}

export function changeScore(scores, trackNumber, takeId, delta) {
  if (!Number.isInteger(delta) || (delta !== 1 && delta !== -1)) return scores;
  const trackKey = String(trackNumber);
  const currentTrack = scores[trackKey];
  const nextTrack = {};
  if (typeof currentTrack === "object" && currentTrack !== null) {
    for (const [id, value] of Object.entries(currentTrack)) {
      if (typeof value === "number") nextTrack[id] = value;
    }
  }
  const current = nextTrack[takeId] ?? 0;
  const next = current + delta;
  if (!Number.isInteger(next) || next < -99 || next > 99) return scores;
  nextTrack[takeId] = next;
  const copy = {};
  for (const [key, value] of Object.entries(scores)) copy[key] = value;
  copy[trackKey] = nextTrack;
  return copy;
}

export function scoreFor(scores, trackNumber, takeId) {
  const track = scores[String(trackNumber)];
  if (typeof track !== "object" || track === null) return 0;
  const value = track[takeId];
  return typeof value === "number" ? value : 0;
}

export function formatScore(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function readAlbum(bytes) {
  const reader = new Reader(bytes);
  const version = reader.u8();
  if (version !== VERSION) throw new Error("Unsupported album link.");
  const flags = reader.u8();
  if ((flags & ~(FLAG_ARTIST | FLAG_COVER)) !== 0) throw new Error("Unknown flag.");
  const albumLength = reader.u8();
  if (albumLength !== 8 && albumLength !== 16) throw new Error("Album id length is invalid.");
  const id = hex(reader.raw(albumLength));
  const title = reader.text();
  const artist = (flags & FLAG_ARTIST) === 0 ? "" : reader.text();
  const coverRef = (flags & FLAG_COVER) === 0 ? null : reader.text();
  if (coverRef !== null && !COVER_PATTERN.test(coverRef)) throw new Error("Cover reference is invalid.");
  const trackCount = reader.u8();
  const tracks = [];
  const seenTakes = new Set();
  const seenTracks = new Set();
  for (let index = 0; index < trackCount; index += 1) {
    const number = reader.u8();
    if (number < 1 || seenTracks.has(number)) throw new Error("Track id is invalid.");
    seenTracks.add(number);
    const trackTitle = reader.text();
    const takeCount = reader.u8();
    const takes = [];
    const seenLetters = new Set();
    for (let takeIndex = 0; takeIndex < takeCount; takeIndex += 1) {
      const takeId = formatUuid(reader.raw(16));
      if (seenTakes.has(takeId)) throw new Error("Duplicate take id.");
      seenTakes.add(takeId);
      const letter = takeLetter(reader.u8());
      if (seenLetters.has(letter)) throw new Error("Duplicate take letter.");
      seenLetters.add(letter);
      const media = reader.u8();
      if ((media & 3) === 3) throw new Error("Take media is invalid.");
      const urls = mediaUrls(takeId, media);
      takes.push({ id: takeId, letter, url: urls.url, fallbackUrl: urls.fallbackUrl });
    }
    tracks.push({ number, title: trackTitle, takes });
  }
  if (!reader.finished()) throw new Error("Album link has trailing bytes.");
  return { id, title, artist, coverRef, tracks };
}

class Reader {
  constructor(bytes) {
    this.bytes = bytes;
    this.offset = 0;
  }

  u8() {
    const value = this.bytes[this.offset];
    if (value === undefined) throw new Error("Album link is truncated.");
    this.offset += 1;
    return value;
  }

  raw(length) {
    const end = this.offset + length;
    if (end > this.bytes.length) throw new Error("Album link is truncated.");
    const slice = this.bytes.slice(this.offset, end);
    this.offset = end;
    return slice;
  }

  text() {
    return textDecoder.decode(this.raw(this.u8()));
  }

  finished() {
    return this.offset === this.bytes.length;
  }
}

function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  let binary;
  try {
    binary = atob(padded);
  } catch {
    return null;
  }
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
  return out;
}

function hex(bytes) {
  let text = "";
  for (const byte of bytes) text += byte.toString(16).padStart(2, "0");
  return text;
}

function formatUuid(bytes) {
  const hexId = hex(bytes);
  return `${hexId.slice(0, 8)}-${hexId.slice(8, 12)}-${hexId.slice(12, 16)}-${hexId.slice(16, 20)}-${hexId.slice(20)}`;
}
