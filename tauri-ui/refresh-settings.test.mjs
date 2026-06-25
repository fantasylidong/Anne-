import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("./index.html", import.meta.url), "utf8");

test("auto refresh defaults use the same fast interval", () => {
  assert.match(appSource, /const FAST_AUTO_REFRESH_SECS = 5;/);
  assert.doesNotMatch(appSource, /SELECTED_REFRESH_DEFAULT_SECS/);
  assert.match(appSource, /autoRefreshEmptySecs: FAST_AUTO_REFRESH_SECS/);
  assert.match(appSource, /autoRefreshActiveSecs: FAST_AUTO_REFRESH_SECS/);
  assert.match(appSource, /autoRefreshSelectedSecs: FAST_AUTO_REFRESH_SECS/);
});

test("auto refresh inputs share the same minimum and default", () => {
  for (const id of [
    "autoRefreshEmptyInput",
    "autoRefreshActiveInput",
    "autoRefreshSelectedInput",
  ]) {
    assert.match(
      htmlSource,
      new RegExp(`id="${id}"[^>]+min="5"[^>]+value="5"`),
    );
  }
});
