import assert from "node:assert/strict"
import test from "node:test"

import { parseExternalHttpUrl } from "../src/lib/security/external-url.ts"

test("parseExternalHttpUrl accepts public HTTP(S) sources", () => {
  assert.equal(parseExternalHttpUrl("https://cdn.example.com/audio/track.mp3")?.hostname, "cdn.example.com")
  assert.equal(parseExternalHttpUrl("http://media.example.org/a.wav")?.protocol, "http:")
})

test("parseExternalHttpUrl rejects private and non-HTTP targets", () => {
  const rejected = [
    "http://localhost:3000/secret",
    "http://127.0.0.1/audio",
    "http://10.1.2.3/audio",
    "http://192.168.1.8/audio",
    "http://172.16.0.2/audio",
    "file:///etc/passwd",
    "not-a-url",
  ]
  for (const value of rejected) assert.equal(parseExternalHttpUrl(value), null)
})
