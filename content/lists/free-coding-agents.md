---
title: Every free Claude Code alternative with public source
shortTitle: Free coding agents
hook: f**king goldmine of free Claude Code alternatives
description: 15 AI coding agents with public source + 4 free local models to power them. Real install commands from each official repo.
lede: 15 AI coding agents with public source code on GitHub, each installable in one line, plus 4 free local models to run them on your own machine. Every command copied from the official repo README on 22 Nov 2026.
category: Dev tools
tags:
- coding
- agents
- open-source
- cli
icon: '>_'
accent: '#8b7bff'
updated: '2026-11-22'
verified: '2026-11-22'
featured: true
stats:
- value: '19'
  label: picks
  note: 15 agents + 4 local models
- value: '15'
  label: agents, source on GitHub
  note: terminal, IDE and self-hosted
- value: '4'
  label: free local brains via Ollama
  note: no API key, runs offline
items:
- name: OpenCode
  url: https://github.com/anomalyco/opencode
  category: agents
  badge: terminal coding agent
  description: '"The open source coding agent." Install script, Homebrew or desktop app.'
  tags:
  - GitHub
  command: curl -fsSL https://opencode.ai/v2/install | bash
- name: Cline
  url: https://github.com/cline/cline
  category: agents
  badge: SDK · IDE · CLI
  description: Autonomous coding agent. Documented support for local models via Ollama / LM Studio.
  tags:
  - local models
  command: npm i -g cline
- name: Aider
  url: https://github.com/Aider-AI/aider
  category: agents
  badge: pair programmer in your terminal
  description: Connects to almost any LLM, including local models. Apache-2.0.
  tags:
  - Apache-2.0
  command: python -m pip install aider-install
- name: Goose
  url: https://github.com/aaif-goose/goose
  category: agents
  badge: runs local models in-process
  description: Loads supported local models directly, no Ollama needed, or connects to 85+ providers.
  tags:
  - local models
  command: curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash
- name: Crush
  url: https://github.com/charmbracelet/crush
  category: agents
  badge: agent for every terminal
  description: From Charm. Auto-discovers models from Ollama, llama.cpp, LM Studio and more.
  tags:
  - local models
  command: brew install charmbracelet/tap/crush
- name: Kilo Code
  url: https://github.com/Kilo-Org/kilocode
  category: agents
  badge: all-in-one agentic platform
  description: '"The all-in-one agentic engineering platform." CLI via npm, Homebrew or install script. MIT.'
  tags:
  - MIT
  command: npm install -g @kilocode/cli
- name: OpenAI Codex CLI
  url: https://github.com/openai/codex
  category: agents
  badge: lightweight terminal agent
  description: OpenAI's coding agent that runs in your terminal. Apache-2.0.
  tags:
  - Apache-2.0
  command: npm install -g @openai/codex
- name: Qwen Code
  url: https://github.com/QwenLM/qwen-code
  category: agents
  badge: agent that lives in your terminal
  description: Open-source terminal coding agent from the Qwen team.
  tags:
  - GitHub
  command: npm install -g @qwen-code/qwen-code@latest
- name: Kimi Code CLI
  url: https://github.com/MoonshotAI/kimi-code
  category: agents
  badge: reads, edits, runs shell
  description: Works out of the box with Kimi models and can use other compatible providers. No Node.js required.
  tags:
  - GitHub
  command: curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash
- name: Mistral Vibe
  url: https://github.com/mistralai/mistral-vibe
  category: agents
  badge: minimal CLI agent
  description: Mistral's own command-line coding agent.
  tags:
  - GitHub
  command: curl -LsSf https://mistral.ai/vibe/install.sh | bash
- name: OpenHands
  url: https://github.com/OpenHands/OpenHands
  category: agents
  badge: run many agents in one place
  description: Run OpenHands, Claude Code, Codex, OpenCode or any ACP agent locally, in Docker or on VMs.
  tags:
  - orchestrator
  command: npm install -g @openhands/agent-canvas
- name: mini-swe-agent
  url: https://github.com/SWE-agent/mini-swe-agent
  category: agents
  badge: 100-line agent
  description: The radically simple agent that solves GitHub issues or helps in your command line.
  tags:
  - tiny
  command: pip install mini-swe-agent
- name: Continue
  url: https://marketplace.visualstudio.com/items?itemName=Continue.continue
  source: https://github.com/continuedev/continue
  category: agents
  badge: CLI · VS Code · JetBrains
  description: Open-source coding agent, Apache-2.0. The team shipped a final 2.0.0 release.
  tags:
  - Apache-2.0
- name: Tabby
  url: https://github.com/TabbyML/tabby
  category: agents
  badge: self-hosted coding assistant
  description: 'Self-hosted AI coding assistant: run your own server on your own GPU.'
  tags:
  - self-host
  command: docker run -it --gpus all -p 8080:8080 -v $HOME/.tabby:/data tabbyml/tabby serve --model StarCoder-1B --device cuda --chat-model Qwen2-1.5B-Instruct
- name: Plandex
  url: https://github.com/plandex-ai/plandex
  category: agents
  badge: built for large projects
  description: Open-source agent designed for big, real-world codebases. MIT. (Last repo update Oct 2025.)
  tags:
  - MIT
  command: curl -sL https://plandex.ai/install.sh | bash
- name: Qwen3-Coder 30B
  url: https://ollama.com/library/qwen3-coder/tags
  category: local models
  badge: 19 GB · free brain
  description: Long-context agentic coding model. Point Cline, Crush or Aider at it via Ollama.
  tags:
  - Ollama
  command: ollama run qwen3-coder:30b
- name: Devstral Small 2
  url: https://ollama.com/library/devstral-small-2
  category: local models
  badge: 15 GB · free brain
  description: 24B model made to explore codebases and edit multiple files for software agents.
  tags:
  - Ollama
  command: ollama run devstral-small-2
- name: Qwen3.6 27B
  url: https://ollama.com/library/qwen3.6/tags
  category: local models
  badge: 18–19 GB · free brain
  description: Upgraded agentic coding and thinking preservation. 256K context.
  tags:
  - Ollama
  command: ollama run qwen3.6:27b
- name: gpt-oss 20B
  url: https://ollama.com/library/gpt-oss/tags
  category: local models
  badge: 14 GB · free brain
  description: OpenAI open-weight model for reasoning and agentic tasks. The lightest brain here.
  tags:
  - Ollama
  command: ollama run gpt-oss:20b
---

## Run it for $0

The agents are free to install and their source is public. Cloud models you connect to them may cost money. Pair one with a local Ollama model (bottom of the list) for a fully free setup.

> Gemini CLI is not listed: its README says free access moved to Antigravity CLI on June 18, 2026.
