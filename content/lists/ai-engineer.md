---
title: Every free resource to become an AI engineer
shortTitle: AI engineer roadmap
hook: f**king goldmine for AI engineers
description: 'A free 16-step AI engineer roadmap: Python to RAG, agents, evals, security, LLMOps, fine-tuning and interviews. 108 official docs, courses, repos and papers.'
lede: 16 steps from writing software to shipping AI systems, in order. Each step says what to learn and what to build, then links the free official docs, courses, repos and papers to learn it. 108 links, all checked on 24 Nov 2026.
category: Learning
tags:
- ai-engineering
- roadmap
- rag
- agents
- llmops
- courses
icon: →
accent: '#ffb347'
updated: '2026-11-24'
verified: '2026-11-24'
featured: true
stats:
- value: '16'
  label: steps
  note: 7 phases, in order
- value: '108'
  label: free resources
  note: docs, courses, repos, papers
- value: '14'
  label: projects to build
  note: most steps end with one
roadmap:
- title: Software engineering basics
  phase: Foundations
  category: 01 Software basics
  summary: 'Ship normal software before you add a model: Python, HTTP APIs, a database, Git and containers.'
  topics:
  - Python
  - HTTP & JSON
  - FastAPI
  - SQL
  - Git
  - Docker
  build: A plain REST API, no AI, deployed
- title: How LLMs actually work
  phase: Foundations
  category: 02 How LLMs work
  summary: 'Build a mental model: tokens, embeddings, attention, training, inference, sampling, reasoning models and how to pick one.'
  topics:
  - Tokenization
  - Transformers
  - Pretraining & RLHF
  - Sampling
  - Reasoning models
  - Benchmarks
- title: Building on LLM APIs
  phase: Foundations
  category: 03 LLM APIs
  summary: 'Turn single calls into software: messages, streaming, structured output, tool calls, retries, async and cost tracking.'
  topics:
  - Chat & streaming
  - Structured outputs
  - Tool calling
  - Async & batching
  - Retries & fallbacks
  - Cost tracking
  build: A streaming assistant that calls tools
- title: Prompt engineering
  phase: Foundations
  category: 04 Prompting
  summary: 'Write instructions that make outputs predictable: examples, step-by-step reasoning, system prompts, output control, versioning.'
  topics:
  - Few-shot
  - Chain of thought
  - System prompts
  - Output format
  - Prompt caching
  - Injection basics
  build: Take one real prompt and measurably improve it
- title: Retrieval and RAG
  phase: Retrieval
  category: 05 RAG
  summary: 'Ground answers in your data: parse documents, chunk, embed, search with vectors and BM25, rerank, cite and say no.'
  topics:
  - Parsing & chunking
  - Embeddings
  - Vector DBs & ANN
  - Hybrid search
  - Reranking
  - Citations
  build: A hybrid search engine, then a deployed RAG app
- title: AI agents
  phase: Agents
  category: 06 Agents
  summary: 'Let the model choose the next step: tool use, ReAct, planning, MCP, memory, multi-agent setups and sandboxed code.'
  topics:
  - Agent loop
  - Tools
  - MCP
  - Memory
  - Multi-agent
  - Sandboxes
  build: A production-style agent
- title: Context engineering
  phase: Agents
  category: 07 Context engineering
  summary: 'Treat the context window as a budget: what goes in, what gets compressed, what moves to memory, what gets cached.'
  topics:
  - Selection
  - Compaction
  - Memory offloading
  - Long context
  - Prompt caching
  - Agent harness
  build: A long-running agent that manages its own context
- title: LLM evaluations
  phase: Evals & trust
  category: 08 Evals
  summary: 'Measure before you ship: test sets, LLM-as-judge, offline vs online evals, regression suites, RAG and agent evals.'
  topics:
  - Error analysis
  - LLM-as-judge
  - Eval suites
  - Regression tests
  - RAG evals
  - Agent evals
- title: AI security
  phase: Evals & trust
  category: 09 AI security
  summary: Defend against prompt injection, jailbreaks, data leaks and unsafe tool use, then red-team your own app.
  topics:
  - Threat model
  - Prompt injection
  - Guardrails
  - Tool permissions
  - PII & secrets
  - Red teaming
  build: Red-team and harden an agentic RAG app
- title: AI system design
  phase: Production
  category: 10 System design
  summary: 'Design the whole system and defend each choice on quality, latency, cost and reliability: routing, caching, fallbacks, feedback.'
  topics:
  - Design framework
  - Model routing
  - Caching
  - Latency
  - Graceful degradation
  - Feedback loops
  build: A written design doc for a real AI product
- title: 'LLMOps: dev to production'
  phase: Production
  category: 11 LLMOps
  summary: Version prompts, gate releases on evals, containerize, deploy with CI/CD and watch traces once real users arrive.
  topics:
  - Prompt versioning
  - Eval gates
  - CI/CD
  - Deployment
  - Tracing
  - Rollbacks
  build: Take your RAG app and agent to production
- title: Managed AI platforms
  phase: Production
  category: 12 Managed platforms
  summary: 'Ship on what teams actually buy: a cloud AI platform, an open-weight host or a router, and know what you give up.'
  topics:
  - Bedrock / Vertex / Foundry
  - Open-weight hosts
  - Routers
  - Quotas & cost
  - Data residency
  - Lock-in
  build: Deploy one app on a managed platform
- title: 'Multimodal: images, audio, video'
  phase: Frontier
  category: 13 Multimodal
  summary: 'Go beyond text: vision and document understanding, speech in and out, realtime voice agents and cross-modal search.'
  topics:
  - Vision
  - Document & visual RAG
  - Speech-to-text
  - Text-to-speech
  - Voice agents
  - Cross-modal search
  build: Ship one multimodal build
- title: Fine-tuning
  phase: Frontier
  category: 14 Fine-tuning
  summary: 'Fine-tune only when prompting and retrieval run out: data curation, SFT, LoRA/QLoRA, DPO, distillation, and prove it with evals.'
  topics:
  - When to tune
  - Data curation
  - SFT
  - LoRA & QLoRA
  - DPO & RL
  - Serving adapters
  build: A LoRA that beats a prompted baseline
- title: Projects and portfolio
  phase: Frontier
  category: 15 Projects
  summary: 'Proof, not certificates: combine earlier steps into 3–5 public builds you can demo and defend.'
  topics:
  - Pick real problems
  - Reuse earlier builds
  - Write it up
  - Deploy a demo
  build: 3–5 public portfolio projects
- title: AI engineer interview prep
  phase: Interview
  category: 16 Interview prep
  summary: 'Turn the work into offers: scenario questions, system-design rounds, debugging cases and defending your projects.'
  topics:
  - Role positioning
  - RAG & agent scenarios
  - System-design rounds
  - Project defense
  - Behavioral
  build: A full mock interview loop
items:
- name: The Python Tutorial
  url: https://docs.python.org/3/tutorial/
  category: 01 Software basics
  badge: official docs
  description: The official walk-through of the language, from data structures to modules and classes.
  tags:
  - docs
- name: FastAPI Tutorial
  url: https://fastapi.tiangolo.com/tutorial/
  category: 01 Software basics
  badge: official docs
  description: Step-by-step guide to typed Python APIs, the default stack for serving LLM apps.
  tags:
  - docs
  - Python
- name: 'MDN: Overview of HTTP'
  url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview
  category: 01 Software basics
  badge: official docs
  description: Mozilla's explainer of requests, responses, headers and status codes.
  tags:
  - docs
- name: PostgreSQL Tutorial
  url: https://www.postgresql.org/docs/current/tutorial.html
  category: 01 Software basics
  badge: official docs
  description: The Postgres manual's own intro to tables, queries and joins. Same database you will use for pgvector later.
  tags:
  - docs
- name: Pro Git
  url: https://git-scm.com/book/en/v2
  category: 01 Software basics
  badge: free book
  description: The full Git book, free to read online.
  tags:
  - book
- name: 'Docker: Learn'
  url: https://docs.docker.com/get-started/
  category: 01 Software basics
  badge: official docs
  description: Docker's own path from first container to Compose.
  tags:
  - docs
- name: The Missing Semester (MIT)
  url: https://missing.csail.mit.edu/
  category: 01 Software basics
  badge: free course
  description: MIT's course on the shell, editors, Git, debugging and the tools classes skip.
  tags:
  - course
- name: Deep Dive into LLMs like ChatGPT
  url: https://www.youtube.com/watch?v=7xTGNNLPyMI
  category: 02 How LLMs work
  badge: video · Andrej Karpathy
  description: Karpathy's long general-audience walk-through of how ChatGPT-style models are trained and why they behave the way they do.
  tags:
  - video
- name: '3Blue1Brown: Neural networks'
  url: https://www.3blue1brown.com/topics/neural-networks
  category: 02 How LLMs work
  badge: video series
  description: Visual lessons on neural nets, transformers and attention.
  tags:
  - video
- name: The Illustrated Transformer
  url: https://jalammar.github.io/illustrated-transformer/
  category: 02 How LLMs work
  badge: article · Jay Alammar
  description: The classic picture-by-picture explanation of the transformer.
  tags:
  - article
- name: Hugging Face LLM Course
  url: https://huggingface.co/learn/llm-course
  category: 02 How LLMs work
  badge: free course
  description: Hugging Face's course on transformers, tokenizers, datasets and fine-tuning.
  tags:
  - course
- name: LLM Course (mlabonne)
  url: https://github.com/mlabonne/llm-course
  category: 02 How LLMs work
  badge: GitHub roadmap
  description: 'Maxime Labonne''s roadmap and notebooks: LLM fundamentals, the scientist track and the engineer track.'
  tags:
  - GitHub
  - course
- name: Tiktokenizer
  url: https://tiktokenizer.vercel.app/
  category: 02 How LLMs work
  badge: tool
  description: Paste text and see exactly how it splits into tokens.
  tags:
  - tool
- name: Arena leaderboard
  url: https://arena.ai/leaderboard
  category: 02 How LLMs work
  badge: leaderboard
  description: Rankings built from people voting on real head-to-head model answers.
  tags:
  - tool
- name: Artificial Analysis
  url: https://artificialanalysis.ai/
  category: 02 How LLMs work
  badge: benchmarks
  description: Compares models on quality, price, speed and latency.
  tags:
  - tool
- name: OpenAI API quickstart
  url: https://developers.openai.com/api/docs/quickstart
  category: 03 LLM APIs
  badge: official docs
  description: First request to the OpenAI API, then text, images, tools and streaming.
  tags:
  - docs
- name: 'Claude: Get started'
  url: https://platform.claude.com/docs/en/get-started
  category: 03 LLM APIs
  badge: official docs
  description: Anthropic's first-call guide for the Claude API.
  tags:
  - docs
- name: Gemini API docs
  url: https://aistudio.google.com/docs
  category: 03 LLM APIs
  badge: official docs
  description: Google's docs for the Gemini API, with a free tier.
  tags:
  - docs
- name: 'OpenAI: Structured outputs'
  url: https://developers.openai.com/api/docs/guides/structured-outputs
  category: 03 LLM APIs
  badge: official docs
  description: Make the model return JSON that matches your schema.
  tags:
  - docs
- name: Pydantic AI
  url: https://ai.pydantic.dev/
  category: 03 LLM APIs
  badge: framework
  description: Type-safe Python agent framework from the Pydantic team.
  tags:
  - framework
  - Python
- name: Instructor
  url: https://python.useinstructor.com/
  category: 03 LLM APIs
  badge: library
  description: Structured outputs from any LLM, validated with Pydantic.
  tags:
  - library
  - Python
- name: LangChain docs
  url: https://docs.langchain.com/
  category: 03 LLM APIs
  badge: framework
  description: Docs for LangChain and LangGraph, the most common orchestration stack.
  tags:
  - framework
  - docs
- name: DeepLearning.AI courses
  url: https://www.deeplearning.ai/short-courses/
  category: 03 LLM APIs
  badge: free courses
  description: 1–2 hour courses on building with LLMs, many made with the model labs.
  tags:
  - course
- name: 'Claude: Prompt engineering'
  url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
  category: 04 Prompting
  badge: official docs
  description: Anthropic's guide to clear prompts, examples, XML tags and chaining.
  tags:
  - docs
- name: 'OpenAI: Prompt engineering'
  url: https://developers.openai.com/api/docs/guides/prompt-engineering
  category: 04 Prompting
  badge: official docs
  description: OpenAI's guide to messages, roles and few-shot prompting.
  tags:
  - docs
- name: 'Gemini: Prompting strategies'
  url: https://aistudio.google.com/docs/prompting-strategies
  category: 04 Prompting
  badge: official docs
  description: Google's prompt design guide for Gemini.
  tags:
  - docs
- name: Prompt engineering interactive tutorial
  url: https://github.com/anthropics/prompt-eng-interactive-tutorial
  category: 04 Prompting
  badge: GitHub · Anthropic
  description: Anthropic's 9-chapter hands-on notebook course with exercises.
  tags:
  - GitHub
  - course
- name: Prompt Engineering Guide
  url: https://www.promptingguide.ai/
  category: 04 Prompting
  badge: guide
  description: Open guide to prompting techniques, each linked to its paper.
  tags:
  - guide
- name: Docling
  url: https://github.com/docling-project/docling
  category: 05 RAG
  badge: GitHub
  description: Turns PDFs, DOCX, HTML and slides into clean Markdown or JSON for retrieval.
  tags:
  - GitHub
  - library
- name: Sentence Transformers
  url: https://sbert.net/
  category: 05 RAG
  badge: library
  description: The standard library for embedding and reranking models.
  tags:
  - library
  - Python
- name: MTEB leaderboard
  url: https://huggingface.co/spaces/mteb/leaderboard
  category: 05 RAG
  badge: leaderboard
  description: Benchmark for choosing an embedding model by task and language.
  tags:
  - tool
- name: pgvector
  url: https://github.com/pgvector/pgvector
  category: 05 RAG
  badge: GitHub
  description: Vector search inside Postgres, with HNSW and IVFFlat indexes.
  tags:
  - GitHub
  - database
- name: Qdrant docs
  url: https://qdrant.tech/documentation/
  category: 05 RAG
  badge: official docs
  description: Open-source vector database with filtering and hybrid search.
  tags:
  - docs
  - database
- name: Contextual Retrieval
  url: https://www.anthropic.com/news/contextual-retrieval
  category: 05 RAG
  badge: article · Anthropic
  description: Anthropic's write-up on contextual embeddings + BM25 + reranking, with measured drops in failed retrievals.
  tags:
  - article
- name: LlamaIndex docs
  url: https://docs.llamaindex.ai/
  category: 05 RAG
  badge: framework
  description: Framework for indexing documents and building RAG pipelines.
  tags:
  - framework
  - docs
- name: Pinecone Learn
  url: https://www.pinecone.io/learn/
  category: 05 RAG
  badge: guides
  description: Free articles on embeddings, chunking, hybrid search and reranking.
  tags:
  - guide
- name: RAG paper (Lewis et al., 2020)
  url: https://arxiv.org/abs/2005.11401
  category: 05 RAG
  badge: paper
  description: The paper that named retrieval-augmented generation.
  tags:
  - paper
- name: Building effective agents
  url: https://www.anthropic.com/engineering/building-effective-agents
  category: 06 Agents
  badge: article · Anthropic
  description: When to use workflows vs agents, and the patterns that hold up in production.
  tags:
  - article
- name: Model Context Protocol
  url: https://modelcontextprotocol.io/
  category: 06 Agents
  badge: official docs
  description: The open standard for connecting agents to tools and data.
  tags:
  - docs
  - protocol
- name: LangGraph
  url: https://docs.langchain.com/oss/python/langgraph/overview
  category: 06 Agents
  badge: framework
  description: Graph-based framework for stateful, long-running agents.
  tags:
  - framework
  - docs
- name: OpenAI Agents SDK
  url: https://openai.github.io/openai-agents-python/
  category: 06 Agents
  badge: framework
  description: Lightweight Python SDK for agents, handoffs and guardrails.
  tags:
  - framework
  - Python
- name: Hugging Face Agents Course
  url: https://huggingface.co/learn/agents-course
  category: 06 Agents
  badge: free course
  description: Free course from agent basics to frameworks, with a certificate.
  tags:
  - course
- name: ReAct paper
  url: https://arxiv.org/abs/2210.03629
  category: 06 Agents
  badge: paper
  description: 'Reasoning + acting interleaved: the loop most agents still run.'
  tags:
  - paper
- name: E2B
  url: https://github.com/e2b-dev/E2B
  category: 06 Agents
  badge: GitHub
  description: Open-source cloud sandboxes for running agent-written code safely.
  tags:
  - GitHub
  - tool
- name: Effective context engineering for AI agents
  url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  category: 07 Context engineering
  badge: article · Anthropic
  description: 'Anthropic on curating context for agents: compaction, note-taking and sub-agents.'
  tags:
  - article
- name: Context engineering for agents
  url: https://blog.langchain.com/context-engineering-for-agents/
  category: 07 Context engineering
  badge: article · LangChain
  description: 'Write, select, compress and isolate: the four strategies, with examples.'
  tags:
  - article
- name: Lessons from building Manus
  url: https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
  category: 07 Context engineering
  badge: article · Manus
  description: 'Production lessons: KV-cache hit rate, file system as memory, keeping errors in context.'
  tags:
  - article
- name: Lost in the Middle
  url: https://arxiv.org/abs/2307.03172
  category: 07 Context engineering
  badge: paper
  description: Shows models use information at the start and end of long contexts better than the middle.
  tags:
  - paper
- name: 'Claude: Prompt caching'
  url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  category: 07 Context engineering
  badge: official docs
  description: Cache long, repeated context to cut cost and latency.
  tags:
  - docs
- name: Your AI product needs evals
  url: https://hamel.dev/blog/posts/evals/
  category: 08 Evals
  badge: article · Hamel Husain
  description: The practical case and method for evals, from unit tests to human review.
  tags:
  - article
- name: promptfoo
  url: https://github.com/promptfoo/promptfoo
  category: 08 Evals
  badge: GitHub
  description: CLI for testing prompts, agents and RAG, plus red teaming.
  tags:
  - GitHub
  - tool
- name: DeepEval
  url: https://github.com/confident-ai/deepeval
  category: 08 Evals
  badge: GitHub
  description: Pytest-style evaluation framework for LLM apps.
  tags:
  - GitHub
  - tool
  - Python
- name: Ragas
  url: https://docs.ragas.io/
  category: 08 Evals
  badge: official docs
  description: Metrics and test-set generation for RAG and agent evaluation.
  tags:
  - docs
  - tool
- name: Inspect
  url: https://inspect.aisi.org.uk/
  category: 08 Evals
  badge: framework · UK AISI
  description: The UK AI Security Institute's open-source framework for model evals.
  tags:
  - framework
  - docs
- name: OpenAI Evals
  url: https://github.com/openai/evals
  category: 08 Evals
  badge: GitHub
  description: OpenAI's framework and open registry of benchmarks.
  tags:
  - GitHub
  - tool
- name: LM Evaluation Harness
  url: https://github.com/EleutherAI/lm-evaluation-harness
  category: 08 Evals
  badge: GitHub
  description: EleutherAI's standard harness for running academic benchmarks.
  tags:
  - GitHub
  - tool
- name: OWASP Top 10 for LLM Applications
  url: https://genai.owasp.org/llm-top-10/
  category: 09 AI security
  badge: standard
  description: The 10 most critical risks for LLM apps, with mitigations.
  tags:
  - standard
- name: MITRE ATLAS
  url: https://atlas.mitre.org/
  category: 09 AI security
  badge: knowledge base
  description: Attack tactics and techniques against AI systems, built from real cases.
  tags:
  - standard
- name: NIST AI Risk Management Framework
  url: https://www.nist.gov/itl/ai-risk-management-framework
  category: 09 AI security
  badge: standard
  description: The US framework for mapping, measuring and managing AI risk.
  tags:
  - standard
- name: Simon Willison on prompt injection
  url: https://simonwillison.net/tags/prompt-injection/
  category: 09 AI security
  badge: blog
  description: The running record of prompt injection attacks and why they are hard to fix.
  tags:
  - article
- name: garak
  url: https://github.com/NVIDIA/garak
  category: 09 AI security
  badge: GitHub · NVIDIA
  description: 'LLM vulnerability scanner: probes for injection, jailbreaks and leaks.'
  tags:
  - GitHub
  - tool
- name: PyRIT
  url: https://github.com/Azure/PyRIT
  category: 09 AI security
  badge: GitHub · Microsoft
  description: Python toolkit for red-teaming generative AI systems.
  tags:
  - GitHub
  - tool
- name: NeMo Guardrails
  url: https://github.com/NVIDIA-NeMo/Guardrails
  category: 09 AI security
  badge: GitHub · NVIDIA
  description: Add programmable input, output and dialog rails to LLM apps.
  tags:
  - GitHub
  - library
- name: Presidio
  url: https://github.com/data-privacy-stack/presidio
  category: 09 AI security
  badge: GitHub
  description: Detect and anonymize PII in text and images before it reaches a model.
  tags:
  - GitHub
  - library
- name: Building a generative AI platform
  url: https://huyenchip.com/2024/07/25/genai-platform.html
  category: 10 System design
  badge: article · Chip Huyen
  description: The common components of a GenAI platform, added one layer at a time.
  tags:
  - article
- name: Patterns for building LLM-based systems
  url: https://eugeneyan.com/writing/llm-patterns/
  category: 10 System design
  badge: article · Eugene Yan
  description: 'Seven patterns: evals, RAG, fine-tuning, caching, guardrails, defensive UX, feedback.'
  tags:
  - article
- name: What we learned from a year of building with LLMs
  url: https://applied-llms.org/
  category: 10 System design
  badge: guide
  description: Tactical, operational and strategic lessons from six practitioners.
  tags:
  - guide
- name: System Design 101
  url: https://github.com/ByteByteGoHq/system-design-101
  category: 10 System design
  badge: GitHub · ByteByteGo
  description: Visual explanations of general system design, the base AI design builds on.
  tags:
  - GitHub
  - guide
- name: LiteLLM
  url: https://github.com/BerriAI/litellm
  category: 10 System design
  badge: GitHub
  description: One API and proxy for 100+ model providers, with fallbacks and spend tracking.
  tags:
  - GitHub
  - tool
- name: vLLM docs
  url: https://docs.vllm.ai/
  category: 10 System design
  badge: official docs
  description: High-throughput open-source inference engine for serving models.
  tags:
  - docs
  - tool
- name: Langfuse
  url: https://github.com/langfuse/langfuse
  category: 11 LLMOps
  badge: GitHub
  description: Open-source LLM tracing, prompt management and evals. Self-hostable.
  tags:
  - GitHub
  - tool
- name: Arize Phoenix
  url: https://github.com/Arize-ai/phoenix
  category: 11 LLMOps
  badge: GitHub
  description: Open-source tracing and evaluation for LLM apps, built on OpenTelemetry.
  tags:
  - GitHub
  - tool
- name: MLflow for GenAI
  url: https://mlflow.org/docs/latest/genai/
  category: 11 LLMOps
  badge: official docs
  description: Tracking, tracing, prompt registry and evaluation for LLM apps.
  tags:
  - docs
  - tool
- name: OpenTelemetry GenAI conventions
  url: https://opentelemetry.io/docs/specs/semconv/gen-ai/
  category: 11 LLMOps
  badge: standard
  description: The standard attribute names for tracing model and agent calls.
  tags:
  - standard
- name: GitHub Actions docs
  url: https://docs.github.com/en/actions
  category: 11 LLMOps
  badge: official docs
  description: CI/CD to run tests and evals on every change.
  tags:
  - docs
- name: Made With ML
  url: https://madewithml.com/
  category: 11 LLMOps
  badge: free course
  description: Goku Mohandas's free course on putting ML into production.
  tags:
  - course
- name: Amazon Bedrock docs
  url: https://docs.aws.amazon.com/bedrock/
  category: 12 Managed platforms
  badge: official docs
  description: AWS's managed service for foundation models, agents and knowledge bases.
  tags:
  - docs
  - cloud
- name: Google Cloud generative AI docs
  url: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/overview
  category: 12 Managed platforms
  badge: official docs
  description: Google Cloud's managed platform for Gemini and partner models.
  tags:
  - docs
  - cloud
- name: Microsoft Foundry docs
  url: https://learn.microsoft.com/en-us/azure/ai-foundry/
  category: 12 Managed platforms
  badge: official docs
  description: Azure's platform for models, agents and evaluation.
  tags:
  - docs
  - cloud
- name: OpenRouter docs
  url: https://openrouter.ai/docs
  category: 12 Managed platforms
  badge: official docs
  description: One API across hundreds of models and providers.
  tags:
  - docs
  - router
- name: Hugging Face Inference Providers
  url: https://huggingface.co/docs/inference-providers
  category: 12 Managed platforms
  badge: official docs
  description: Call open-weight models through many hosts with one client.
  tags:
  - docs
- name: Together AI docs
  url: https://docs.together.ai/
  category: 12 Managed platforms
  badge: official docs
  description: Serverless and dedicated hosting for open-weight models.
  tags:
  - docs
- name: 'Gemini: Image understanding'
  url: https://aistudio.google.com/docs/image-understanding
  category: 13 Multimodal
  badge: official docs
  description: Captioning, visual Q&A, object detection and segmentation with Gemini.
  tags:
  - docs
- name: OpenAI Realtime API
  url: https://developers.openai.com/api/docs/guides/realtime
  category: 13 Multimodal
  badge: official docs
  description: Low-latency speech-to-speech for voice agents.
  tags:
  - docs
- name: Whisper
  url: https://github.com/openai/whisper
  category: 13 Multimodal
  badge: GitHub · OpenAI
  description: Open-source speech recognition and translation model.
  tags:
  - GitHub
  - model
- name: LiveKit Agents
  url: https://github.com/livekit/agents
  category: 13 Multimodal
  badge: GitHub
  description: Framework for realtime voice and video AI agents.
  tags:
  - GitHub
  - framework
- name: Pipecat
  url: https://github.com/pipecat-ai/pipecat
  category: 13 Multimodal
  badge: GitHub
  description: Open-source Python framework for voice and multimodal agents.
  tags:
  - GitHub
  - framework
- name: CLIP
  url: https://github.com/openai/CLIP
  category: 13 Multimodal
  badge: GitHub · OpenAI
  description: Joint image–text embeddings, the base of most cross-modal search.
  tags:
  - GitHub
  - model
- name: ColPali
  url: https://github.com/illuin-tech/colpali
  category: 13 Multimodal
  badge: GitHub
  description: Retrieve document pages straight from their images, no OCR step.
  tags:
  - GitHub
  - library
- name: Unsloth
  url: https://github.com/unslothai/unsloth
  category: 14 Fine-tuning
  badge: GitHub
  description: Faster, lower-memory fine-tuning with free Colab notebooks.
  tags:
  - GitHub
  - library
- name: TRL
  url: https://huggingface.co/docs/trl
  category: 14 Fine-tuning
  badge: official docs · Hugging Face
  description: SFT, DPO, GRPO and reward modeling in one library.
  tags:
  - docs
  - library
- name: PEFT
  url: https://huggingface.co/docs/peft
  category: 14 Fine-tuning
  badge: official docs · Hugging Face
  description: LoRA and other parameter-efficient methods.
  tags:
  - docs
  - library
- name: Axolotl
  url: https://github.com/axolotl-ai-cloud/axolotl
  category: 14 Fine-tuning
  badge: GitHub
  description: Config-driven fine-tuning for many model families.
  tags:
  - GitHub
  - tool
- name: smol course
  url: https://github.com/huggingface/smol-course
  category: 14 Fine-tuning
  badge: GitHub · Hugging Face
  description: Hands-on course on aligning small models, runs on modest hardware.
  tags:
  - GitHub
  - course
- name: LoRA paper
  url: https://arxiv.org/abs/2106.09685
  category: 14 Fine-tuning
  badge: paper
  description: 'Low-rank adaptation: train a small fraction of the weights.'
  tags:
  - paper
- name: QLoRA paper
  url: https://arxiv.org/abs/2305.14314
  category: 14 Fine-tuning
  badge: paper
  description: LoRA on a 4-bit quantized model, fine-tuning on a single GPU.
  tags:
  - paper
- name: DPO paper
  url: https://arxiv.org/abs/2305.18290
  category: 14 Fine-tuning
  badge: paper
  description: Preference tuning without a separate reward model.
  tags:
  - paper
- name: OpenAI Cookbook
  url: https://cookbook.openai.com/
  category: 15 Projects
  badge: examples
  description: Runnable examples for RAG, agents, evals and more.
  tags:
  - examples
- name: Claude Cookbooks
  url: https://github.com/anthropics/claude-cookbooks
  category: 15 Projects
  badge: GitHub · Anthropic
  description: Notebooks and recipes for building with Claude.
  tags:
  - GitHub
  - examples
- name: Gemini Cookbook
  url: https://github.com/google-gemini/cookbook
  category: 15 Projects
  badge: GitHub · Google
  description: Examples and guides for the Gemini API.
  tags:
  - GitHub
  - examples
- name: 'Neural Networks: Zero to Hero'
  url: https://karpathy.ai/zero-to-hero.html
  category: 15 Projects
  badge: free course · Andrej Karpathy
  description: Build neural nets up to a GPT from scratch, in code.
  tags:
  - course
  - video
- name: nanoGPT
  url: https://github.com/karpathy/nanoGPT
  category: 15 Projects
  badge: GitHub
  description: Small, readable repo for training and fine-tuning GPT models.
  tags:
  - GitHub
- name: Stanford CS336
  url: https://cs336.stanford.edu/
  category: 15 Projects
  badge: free course
  description: 'Language Modeling from Scratch: build every piece of an LLM yourself.'
  tags:
  - course
- name: FSDL LLM Bootcamp
  url: https://fullstackdeeplearning.com/llm-bootcamp/
  category: 15 Projects
  badge: free course
  description: Full Stack Deep Learning's free lectures on shipping LLM apps.
  tags:
  - course
  - video
- name: Hugging Face Spaces
  url: https://huggingface.co/spaces
  category: 15 Projects
  badge: hosting
  description: Host your demos for free so anyone can try them.
  tags:
  - tool
- name: Machine Learning Interviews Book
  url: https://huyenchip.com/ml-interviews-book/
  category: 16 Interview prep
  badge: free book · Chip Huyen
  description: How ML interviews work, plus 200+ knowledge questions.
  tags:
  - book
- name: AI Engineering book resources
  url: https://github.com/chiphuyen/aie-book
  category: 16 Interview prep
  badge: GitHub · Chip Huyen
  description: 'Free companion repo to the AI Engineering book: summaries, case studies, prompt examples.'
  tags:
  - GitHub
  - book
- name: Tech Interview Handbook
  url: https://www.techinterviewhandbook.org/
  category: 16 Interview prep
  badge: free guide
  description: Free guide to coding interviews, résumés, negotiation and behavioral rounds.
  tags:
  - guide
---

## How to use this roadmap

1. **Start where you are.** If you already know a step, skip it. If not, start at step 01.
2. **One step at a time, in order.** Each step builds on the ones before it. RAG needs APIs, agents need RAG, evals need something to evaluate.
3. **A step is done when you've built its project.** Reading the docs is not enough. Ship the build, put it on GitHub, write down what broke.

Everything linked here is free to read or use. Each link goes to the official docs, the author's own site or the original repo or paper.

The step order follows the free [AI Engineering Roadmap by CampusX](https://ai-engineer-roadmap-2026.vercel.app/) (16 levels, 286 sessions), which went viral on X. The resources and the wording on this page are our own.

## FAQ

### What does an AI engineer do?
An AI engineer builds software products on top of models like GPT, Claude and Gemini: retrieval (RAG), agents, evals, guardrails and the production systems around them. Most of the job is software engineering, not training models from scratch.

### Do I need a machine learning or math background?
Not to start. Steps 01–12 need solid Python and software skills. The math matters more at step 14 (fine-tuning) and for research roles.

### How long does the roadmap take?
It depends on your starting point and hours per week. The CampusX roadmap this order follows counts 286 sessions across 16 levels, and also offers a 100-day accelerated track covering the core (LLMs, APIs, prompting, RAG, agents, shipping).

### Are all the resources free?
Yes. Every link is free docs, a free course, an open-source repo, a free book or an open paper. Some cloud platforms in step 12 charge for usage beyond their free tiers.

### Which step matters most for getting hired?
RAG (step 05), agents (step 06), evals (step 08) and system design (step 10) come up most in AI engineer interviews and job descriptions. Ship a public project for each.
