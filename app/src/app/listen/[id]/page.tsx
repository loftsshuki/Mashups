"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { GreenPublication } from "@mashups/contracts"
import { ProcessPlayer } from "@/components/player/process-player"
type Legacy={id:string;title:string;audioUrl:string;duration:number;creator:{displayName:string;avatarUrl:string|null};sourceTracks?:{title:string;artist:string;position:number}[]}
export default function ListenPage(){
 const {id}=useParams<{id:string}>()
 const [publication,setPublication]=useState<GreenPublication|null>(null),[legacy,setLegacy]=useState<Legacy|null>(null)
 const [message,setMessage]=useState("Loading publication…"),[shareMessage,setShareMessage]=useState("")
 useEffect(()=>{
  const controller=new AbortController();let cancelled=false
  setPublication(null);setLegacy(null);setMessage("Loading publication…")
  async function load(){try{
   const response=await fetch(`/api/green/publications/${encodeURIComponent(id)}`,{cache:"no-store",signal:controller.signal})
   if(response.ok){const body=await response.json();if(body.publication?.id!==id)throw new Error("Publication receipt could not be verified.");if(!cancelled){setPublication(body.publication);setMessage("")}return}
   if(![400,404].includes(response.status))throw new Error("The listening service is temporarily unavailable. Please try again.")
   const older=await fetch(`/api/mashups/${encodeURIComponent(id)}/summary`,{cache:"no-store",signal:controller.signal})
   const body=older.ok?await older.json():null
   // Never substitute a demo or another song for a missing or withdrawn ID.
   if(!cancelled){if(body?.mashup?.id===id){setLegacy(body.mashup);setMessage("")}else setMessage("This publication is unavailable or its permissions have changed.")}
  }catch(error){if(!cancelled)setMessage(error instanceof Error?error.message:"Playback unavailable.")}}
  void load();return()=>{cancelled=true;controller.abort()}
 },[id])
 async function share(){try{const url=new URL(`/listen/${encodeURIComponent(id)}`,window.location.origin).href;if(navigator.share)await navigator.share({title:publication?.title,url});else{await navigator.clipboard.writeText(url);setShareMessage("Listening link copied.")}}catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setShareMessage("Copy this page’s address to share it.")}}
 if(legacy)return <ProcessPlayer key={legacy.id} title={legacy.title} creatorName={legacy.creator.displayName} creatorAvatar={legacy.creator.avatarUrl??undefined} audioUrl={legacy.audioUrl} duration={legacy.duration} tracks={(legacy.sourceTracks??[]).map(t=>({title:t.title,artist:t.artist,entryTime:0,color:"#888888"}))} mashupId={legacy.id} className="min-h-screen"/>
 return <main className="mx-auto min-h-screen max-w-4xl px-5 pb-24 pt-28">
  {!publication?<><h1 className="display-type text-5xl">Listen</h1><p role="status" className="mt-6">{message}</p><Link className="mt-6 block underline" href="/">Return home</Link></>:<>
   <p className="mono-label text-primary">Published mashup</p><h1 className="display-type mt-4 text-5xl sm:text-7xl">{publication.title}</h1><p className="mt-5">by {publication.creator.displayName??publication.creator.username}</p>
   <audio key={id} className="mt-8 w-full" aria-label="Play published mashup" controls preload="metadata" src={`/api/green/publications/${encodeURIComponent(id)}/audio`} onError={()=>setShareMessage("Audio is unavailable. Reload to recheck source permissions.")}/>
   <section aria-label="Source credits" className="mt-8 grid gap-4 sm:grid-cols-2">{[publication.leftSource,publication.rightSource].map((source,index)=><article key={source.id} className="border border-foreground bg-card p-5"><p className="mono-label">Source {index===0?"A":"B"}</p><h2 className="mt-3 text-xl font-semibold">{source.trackTitle}</h2><p className="mt-2">{source.artistName}</p></article>)}</section>
   <p className="mt-6 text-sm text-muted-foreground">{publication.durationSeconds.toFixed(1)} second preview. Source permissions are rechecked for each playback request.</p>
   <div className="mt-8 flex flex-wrap gap-4"><Link className="inline-flex min-h-12 items-center border border-foreground bg-foreground px-5 font-semibold text-background" href={`/create?mode=catalog&fork=${encodeURIComponent(id)}`}>Make your version</Link><button className="min-h-12 border border-foreground px-5 font-semibold" onClick={()=>void share()}>Share this mashup</button></div>
   {publication.parentProjectId&&<Link className="mt-6 block underline" href={`/listen/${encodeURIComponent(publication.parentProjectId)}`}>Listen to the parent version</Link>}
   {shareMessage&&<p role="status" className="mt-5">{shareMessage}</p>}
  </>}
 </main>
}
