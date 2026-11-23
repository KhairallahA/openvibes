---
title: Every AI model that runs offline on your laptop
shortTitle: Offline AI
hook: f**king goldmine of offline AI for your pc
description: 21 open models you can run fully offline with one Ollama command each. Sizes from ollama.com, checked 22 Nov 2026.
lede: 21 open models that run on your own laptop with no internet, no API key and no monthly bill. One copy-paste command each, sizes straight from the Ollama library.
category: AI models
tags:
- offline
- local
- ollama
- no-api-key
icon: ⌁
accent: '#ff8a3d'
updated: '2026-11-22'
verified: '2026-11-22'
featured: true
stats:
- value: '21'
  label: models, one command each
  note: chat · reasoning · coding · vision · OCR · RAG
- value: 274 MB
  label: smallest download
  note: nomic-embed-text for chatting with your files
- value: $0
  label: per month
  note: after the one-time download it runs offline
items:
- name: Qwen3.8 27B
  url: https://ollama.com/library/qwen3.8
  category: best overall
  badge: 18 GB download
  description: Big gains in coding, research and long-horizon agentic tasks. Best pick if your machine has plenty of memory.
  tags:
  - pick
  command: ollama run qwen3.8
- name: Gemma 4 (E4B)
  url: https://ollama.com/library/gemma4
  category: laptop
  badge: 6.6–9.5 GB · 128K ctx
  description: Google's Gemma 4, text + image input, built for reasoning, agents and coding. The default tag runs on a 16 GB laptop.
  tags: []
  command: ollama run gemma4
- name: Gemma 4 12B
  url: https://ollama.com/library/gemma4/tags
  category: laptop
  badge: 7.7–8.0 GB · 256K ctx
  description: Same family, bigger brain and a 256K context window. Text + image input.
  tags: []
  command: ollama run gemma4:12b
- name: gpt-oss 20B
  url: https://ollama.com/library/gpt-oss/tags
  category: reasoning
  badge: 14 GB download
  description: OpenAI's open-weight model for reasoning and agentic tasks. Runs fully offline.
  tags:
  - OpenAI
  command: ollama run gpt-oss:20b
- name: gpt-oss 120B
  url: https://ollama.com/library/gpt-oss/tags
  category: reasoning
  badge: 65 GB download
  description: The big one. Needs a high-memory workstation or Mac.
  tags:
  - OpenAI
  command: ollama run gpt-oss:120b
- name: DeepSeek-R1 8B
  url: https://ollama.com/library/deepseek-r1/tags
  category: reasoning
  badge: 5.2 GB download
  description: Open reasoning model family. The 8B fits most laptops and shows its thinking.
  tags: []
  command: ollama run deepseek-r1:8b
- name: Qwen3.6 27B
  url: https://ollama.com/library/qwen3.6/tags
  category: coding
  badge: 18–19 GB · 256K ctx
  description: Upgrades in agentic coding and thinking preservation over earlier Qwen models.
  tags: []
  command: ollama run qwen3.6:27b
- name: Qwen3-Coder 30B
  url: https://ollama.com/library/qwen3-coder/tags
  category: coding
  badge: 19 GB download
  description: Long-context model built for agentic coding. Plug it into a local coding agent.
  tags: []
  command: ollama run qwen3-coder:30b
- name: Devstral Small 2
  url: https://ollama.com/library/devstral-small-2
  category: coding
  badge: 15 GB download
  description: 24B model that uses tools to explore codebases and edit multiple files. Made for software agents.
  tags:
  - agents
  command: ollama run devstral-small-2
- name: GLM-4.7-Flash
  url: https://ollama.com/library/glm-4.7-flash
  category: coding
  badge: 19 GB download
  description: Pitched by its makers as the strongest model in the 30B class, built for lightweight deployment.
  tags: []
  command: ollama run glm-4.7-flash
- name: Phi-4 14B
  url: https://ollama.com/library/phi4
  category: laptop
  badge: 9.1 GB download
  description: Microsoft's 14B open model. Strong for its size on a 16 GB machine.
  tags: []
  command: ollama run phi4
- name: Phi-4-mini
  url: https://ollama.com/library/phi4-mini
  category: tiny
  badge: 2.5 GB download
  description: 3.8B with multilingual support, reasoning, math and function calling.
  tags: []
  command: ollama run phi4-mini
- name: Llama 3.2 3B
  url: https://ollama.com/library/llama3.2
  category: tiny
  badge: 2.0 GB download
  description: Meta's small model. Fast on almost any laptop.
  tags: []
  command: ollama run llama3.2
- name: Llama 3.2 1B
  url: https://ollama.com/library/llama3.2/tags
  category: tiny
  badge: 1.3 GB download
  description: Runs on old laptops. Great for quick summaries and rewrites.
  tags: []
  command: ollama run llama3.2:1b
- name: Qwen3.5 4B
  url: https://ollama.com/library/qwen3.5/tags
  category: tiny
  badge: 3.3–4.0 GB · 256K ctx
  description: Small multimodal model with text + image input and a huge context window.
  tags: []
  command: ollama run qwen3.5:4b
- name: Ministral 3 8B
  url: https://ollama.com/library/ministral-3/tags
  category: laptop
  badge: 6.0 GB download
  description: Mistral's edge family, made to run on a wide range of hardware.
  tags: []
  command: ollama run ministral-3:8b
- name: Qwen3-VL 8B
  url: https://ollama.com/library/qwen3-vl/tags
  category: vision
  badge: 6.2 GB download
  description: Qwen's most powerful vision-language family. Read screenshots, charts and photos offline.
  tags: []
  command: ollama run qwen3-vl:8b
- name: GLM-OCR
  url: https://ollama.com/library/glm-ocr
  category: vision
  badge: 2.7 GB download
  description: Multimodal OCR for complex documents. Turn PDFs and scans into text locally.
  tags: []
  command: ollama run glm-ocr
- name: Moondream 2
  url: https://ollama.com/library/moondream
  category: vision
  badge: 1.7 GB download
  description: Tiny vision model made for edge devices.
  tags: []
  command: ollama run moondream
- name: TranslateGemma 4B
  url: https://ollama.com/library/translategemma
  category: translate
  badge: 3.3 GB download
  description: Open translation model built on Gemma 3. 55 languages, no internet needed.
  tags: []
  command: ollama run translategemma
- name: nomic-embed-text
  url: https://ollama.com/library/nomic-embed-text
  category: RAG
  badge: 274 MB download
  description: Embedding model with a large context window. The base for chatting with your own files.
  tags: []
  command: ollama run nomic-embed-text
---

## Install Ollama once

- **Mac:** download the app at [ollama.com/download](https://ollama.com/download)
- **Linux:** `curl -fsSL https://ollama.com/install.sh | sh`
- **Windows (PowerShell):** `irm https://ollama.com/install.ps1 | iex`

Then copy any command above. The first run downloads the model; after that it works with no internet.

> Sizes are download sizes from ollama.com on the verified date. You need more RAM/VRAM than the file size.
