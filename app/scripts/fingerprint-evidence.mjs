/** Provider-neutral evidence contract. A zero-match scan is not rights clearance. */
export function fingerprintEvidence(input, expectedSourceSha256) {
 if(!input || !/^[a-f0-9]{64}$/i.test(expectedSourceSha256??'') || input.sourceSha256!==expectedSourceSha256)throw new Error('Scan must bind to the exact authorized source hash')
 if(!['clear','flagged','unavailable'].includes(input.sampleScanStatus))throw new Error('Unsupported scan status')
 if(typeof input.providerReference!=='string'||!input.providerReference.trim()||input.providerReference.length>240)throw new Error('Provider evidence reference required')
 if(!Number.isInteger(input.matchCount)||input.matchCount<0)throw new Error('Measured match count required')
 if(input.sampleScanStatus==='clear'&&input.matchCount!==0)throw new Error('A matching source cannot be labelled clear')
 return {sampleScanStatus:input.sampleScanStatus,providerReference:input.providerReference,matchCount:input.matchCount,sourceSha256:expectedSourceSha256}
}
