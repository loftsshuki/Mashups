"use client"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GreenMashupStudio } from "./green-mashup-studio"
import { CatalogStudio } from "./catalog-studio"
import { newLocalDraft, readLocalDraft, recipeFingerprint, renderFingerprint, type GreenLocalDraft } from "@/lib/green-room/local-draft"
import { greenSavedProjectSchema } from "@/lib/green-room/project-schema"
import { getGreenTrack } from "@/lib/catalog/green-catalog"
import { GREEN_CATALOG_MANIFEST } from "@/lib/catalog/catalog-manifest"
export function GreenStudioWorkspace({ initialLeft, initialRight, projectId, usePreviousDraft }: { initialLeft: string; initialRight: string; projectId?: string; usePreviousDraft: boolean }) {
 const [draft,setDraft]=useState<GreenLocalDraft|null>(null)
 const [catalogId,setCatalogId]=useState<string|null>(null)
 const [notice,setNotice]=useState<string|null>(null)
 const [failed,setFailed]=useState(false)
 useEffect(()=>{
  let cancelled=false
  async function restore(){try {
   const local=projectId||usePreviousDraft?await readLocalDraft(projectId):null
   if(cancelled)return
   if(local){setDraft(local);setNotice("Recovered your device draft.");return}
   if(projectId){
    const response=await fetch(`/api/green/projects?id=${encodeURIComponent(projectId)}`,{cache:"no-store",signal:AbortSignal.timeout(8000)})
    const body=await response.json()
    if(!response.ok)throw new Error(body.error??"This project could not be loaded.")
    const project=greenSavedProjectSchema.parse(body.project)
    if(project.id!==projectId)throw new Error("The project response could not be verified.")
    if(project.sources.kind==="catalog"){if(!cancelled)setCatalogId(project.id);return}
    if(project.sources.catalogVersion!==GREEN_CATALOG_MANIFEST.catalogVersion||!getGreenTrack(project.sources.leftId)||!getGreenTrack(project.sources.rightId))throw new Error("This recipe uses an older catalog. Your account copy has not been changed.")
    const input={id:project.id,title:project.title,sources:project.sources,intensity:project.intensity,selectedArrangement:project.selectedArrangement,expectedRevision:project.revision}
    if(!cancelled){setDraft({...newLocalDraft(project.sources.leftId,project.sources.rightId),input,cloudFingerprint:recipeFingerprint(input),renderKey:renderFingerprint(input)});setNotice("Recipe loaded from your account. Generate the audio to hear it on this device.")}
    return
   }
   setDraft(newLocalDraft(initialLeft,initialRight))
  }catch(error){if(cancelled)return;setNotice(error instanceof Error?error.message:"Draft recovery is unavailable.");if(projectId||usePreviousDraft)setFailed(true);else setDraft(newLocalDraft(initialLeft,initialRight))}}
  void restore();return()=>{cancelled=true}
 },[initialLeft,initialRight,projectId,usePreviousDraft])
 if(catalogId)return <CatalogStudio projectId={catalogId}/>
 if(draft)return <GreenMashupStudio initialDraft={draft} initialNotice={notice}/>
 return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col justify-center gap-5 px-6 pt-28">{failed?<><h1 className="display-type text-4xl">Couldn’t open this draft.</h1><p role="alert">{notice}</p><p className="text-sm text-muted-foreground">Starting a new draft will keep any existing draft record on this device.</p><Button onClick={()=>{setDraft(newLocalDraft(initialLeft,initialRight));setNotice("Started a new device draft.")}}>Start a new draft</Button></>:<p role="status" className="flex items-center gap-3"><Loader2 className="size-5 animate-spin"/>Opening your studio…</p>}</div>
}
