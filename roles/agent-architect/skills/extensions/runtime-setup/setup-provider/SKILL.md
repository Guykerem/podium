---
name: setup-provider
description: Guide user through configuring LLM providers in providers.yaml
when_to_use: >
  User wants to set up or change their LLM provider, asks about API keys,
  model selection, or how to connect to Claude, GPT, or other models.
tier: extension
---

# Setup Provider

An extension skill that guides the user through configuring which LLM provider powers their agent.

## Key Topics

- Available providers: Anthropic (Claude), OpenAI (GPT), local models (Ollama/Llama)
- Configuring `runtime/providers.yaml` — API keys, model selection, parameters
- Model trade-offs: capability vs. cost vs. privacy vs. speed
- Temperature and other generation parameters — what they control
- API key security — environment variables, never committing keys to git

## Files to Reference

- `runtime/providers.yaml` (the configuration file)
- `roles/agent-architect/knowledge/tool-guides/getting-started.md` (choosing a tool)

## Activation

This is an extension skill. Activate when the user is ready to connect their agent to a real LLM provider and needs help with the technical setup.
