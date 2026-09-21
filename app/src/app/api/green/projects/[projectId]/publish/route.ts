import { POST as studioAction } from "@/app/api/green/studio/route"
/** Compatibility URL; all publication writes now use the revision-checked action. */
export async function POST(request:Request,{params}:{params:Promise<{projectId:string}>}) {
 const {projectId}=await params
 const body=await request.json().catch(()=>null)
 const headers=new Headers(request.headers);headers.delete("content-length");headers.set("Content-Type","application/json")
 return studioAction(new Request(new URL("/api/green/studio",request.url),{method:"POST",headers,body:JSON.stringify({action:"publish",projectId,expectedRevision:body?.expectedRevision})}))
}
