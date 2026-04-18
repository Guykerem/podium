"""L1: providers.yaml must not pin a retired model."""
from __future__ import annotations

from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]

RETIRED_MODELS = {
    "claude-sonnet-4-20250514",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
}


def test_providers_yaml_exists():
    assert (ROOT / "runtime" / "providers.yaml").exists()


def test_default_provider_is_declared():
    data = yaml.safe_load((ROOT / "runtime" / "providers.yaml").read_text())
    assert data.get("default_provider"), "default_provider must be set"
    assert data["default_provider"] in data.get("providers", {}), \
        "default_provider must map to a providers.<name> entry"


def test_no_retired_models_pinned():
    data = yaml.safe_load((ROOT / "runtime" / "providers.yaml").read_text())
    for provider_name, cfg in data.get("providers", {}).items():
        model = cfg.get("model")
        if model:
            assert model not in RETIRED_MODELS, \
                f"provider '{provider_name}' pins retired model '{model}'"
