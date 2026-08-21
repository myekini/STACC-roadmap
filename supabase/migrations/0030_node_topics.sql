-- Node content gets a real hierarchy: topics within a node, each with its own
-- curated resources — instead of exactly 2 resources per node with no
-- structure. Mechanical migration, zero hand-authored content: one topic per
-- existing `nodes.skills` entry (already exactly 3, already the de facto
-- topic list — it just had no resources attached), and both of a node's
-- existing resources land on its first topic. Topics 2/3 start with no
-- resources; the admin curriculum editor is the intended way to fill them in
-- with real, individually curated material — not something to fabricate here.

create table public.topics (
  id         uuid primary key default gen_random_uuid(),
  node_id    uuid not null references public.nodes(id) on delete cascade,
  title      text not null,
  "order"    integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
create index idx_topics_node on public.topics (node_id, "order");

alter table public.topics enable row level security;
create policy "topics require auth" on public.topics for select using (auth.uid() is not null);
-- Writes go only through the admin RPCs below, consistent with every other
-- curriculum table (0014's header note) — no insert/update/delete policy.

-- One topic per existing skill, in the same order the skill was authored.
insert into public.topics (node_id, title, "order")
select n.id, s.skill, s.ordinality
from public.nodes n, unnest(n.skills) with ordinality as s(skill, ordinality);

-- ─────────────────────────────────────────────────────────────
-- resources: attach to a topic instead of a bare node, gain a real
-- ordering column (today's "primary vs. secondary" was implicit array
-- position — the exact fragility the node-page audit flagged).
-- ─────────────────────────────────────────────────────────────
alter table public.resources
  add column topic_id uuid references public.topics(id) on delete cascade,
  add column "order" integer not null default 1;

with ranked as (
  select
    r.id as resource_id,
    row_number() over (partition by r.node_id order by r.created_at) as rn
  from public.resources r
),
first_topic as (
  select node_id, id as topic_id
  from (
    select node_id, id, row_number() over (partition by node_id order by "order") as rn
    from public.topics
  ) t
  where rn = 1
)
update public.resources r
set topic_id = ft.topic_id,
    "order" = ranked.rn
from ranked, first_topic ft
where ranked.resource_id = r.id and ft.node_id = r.node_id;

alter table public.resources alter column topic_id set not null;

-- ─────────────────────────────────────────────────────────────
-- Admin RPCs — topics
-- ─────────────────────────────────────────────────────────────
create function public.admin_upsert_topic(
  p_id uuid,
  p_node_id uuid,
  p_title text,
  p_order integer
)
returns public.topics
language plpgsql security definer set search_path = public
as $$
declare
  result public.topics;
begin
  perform public.require_admin();
  if coalesce(trim(p_title), '') = '' then
    raise exception 'Topic title is required.';
  end if;

  if p_id is null then
    insert into public.topics (node_id, title, "order", created_by, updated_by, updated_at)
    values (p_node_id, p_title, coalesce(p_order, 0), auth.uid(), auth.uid(), now())
    returning * into result;
  else
    update public.topics set
      title = p_title,
      "order" = coalesce(p_order, "order"),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

create function public.admin_delete_topic(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  -- Deleting the topic cascades to its resources (on delete cascade), which
  -- would null out any lesson task's resource_id (on delete set null) and
  -- violate the read/watch lesson-completeness check in 0024 if that task's
  -- lesson_title/duration are still set. Block it with a clear message
  -- instead of a raw constraint error.
  if exists (
    select 1 from public.tasks t
    join public.resources r on r.id = t.resource_id
    where r.topic_id = p_id
  ) then
    raise exception 'A lesson task still points at a resource in this topic — edit or delete that task first.';
  end if;
  delete from public.topics where id = p_id;
end;
$$;

create function public.admin_reorder_topics(p_node_id uuid, p_ordered_ids uuid[])
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  update public.topics t set "order" = ordering.idx
  from unnest(p_ordered_ids) with ordinality as ordering(id, idx)
  where t.id = ordering.id and t.node_id = p_node_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- admin_upsert_resource — now scoped to a topic (max 2 per topic,
-- replacing the old "exactly 2 per node" rule) with an explicit order.
-- ─────────────────────────────────────────────────────────────
drop function if exists public.admin_upsert_resource(uuid, uuid, text, text, text, text, text);

create function public.admin_upsert_resource(
  p_id uuid,
  p_topic_id uuid,
  p_order integer,
  p_name text,
  p_type text,
  p_platform text,
  p_url text,
  p_cost text
)
returns public.resources
language plpgsql security definer set search_path = public
as $$
declare
  result public.resources;
  v_node_id uuid;
  existing_count integer;
begin
  perform public.require_admin();
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_url), '') = '' then
    raise exception 'Resource name and URL are required.';
  end if;

  select node_id into v_node_id from public.topics where id = p_topic_id;
  if v_node_id is null then
    raise exception 'Unknown topic.';
  end if;

  if p_id is null then
    select count(*) into existing_count from public.resources where topic_id = p_topic_id;
    if existing_count >= 2 then
      raise exception 'Each topic has at most 2 curated resources — remove one before adding another.';
    end if;
    insert into public.resources (node_id, topic_id, "order", name, type, platform, url, cost, created_by, updated_by, updated_at)
    values (v_node_id, p_topic_id, coalesce(p_order, existing_count + 1), p_name, p_type, coalesce(p_platform, ''), p_url, coalesce(p_cost, 'free'), auth.uid(), auth.uid(), now())
    returning * into result;
  else
    update public.resources set
      "order" = coalesce(p_order, "order"),
      name = p_name,
      type = p_type,
      platform = coalesce(p_platform, ''),
      url = p_url,
      cost = coalesce(p_cost, 'free'),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_upsert_resource(uuid, uuid, integer, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_upsert_resource(uuid, uuid, integer, text, text, text, text, text) to authenticated;
