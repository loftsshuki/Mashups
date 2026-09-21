import { get } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getGreenPublicationAudioAsset } from "@/lib/green-room/publication"
import { parseByteRange } from "@/lib/green-room/studio-contract"
export const dynamic="force-dynamic"
const fail=(error:string,status:number)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}})
export async function GET(request:Request,{params}:{params:Promise<{projectId:string}>}) {
 const {projectId}=await params
 if(!z.uuid().safeParse(projectId).success)return fail("Invalid publication ID.",400)
 const token=process.env.GREEN_ROOM_READ_WRITE_TOKEN??process.env.GREEN_ROOM_BLOB_READ_WRITE_TOKEN
 if(!token)return fail("Playback is not configured.",503)
 try{
  const asset=await getGreenPublicationAudioAsset(projectId);if(!asset)return fail("Publication unavailable.",404)
  const blob=await get(asset.blobUrl,{token,access:"private"});if(!blob||blob.statusCode!==200)return fail("Audio unavailable.",404)
  const headers=new Headers({"Content-Type":asset.contentType,"Content-Disposition":"inline","Cache-Control":"private, no-store","Accept-Ranges":"bytes","X-Content-Type-Options":"nosniff"})
  if(!request.headers.has("range"))return new Response(blob.stream,{headers})
  const reader=blob.stream.getReader();const chunks:Uint8Array[]=[];let size=0
  try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>12*1024*1024)throw new Error("Preview exceeds bounded range buffer");chunks.push(next.value)}}finally{await reader.cancel().catch(()=>undefined)}
  const range=parseByteRange(request.headers.get("range"),size)
  if(!range){headers.set("Content-Range",`bytes */${size}`);return new Response(null,{status:416,headers})}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  headers.set("Content-Range",`bytes ${range.start}-${range.end}/${size}`);headers.set("Content-Length",String(range.end-range.start+1))
  return new Response(bytes.slice(range.start,range.end+1),{status:206,headers})
 }catch{return fail("Playback service is temporarily unavailable.",503)}
}
