import { NextResponse } from "next/server"
import { z } from "zod"
import { getProjectContext, projectError } from "@/lib/green-room/project-access"
import { studioSnapshot } from "@/lib/green-room/studio-service"
import { studioPath } from "@/lib/green-room/studio-contract"
import { resolveGreenProcessorRoute } from "@/lib/green-room/processor-routing"
import { consumeRateLimit, resolveRateLimitKey } from "@/lib/security/rate-limit"
import { isAdminUser } from "@/lib/auth/admin"
export const dynamic="force-dynamic"
const revision=z.number().int().positive().max(2147483646)
const recipe=z.object({targetBpm:z.number().min(60).max(180),durationSeconds:z.number().min(8).max(30),leftStartSeconds:z.number().min(0).max(600),rightStartSeconds:z.number().min(0).max(600),leftSemitones:z.number().int().min(-3).max(3),rightSemitones:z.number().int().min(-3).max(3)})
const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("create"),projectId:z.uuid(),title:z.string().trim().min(1).max(120),leftId:z.uuid(),rightId:z.uuid()}),
 z.object({action:z.literal("render"),projectId:z.uuid(),expectedRevision:revision,requestId:z.uuid(),recipe}),
 z.object({action:z.literal("select"),projectId:z.uuid(),expectedRevision:revision,candidateId:z.uuid()}),
 z.object({action:z.literal("publish"),projectId:z.uuid(),expectedRevision:revision}),
 z.object({action:z.literal("fork"),parentId:z.uuid(),projectId:z.uuid()}),
 z.object({action:z.literal("review"),candidateId:z.uuid(),decision:z.enum(["keep","reject","rework"]),musicality:z.number().int().min(1).max(5),artifacts:z.number().int().min(1).max(5),share:z.number().int().min(1).max(5),notes:z.string().max(2000)}),
])
export async function GET(request:Request) {
 const ctx=await getProjectContext(request); if(ctx.response) return ctx.response
 const id=new URL(request.url).searchParams.get("projectId")
 if(!z.uuid().safeParse(id).success) return projectError("invalid_request","Invalid project ID.",400)
 try {const project=await studioSnapshot(ctx.admin,ctx.user.id,id!);return project ? NextResponse.json({project},{headers:{"Cache-Control":"private, no-store"}}):projectError("not_found","Catalog project not found.",404)}
 catch {return projectError("unavailable","Your project could not be loaded. Try again.",503)}
}
export async function POST(request:Request) {
 const ctx=await getProjectContext(request); if(ctx.response) return ctx.response
 // Cookie writes must be same-origin. Native clients use verified Bearer tokens.
 const origin=request.headers.get("origin")
 if(!request.headers.get("authorization") && origin && origin!==new URL(request.url).origin) return projectError("invalid_request","Cross-origin write rejected.",403)
 const limited=await consumeRateLimit({key:resolveRateLimitKey(request,"green.studio",ctx.user.id),limit:30,windowMs:60000})
 if(!limited.allowed) return projectError("unavailable","Studio requests are temporarily limited.",limited.unavailable?503:429)
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success) return projectError("invalid_request","Invalid studio request.",400)
 const b=parsed.data
 let operation: string; let args: Record<string,unknown>
 switch(b.action) {
  case "create":
   if(b.leftId===b.rightId) return projectError("invalid_request","Choose different sources.",400)
   operation="save_green_project";args={p_id:b.projectId,p_creator_id:ctx.user.id,p_title:b.title,p_sources:{kind:"catalog",leftId:b.leftId,rightId:b.rightId},p_intensity:82,p_selected_arrangement:null,p_expected_revision:0};break
  case "select": operation="select_green_project_candidate";args={p_project_id:b.projectId,p_creator_id:ctx.user.id,p_candidate_id:b.candidateId,p_expected_revision:b.expectedRevision};break
  case "publish": operation="publish_green_studio_project";args={p_project_id:b.projectId,p_creator_id:ctx.user.id,p_expected_revision:b.expectedRevision};break
  case "fork": operation="fork_green_publication";args={p_parent_id:b.parentId,p_creator_id:ctx.user.id,p_new_id:b.projectId};break
  case "render":
   if(!resolveGreenProcessorRoute({jobType:"render_candidates",provider:"renderer"})) return projectError("unavailable","Real-audio rendering is not configured. Your project is saved.",503)
   operation="start_green_studio_render";args={p_project_id:b.projectId,p_creator_id:ctx.user.id,p_expected_revision:b.expectedRevision,p_request_id:b.requestId,p_recipe:b.recipe};break
  case "review":
   if(!isAdminUser({email:ctx.user.email,id:ctx.user.id})) return projectError("unauthenticated","Reviewer access required.",403)
   operation="review_green_render_candidate";args={p_candidate_id:b.candidateId,p_reviewer_id:ctx.user.id,p_decision:b.decision,p_musicality:b.musicality,p_artifacts:b.artifacts,p_share:b.share,p_notes:b.notes};break
 }
 try {
  const result=await ctx.admin.rpc(operation,args)
  if(result.error) {
   if(result.error.code==="42501") return projectError("not_found","Project unavailable or reviewer is not independent.",404)
   if(["P0001","40001","22023"].includes(result.error.code)) return projectError("conflict",result.error.message,409)
   return projectError("unavailable","Studio write could not be confirmed. Reload before retrying.",503)
  }
  if(b.action==="review") return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}})
  const project=await studioSnapshot(ctx.admin,ctx.user.id,b.projectId)
  if(!project) return projectError("unavailable","The saved project receipt could not be verified.",503)
  return NextResponse.json({project,projectPath:studioPath(project.id)},{status:b.action==="render"?202:200,headers:{"Cache-Control":"private, no-store"}})
 } catch {return projectError("unavailable","Studio is temporarily unavailable. Your last confirmed save is unchanged.",503)}
}
