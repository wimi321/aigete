#!/bin/sh
set -eu

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  if [ -n "${MOCK_PID:-}" ]; then kill "$MOCK_PID" 2>/dev/null || true; fi
}

trap cleanup EXIT INT TERM

node scripts/mock-upstream.js &
MOCK_PID=$!

node src/server.js &
SERVER_PID=$!

echo "AIGete lab is running."
echo "Console: http://127.0.0.1:3456"
echo "Mock upstream: http://127.0.0.1:4000/v1"
echo "Press Ctrl+C to stop."

wait "$SERVER_PID"
