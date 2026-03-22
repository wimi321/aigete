import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const gatewayBaseUrl = args.gateway || 'http://127.0.0.1:3456';
const packPath = path.resolve(process.cwd(), args.pack || 'datasets/attack-packs/core.json');
const outputPath = path.resolve(process.cwd(), args.output || 'reports/latest.json');

const pack = JSON.parse(await readFile(packPath, 'utf8'));
const originalState = await fetchJson(`${gatewayBaseUrl}/api/state`);
const report = {
  generatedAt: new Date().toISOString(),
  gatewayBaseUrl,
  pack: {
    id: pack.id,
    name: pack.name,
    description: pack.description,
    source: packPath,
  },
  summary: {
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    failures: 0,
  },
  cases: [],
};

try {
  for (const testCase of pack.cases) {
    await saveGatewayState(gatewayBaseUrl, {
      enabled: testCase.experiment !== 'none',
      activeExperiment: testCase.experiment,
    });

    const endpoint = buildEndpoint(gatewayBaseUrl, testCase);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(testCase.request),
    });

    const rawText = await response.text();
    const body = parseMaybeJson(rawText);
    const responseRisk = response.headers.get('x-aigate-response-risk') || 'unknown';
    const requestRisk = response.headers.get('x-aigate-request-risk') || 'unknown';
    const sessionId = response.headers.get('x-aigate-session-id');

    report.summary.total += 1;
    if (responseRisk in report.summary) {
      report.summary[responseRisk] += 1;
    }
    if (!response.ok) {
      report.summary.failures += 1;
    }

    report.cases.push({
      id: testCase.id,
      protocol: testCase.protocol,
      experiment: testCase.experiment,
      endpoint,
      ok: response.ok,
      status: response.status,
      sessionId,
      requestRisk,
      responseRisk,
      preview: summarizePayload(body),
    });
  }
} finally {
  await saveGatewayState(gatewayBaseUrl, {
    enabled: originalState.state.enabled,
    activeExperiment: originalState.state.activeExperiment,
    canaryToken: originalState.state.canaryToken,
    upstreamBaseUrl: originalState.state.upstreamBaseUrl,
    apiKey: originalState.state.apiKey,
  });
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`AIGete benchmark complete`);
console.log(`Pack: ${pack.name}`);
console.log(`Gateway: ${gatewayBaseUrl}`);
console.log(`Cases: ${report.summary.total}`);
console.log(`High: ${report.summary.high} | Medium: ${report.summary.medium} | Low: ${report.summary.low} | Info: ${report.summary.info}`);
console.log(`Failures: ${report.summary.failures}`);
console.log(`Report: ${outputPath}`);

function parseArgs(argv) {
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) continue;
    const key = current.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[index + 1] : 'true';
    out[key] = value;
    if (value !== 'true') index += 1;
  }
  return out;
}

function buildEndpoint(baseUrl, testCase) {
  const suffix = testCase.query || '';
  if (testCase.protocol === 'responses') return `${baseUrl}/v1/responses${suffix}`;
  if (testCase.protocol === 'messages') return `${baseUrl}/v1/messages${suffix}`;
  return `${baseUrl}/v1/chat/completions${suffix}`;
}

async function saveGatewayState(baseUrl, patch) {
  return fetchJson(`${baseUrl}/api/state`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.json();
}

function parseMaybeJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}

function summarizePayload(payload) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return text.replace(/\s+/g, ' ').trim().slice(0, 220);
}
