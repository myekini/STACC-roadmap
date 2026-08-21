-- Add only the verified, topic-specific resources needed to close the current
-- Foundations/Data Analysis gaps. SQL query validation remains an executable
-- checkpoint backed by SQLBolt rather than a duplicated format-filler lesson.

begin;

-- Replace the broad EDA introduction with an analysis-planning and quality
-- reference, then attach it to the topic it actually teaches.
update public.resources r
set name = 'The Aqua Book — analysis design, quality and uncertainty (chapters 6–8)',
    type = 'documentation',
    platform = 'UK Government',
    url = 'https://www.gov.uk/guidance/the-aqua-book',
    topic_id = target_topic.id,
    "order" = 1
from public.nodes n
join public.topics target_topic
  on target_topic.node_id = n.id and target_topic."order" = 3
where r.node_id = n.id
  and n.slug = 'da-eda'
  and r.url = 'https://www.itl.nist.gov/div898/handbook/eda/section1/eda11.htm';

update public.tasks task
set description = 'Learn: study pandas missing-data handling and use the Aqua Book chapters 6–8 to frame the analysis plan, quality checks and uncertainty'
from public.nodes n
where task.node_id = n.id
  and n.slug = 'da-eda'
  and task."order" = 1;

-- Move the existing accessibility reference to its correct topic before
-- adding the bounded Microsoft Learn course beside it.
update public.resources r
set topic_id = target_topic.id,
    "order" = 2
from public.nodes n
join public.topics target_topic
  on target_topic.node_id = n.id and target_topic."order" = 3
where r.node_id = n.id
  and n.slug = 'da-dashboards'
  and r.url = 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports';

with curated(node_slug, topic_order, resource_order, name, type, platform, url) as (values
  ('found-python', 3, 1, 'Validate pandas data with Pandera', 'video', 'ArjanCodes', 'https://www.youtube.com/watch?v=-tU7fuUiq7w'),
  ('found-python', 3, 2, 'Pandera DataFrame schemas', 'documentation', 'Pandera', 'https://pandera.readthedocs.io/en/stable/dataframe_schemas.html'),
  ('da-dashboards', 3, 1, 'Design effective reports in Power BI — first 3 modules', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/power-bi-effective/'),
  ('da-bi', 3, 1, 'Manage and secure Power BI — semantic models and data access', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/manage-secure-power-bi/'),
  ('da-bi', 3, 2, 'Configure scheduled refresh', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-scheduled-refresh')
)
insert into public.resources (node_id, topic_id, "order", name, type, platform, url)
select n.id, t.id, c.resource_order, c.name, c.type, c.platform, c.url
from curated c
join public.nodes n on n.slug = c.node_slug
join public.topics t on t.node_id = n.id and t."order" = c.topic_order
where not exists (
  select 1 from public.resources existing where existing.url = c.url
);

commit;
