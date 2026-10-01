import assert from 'node:assert/strict'
import test from 'node:test'
import { runPreflight } from '../scripts/release-preflight.mjs'
test('empty environment cannot produce a release approval or issue network calls',async()=>{
 let calls=0;const result=await runPreflight({},async()=>{calls++;throw new Error('unexpected')})
 assert.equal(calls,0);assert.equal(result.releaseApproved,false)
 assert.ok(result.checks.some((c:{status:string})=>c.status==='unconfigured'))
})
test('preflight refuses live Stripe keys before a network call',async()=>{
 let calls=0;const result=await runPreflight({STRIPE_SECRET_KEY:'sk_live_private'},async()=>{calls++;throw new Error('unexpected')})
 assert.equal(calls,0);assert.equal(JSON.stringify(result).includes('sk_live_private'),false)
 assert.ok(result.checks.some((c:{status:string})=>c.status==='live_or_invalid_key_refused'))
})
test('a real-mode price cannot pass a sandbox check; no credentials enter the report',async()=>{
 const secret='sk_test_private123';const result=await runPreflight({STRIPE_SECRET_KEY:secret,STRIPE_PRICE_ID_PRO_CREATOR:'price_creator'},async()=>Response.json({id:'price_creator',active:true,livemode:true,type:'recurring',recurring:{interval:'month'}}))
 assert.equal(JSON.stringify(result).includes(secret),false)
 assert.equal(result.checks.find((c:{name:string})=>c.name==='stripe.PRO_CREATOR')?.status,'not_verified')
})
