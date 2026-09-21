-- Native/web safety surfaces and reversible account-deletion request workflow.
begin;

create table if not exists public.green_content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  publication_id uuid references public.green_projects(id) on delete set null,
  reported_creator_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('rights','harassment','spam','unsafe','other')),
  details text not null default '' check (char_length(details) <= 2000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.green_user_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_creator_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_creator_id),
  constraint green_no_self_block check (blocker_id <> blocked_creator_id)
);

create table if not exists public.green_account_deletion_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('requested','cancelled','completed')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.green_content_reports enable row level security;
alter table public.green_user_blocks enable row level security;
alter table public.green_account_deletion_requests enable row level security;
revoke all on public.green_content_reports,public.green_user_blocks,public.green_account_deletion_requests from public,anon,authenticated;
grant all on public.green_content_reports,public.green_user_blocks,public.green_account_deletion_requests to service_role;

create or replace function public.report_green_publication(
  p_reporter_id uuid,p_publication_id uuid,p_category text,p_details text
) returns uuid language plpgsql security invoker set search_path='' as $$
declare creator uuid; report_id uuid;
begin
  if p_reporter_id is null or p_publication_id is null
    or p_category not in ('rights','harassment','spam','unsafe','other') then
    raise exception using errcode='22023',message='Valid report details are required.';
  end if;
  select creator_id into creator from public.green_projects
  where id=p_publication_id and status='published';
  if creator is null then raise exception using errcode='P0001',message='Publication is unavailable.';end if;
  insert into public.green_content_reports(reporter_id,publication_id,reported_creator_id,category,details)
  values(p_reporter_id,p_publication_id,creator,p_category,left(coalesce(p_details,''),2000))
  returning id into report_id;
  return report_id;
end;
$$;

create or replace function public.set_green_publication_creator_block(
  p_blocker_id uuid,p_publication_id uuid,p_block boolean
) returns void language plpgsql security invoker set search_path='' as $$
declare creator uuid;
begin
  if p_blocker_id is null or p_publication_id is null or p_block is null then
    raise exception using errcode='22023',message='Block action is incomplete.';
  end if;
  select creator_id into creator from public.green_projects where id=p_publication_id and status='published';
  if creator is null then raise exception using errcode='P0001',message='Publication is unavailable.';end if;
  if creator=p_blocker_id then raise exception using errcode='22023',message='You cannot block your own creator account.';end if;
  if p_block then
    insert into public.green_user_blocks(blocker_id,blocked_creator_id) values(p_blocker_id,creator)
    on conflict do nothing;
  else
    delete from public.green_user_blocks where blocker_id=p_blocker_id and blocked_creator_id=creator;
  end if;
end;
$$;

create or replace function public.request_green_account_deletion(
  p_user_id uuid,p_confirm boolean
) returns public.green_account_deletion_requests
language plpgsql security invoker set search_path='' as $$
declare result public.green_account_deletion_requests%rowtype;
begin
  if p_user_id is null or p_confirm is distinct from true then
    raise exception using errcode='22023',message='Explicit deletion confirmation is required.';
  end if;
  insert into public.green_account_deletion_requests(user_id,status,requested_at,updated_at)
  values(p_user_id,'requested',now(),now())
  on conflict(user_id) do update set status='requested',requested_at=now(),updated_at=now()
  returning * into result;
  return result;
end;
$$;

create or replace function public.cancel_green_account_deletion(p_user_id uuid)
returns public.green_account_deletion_requests
language plpgsql security invoker set search_path='' as $$
declare result public.green_account_deletion_requests%rowtype;
begin
  update public.green_account_deletion_requests set status='cancelled',updated_at=now()
  where user_id=p_user_id and status='requested' returning * into result;
  return result;
end;
$$;

revoke all on function public.report_green_publication(uuid,uuid,text,text),
 public.set_green_publication_creator_block(uuid,uuid,boolean),
 public.request_green_account_deletion(uuid,boolean),
 public.cancel_green_account_deletion(uuid)
from public,anon,authenticated;
grant execute on function public.report_green_publication(uuid,uuid,text,text),
 public.set_green_publication_creator_block(uuid,uuid,boolean),
 public.request_green_account_deletion(uuid,boolean),
 public.cancel_green_account_deletion(uuid)
to service_role;

commit;
