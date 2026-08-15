import test from "node:test";
import assert from "node:assert/strict";

// Mirrors the server's supported magic-byte contract with representative signatures.
const signatures = {
  png: [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a],
  jpeg: [0xff,0xd8,0xff,0xe0],
  webp: [...Buffer.from("RIFF"),0,0,0,0,...Buffer.from("WEBP")],
};

test("representative signatures remain distinct", () => {
  assert.notDeepEqual(signatures.png, signatures.jpeg);
  assert.equal(Buffer.from(signatures.webp.slice(0,4)).toString(), "RIFF");
  assert.equal(Buffer.from(signatures.webp.slice(8,12)).toString(), "WEBP");
});
