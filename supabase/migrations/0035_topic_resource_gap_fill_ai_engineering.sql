-- Verified topic-2/topic-3 resources for the AI Engineering path (currently
-- paused for members via PAUSED_PATH_IDS, but kept curated). Dedup keyed on
-- (topic_id, url) — see 0032.
--
-- Three primary slots had no candidate that cleared the editorial bar and
-- are left empty rather than filled weakly: ai-llm-apis' Streaming
-- responses, and both of ai-product's topics (Fallback design, UX for
-- uncertainty). ai-product's one filled resource (Explainability + Trust)
-- was verified only via search-result content, not a direct fetch — worth
-- a manual click-through before treating it as confirmed.

begin;

with curated(node_slug, topic_order, resource_order, name, type, platform, url) as (values
  -- ai-llm-apis — Structured outputs (Streaming responses primary: no candidate found)
  ('ai-llm-apis', 2, 1, 'OpenAI DevDay 2024 — Structured Outputs for Reliable Applications', 'video', 'OpenAI', 'https://www.youtube.com/watch?v=kE4BkATIl9c'),
  ('ai-llm-apis', 2, 2, 'Structured Outputs Guide', 'documentation', 'OpenAI docs', 'https://platform.openai.com/docs/guides/structured-outputs'),
  ('ai-llm-apis', 3, 1, 'Streaming API Responses', 'documentation', 'OpenAI docs', 'https://platform.openai.com/docs/guides/streaming-responses'),

  -- ai-rag — Hybrid search / Reranking
  ('ai-rag', 2, 1, 'Retrieval Augmented Generation (RAG) — Module 2', 'course', 'DeepLearning.AI', 'https://www.deeplearning.ai/courses/retrieval-augmented-generation'),
  ('ai-rag', 2, 2, 'Weaviate: Hybrid Search', 'documentation', 'Weaviate docs', 'https://docs.weaviate.io/weaviate/search/hybrid'),
  ('ai-rag', 3, 1, 'Advanced Retrieval for AI with Chroma — Cross-Encoder Re-ranking', 'course', 'DeepLearning.AI', 'https://www.deeplearning.ai/courses/advanced-retrieval-for-ai'),
  ('ai-rag', 3, 2, 'Cohere: Reranking Quickstart', 'documentation', 'Cohere docs', 'https://docs.cohere.com/docs/reranking-quickstart'),

  -- ai-agents — Tool design / Guardrails
  ('ai-agents', 2, 1, 'Building Toward Computer Use with Anthropic — Tool Use', 'course', 'DeepLearning.AI (with Anthropic)', 'https://www.deeplearning.ai/courses/building-toward-computer-use-with-anthropic'),
  ('ai-agents', 2, 2, 'Anthropic: Define Tools', 'documentation', 'Anthropic docs', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools'),
  ('ai-agents', 3, 1, 'Safe and Reliable AI via Guardrails', 'course', 'DeepLearning.AI (with Guardrails AI)', 'https://www.deeplearning.ai/courses/safe-and-reliable-ai-via-guardrails'),
  ('ai-agents', 3, 2, 'OpenAI Agents SDK: Guardrails', 'documentation', 'OpenAI', 'https://openai.github.io/openai-agents-python/guardrails/'),

  -- ai-multimodal — Audio / Document AI
  ('ai-multimodal', 2, 1, 'Building AI Voice Agents for Production', 'course', 'DeepLearning.AI (with LiveKit)', 'https://www.deeplearning.ai/courses/building-ai-voice-agents-for-production'),
  ('ai-multimodal', 2, 2, 'OpenAI: Audio and Speech', 'documentation', 'OpenAI docs', 'https://platform.openai.com/docs/guides/audio'),
  ('ai-multimodal', 3, 1, 'Document AI: From OCR to Agentic Doc Extraction', 'course', 'DeepLearning.AI (with LandingAI)', 'https://www.deeplearning.ai/courses/document-ai-from-ocr-to-agentic-doc-extraction'),
  ('ai-multimodal', 3, 2, 'Anthropic: PDF Support', 'documentation', 'Anthropic docs', 'https://platform.claude.com/docs/en/build-with-claude/pdf-support'),

  -- ai-llmops — Prompt regression / Cost & observability
  ('ai-llmops', 2, 1, 'Automated Testing for LLMOps', 'course', 'DeepLearning.AI (with CircleCI)', 'https://www.deeplearning.ai/courses/automated-testing-llmops'),
  ('ai-llmops', 2, 2, 'Promptfoo: CI/CD Integration', 'documentation', 'Promptfoo docs', 'https://www.promptfoo.dev/docs/integrations/ci-cd/'),
  ('ai-llmops', 3, 1, 'Foundation: Introduction to Agent Observability & Evaluations', 'course', 'LangChain Academy', 'https://academy.langchain.com/courses/intro-to-langsmith'),
  ('ai-llmops', 3, 2, 'LangSmith: Usage and Billing', 'documentation', 'LangChain docs', 'https://docs.langchain.com/langsmith/usage-and-billing'),

  -- ai-product — Fallback design / UX for uncertainty (both primaries: no candidate found)
  ('ai-product', 2, 1, 'Google PAIR: Errors + Graceful Failure', 'documentation', 'Google PAIR', 'https://pair.withgoogle.com/chapter/errors-failing/'),
  ('ai-product', 3, 1, 'Google PAIR: Explainability + Trust', 'documentation', 'Google PAIR', 'https://pair.withgoogle.com/chapter/explainability-trust/')
)
insert into public.resources (node_id, topic_id, "order", name, type, platform, url)
select n.id, t.id, c.resource_order, c.name, c.type, c.platform, c.url
from curated c
join public.nodes n on n.slug = c.node_slug
join public.topics t on t.node_id = n.id and t."order" = c.topic_order
where not exists (
  select 1 from public.resources existing where existing.topic_id = t.id and existing.url = c.url
);

commit;
