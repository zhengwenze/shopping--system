#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.local.yml"
STATE_FILE="$ROOT_DIR/.local-stack.env"
PROJECT_NAME="${LOCAL_PROJECT_NAME:-shopping-system-local}"

find_free_port() {
  local start_port="$1"
  local port="$start_port"

  while lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
    port=$((port + 1))
  done

  echo "$port"
}

write_state_file() {
  cat >"$STATE_FILE" <<EOF
LOCAL_PROJECT_NAME=$PROJECT_NAME
FRONTEND_DEV_PORT=$FRONTEND_DEV_PORT
BACKEND_DEV_PORT=$BACKEND_DEV_PORT
RABBITMQ_UI_PORT=$RABBITMQ_UI_PORT
EOF
}

load_or_init_ports() {
  if [[ -f "$STATE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$STATE_FILE"
  fi

  FRONTEND_DEV_PORT="${FRONTEND_DEV_PORT:-$(find_free_port 3001)}"
  BACKEND_DEV_PORT="${BACKEND_DEV_PORT:-$(find_free_port 8081)}"
  RABBITMQ_UI_PORT="${RABBITMQ_UI_PORT:-$(find_free_port 15673)}"
}

wait_for_http() {
  local url="$1"
  local name="$2"
  local max_attempts="${3:-180}"
  local attempt=1

  until curl -fsS "$url" >/dev/null 2>&1; do
    if (( attempt >= max_attempts )); then
      echo "$name 启动超时: $url" >&2
      return 1
    fi

    if (( attempt % 15 == 0 )); then
      echo "等待 $name 就绪中... ($attempt/$max_attempts)"
    fi

    sleep 2
    attempt=$((attempt + 1))
  done
}

print_failure_context() {
  echo
  echo "启动失败，最近日志如下："
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs backend-dev --tail=80 || true
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" logs frontend-dev --tail=80 || true
}

main() {
  docker info >/dev/null
  load_or_init_ports
  write_state_file

  echo "使用端口:"
  echo "  前端:   $FRONTEND_DEV_PORT"
  echo "  后端:   $BACKEND_DEV_PORT"
  echo "  Rabbit: $RABBITMQ_UI_PORT"
  echo
  echo "首次启动会下载 Maven 和 npm 依赖，可能需要几分钟。"

  export FRONTEND_DEV_PORT BACKEND_DEV_PORT RABBITMQ_UI_PORT
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --remove-orphans

  trap print_failure_context ERR
  wait_for_http "http://localhost:$BACKEND_DEV_PORT/actuator/health" "后端"
  wait_for_http "http://localhost:$FRONTEND_DEV_PORT" "前端"
  trap - ERR

  echo
  echo "本地开发环境已就绪:"
  echo "  前端: http://localhost:$FRONTEND_DEV_PORT"
  echo "  后端: http://localhost:$BACKEND_DEV_PORT"
  echo "  健康: http://localhost:$BACKEND_DEV_PORT/actuator/health"
  echo "  RabbitMQ: http://localhost:$RABBITMQ_UI_PORT"
  echo
  echo "下一步可以执行: ./scripts/local-check.sh"
}

main "$@"
