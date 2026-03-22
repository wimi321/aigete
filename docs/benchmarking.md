# Benchmarking

AIGete now supports repeatable benchmark runs inspired by the workflow patterns that make tools like `promptfoo` and `garak` useful in real teams:

- fixed test packs committed to the repo
- command-line execution for regression checks
- machine-readable JSON reports for CI

## Run the default pack

Start the local mock upstream and the gateway first:

```bash
npm run mock
npm start
```

Then run:

```bash
npm run benchmark
```

This loads [datasets/attack-packs/core.json](/Users/haoc/Developer/aigete/datasets/attack-packs/core.json) and writes a report to `reports/latest.json`.

## Custom pack

```bash
node scripts/run-benchmark.js \
  --gateway http://127.0.0.1:3456 \
  --pack datasets/attack-packs/core.json \
  --output reports/core-pack.json
```

## Pack format

Each case defines:

- `protocol`: `chat`, `responses`, or `messages`
- `experiment`: AIGete experiment id
- `request`: raw request body sent to the gateway
- `query`: optional query string, useful for Anthropic version parameters

This makes attack packs easy to review, diff, and expand in pull requests.
