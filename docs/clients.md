# Client Setup

## Direct Mode

Fill `Direct Upstream Base URL` with the real upstream base, for example `http://127.0.0.1:4000/v1`.

Then point clients at:

- OpenAI-style base URL: `http://127.0.0.1:3456/v1`
- Anthropic-style base URL: `http://127.0.0.1:3456/v1`

## Token Mode

Create a route in the web console or with:

```bash
curl http://127.0.0.1:3456/__gw__/register \
  -H 'content-type: application/json' \
  -d '{
    "upstreamBaseUrl": "http://127.0.0.1:4000/v1",
    "gatewayKey": "<GATEWAY_KEY>",
    "note": "claude-code-lab"
  }'
```

Use the returned base URL:

```text
http://127.0.0.1:3456/v1/__gw__/t/<TOKEN>
```

## Codex

Use an OpenAI-compatible provider and point `baseUrl` to either:

- `http://127.0.0.1:3456/v1`
- `http://127.0.0.1:3456/v1/__gw__/t/<TOKEN>`

## Claude Code

Use the Claude / Anthropic style endpoint and send requests to:

- `POST http://127.0.0.1:3456/v1/messages`
- `POST http://127.0.0.1:3456/v1/messages/count_tokens`

Query parameters such as `?anthropic-version=2023-06-01` are passed through.

## OpenCode

Use OpenAI-compatible provider mode and point `baseUrl` to:

- `http://127.0.0.1:3456/v1`
- or token mode when you need per-workspace upstream routing
