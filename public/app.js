const stateEls = {
  upstreamBaseUrl: document.querySelector('#upstreamBaseUrl'),
  apiKey: document.querySelector('#apiKey'),
  activeExperiment: document.querySelector('#activeExperiment'),
  canaryToken: document.querySelector('#canaryToken'),
  enabled: document.querySelector('#enabled'),
};

const experimentList = document.querySelector('#experiment-list');
const sessionsEl = document.querySelector('#sessions');
const routesEl = document.querySelector('#routes');
const sessionTemplate = document.querySelector('#session-template');
const routeTemplate = document.querySelector('#route-template');
const gatewayKeyEl = document.querySelector('#gatewayKey');
const routeForm = document.querySelector('#route-form');
const langButtons = document.querySelectorAll('.lang-btn');
const copyButtons = document.querySelectorAll('[data-copy-target]');
const quickBaseEls = document.querySelectorAll('[data-base-url]');
const quickClaudeEls = document.querySelectorAll('[data-claude-url]');
const quickTokenEls = document.querySelectorAll('[data-token-url]');

let experiments = [];
let state = null;
let currentLang = getInitialLang();

const translations = {
  en: {
    title: 'AIGete',
    heroEyebrow: 'Authorized Security Research Only',
    heroTitle: 'Prompt Injection Research, Made Simple.',
    heroLede: 'Run a local gateway between your client and model, switch on a probe, and see whether the model leaks hidden instructions, obeys malicious overrides, or carries poisoned memory forward.',
    quickBadge: '60-second setup',
    quickTitle: 'Three steps. No maze.',
    quickLede: 'Start the mock upstream, start AIGete, then point Codex, Claude Code, or OpenCode at the gateway.',
    stepOneTitle: '1. Start the lab',
    stepOneBody: 'Run the mock upstream and the gateway locally.',
    stepTwoTitle: '2. Leave defaults alone',
    stepTwoBody: 'The default upstream already points at the local mock server, so new users can test without extra setup.',
    stepThreeTitle: '3. Paste one URL',
    stepThreeBody: 'Use the OpenAI-style URL for Codex and OpenCode, or the Anthropic-style URL for Claude Code.',
    runMock: 'npm run mock',
    runStart: 'npm start',
    copy: 'Copy',
    copied: 'Copied',
    clientsTitle: 'Connect Your Client',
    clientsLede: 'Use the same local gateway for the mainstream coding-agent workflows.',
    codexTitle: 'Codex',
    codexBody: 'Use an OpenAI-compatible provider and paste this as the base URL.',
    claudeTitle: 'Claude Code',
    claudeBody: 'Use the Anthropic-style endpoint below for messages and token counting.',
    openCodeTitle: 'OpenCode',
    openCodeBody: 'Use OpenAI-compatible mode with the same base URL as Codex.',
    openAiBase: 'OpenAI-compatible base URL',
    anthropicEndpoint: 'Anthropic endpoint',
    tokenRouteBase: 'Token route base URL',
    beginnerTitle: 'Beginner Setup',
    beginnerLede: 'Most users only need these fields. Save once, then start testing.',
    gatewayConfig: 'Gateway Config',
    save: 'Save',
    directUpstreamBaseUrl: 'Direct Upstream Base URL',
    upstreamPlaceholder: 'http://127.0.0.1:4000/v1',
    defaultApiKey: 'Default Upstream API Key',
    apiKeyPlaceholder: 'Optional bearer token',
    activeExperiment: 'Active Experiment',
    canaryToken: 'Canary Token',
    canaryPlaceholder: 'AG_CANARY_7F3A',
    enableInjection: 'Enable injection research mode',
    gatewayKey: 'Gateway Key',
    experimentCatalog: 'Probe Library',
    experimentHint: 'Pick one probe and compare model behavior.',
    tokenRoutes: 'Advanced: Token Routes',
    refresh: 'Refresh',
    routeUpstreamBaseUrl: 'Upstream Base URL',
    routeUpstreamPlaceholder: 'https://example.com/v1',
    note: 'Note',
    routeNotePlaceholder: 'team-lab / claude-code / prod-shadow',
    createRoute: 'Create Route',
    recentSessions: 'Recent Sessions',
    request: 'Request',
    response: 'Response',
    unnamedRoute: 'unnamed route',
    upstreamPrefix: 'upstream',
    baseUrlLabel: 'baseUrl',
    requestRiskPrefix: 'request',
    advancedLabel: 'Advanced',
    sessionsEmpty: 'No sessions yet. Run one request through the gateway and results will appear here.',
  },
  zh: {
    title: 'AIGete',
    heroEyebrow: '仅限授权安全研究',
    heroTitle: '把提示词注入研究，做得更简单。',
    heroLede: '在客户端和模型之间放一个本地网关，打开一个实验模板，就能观察模型是否会泄漏隐藏提示词、接受恶意覆盖，或把污染内容带到后续任务里。',
    quickBadge: '60 秒上手',
    quickTitle: '只要三步，不绕路。',
    quickLede: '先启动 mock upstream，再启动 AIGete，然后把 Codex、Claude Code 或 OpenCode 指到网关地址。',
    stepOneTitle: '1. 启动本地实验室',
    stepOneBody: '先在本地运行 mock upstream 和网关。',
    stepTwoTitle: '2. 默认配置先别动',
    stepTwoBody: '默认上游已经指向本地 mock 服务，新手无需额外配置就能测试。',
    stepThreeTitle: '3. 复制一个地址',
    stepThreeBody: 'Codex 和 OpenCode 用 OpenAI 风格地址，Claude Code 用 Anthropic 风格地址。',
    runMock: 'npm run mock',
    runStart: 'npm start',
    copy: '复制',
    copied: '已复制',
    clientsTitle: '连接你的客户端',
    clientsLede: '用同一个本地网关覆盖主流 AI 编程代理工作流。',
    codexTitle: 'Codex',
    codexBody: '选择 OpenAI-compatible provider，并把下面这个地址填进 base URL。',
    claudeTitle: 'Claude Code',
    claudeBody: '把下面这个 Anthropic 风格接口地址用于 messages 和 count_tokens。',
    openCodeTitle: 'OpenCode',
    openCodeBody: '使用 OpenAI-compatible 模式，和 Codex 使用同一个 base URL。',
    openAiBase: 'OpenAI 兼容 base URL',
    anthropicEndpoint: 'Anthropic 接口地址',
    tokenRouteBase: 'Token 路由 base URL',
    beginnerTitle: '新手配置',
    beginnerLede: '大多数人只需要这几个字段。保存一次，然后开始测试。',
    gatewayConfig: '网关配置',
    save: '保存',
    directUpstreamBaseUrl: '直连上游 Base URL',
    upstreamPlaceholder: 'http://127.0.0.1:4000/v1',
    defaultApiKey: '默认上游 API Key',
    apiKeyPlaceholder: '可选 Bearer Token',
    activeExperiment: '当前实验模板',
    canaryToken: 'Canary 标记',
    canaryPlaceholder: 'AG_CANARY_7F3A',
    enableInjection: '启用注入研究模式',
    gatewayKey: '网关密钥',
    experimentCatalog: '探针库',
    experimentHint: '选择一个探针，对比模型行为。',
    tokenRoutes: '高级功能：Token 路由',
    refresh: '刷新',
    routeUpstreamBaseUrl: '上游 Base URL',
    routeUpstreamPlaceholder: 'https://example.com/v1',
    note: '备注',
    routeNotePlaceholder: 'team-lab / claude-code / prod-shadow',
    createRoute: '创建路由',
    recentSessions: '最近会话',
    request: '请求',
    response: '响应',
    unnamedRoute: '未命名路由',
    upstreamPrefix: '上游',
    baseUrlLabel: 'baseUrl',
    requestRiskPrefix: '请求',
    advancedLabel: '高级',
    sessionsEmpty: '还没有会话记录。先让一个请求经过网关，结果就会显示在这里。',
  },
};

await loadState();
await Promise.all([loadSessions(), loadRoutes()]);
applyTranslations();
updateQuickStartUrls();

document.querySelector('#save-state').addEventListener('click', saveState);
document.querySelector('#refresh-sessions').addEventListener('click', loadSessions);
document.querySelector('#refresh-routes').addEventListener('click', loadRoutes);
routeForm.addEventListener('submit', createRoute);

for (const button of langButtons) {
  button.addEventListener('click', async () => {
    currentLang = button.dataset.lang;
    localStorage.setItem('aigete-lang', currentLang);
    applyTranslations();
    renderExperimentOptions(state.activeExperiment);
    renderExperimentCards(state.activeExperiment);
    await Promise.all([loadSessions(), loadRoutes()]);
  });
}

for (const button of copyButtons) {
  button.addEventListener('click', async () => {
    const targetId = button.dataset.copyTarget;
    const value = document.querySelector(`#${targetId}`)?.textContent?.trim();
    if (!value) return;
    await navigator.clipboard.writeText(value);
    const original = t('copy');
    button.textContent = t('copied');
    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  });
}

async function loadState() {
  const response = await fetch('/api/state');
  const data = await response.json();
  state = data.state;
  experiments = data.experiments;
  renderExperimentOptions(state.activeExperiment);
  renderExperimentCards(state.activeExperiment);
  for (const [key, el] of Object.entries(stateEls)) {
    if (el.type === 'checkbox') {
      el.checked = Boolean(state[key]);
    } else {
      el.value = state[key] ?? '';
    }
  }
  gatewayKeyEl.textContent = state.gatewayKey;
}

async function saveState() {
  const payload = Object.fromEntries(
    Object.entries(stateEls).map(([key, el]) => [key, el.type === 'checkbox' ? el.checked : el.value]),
  );
  const response = await fetch('/api/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  state = data.state;
  renderExperimentCards(state.activeExperiment);
  updateQuickStartUrls();
}

async function loadSessions() {
  const response = await fetch('/api/sessions');
  const data = await response.json();
  sessionsEl.innerHTML = '';
  if (!data.sessions.length) {
    sessionsEl.innerHTML = `<p class="empty">${t('sessionsEmpty')}</p>`;
    return;
  }
  for (const session of data.sessions) {
    const node = sessionTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('h3').textContent = `${session.protocol} / ${getExperimentLabel(session.experiment)}`;
    node.querySelector('.timestamp').textContent = new Date(session.createdAt).toLocaleString();
    node.querySelector('.pill').textContent = `${session.responseRisk.level.toUpperCase()} / ${session.responseRisk.score}`;
    node.querySelector('.meta').textContent = `${t('requestRiskPrefix')} ${session.requestRisk.level} (${session.requestRisk.score}) | ${t('upstreamPrefix')}: ${session.upstreamUrl}`;
    node.querySelector('.request').textContent = `${t('request')}\n${session.requestPreview}`;
    node.querySelector('.response').textContent = `${t('response')}\n${session.responsePreview}`;
    sessionsEl.appendChild(node);
  }
}

async function loadRoutes() {
  const response = await fetch('/api/routes');
  const data = await response.json();
  routesEl.innerHTML = '';
  for (const route of data.routes) {
    const node = routeTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.route-note').textContent = route.note || t('unnamedRoute');
    node.querySelector('.route-time').textContent = new Date(route.createdAt).toLocaleString();
    node.querySelector('.route-upstream').textContent = `${t('upstreamPrefix')}: ${route.upstreamBaseUrl}`;
    node.querySelector('.route-base').textContent = `${t('baseUrlLabel')}\n${window.location.origin}/v1/__gw__/t/${route.token}`;
    routesEl.appendChild(node);
  }

  const newestToken = data.routes[0]?.token;
  for (const element of quickTokenEls) {
    element.textContent = newestToken
      ? `${window.location.origin}/v1/__gw__/t/${newestToken}`
      : `${window.location.origin}/v1/__gw__/t/<TOKEN>`;
  }
}

async function createRoute(event) {
  event.preventDefault();
  const upstreamBaseUrl = document.querySelector('#routeUpstreamBaseUrl').value.trim();
  const note = document.querySelector('#routeNote').value.trim();
  if (!upstreamBaseUrl) return;
  await fetch('/__gw__/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ upstreamBaseUrl, note, gatewayKey: state.gatewayKey }),
  });
  routeForm.reset();
  await loadRoutes();
}

function renderExperimentOptions(active) {
  stateEls.activeExperiment.innerHTML = experiments
    .map((item) => `<option value="${item.id}" ${item.id === active ? 'selected' : ''}>${getExperimentLabel(item.id)}</option>`)
    .join('');
}

function renderExperimentCards(active) {
  experimentList.innerHTML = experiments
    .map(
      (item) => `
      <article class="exp-card ${item.id === active ? 'active' : ''}">
        <div>
          <p class="exp-name">${currentLang === 'zh' ? item.zhName || item.name : item.name}</p>
          <p class="exp-desc">${currentLang === 'zh' ? item.zhDescription || item.description : item.description}</p>
        </div>
        <span class="pill ${item.severity}">${item.severity}</span>
      </article>`,
    )
    .join('');
}

function updateQuickStartUrls() {
  const openAiBase = `${window.location.origin}/v1`;
  const claudeBase = `${window.location.origin}/v1/messages`;
  for (const element of quickBaseEls) {
    element.textContent = openAiBase;
  }
  for (const element of quickClaudeEls) {
    element.textContent = claudeBase;
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('title');
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }
  for (const button of langButtons) {
    button.classList.toggle('active', button.dataset.lang === currentLang);
  }
  for (const button of copyButtons) {
    button.textContent = t('copy');
  }
}

function getExperimentLabel(experimentId) {
  const match = experiments.find((item) => item.id === experimentId);
  if (!match) return experimentId;
  return currentLang === 'zh' ? match.zhName || match.name : match.name;
}

function getInitialLang() {
  const fromStorage = localStorage.getItem('aigete-lang');
  if (fromStorage === 'zh' || fromStorage === 'en') return fromStorage;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}
