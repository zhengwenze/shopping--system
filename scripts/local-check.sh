#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$ROOT_DIR/.local-stack.env"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "未找到 .local-stack.env，请先执行 ./scripts/local-up.sh" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$STATE_FILE"

FRONTEND_DEV_PORT="${FRONTEND_DEV_PORT:-3001}"
BACKEND_DEV_PORT="${BACKEND_DEV_PORT:-8081}"

USER_ID="$(date +%s)"
FIRST_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/seckill?userId=$USER_ID&productId=1")"
SECOND_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/seckill?userId=$USER_ID&productId=1")"

echo "后端健康检查:"
curl -fsS "http://localhost:$BACKEND_DEV_PORT/actuator/health"
echo
echo
echo "前端首页:"
curl -I "http://localhost:$FRONTEND_DEV_PORT" | sed -n '1,5p'
echo
echo
echo "前端代理秒杀请求:"
curl -sS -X POST "http://localhost:$FRONTEND_DEV_PORT/api/seckill?userId=$((USER_ID + 1))&productId=1"
echo
echo
echo "秒杀首次请求:"
echo "$FIRST_RESPONSE"
echo
echo
echo "秒杀重复请求:"
echo "$SECOND_RESPONSE"

if [[ "$FIRST_RESPONSE" != *'"code":0'* ]]; then
  echo "首次秒杀请求未返回成功受理结果" >&2
  exit 1
fi

if [[ "$SECOND_RESPONSE" != *'"code":40900'* ]]; then
  echo "重复下单保护未生效" >&2
  exit 1
fi

echo
echo "验收通过。"
