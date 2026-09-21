import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { z } from "zod"
import { GreenStudioWorkspace } from "@/components/create/green-studio-workspace"
import { CatalogStudio } from "@/components/create/catalog-studio"
import { getGreenTrack, GREEN_CATALOG } from "@/lib/catalog/green-catalog"
export const metadata: Metadata = {title:"Make a Mashup",description:"Create with approved catalog tracks or try the synthesized demo.",alternates:{canonical:"/create"}}
export default async function CreatePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams
 const projectId=typeof params.project==="string"?params.project:undefined
 const parentId=typeof params.fork==="string"?params.fork:undefined
 if(params.project && (!projectId||!z.uuid().safeParse(projectId).success))notFound()
 if(params.fork && (!parentId||!z.uuid().safeParse(parentId).success))notFound()
 if(params.mode==="catalog"||parentId)return <CatalogStudio key={projectId??parentId??String(params.fresh)} projectId={projectId} parentId={parentId} fresh={params.fresh==="1"}/>
 const requestedLeft=typeof params.left==="string"?params.left:null
 const requestedRight=typeof params.right==="string"?params.right:null
 const initialLeft=getGreenTrack(requestedLeft)?.id??GREEN_CATALOG[0].id
 const initialRight=getGreenTrack(requestedRight)?.id??GREEN_CATALOG[1].id
 const usePreviousDraft=!requestedLeft&&!requestedRight&&params.fresh!=="1"
 return <><GreenStudioWorkspace key={projectId??`${initialLeft}:${initialRight}:${usePreviousDraft}`} initialLeft={initialLeft} initialRight={initialRight} projectId={projectId} usePreviousDraft={usePreviousDraft}/><div className="mx-auto max-w-6xl px-5 pb-16"><Link className="inline-flex min-h-12 items-center border border-foreground px-5 font-semibold" href="/create?mode=catalog">Open the real-audio catalog studio</Link></div></>
}
