import { get } from "@vercel/blob"
import { z } from "zod"
import { getProjectContext, projectError } from "@/lib/green-room/project-access"
import { parseByteRange } from "@/lib/green-room/studio-contract"
import { isAdminUser } from "@/lib/auth/admin"
export const dynamic="force-dynamic"
export async function GET(request:Request) {
 const ctx=await getProjectContext(request);if(ctx.response)return ctx.response
 const params=new URL(request.url).searchParams
 const projectId=params.get("projectId"),candidateId=params.get("candidateId")
 if(!z.uuid().safeParse(projectId).success || !z.uuid().safeParse(candidateId).success)return projectError("invalid_request","Invalid candidate.",400)
 try {
  const p=await ctx.admin.from("green_projects").select("creator_id,left_track_id,right_track_id,status").eq("id",projectId!).maybeSingle()
  if(p.error)return projectError("unavailable","Playback unavailable.",503)
  if(!p.data || p.data.status==="archived" || (p.data.creator_id!==ctx.user.id && !isAdminUser({email:ctx.user.email,id:ctx.user.id})))return projectError("not_found","Candidate unavailable.",404)
  const grants=await Promise.all([p.data.left_track_id,p.data.right_track_id].map(id=>ctx.admin.rpc("green_track_has_active_grant",{p_track_id:id})))
  if(grants.some(g=>g.error))return projectError("unavailable","Permissions could not be checked.",503)
  if(grants.some(g=>g.data!==true))return projectError("source_unavailable","Source permission is no longer active.",403)
  const c=await ctx.admin.from("green_render_candidates").select("asset_id").eq("id",candidateId!).eq("project_id",projectId!).maybeSingle()
  if(c.error)return projectError("unavailable","Candidate unavailable.",503)
  if(!c.data?.asset_id)return projectError("not_found","Candidate unavailable.",404)
  const a=await ctx.admin.from("green_track_assets").select("blob_url,content_type,byte_size").eq("id",c.data.asset_id).eq("owner_id",p.data.creator_id).eq("asset_kind","preview").eq("access_level","private").is("quarantined_at",null).maybeSingle()
  if(a.error)return projectError("unavailable","Audio unavailable.",503)
  if(!a.data)return projectError("not_found","Audio unavailable.",404)
  const token=process.env.GREEN_ROOM_READ_WRITE_TOKEN??process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
  if(!token)return projectError("unavailable","Private playback is not configured.",503)
  const blob=await get(a.data.blob_url,{token,access:"private"})
  if(!blob || blob.statusCode!==200)return projectError("not_found","Audio unavailable.",404)
  const headers=new Headers({"Content-Type":a.data.content_type,"Cache-Control":"private, no-store","Accept-Ranges":"bytes","Content-Disposition":"inline","X-Content-Type-Options":"nosniff"})
  if(!request.headers.has("range"))return new Response(blob.stream,{headers})
  // Short previews only. Bound buffering; never buffer a source master here.
  const reader=blob.stream.getReader();const chunks:Uint8Array[]=[];let size=0
  try {while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>12*1024*1024)throw new Error("Preview exceeds range limit");chunks.push(next.value)}} finally {await reader.cancel().catch(()=>undefined)}
  const range=parseByteRange(request.headers.get("range"),size)
  if(!range){headers.set("Content-Range",`bytes */${size}`);return new Response(null,{status:416,headers})}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  headers.set("Content-Range",`bytes ${range.start}-${range.end}/${size}`);headers.set("Content-Length",String(range.end-range.start+1))
  return new Response(bytes.slice(range.start,range.end+1),{status:206,headers})
 }catch{return projectError("unavailable","Audio could not be loaded. Please retry.",503)}
}
