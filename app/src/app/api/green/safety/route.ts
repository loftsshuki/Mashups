import { NextResponse } from "next/server"
import { z } from "zod"

import { getProjectContext, projectError } from "@/lib/green-room/project-access"

const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("report"),publicationId:z.uuid(),category:z.enum(["rights","harassment","spam","unsafe","other"]),details:z.string().max(2000).default("")}),
 z.object({action:z.literal("block"),publicationId:z.uuid()}),
 z.object({action:z.literal("unblock"),publicationId:z.uuid()}),
 z.object({action:z.literal("request_deletion"),confirmation:z.literal("DELETE MY ACCOUNT")}),
 z.object({action:z.literal("cancel_deletion")}),
])

export async function GET(request:Request){
 const ctx=await getProjectContext(request);if(ctx.response)return ctx.response
 const [deletion,blocks]=await Promise.all([
  ctx.admin.from("green_account_deletion_requests").select("status,requested_at,updated_at").eq("user_id",ctx.user.id).maybeSingle(),
  ctx.admin.from("green_user_blocks").select("blocked_creator_id",{count:"exact",head:true}).eq("blocker_id",ctx.user.id),
 ])
 if(deletion.error||blocks.error)return projectError("unavailable","Safety settings are temporarily unavailable.",503)
 return NextResponse.json({deletion:deletion.data??null,blockedCreatorCount:blocks.count??0},{headers:{"Cache-Control":"private, no-store"}})
}

export async function POST(request:Request){
 const ctx=await getProjectContext(request);if(ctx.response)return ctx.response
 const parsed=schema.safeParse(await request.json().catch(()=>null))
 if(!parsed.success)return projectError("invalid_request","Invalid safety request.",400)
 const body=parsed.data
 let operation:string,args:Record<string,unknown>
 switch(body.action){
  case "report":
   operation="report_green_publication";args={p_reporter_id:ctx.user.id,p_publication_id:body.publicationId,p_category:body.category,p_details:body.details};break
  case "block":
  case "unblock":
   operation="set_green_publication_creator_block";args={p_blocker_id:ctx.user.id,p_publication_id:body.publicationId,p_block:body.action==="block"};break
  case "request_deletion":
   operation="request_green_account_deletion";args={p_user_id:ctx.user.id,p_confirm:true};break
  case "cancel_deletion":
   operation="cancel_green_account_deletion";args={p_user_id:ctx.user.id};break
 }
 const result=await ctx.admin.rpc(operation,args)
 if(result.error){
  if(["P0001","22023"].includes(result.error.code))return projectError("conflict",result.error.message,409)
  return projectError("unavailable","Safety request could not be confirmed.",503)
 }
 return NextResponse.json({ok:true,result:result.data??null},{headers:{"Cache-Control":"private, no-store"}})
}
