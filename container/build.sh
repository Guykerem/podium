#!/bin/bash
# Build the Podium agent container image.
#
# Forked from NanoClaw's container/build.sh, adapted for Podium.
# Must be invoked from the repo root so the Docker build context has access
# to package.json, runtime/, setup/, agent/, roles/.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

IMAGE_NAME="podium-agent"
TAG="${1:-latest}"
CONTAINER_RUNTIME="${CONTAINER_RUNTIME:-docker}"

if ! command -v "${CONTAINER_RUNTIME}" >/dev/null 2>&1; then
    echo "error: ${CONTAINER_RUNTIME} not found on PATH" >&2
    echo "hint: install Docker Desktop, or set CONTAINER_RUNTIME=podman" >&2
    exit 127
fi

echo "Building Podium agent container image..."
echo "  Image:   ${IMAGE_NAME}:${TAG}"
echo "  Context: ${REPO_ROOT}"
echo ""

"${CONTAINER_RUNTIME}" build \
    -t "${IMAGE_NAME}:${TAG}" \
    -f container/Dockerfile \
    .

echo ""
echo "Build complete: ${IMAGE_NAME}:${TAG}"
echo ""
echo "Smoke test:"
echo "  echo '{\"message\":\"Say hi in one word\"}' | \\"
echo "    ${CONTAINER_RUNTIME} run -i --rm \\"
echo "      -v \$(pwd)/roles:/workspace/roles:ro \\"
echo "      -v \$(pwd)/agent:/workspace/agent \\"
echo "      -e ANTHROPIC_API_KEY=\"\$ANTHROPIC_API_KEY\" \\"
echo "      ${IMAGE_NAME}:${TAG}"
