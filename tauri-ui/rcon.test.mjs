import assert from "node:assert/strict";
import test from "node:test";

import { shouldSubmitRconCommand, splitRconCommands } from "./rcon.js";

test("splitRconCommands trims blank lines and keeps command order", () => {
  assert.deepEqual(
    splitRconCommands(" status \n\nmeta list\r\n sm_cvar z_difficulty hard "),
    ["status", "meta list", "sm_cvar z_difficulty hard"],
  );
});

test("plain Enter stays in the multiline RCON editor", () => {
  assert.equal(
    shouldSubmitRconCommand({
      key: "Enter",
      ctrlKey: false,
      metaKey: false,
    }),
    false,
  );
});

test("Ctrl+Enter and Cmd+Enter submit the RCON editor", () => {
  assert.equal(
    shouldSubmitRconCommand({
      key: "Enter",
      ctrlKey: true,
      metaKey: false,
    }),
    true,
  );
  assert.equal(
    shouldSubmitRconCommand({
      key: "Enter",
      ctrlKey: false,
      metaKey: true,
    }),
    true,
  );
});
