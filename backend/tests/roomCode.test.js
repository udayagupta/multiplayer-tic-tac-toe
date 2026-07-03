const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const generateRoomCode = require("../utils/roomCode");

test("generateRoomCode returns a 6-character code for an empty room set", async () => {
  const originalRandomInt = crypto.randomInt;
  crypto.randomInt = () => 0;

  try {
    const result = await Promise.race([
      Promise.resolve(generateRoomCode({})),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 100)),
    ]);

    assert.notEqual(result, "timeout");
    assert.equal(result.length, 6);
    assert.equal(typeof result, "string");
  } finally {
    crypto.randomInt = originalRandomInt;
  }
});
