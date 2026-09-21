import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { candidateAudioPath, type StudioSnapshot } from "./studio-contract"
type Admin = NonNullable<ReturnType<typeof createAdminClient>>
export async function studioSnapshot(admin: Admin, creatorId: string, id: string): Promise<StudioSnapshot | null> {
  const project = await admin.from("green_projects").select("id,title,revision,status,source_mode,selected_candidate_id,parent_project_id,left_track_id,right_track_id").eq("id",id).eq("creator_id",creatorId).maybeSingle()
  if(project.error) throw new Error("Project read failed")
  const p=project.data
  if(!p || p.source_mode!=="catalog") return null
  const [candidates,jobs,owners]=await Promise.all([
    admin.from("green_render_candidates").select("id,arrangement,duration_seconds,quality_status").eq("project_id",id).order("arrangement"),
    admin.from("green_processing_jobs").select("id,status,error_code").eq("project_id",id).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(1).maybeSingle(),
    admin.from("green_catalog_tracks").select("owner_id").in("id",[p.left_track_id,p.right_track_id]),
  ])
  if(candidates.error || jobs.error || owners.error) throw new Error("Studio read failed")
  const ids=(candidates.data??[]).map(c=>c.id)
  const reviews=ids.length ? await admin.from("green_listening_reviews").select("candidate_id,reviewer_id,decision").in("candidate_id",ids) : {data:[],error:null}
  if(reviews.error) throw new Error("Review read failed")
  const excluded=new Set([creatorId,...(owners.data??[]).map(t=>t.owner_id)])
  return {id:p.id,title:p.title,revision:p.revision,status:p.status,selectedCandidateId:p.selected_candidate_id,parentProjectId:p.parent_project_id,
    candidates:(candidates.data??[]).map(c=>({id:c.id,arrangement:c.arrangement,durationSeconds:Number(c.duration_seconds),qualityStatus:c.quality_status,
      keepReviews:new Set((reviews.data??[]).filter(r=>r.candidate_id===c.id && r.decision==="keep" && !excluded.has(r.reviewer_id)).map(r=>r.reviewer_id)).size,
      audioPath:candidateAudioPath(id,c.id)})),
    job:jobs.data ? {id:jobs.data.id,status:jobs.data.status,errorCode:jobs.data.error_code}:null,
    publicationPath:p.status==="published" ? `/listen/${encodeURIComponent(id)}`:null}
}
