import assert from "node:assert/strict";
import test from "node:test";

import { runAutoRefreshTick } from "./auto-refresh.js";

function createState(overrides = {}) {
  return {
    busy: false,
    refreshInFlight: false,
    autoRefreshEmptySecs: 5,
    autoRefreshActiveSecs: 5,
    autoRefreshSelectedSecs: 5,
    lastFullRefreshAt: 0,
    lastActiveRefreshAt: 0,
    lastSelectedRefreshAt: 0,
    ...overrides,
  };
}

function createHarness({
  state = createState(),
  now = 5_000,
  selected = null,
  activeSockets = [],
} = {}) {
  const calls = [];
  const result = runAutoRefreshTick(state, {
    now,
    selectedServerSocket: () => selected,
    activeServerSockets: () => [...activeSockets],
    refreshServers: (options) => calls.push(options),
  });
  return { calls, result, state };
}

test("auto refresh full query runs when interval elapsed even if unrelated UI busy flag is stuck", () => {
  const state = createState({ busy: true, refreshInFlight: false });

  const { calls, result } = createHarness({ state });

  assert.deepEqual(calls, [{ silent: true }]);
  assert.equal(result.type, "full");
});

test("auto refresh skips while a server refresh is already in flight", () => {
  const state = createState({ refreshInFlight: true });

  const { calls, result } = createHarness({ state });

  assert.deepEqual(calls, []);
  assert.equal(result.type, "skipped");
});

test("auto refresh includes selected server with active partial refresh when selected is due", () => {
  const state = createState({
    lastFullRefreshAt: 1_000,
    lastActiveRefreshAt: 0,
    lastSelectedRefreshAt: 0,
  });

  const { calls, result } = createHarness({
    state,
    selected: "2.2.2.2:27015",
    activeSockets: ["1.1.1.1:27015"],
  });

  assert.deepEqual(calls, [
    { silent: true, sockets: ["1.1.1.1:27015", "2.2.2.2:27015"] },
  ]);
  assert.equal(result.type, "partial");
});
