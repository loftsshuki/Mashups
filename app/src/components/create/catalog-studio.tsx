"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { buildAuthPath } from "@/lib/auth/return-path"
import { publicationBlocker, studioPath, type StudioSnapshot } from "@/lib/green-room/studio-contract"
type Track={id:string;trackTitle:string;artistName:string;bpm:number|null}
const DRAFT_KEY="mashups.catalog-draft.v1"
export function CatalogStudio({projectId:initialId,parentId,fresh=false}:{projectId?:string;parentId?:string;fresh?:boolean}) {
 const [project,setProject]=useState<StudioSnapshot|null>(null)
 const [tracks,setTracks]=useState<Track[]>([])
 const [title,setTitle]=useState("My mashup")
 const [left,setLeft]=useState("");const [right,setRight]=useState("")
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("Opening catalog…")
 const [login,setLogin]=useState(false)
 const [recipe,setRecipe]=useState({targetBpm:128,durationSeconds:20,leftStartSeconds:0,rightStartSeconds:0,leftSemitones:0,rightSemitones:0})
 const draftId=useRef<string|null>(null);const renderId=useRef<string|null>(null)
 const audioRack=useRef<HTMLDivElement>(null)
 async function readProject(id:string,signal?:AbortSignal) {
  const response=await fetch(`/api/green/studio?projectId=${encodeURIComponent(id)}`,{cache:"no-store",signal})
  const data=await response.json()
  if(response.status===401)setLogin(true)
  if(!response.ok)throw new Error(data.error??"Project unavailable.")
  if(data.project?.id!==id || !Array.isArray(data.project.candidates))throw new Error("Invalid project receipt.")
  return data.project as StudioSnapshot
 }
 useEffect(()=>{
  const controller=new AbortController();let cancelled=false
  try{if(fresh)sessionStorage.removeItem(DRAFT_KEY);const saved=fresh?null:JSON.parse(sessionStorage.getItem(DRAFT_KEY)??"null");if(saved && (saved.parentId??null)===(parentId??null) && typeof saved.title==="string" && typeof saved.left==="string" && typeof saved.right==="string"){setTitle(saved.title.slice(0,120));setLeft(saved.left);setRight(saved.right);draftId.current=typeof saved.id==="string"?saved.id:null}}catch{/* Device recovery is optional; no cloud save is claimed. */}
  if(initialId){void readProject(initialId,controller.signal).then(value=>{if(!cancelled){setProject(value);setMessage("")}}).catch(error=>{if(!cancelled)setMessage(error.message)})}
  void fetch("/api/green/catalog",{cache:"no-store",signal:controller.signal}).then(response=>{if(!response.ok)throw new Error("Catalog could not be loaded.");return response.json()}).then(data=>{
   if(cancelled)return
   const live=data.mode==="live" && Array.isArray(data.tracks)?data.tracks:[]
   setTracks(live);setLeft(value=>value||live[0]?.id||"");setRight(value=>value||live[1]?.id||"")
   if(!initialId)setMessage(live.length>=2 ? (parentId?"Start a new version from the published sources.":"") : "No approved real-audio catalog is available yet. The demo remains separate.")
  }).catch(error=>{if(!cancelled)setMessage(error.message)})
  return()=>{cancelled=true;controller.abort()}
 // Each mount owns its restore request. Navigation remounts with a new identity.
 },[initialId,parentId,fresh])
 useEffect(()=>{
  if(!project || project.status!=="rendering")return
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;let cancelled=false
  const poll=async()=>{try{const value=await readProject(project.id,controller.signal);if(!cancelled){setProject(value);setMessage(value.job?.status==="failed"?"Rendering failed. Your saved project is intact.":"")}}catch(error){if(!cancelled)setMessage(error instanceof Error?error.message:"Connection lost. Reconnecting…")}finally{if(!cancelled)timer=setTimeout(poll,2500)}}
  timer=setTimeout(poll,1500)
  return()=>{cancelled=true;clearTimeout(timer);controller.abort()}
 },[project?.id,project?.status])
 async function act(action:string,extra:Record<string,unknown>={}) {
  if(busy)return;setBusy(true);setLogin(false);setMessage("")
  const id=project?.id??draftId.current??crypto.randomUUID();draftId.current=id
  try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify({id,title,left,right,parentId:parentId??null}))}catch{/* A failed browser save is not an account save. */}
  try {
   const response=await fetch("/api/green/studio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,projectId:id,expectedRevision:project?.revision,...extra}),signal:AbortSignal.timeout(15000)})
   const data=await response.json()
   if(response.status===401){setLogin(true);throw new Error("Sign in to save and render real catalog tracks. Your selections remain in this tab.")}
   if(!response.ok){if(response.status===409 && project)setProject(await readProject(project.id));throw new Error(data.error??"The action could not be confirmed.")}
   if(data.project?.id!==id)throw new Error("Save receipt could not be verified. Reload before retrying.")
   setProject(data.project);window.history.replaceState(null,"",studioPath(data.project.id));renderId.current=null
   setMessage(action==="publish"?"Published. Your listening link is ready.":action==="select"?"Candidate kept in your account.":action==="render"?"Render queued. You can return to this saved project later.":"Project saved to your account.")
  }catch(error){setMessage(error instanceof Error?error.message:"Connection failed. Reload to confirm the last save.")}finally{setBusy(false)}
 }
 async function share() {
  if(!project?.publicationPath)return
  const url=new URL(project.publicationPath,window.location.origin).href
  try{if(navigator.share)await navigator.share({title:project.title,url});else{await navigator.clipboard.writeText(url);setMessage("Listening link copied.")}}catch(error){if(!(error instanceof DOMException && error.name==="AbortError"))setMessage("Copy the listening link below to share it.")}
 }
 const blocker=project?publicationBlocker(project):null
 const button="min-h-12 border border-foreground bg-foreground px-5 py-3 font-semibold text-background disabled:opacity-40"
 return <main className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-28">
  <p className="mono-label text-primary">Catalog studio / Real audio</p><h1 className="display-type mt-4 text-5xl sm:text-7xl">{project?.title??"Make your cut."}</h1>
  <div className="mt-5 flex flex-wrap gap-5 text-sm"><Link href="/create?fresh=1" className="underline">Open synthesized demo</Link><Link href="/projects" className="underline">My saved mashups</Link><a href="/create?mode=catalog&fresh=1" className="underline">New catalog project</a></div>
  {message && <p role="status" className="my-6 border border-foreground bg-secondary p-4">{message}</p>}
  {login && <Link className={button} href={buildAuthPath("login",`${studioPath(project?.id??initialId)}${parentId?`&fork=${encodeURIComponent(parentId)}`:""}`)}>Sign in and return</Link>}
  {!project && <section className="mt-8 grid gap-5 border border-foreground bg-card p-6">
   <label>Mashup name<input className="mt-2 block min-h-12 w-full border bg-background p-3" value={title} maxLength={120} onChange={event=>setTitle(event.target.value)}/></label>
   {!parentId && <div className="grid gap-5 sm:grid-cols-2">{(["left","right"] as const).map(side=><label key={side}>{side==="left"?"Source A":"Source B"}<select className="mt-2 block min-h-12 w-full border bg-background p-3" value={side==="left"?left:right} onChange={event=>side==="left"?setLeft(event.target.value):setRight(event.target.value)}>{tracks.map(track=><option key={track.id} value={track.id}>{track.trackTitle} / {track.artistName}</option>)}</select></label>)}</div>}
   <button className={button} disabled={busy || (!parentId && (!left||!right||left===right||!title.trim()))} onClick={()=>void act(parentId?"fork":"create",parentId?{parentId}:{title,leftId:left,rightId:right})}>{busy?"Saving…":parentId?"Make my version":"Save catalog project"}</button>
  </section>}
  {project && <>
   <p className="mt-6 font-mono text-sm" data-testid="catalog-project-status">{project.status} · Revision {project.revision}{project.job?` · Job ${project.job.status}`:""}</p>
   {project.status==="draft" && <section className="mt-6 border border-foreground bg-card p-6"><h2 className="text-2xl font-semibold">Prepare the render</h2><p className="mt-3 text-sm text-muted-foreground">Choose excerpt start points and tempo. Timing and musical fit still require listening review; no automatic pitch correction is assumed.</p><div className="mt-5 grid gap-4 sm:grid-cols-3">{Object.entries(recipe).map(([key,value])=><label key={key} className="text-sm">{({targetBpm:"Target BPM",durationSeconds:"Preview seconds",leftStartSeconds:"A start (seconds)",rightStartSeconds:"B start (seconds)",leftSemitones:"A pitch (semitones)",rightSemitones:"B pitch (semitones)"} as Record<string,string>)[key]}<input type="number" className="mt-2 block min-h-12 w-full border bg-background p-3" value={value} onChange={event=>{renderId.current=null;setRecipe(old=>({...old,[key]:Number(event.target.value)}))}}/></label>)}</div><button className={`${button} mt-6`} disabled={busy} onClick={()=>{renderId.current??=crypto.randomUUID();void act("render",{recipe,requestId:renderId.current})}}>Generate three real arrangements</button></section>}
   {project.status==="rendering" && <p role="status" className="mt-6 border p-6">{project.job?.status==="queued"?"Waiting for the processor.":"Rendering your arrangements."} Status updates automatically. No progress percentage is estimated.</p>}
   <div ref={audioRack} className="mt-8 grid gap-4 lg:grid-cols-3">{project.candidates.map(candidate=><article key={candidate.id} className="border border-foreground bg-card p-5"><h2 className="text-xl font-semibold">{candidate.arrangement}</h2><audio className="mt-5 w-full" controls preload="none" src={candidate.audioPath} onPlay={event=>audioRack.current?.querySelectorAll("audio").forEach(audio=>{if(audio!==event.currentTarget)audio.pause()})}/><p className="mt-3 text-sm">{candidate.durationSeconds.toFixed(1)} seconds · {candidate.qualityStatus.replaceAll("_"," ")}</p><p className="mt-2 text-xs">{candidate.keepReviews} independent keep reviews</p><button className={`${button} mt-5 w-full`} disabled={busy||project.status!=="ready"||candidate.qualityStatus==="failed"} onClick={()=>void act("select",{candidateId:candidate.id})}>{project.selectedCandidateId===candidate.id?"Kept":"Keep this version"}</button></article>)}</div>
   <section className="mt-8 border border-foreground bg-secondary p-6"><h2 className="text-2xl font-semibold">Publish and share</h2>{blocker && <p className="mt-3">{blocker}</p>}{project.publicationPath?<><Link className="mt-4 block break-all underline" href={project.publicationPath}>{project.publicationPath}</Link><button className={`${button} mt-4`} onClick={()=>void share()}>Share listening link</button></>:<button className={`${button} mt-5`} disabled={busy||Boolean(blocker)} onClick={()=>void act("publish")}>Publish mashup</button>}</section>
   <button className="mt-6 min-h-11 underline" disabled={busy} onClick={()=>void readProject(project.id).then(setProject).catch(error=>setMessage(error.message))}>Refresh project and reviews</button>
  </>}
 </main>
}
