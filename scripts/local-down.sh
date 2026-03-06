#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.local.yml"
STATE_FILE="$ROOT_DIR/.local-stack.env"
PROJECT_NAME="${LOCAL_PROJECT_NAME:-shopping-system-local}"

if [[ -f "$STATE_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$STATE_FILE"
fi

docker compose -p "${LOCAL_PROJECT_NAME:-$PROJECT_NAME}" -f "$COMPOSE_FILE" down --remove-orphans
rm -f "$STATE_FILE"

echo "本地开发环境已停止。"
