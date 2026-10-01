import assert from 'node:assert/strict'
import test from 'node:test'
import { fingerprintEvidence } from '../scripts/fingerprint-evidence.mjs'
const hash='a'.repeat(64)
test('fingerprint evidence needs provenance and the exact source hash',()=>{
 assert.throws(()=>fingerprintEvidence({sampleScanStatus:'clear'},hash))
 assert.throws(()=>fingerprintEvidence({sourceSha256:'b'.repeat(64),sampleScanStatus:'clear',providerReference:'scan-1',matchCount:0},hash))
 assert.throws(()=>fingerprintEvidence({sourceSha256:hash,sampleScanStatus:'clear',providerReference:'scan-1',matchCount:2},hash))
 assert.equal(fingerprintEvidence({sourceSha256:hash,sampleScanStatus:'flagged',providerReference:'scan-1',matchCount:2},hash).sampleScanStatus,'flagged')
})
