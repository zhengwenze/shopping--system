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
USERNAME="demo_$(date +%s)_$RANDOM"
PROXY_USERNAME="proxy_$(date +%s)_$RANDOM"
PASSWORD="Passw0rd!"

parse_json_field() {
  local path="$1"
  python3 -c 'import json, sys
data = json.loads(sys.stdin.read())
value = data
for part in sys.argv[1].split("."):
    value = value[part]
print(value)' "$path"
}

REGISTER_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")"
LOGIN_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")"
TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | parse_json_field "data.token")"
PROXY_REGISTER_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$PROXY_USERNAME\",\"password\":\"$PASSWORD\"}")"
PROXY_TOKEN="$(printf '%s' "$PROXY_REGISTER_RESPONSE" | parse_json_field "data.token")"
STOCK_RESPONSE="$(curl -sS "http://localhost:$BACKEND_DEV_PORT/seckill/stock?productId=1" \
  -H "Authorization: Bearer $TOKEN")"
INITIAL_STOCK="$(printf '%s' "$STOCK_RESPONSE" | parse_json_field "data.remainingStock")"

UNAUTHORIZED_RESPONSE="$(curl -sS -o /tmp/shopping_auth_check_unauthorized.json -w "%{http_code}" \
  -X POST "http://localhost:$BACKEND_DEV_PORT/seckill?productId=1")"
FIRST_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/seckill?productId=1" \
  -H "Authorization: Bearer $TOKEN")"
SECOND_RESPONSE="$(curl -sS -X POST "http://localhost:$BACKEND_DEV_PORT/seckill?productId=1" \
  -H "Authorization: Bearer $TOKEN")"
sleep 1
RESULT_RESPONSE="$(curl -sS "http://localhost:$BACKEND_DEV_PORT/seckill/result?productId=1" \
  -H "Authorization: Bearer $TOKEN")"
FINAL_STOCK_RESPONSE="$(curl -sS "http://localhost:$BACKEND_DEV_PORT/seckill/stock?productId=1" \
  -H "Authorization: Bearer $TOKEN")"
FINAL_STOCK="$(printf '%s' "$FINAL_STOCK_RESPONSE" | parse_json_field "data.remainingStock")"
PROXY_RESPONSE="$(curl -sS -X POST "http://localhost:$FRONTEND_DEV_PORT/api/seckill?productId=1" \
  -H "Authorization: Bearer $PROXY_TOKEN")"

echo "后端健康检查:"
curl -fsS "http://localhost:$BACKEND_DEV_PORT/actuator/health"
echo
echo
echo "前端首页:"
curl -I "http://localhost:$FRONTEND_DEV_PORT" | sed -n '1,5p'
echo
echo
echo "注册响应:"
echo "$REGISTER_RESPONSE"
echo
echo
echo "登录响应:"
echo "$LOGIN_RESPONSE"
echo
echo
echo "前端代理用户注册响应:"
echo "$PROXY_REGISTER_RESPONSE"
echo
echo
echo "库存查询响应:"
echo "$STOCK_RESPONSE"
echo
echo
echo "秒杀后库存响应:"
echo "$FINAL_STOCK_RESPONSE"
echo
echo
echo "未登录秒杀响应码:"
echo "$UNAUTHORIZED_RESPONSE"
echo
echo
echo "前端代理秒杀请求:"
echo "$PROXY_RESPONSE"
echo
echo
echo "秒杀首次请求:"
echo "$FIRST_RESPONSE"
echo
echo
echo "秒杀结果查询:"
echo "$RESULT_RESPONSE"
echo
echo
echo "秒杀重复请求:"
echo "$SECOND_RESPONSE"

if [[ "$REGISTER_RESPONSE" != *'"code":0'* ]]; then
  echo "注册接口未返回成功结果" >&2
  exit 1
fi

if [[ "$LOGIN_RESPONSE" != *'"code":0'* ]]; then
  echo "登录接口未返回成功结果" >&2
  exit 1
fi

if [[ "$PROXY_REGISTER_RESPONSE" != *'"code":0'* ]]; then
  echo "前端代理验收账号注册失败" >&2
  exit 1
fi

if [[ "$STOCK_RESPONSE" != *'"code":0'* ]]; then
  echo "库存查询接口未返回成功结果" >&2
  exit 1
fi

if [[ "$FINAL_STOCK_RESPONSE" != *'"code":0'* ]]; then
  echo "秒杀后库存查询接口未返回成功结果" >&2
  exit 1
fi

if [[ "$UNAUTHORIZED_RESPONSE" != "401" ]]; then
  echo "未登录访问秒杀接口未被正确拦截" >&2
  exit 1
fi

if [[ "$FIRST_RESPONSE" != *'"code":0'* ]]; then
  echo "首次秒杀请求未返回成功受理结果" >&2
  exit 1
fi

if [[ "$SECOND_RESPONSE" != *'"code":40900'* ]]; then
  echo "重复下单保护未生效" >&2
  exit 1
fi

if [[ "$RESULT_RESPONSE" != *'"status":"SUCCESS"'* ]]; then
  echo "秒杀结果查询未返回最终成功状态" >&2
  exit 1
fi

if [[ "$PROXY_RESPONSE" != *'"code":0'* ]]; then
  echo "前端代理秒杀链路未通过" >&2
  exit 1
fi

if (( FINAL_STOCK >= INITIAL_STOCK )); then
  echo "秒杀后库存未减少" >&2
  exit 1
fi

echo
echo "验收通过。"
