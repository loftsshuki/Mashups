import { NextResponse } from "next/server"
import { z } from "zod"
import { getGreenPublication } from "@/lib/green-room/publication"
export const dynamic="force-dynamic"
const headers={"Cache-Control":"private, no-store"}
export async function GET(_request:Request,{params}:{params:Promise<{projectId:string}>}) {
 const {projectId}=await params
 if(!z.uuid().safeParse(projectId).success)return NextResponse.json({error:"Invalid publication ID."},{status:400,headers})
 try{const publication=await getGreenPublication(projectId);return publication?NextResponse.json({publication},{headers}):NextResponse.json({error:"Publication unavailable."},{status:404,headers})}
 catch{return NextResponse.json({error:"Publication service is temporarily unavailable."},{status:503,headers})}
}
