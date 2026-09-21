/** Read-only checks. Never creates a database, registers a webhook, or charges. */
import { pathToFileURL } from 'node:url'
export async function runPreflight(env, fetcher=fetch) {
 const checks=[]
 const add=(name,status)=>checks.push({name,status})
 const usable=value=>typeof value==='string' && value.trim() && !/placeholder|your_|replace-with|\.\.\./i.test(value)
 const get=async(url,headers)=>{try{const r=await fetcher(url,{headers,redirect:'error',signal:AbortSignal.timeout(10000)});return {ok:r.ok,status:r.status,body:await r.json().catch(()=>null)}}catch{return {ok:false,status:0,body:null}}}
 const supabase=env.NEXT_PUBLIC_SUPABASE_URL,anon=env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=env.SUPABASE_SERVICE_ROLE_KEY
 let validSupabase=false
 try{const u=new URL(supabase);validSupabase=u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'}catch{}
 if(validSupabase&&usable(anon)) {
  const auth=await get(`${supabase.replace(/\/$/,'')}/auth/v1/health`,{apikey:anon})
  add('supabase.auth',auth.ok?'pass':`http_${auth.status}`)
 } else add('supabase.auth','unconfigured')
 if(validSupabase&&usable(service)) {
  const schema=await get(`${supabase.replace(/\/$/,'')}/rest/v1/`,{apikey:service,Authorization:`Bearer ${service}`,Accept:'application/openapi+json'})
  for(const name of ['save_green_project','queue_green_project_render','select_green_project_candidate','fork_green_publication','publish_green_studio_project'])add(`database.rpc.${name}`,schema.ok&&schema.body?.paths?.[`/rpc/${name}`]?'pass':'not_verified')
 }else add('database.migrations_through_029','not_verified')
 for(const key of ['GREEN_ROOM_PROCESSOR_SECRET','GREEN_ROOM_READ_WRITE_TOKEN','GREEN_ROOM_SEPARATION_PROCESSOR_URL','GREEN_ROOM_RENDER_CANDIDATES_PROCESSOR_URL'])add(key,usable(env[key])?'configured_not_exercised':'unconfigured')
 const key=env.STRIPE_SECRET_KEY
 if(!usable(key))add('stripe.sandbox','unconfigured')
 else if(!/^sk_test_[A-Za-z0-9]+$/.test(key))add('stripe.sandbox','live_or_invalid_key_refused')
 else {
  for(const plan of ['PRO_CREATOR','PRO_STUDIO']) {
   const price=env[`STRIPE_PRICE_ID_${plan}`]
   if(!usable(price)||!/^price_[A-Za-z0-9]+$/.test(price)){add(`stripe.${plan}`,'unconfigured');continue}
   const r=await get(`https://api.stripe.com/v1/prices/${encodeURIComponent(price)}`,{Authorization:`Bearer ${key}`})
   add(`stripe.${plan}`,r.ok&&r.body?.id===price&&r.body.active===true&&r.body.livemode===false&&r.body.type==='recurring'&&r.body.recurring?'pass':'not_verified')
  }
 }
 add('stripe.signed_webhook_checkout_cancellation','not_run')
 add('authorized_real_audio_listening_panel','not_run')
 add('physical_ios_android_acceptance','not_run')
 return {releaseApproved:false,checks}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){const report=await runPreflight(process.env);console.log(JSON.stringify(report,null,2));process.exitCode=report.checks.some(c=>!['pass','configured_not_exercised'].includes(c.status))?2:0}
