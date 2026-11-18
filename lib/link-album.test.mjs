import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  changeScore,
  decodeLinkFragment,
  formatScore,
  parseScores,
  scoreFor,
  scoreStorageKey,
} from "./link-album.mjs";

const sample =
  "Y2QUEBQUFFRScjZucQkFA06_zPSMEgWn0mK-kIxUBQjPJbU4m4mR1yexuEQhICexJC2_KJdp1apVq3bv9jnTe_cdCDAysqGJMDFxMvEE56dkluYq-IDMYQAA";

test("decodes a snapshot and rebuilds public Suno URLs", async () => {
  const album = await decodeLinkFragment(sample);
  assert.ok(album);
  assert.equal(album.title, "Night Bus");
  assert.equal(album.artist, "The Night Desk");
  assert.equal(album.coverRef, null);
  assert.equal(album.tracks.length, 2);
  assert.equal(album.tracks[1].takes.length, 0);
  const takes = album.tracks[0].takes;
  assert.equal(takes.length, 2);
  assert.equal(takes[0].letter, "A");
  assert.equal(takes[0].url, "https://cdn1.suno.ai/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01.mp4");
  assert.equal(takes[0].fallbackUrl, "https://cdn1.suno.ai/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01.mp3");
  assert.equal(takes[1].url, "https://cdn2.suno.ai/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee02.mp3");
  assert.equal(sample.includes("suno.ai"), false);
  assert.equal(sample.includes("http"), false);
});

test("rejects a damaged or old fragment", async () => {
  assert.equal(await decodeLinkFragment(""), null);
  assert.equal(await decodeLinkFragment("%%%%"), null);
  assert.equal(await decodeLinkFragment("aaaa"), null);
});

test("keeps ratings on stable take ids when another take is added", () => {
  const albumId = "11111111222243338444555555555555";
  const first = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01";
  const second = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee02";
  const scored = changeScore({}, 1, first, 1);
  const kept = changeScore(scored, 1, second, -1);
  assert.equal(scoreFor(kept, 1, first), 1);
  assert.equal(scoreFor(kept, 1, second), -1);
  assert.equal(scoreStorageKey(albumId), `album-link:${albumId}`);
  const stored = parseScores(JSON.stringify(kept));
  assert.equal(scoreFor(stored, 1, first), 1);
  assert.equal(formatScore(1), "+1");
  assert.equal(formatScore(-1), "-1");
});

test("the player route stores nothing and has no vote handoff", async () => {
  const page = await readFile(new URL("../pages/a.tsx", import.meta.url), "utf8");
  assert.equal(page.includes("getServerSideProps"), false);
  assert.equal(page.includes("getInitialProps"), false);
  assert.equal(page.includes("Send votes"), false);
  assert.equal(page.includes("clipboard"), false);
  assert.equal(page.includes("navigator.share"), false);
  assert.equal(page.includes("/api/"), false);
});
