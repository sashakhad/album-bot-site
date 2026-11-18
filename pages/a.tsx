import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import {
  changeScore,
  decodeLinkFragment,
  formatScore,
  parseScores,
  scoreFor,
  scoreStorageKey,
} from "../lib/link-album.mjs";

type LinkTake = {
  id: string;
  letter: string;
  url: string;
  fallbackUrl: string;
};

type LinkTrack = {
  number: number;
  title: string;
  takes: LinkTake[];
};

type LinkAlbum = {
  id: string;
  title: string;
  artist: string;
  coverRef: string | null;
  tracks: LinkTrack[];
};

type ScoreMap = Record<string, Record<string, number>>;

type Playback = { trackNumber: number; takeId: string };

export default function AlbumLinkPage() {
  const [album, setAlbum] = useState<LinkAlbum | null>(null);
  const [problem, setProblem] = useState("Opening the album in this link.");
  const [scores, setScores] = useState<ScoreMap>({});
  const [persist, setPersist] = useState(false);
  const [current, setCurrent] = useState<Playback | null>(null);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failure, setFailure] = useState("");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const usedFallback = useRef(false);
  const albumRef = useRef<LinkAlbum | null>(null);
  const currentRef = useRef<Playback | null>(null);
  albumRef.current = album;
  currentRef.current = current;

  useEffect(() => {
    let cancel = false;

    async function load() {
      const fragment = window.location.hash.replace(/^#/, "");
      if (fragment.length === 0) {
        if (cancel) return;
        setAlbum(null);
        setPersist(false);
        setProblem("This link has no album in it.");
        return;
      }
      const decoded = (await decodeLinkFragment(fragment)) as LinkAlbum | null;
      if (cancel) return;
      if (decoded === null) {
        setAlbum(null);
        setPersist(false);
        setProblem("This link is damaged or from an older album page. Ask Album Bot for a new link.");
        return;
      }
      let stored: ScoreMap = {};
      try {
        stored = parseScores(window.localStorage.getItem(scoreStorageKey(decoded.id))) as ScoreMap;
      } catch {
        stored = {};
      }
      setScores(stored);
      setAlbum(decoded);
      setPersist(true);
      setProblem("");
      document.title = decoded.title;
    }

    void load();
    window.addEventListener("hashchange", load);
    return () => {
      cancel = true;
      window.removeEventListener("hashchange", load);
    };
  }, []);

  useEffect(() => {
    if (!persist || album === null) return;
    try {
      window.localStorage.setItem(scoreStorageKey(album.id), JSON.stringify(scores));
    } catch {
      // Ratings stay on this page when the browser blocks storage.
    }
  }, [album, persist, scores]);

  function findTake(trackNumber: number, takeId: string): { track: LinkTrack; take: LinkTake } | null {
    const page = albumRef.current;
    if (page === null) return null;
    for (const track of page.tracks) {
      if (track.number !== trackNumber) continue;
      for (const take of track.takes) {
        if (take.id === takeId) return { track, take };
      }
    }
    return null;
  }

  function bind(media: HTMLMediaElement) {
    media.ontimeupdate = () => setTime(media.currentTime);
    media.ondurationchange = () => {
      setDuration(Number.isFinite(media.duration) ? media.duration : 0);
    };
    media.onplaying = () => {
      setPlaying(true);
      setWaiting(false);
      setFailure("");
    };
    media.onwaiting = () => setWaiting(true);
    media.onpause = () => setPlaying(false);
    media.onended = () => {
      setPlaying(false);
      advance(false);
    };
    media.onerror = () => {
      const playingNow = currentRef.current;
      if (playingNow === null) return;
      const found = findTake(playingNow.trackNumber, playingNow.takeId);
      if (found !== null && !usedFallback.current) {
        usedFallback.current = true;
        startMedia(found.take.fallbackUrl);
        return;
      }
      setPlaying(false);
      setWaiting(false);
      setFailure("This take did not play. It may be unavailable.");
    };
  }

  function startMedia(url: string) {
    const mp4 = url.endsWith(".mp4");
    const currentMedia = mediaRef.current;
    const kind = mp4 ? "VIDEO" : "AUDIO";
    let media = currentMedia;
    if (media === null || media.tagName !== kind) {
      media = document.createElement(mp4 ? "video" : "audio");
      media.preload = "auto";
      if (media instanceof HTMLVideoElement) media.playsInline = true;
      media.className = "pointer-events-none fixed h-px w-px opacity-0";
      document.body.appendChild(media);
      if (currentMedia !== null) currentMedia.remove();
      mediaRef.current = media;
      bind(media);
    }
    media.volume = volume;
    if (media.src !== url) media.src = url;
    const pending = media.play();
    setWaiting(true);
    if (pending !== undefined) {
      pending.catch(() => {
        setPlaying(false);
        setWaiting(false);
        setFailure("This take did not play. Tap it again.");
      });
    }
  }

  function playTake(take: LinkTake, trackNumber: number) {
    setFailure("");
    setCurrent({ trackNumber, takeId: take.id });
    currentRef.current = { trackNumber, takeId: take.id };
    usedFallback.current = false;
    startMedia(take.url);
  }

  function advance(manual: boolean) {
    const page = albumRef.current;
    const playingNow = currentRef.current;
    if (page === null || playingNow === null) return;
    const order: { trackNumber: number; take: LinkTake }[] = [];
    for (const track of page.tracks) {
      for (const take of track.takes) order.push({ trackNumber: track.number, take });
    }
    let index = -1;
    for (let cursor = 0; cursor < order.length; cursor += 1) {
      const item = order[cursor];
      if (item !== undefined && item.trackNumber === playingNow.trackNumber && item.take.id === playingNow.takeId) {
        index = cursor;
      }
    }
    const next = order[index + 1];
    if (next === undefined) {
      if (manual) return;
      setPlaying(false);
      return;
    }
    playTake(next.take, next.trackNumber);
  }

  function togglePlay() {
    const media = mediaRef.current;
    if (media === null || current === null) {
      const page = album;
      if (page === null) return;
      for (const track of page.tracks) {
        const take = track.takes[0];
        if (take !== undefined) {
          playTake(take, track.number);
          return;
        }
      }
      return;
    }
    if (media.paused) {
      const pending = media.play();
      if (pending !== undefined) pending.catch(() => setFailure("This take did not play. Tap it again."));
      return;
    }
    media.pause();
  }

  function rate(trackNumber: number, takeId: string, delta: number) {
    setScores((currentScores) => changeScore(currentScores, trackNumber, takeId, delta));
  }

  function retreat() {
    const page = albumRef.current;
    const playingNow = currentRef.current;
    if (page === null || playingNow === null) return;
    const order: { trackNumber: number; take: LinkTake }[] = [];
    for (const track of page.tracks) {
      for (const take of track.takes) order.push({ trackNumber: track.number, take });
    }
    let index = -1;
    for (let cursor = 0; cursor < order.length; cursor += 1) {
      const item = order[cursor];
      if (item !== undefined && item.trackNumber === playingNow.trackNumber && item.take.id === playingNow.takeId) {
        index = cursor;
      }
    }
    const previous = order[index - 1];
    if (previous === undefined) return;
    playTake(previous.take, previous.trackNumber);
  }

  const readyCount = album === null ? 0 : countReady(album);
  const currentTake = album === null || current === null ? null : findRenderedTake(album, current);

  return (
    <>
      <Head>
        <title>{album === null ? "Album" : album.title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        {album === null ? (
          <p className="max-w-xl text-sm leading-relaxed text-muted">{problem}</p>
        ) : (
          <>
            <header>
              <h1 className="font-serif text-3xl tracking-tight text-cream sm:text-4xl">{album.title}</h1>
              {album.artist.length > 0 ? <p className="mt-1 text-sand">{album.artist}</p> : null}
              <p className="mt-3 max-w-xl text-sm text-muted">{blurb(album)}</p>
              <p className="mt-2 max-w-xl text-xs text-muted">
                This link is a snapshot. It will not pick up later takes. Your ratings stay in this browser.
              </p>
            </header>
            <section className="grid min-w-0 gap-8 pb-24 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:pb-0">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">
                    {readyCount > 0 ? "Now playing" : "Coming soon"}
                  </p>
                  <h2 className="font-serif text-3xl leading-tight text-cream">
                    {currentTake === null ? album.title : currentTake.track.title}
                  </h2>
                  {currentTake === null ? null : (
                    <p className="mt-1 text-sm text-muted">
                      {pad(currentTake.track.number)} · Take {currentTake.take.letter}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <IconButton label="Previous take" onClick={() => retreat()} disabled={readyCount === 0}>
                      Previous
                    </IconButton>
                    <button
                      type="button"
                      onClick={togglePlay}
                      disabled={readyCount === 0}
                      aria-label={playing ? "Pause" : "Play album"}
                      className="flex min-h-12 items-center rounded-xl bg-amber px-5 text-sm font-medium text-ink disabled:opacity-40"
                    >
                      {waiting ? "Loading" : playing ? "Pause" : "Play album"}
                    </button>
                    <IconButton label="Next take" onClick={() => advance(true)} disabled={readyCount === 0}>
                      Next
                    </IconButton>
                  </div>
                  <label className="block text-xs text-muted">
                    Seek
                    <input
                      type="range"
                      min={0}
                      max={duration > 0 ? duration : 0}
                      step={0.1}
                      value={Math.min(time, duration || 0)}
                      disabled={duration <= 0}
                      onChange={(event) => {
                        const media = mediaRef.current;
                        if (media === null) return;
                        media.currentTime = Number(event.target.value);
                      }}
                      className="mt-1 block h-11 w-full accent-amber"
                    />
                  </label>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-mono">
                      {formatClock(time)} / {duration > 0 ? formatClock(duration) : "—:—"}
                    </span>
                    <label className="flex items-center gap-2">
                      Volume
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          setVolume(next);
                          if (mediaRef.current !== null) mediaRef.current.volume = next;
                        }}
                        className="h-11 w-24 accent-amber"
                      />
                    </label>
                  </div>
                  <p className="min-h-6 text-sm" aria-live="polite">
                    {failure.length > 0 ? (
                      <span role="alert" className="text-amber-bright">
                        {failure}
                      </span>
                    ) : waiting ? (
                      "Loading audio…"
                    ) : playing ? (
                      "Playing"
                    ) : (
                      "Ready to play"
                    )}
                  </p>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-sm font-medium text-cream">Tracks</h2>
                  <span className="text-xs text-muted">{readyCount} ready to play</span>
                </div>
                <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel/80">
                  {album.tracks.map((track) => {
                    const active = current !== null && current.trackNumber === track.number;
                    return (
                      <li key={track.number} className={active ? "bg-white/5 px-4 py-4" : "px-4 py-4"}>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                            disabled={track.takes.length === 0}
                            aria-current={active ? "true" : undefined}
                            onClick={() => {
                              const selected =
                                track.takes.find((take) => current !== null && take.id === current.takeId) ??
                                track.takes[0];
                              if (selected !== undefined) playTake(selected, track.number);
                            }}
                          >
                            <span className="w-6 font-mono text-xs text-muted">{pad(track.number)}</span>
                            <span className={track.takes.length === 0 ? "text-sm text-muted" : "text-sm text-cream"}>
                              {track.title}
                            </span>
                          </button>
                          {track.takes.length === 0 ? (
                            <span className="text-xs text-muted">Coming soon</span>
                          ) : null}
                        </div>
                        {track.takes.length === 0 ? null : (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {track.takes.map((take) => {
                              const selected = current !== null && current.takeId === take.id;
                              const score = scoreFor(scores, track.number, take.id);
                              return (
                                <div
                                  key={take.id}
                                  className={
                                    selected
                                      ? "flex items-stretch overflow-hidden rounded-lg border border-amber"
                                      : "flex items-stretch overflow-hidden rounded-lg border border-line"
                                  }
                                >
                                  <button
                                    type="button"
                                    aria-pressed={selected}
                                    aria-label={`Take ${take.letter}`}
                                    className="min-h-11 min-w-11 px-2 text-sm"
                                    onClick={() => playTake(take, track.number)}
                                  >
                                    Take {take.letter}
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Subtract one from take ${take.letter} of ${track.title}`}
                                    className="min-h-11 min-w-11 border-l border-line text-muted"
                                    onClick={() => rate(track.number, take.id, -1)}
                                  >
                                    −
                                  </button>
                                  <span
                                    aria-live="polite"
                                    aria-label={`Score ${formatScore(score)}`}
                                    className="flex min-w-11 items-center justify-center font-mono text-sm"
                                  >
                                    {formatScore(score)}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Add one to take ${take.letter} of ${track.title}`}
                                    className="min-h-11 min-w-11 border-l border-line text-muted"
                                    onClick={() => rate(track.number, take.id, 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
            {readyCount === 0 ? null : (
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-4 py-2 lg:hidden">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-cream">
                      {currentTake === null ? album.title : currentTake.track.title}
                    </p>
                    <p className="text-xs text-muted">
                      {failure.length > 0 ? "Playback unavailable" : `${formatClock(time)} / ${duration > 0 ? formatClock(duration) : "—:—"}`}
                    </p>
                  </div>
                  <IconButton label={playing ? "Pause playback" : "Resume playback"} onClick={togglePlay}>
                    {playing ? "Pause" : "Play"}
                  </IconButton>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function IconButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-sand disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function blurb(album: LinkAlbum): string {
  for (const track of album.tracks) {
    if (track.takes.length > 0) return "An album in the making. Tap a track to listen.";
  }
  return "Music is on the way. Tracks will appear here as they become available.";
}

function countReady(album: LinkAlbum): number {
  let count = 0;
  for (const track of album.tracks) {
    if (track.takes.length > 0) count += 1;
  }
  return count;
}

function pad(number: number): string {
  return String(number).padStart(2, "0");
}

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${minutes}:${remain < 10 ? `0${remain}` : String(remain)}`;
}

function findRenderedTake(
  album: LinkAlbum,
  current: Playback
): { track: LinkTrack; take: LinkTake } | null {
  for (const track of album.tracks) {
    if (track.number !== current.trackNumber) continue;
    for (const take of track.takes) {
      if (take.id === current.takeId) return { track, take };
    }
  }
  return null;
}
