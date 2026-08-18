-- Strengthen Data Analysis in place while preserving progress and ratings.

update public.nodes n set description = v.description, skills = v.skills
from (values
  ('da-eda', 'Translate a stakeholder question into defined metrics, profile the data, and produce a reproducible analysis plan.', array['Question & metric framing','Data profiling','Analysis planning']),
  ('da-visualization', 'Choose honest visual encodings and produce accessible charts that make the comparison and uncertainty clear.', array['Chart selection','Honest encoding','Accessible visualisation']),
  ('da-dashboards', 'Build a focused dashboard that answers three defined questions on desktop and mobile without hiding context or accessibility.', array['Decision-led layout','KPI definitions','Accessible interaction']),
  ('da-storytelling', 'Turn analysis into a concise recommendation that separates evidence, uncertainty, limitations, and the decision required.', array['Executive synthesis','Evidence & uncertainty','Recommendation delivery']),
  ('da-bi', 'Prepare data with Power Query, model facts and dimensions, write dependable DAX measures, and publish a governed report.', array['Power Query','Semantic models & DAX','Security & refresh']),
  ('da-ai-analysis', 'Use AI to accelerate an analysis while preserving reproducibility, privacy, source traceability, and human accountability.', array['AI-assisted workflow','Claim verification','Audit trail'])
) as v(slug, description, skills) where n.slug = v.slug;

update public.resources r set name = v.new_name, type = v.new_type, platform = v.platform, url = v.url
from public.nodes n, (values
  ('da-eda','Kaggle: Data Cleaning','Pandas — working with missing data','documentation','pandas.pydata.org','https://pandas.pydata.org/docs/user_guide/missing_data.html'),
  ('da-eda','ydata-profiling Documentation','NIST EDA Handbook — introduction','documentation','NIST','https://www.itl.nist.gov/div898/handbook/eda/section1/eda11.htm'),
  ('da-visualization','Storytelling with Data (blog)','Matplotlib — the lifecycle of a plot','documentation','Matplotlib','https://matplotlib.org/stable/tutorials/lifecycle.html'),
  ('da-visualization','Matplotlib Tutorials','Accessible data visualisation guidance','article','UK Analysis Function','https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/'),
  ('da-dashboards','Metabase: Dashboard Best Practices','Power BI report design tips','documentation','Microsoft Learn','https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips'),
  ('da-dashboards','Looker Studio Help Center','Design Power BI reports for accessibility','documentation','Microsoft Learn','https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports'),
  ('da-storytelling','SWD Podcast & Exercises','Storytelling with Data exercises','article','Storytelling with Data','https://community.storytellingwithdata.com/exercises'),
  ('da-storytelling','Nightingale — The Journal of the Data Visualization Society','Communicating quality, uncertainty and change','documentation','UK Analysis Function','https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/'),
  ('da-bi','Microsoft Learn: Power BI','PL-300 Data Analyst study guide','course','Microsoft Learn','https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300'),
  ('da-bi','Metabase Documentation','Learn DAX basics in Power BI Desktop','documentation','Microsoft Learn','https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics'),
  ('da-ai-analysis','Prompt Engineering Guide','NIST AI RMF Generative AI Profile','documentation','NIST','https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence'),
  ('da-ai-analysis','Anthropic Cookbook','Generative AI Framework for government','documentation','UK Government','https://www.gov.uk/government/publications/generative-ai-framework-for-hmg/generative-ai-framework-for-hmg-html')
) as v(slug, old_name, new_name, new_type, platform, url)
where r.node_id = n.id and n.slug = v.slug and r.name = v.old_name;

update public.tasks t set description = v.description, type = v.task_type
from public.nodes n, (values
  ('da-eda',1,'Learn: study pandas missing-data handling and the NIST EDA purpose and approach sections','read'),
  ('da-eda',2,'Build: add brief.md and analysis.ipynb that define the stakeholder, decision, metrics and assumptions, then profile missingness, duplicates, distributions, segments and anomalies with reproducible code','build'),
  ('da-visualization',1,'Learn: complete the Matplotlib lifecycle tutorial and accessibility guidance','read'),
  ('da-visualization',2,'Build: remake three misleading charts with justified chart choices, direct labels, colour-safe palettes, alt text and a written note explaining every correction','build'),
  ('da-dashboards',1,'Learn: study Microsoft report-design and accessibility guidance','read'),
  ('da-dashboards',2,'Build: produce desktop and mobile dashboard views for three stakeholder questions, with metric definitions, useful defaults, keyboard order, alt text and a five-person usability checklist','build'),
  ('da-storytelling',1,'Learn: complete one Storytelling with Data exercise and study the uncertainty guidance','read'),
  ('da-storytelling',2,'Build: create a five-slide decision narrative and one-page executive memo covering context, evidence, recommendation, uncertainty, limitations and next action','build'),
  ('da-bi',1,'Learn: cover the PL-300 prepare/model/manage objectives and complete the DAX basics tutorial','read'),
  ('da-bi',2,'Build: publish a star-schema report with documented Power Query steps, a date table, explicit DAX measures, row-level security, scheduled refresh notes and a shared metric dictionary','build'),
  ('da-ai-analysis',1,'Learn: review the NIST generative-AI risk profile and one documented AI analysis workflow','read'),
  ('da-ai-analysis',2,'Build: repeat one prior analysis with AI assistance, preserve prompts and generated code, remove sensitive data, independently verify every number and citation, and compare time saved against new risks','build')
) as v(slug, task_order, description, task_type)
where t.node_id = n.id and n.slug = v.slug and t."order" = v.task_order;
