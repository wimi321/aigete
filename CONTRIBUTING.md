# Contributing

## Principles

- Keep changes local-first and easy to audit.
- Prefer transparent research probes over hidden behavior.
- Preserve compatibility with OpenAI-style and Anthropic-style clients.

## Local Development

```bash
npm run mock
npm start
```

Then open `http://127.0.0.1:3456`.

## Pull Requests

Include:

- the client or protocol you tested
- whether the change affects injection behavior, routing, or risk scoring
- before/after examples when UI changes are involved
