# 客户端接入

## 直连模式

先在控制台里把 `直连上游 Base URL` 配成真实上游，例如 `http://127.0.0.1:4000/v1`。

然后把客户端指向：

- OpenAI 风格 base URL：`http://127.0.0.1:3456/v1`
- Anthropic 风格 base URL：`http://127.0.0.1:3456/v1`

## Token 模式

可以在 Web 控制台中创建路由，也可以用下面的 API：

```bash
curl http://127.0.0.1:3456/__gw__/register \
  -H 'content-type: application/json' \
  -d '{
    "upstreamBaseUrl": "http://127.0.0.1:4000/v1",
    "gatewayKey": "<GATEWAY_KEY>",
    "note": "claude-code-lab"
  }'
```

使用返回的 base URL：

```text
http://127.0.0.1:3456/v1/__gw__/t/<TOKEN>
```

## Codex

使用 OpenAI-compatible provider，并把 `baseUrl` 指向：

- `http://127.0.0.1:3456/v1`
- 或 `http://127.0.0.1:3456/v1/__gw__/t/<TOKEN>`

## Claude Code

使用 Claude / Anthropic 风格接口：

- `POST http://127.0.0.1:3456/v1/messages`
- `POST http://127.0.0.1:3456/v1/messages/count_tokens`

诸如 `?anthropic-version=2023-06-01` 这类查询参数会被原样透传。

## OpenCode

使用 OpenAI-compatible provider，并把 `baseUrl` 指向：

- `http://127.0.0.1:3456/v1`
- 如果你需要为不同工作区配置不同上游，可以用 token 模式
