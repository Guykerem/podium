"""LLMClient protocol + ClaudeCodeClient implementation.

v0.1 ships ClaudeCodeClient only. LiteLLMClient is the v0.2 drop-in.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import time
from dataclasses import dataclass
from typing import Protocol


@dataclass
class LLMResponse:
    text: str
    latency_ms: int


class LLMClient(Protocol):
    def complete(self, system_prompt: str, user_message: str) -> LLMResponse: ...


class ClaudeCodeClient:
    """Shells out to `claude -p` with the role context as the system prompt."""

    def __init__(self, timeout_sec: int = 60):
        self.timeout_sec = timeout_sec
        self.binary = shutil.which("claude")
        if not self.binary:
            raise RuntimeError("`claude` CLI not found on PATH")

    def complete(self, system_prompt: str, user_message: str) -> LLMResponse:
        start = time.time()
        result = subprocess.run(
            [
                self.binary,
                "-p", user_message,
                "--append-system-prompt", system_prompt,
                "--output-format", "json",
            ],
            capture_output=True,
            text=True,
            timeout=self.timeout_sec,
        )
        latency = int((time.time() - start) * 1000)
        if result.returncode != 0:
            raise RuntimeError(
                f"claude -p failed (rc={result.returncode}): {result.stderr}"
            )
        try:
            data = json.loads(result.stdout)
            text = data.get("result") or data.get("text") or result.stdout
        except json.JSONDecodeError:
            text = result.stdout.strip()
        return LLMResponse(text=text, latency_ms=latency)
