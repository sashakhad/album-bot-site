/**
 * Length of a public Suno MP4.
 * Suno writes the movie header at the end, so one suffix range is enough.
 * Anything other than 206 is ignored so a full file is never downloaded.
 */

const MVHD = [0x6d, 0x76, 0x68, 0x64];

/** Finite media length, or the end of the seekable range once the browser knows it. */
export function knownMediaDuration(media) {
  if (Number.isFinite(media.duration) && media.duration > 0)
    return media.duration;
  if (media.seekable.length < 1) return null;
  const end = media.seekable.end(media.seekable.length - 1);
  if (!Number.isFinite(end) || end <= 0) return null;
  return end;
}

/** Last sane `mvhd` duration. A tail download still finds the header Suno writes at the end. */
export function mp4DurationSeconds(bytes) {
  if (!(bytes instanceof Uint8Array)) return null;
  let found = null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let index = 4; index + 24 < bytes.length; index += 1) {
    if (
      bytes[index] !== MVHD[0] ||
      bytes[index + 1] !== MVHD[1] ||
      bytes[index + 2] !== MVHD[2] ||
      bytes[index + 3] !== MVHD[3]
    ) {
      continue;
    }
    const version = bytes[index + 4];
    if (version !== 0 && version !== 1) continue;
    let timescale = 0;
    let duration = 0;
    if (version === 0) {
      if (index + 24 > bytes.length) continue;
      timescale = view.getUint32(index + 16);
      duration = view.getUint32(index + 20);
    } else {
      if (index + 36 > bytes.length) continue;
      timescale = view.getUint32(index + 24);
      duration = Number(view.getBigUint64(index + 28));
    }
    if (timescale < 1 || timescale > 1000000) continue;
    const seconds = duration / timescale;
    if (seconds >= 0.05 && seconds <= 60 * 60) found = seconds;
  }
  return found;
}

export async function remoteMp4Duration(url, fetchImpl) {
  const fetchRange = fetchImpl ?? (typeof fetch === "function" ? fetch : null);
  if (fetchRange === null) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetchRange(url, {
      headers: { Range: "bytes=-131072" },
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    if (response.status !== 206) {
      await response.body?.cancel();
      return null;
    }
    return mp4DurationSeconds(new Uint8Array(await response.arrayBuffer()));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
