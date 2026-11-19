import assert from "node:assert/strict";
import { test } from "node:test";

import {
  knownMediaDuration,
  mp4DurationSeconds,
  remoteMp4Duration,
} from "./media-duration.mjs";

test("reads a finite duration and ignores a missing one", () => {
  assert.equal(
    knownMediaDuration({ duration: 80, seekable: { length: 0, end: () => 0 } }),
    80
  );
  assert.equal(
    knownMediaDuration({
      duration: Number.NaN,
      seekable: { length: 1, end: () => 125 },
    }),
    125
  );
  assert.equal(
    knownMediaDuration({
      duration: Number.POSITIVE_INFINITY,
      seekable: { length: 0, end: () => 0 },
    }),
    null
  );
});

test("reads the movie header from the end of a buffer", () => {
  const header = movieHeader(0, 1000, 213206);
  const bytes = new Uint8Array(header.length + 16);
  bytes.set(header, 8);
  assert.equal(mp4DurationSeconds(bytes), 213.206);
  assert.equal(mp4DurationSeconds(new Uint8Array(32)), null);
  assert.equal(mp4DurationSeconds(header), null);
});

test("keeps the last sane movie header and reads version 1", () => {
  const bogus = movieHeader(0, 0, 10);
  const real = movieHeader(1, 48000, 96000);
  const bytes = new Uint8Array(bogus.length + real.length + 16);
  bytes.set(bogus, 4);
  bytes.set(real, bogus.length + 8);
  assert.equal(mp4DurationSeconds(bytes), 2);
});

test("uses a suffix range and ignores a full-body response", async () => {
  const calls = [];
  const header = movieHeader(0, 1000, 180000);
  const body = new Uint8Array(header.length + 16);
  body.set(header, 8);
  const found = await remoteMp4Duration(
    "https://cdn1.suno.ai/clip.mp4",
    async (url, init) => {
      calls.push(url);
      const headers = new Headers(init.headers);
      assert.equal(headers.get("Range"), "bytes=-131072");
      assert.equal(init.referrerPolicy, "no-referrer");
      return new Response(body, {
        status: 206,
        headers: { "content-type": "video/mp4" },
      });
    }
  );
  assert.deepEqual(calls, ["https://cdn1.suno.ai/clip.mp4"]);
  assert.equal(found, 180);

  const ignored = await remoteMp4Duration(
    "https://cdn1.suno.ai/clip.mp4",
    async () => new Response(body, { status: 200 })
  );
  assert.equal(ignored, null);

  const failed = await remoteMp4Duration(
    "https://cdn1.suno.ai/clip.mp4",
    async () => {
      throw new Error("offline");
    }
  );
  assert.equal(failed, null);
});

function movieHeader(version, timescale, duration) {
  const bytes = new Uint8Array(version === 0 ? 28 : 40);
  bytes.set([0x6d, 0x76, 0x68, 0x64], 0);
  bytes[4] = version;
  const view = new DataView(bytes.buffer);
  if (version === 0) {
    view.setUint32(16, timescale);
    view.setUint32(20, duration);
    return bytes;
  }
  view.setUint32(24, timescale);
  view.setBigUint64(28, BigInt(duration));
  return bytes;
}
