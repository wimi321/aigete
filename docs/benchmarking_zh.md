# Benchmark 说明

AIGete 现在支持可重复的 benchmark 运行方式，这一套工作流参考了 `promptfoo` 和 `garak` 等项目的实战模式：

- 固定测试包纳入仓库版本管理
- 命令行可批量执行，适合回归测试
- 输出机器可读 JSON 报告，方便接入 CI

## 运行默认测试包

先启动本地 mock upstream 和网关：

```bash
npm run mock
npm start
```

然后执行：

```bash
npm run benchmark
```

它会加载 [datasets/attack-packs/core.json](/Users/haoc/Developer/aigete/datasets/attack-packs/core.json)，并把报告写到 `reports/latest.json`。

## 自定义测试包

```bash
node scripts/run-benchmark.js \
  --gateway http://127.0.0.1:3456 \
  --pack datasets/attack-packs/core.json \
  --output reports/core-pack.json
```

## 测试包格式

每个 case 定义：

- `protocol`：`chat`、`responses` 或 `messages`
- `experiment`：AIGete 的实验模板 id
- `request`：发给网关的原始请求体
- `query`：可选查询参数，适合 Anthropic 版本号等场景

这种格式方便审查、diff 和在 PR 里扩展新的攻击用例。
