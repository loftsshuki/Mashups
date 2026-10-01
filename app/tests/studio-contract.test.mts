import assert from 'node:assert/strict'
import test from 'node:test'
import { candidateAudioPath, parseByteRange, publicationBlocker, studioPath } from '../src/lib/green-room/studio-contract.ts'
import type { StudioSnapshot } from '../src/lib/green-room/studio-contract.ts'
test('studio and candidate links encode identifiers', () => {
 assert.equal(studioPath('a&b'), '/create?mode=catalog&project=a%26b')
 assert.match(candidateAudioPath('a&b','c/d'), /projectId=a%26b&candidateId=c%2Fd/)
})
test('closed, open and suffix byte ranges', () => {
 assert.deepEqual(parseByteRange('bytes=0-1',100),{start:0,end:1})
 assert.deepEqual(parseByteRange('bytes=50-',100),{start:50,end:99})
 assert.deepEqual(parseByteRange('bytes=-20',100),{start:80,end:99})
 assert.deepEqual(parseByteRange('bytes=1-1000',100),{start:1,end:99})
 assert.deepEqual(parseByteRange('bytes=-1000',100),{start:0,end:99})
})
test('bad or multiple ranges cannot reach the media reader', () => {
 for(const range of ['bytes=-0','bytes=-','bytes=100-','bytes=20-10','bytes=0-1,5-6','bytes=9007199254740992-', 'garbage']) assert.equal(parseByteRange(range,100),null)
 assert.equal(parseByteRange('bytes=0-',0),null)
})
test('publishing never treats rendered or selected as reviewed', () => {
 const project:StudioSnapshot={id:'p',title:'mix',revision:1,status:'rendering',selectedCandidateId:null,parentProjectId:null,candidates:[],job:null,publicationPath:null}
 assert.match(publicationBlocker(project)!,/Finish/)
 project.status='ready';assert.match(publicationBlocker(project)!,/Keep/)
 project.candidates=[{id:'c',arrangement:'drop-swap',durationSeconds:20,qualityStatus:'manual_review',keepReviews:0,audioPath:'/audio'}]
 project.selectedCandidateId='c';assert.match(publicationBlocker(project)!,/quality/)
 project.candidates[0].qualityStatus='passed';assert.match(publicationBlocker(project)!,/Two/)
 project.candidates[0].keepReviews=2;assert.equal(publicationBlocker(project),null)
})
