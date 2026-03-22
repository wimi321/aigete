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

let experiments = [];
let state = null;

await loadState();
await Promise.all([loadSessions(), loadRoutes()]);

document.querySelector('#save-state').addEventListener('click', saveState);
document.querySelector('#refresh-sessions').addEventListener('click', loadSessions);
document.querySelector('#refresh-routes').addEventListener('click', loadRoutes);
routeForm.addEventListener('submit', createRoute);

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
}

async function loadSessions() {
  const response = await fetch('/api/sessions');
  const data = await response.json();
  sessionsEl.innerHTML = '';
  for (const session of data.sessions) {
    const node = sessionTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('h3').textContent = `${session.protocol} / ${session.experiment}`;
    node.querySelector('.timestamp').textContent = new Date(session.createdAt).toLocaleString();
    node.querySelector('.pill').textContent = `${session.responseRisk.level.toUpperCase()} / ${session.responseRisk.score}`;
    node.querySelector('.meta').textContent = `request ${session.requestRisk.level} (${session.requestRisk.score}) | upstream: ${session.upstreamUrl}`;
    node.querySelector('.request').textContent = `Request\n${session.requestPreview}`;
    node.querySelector('.response').textContent = `Response\n${session.responsePreview}`;
    sessionsEl.appendChild(node);
  }
}

async function loadRoutes() {
  const response = await fetch('/api/routes');
  const data = await response.json();
  routesEl.innerHTML = '';
  for (const route of data.routes) {
    const node = routeTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.route-note').textContent = route.note || 'unnamed route';
    node.querySelector('.route-time').textContent = new Date(route.createdAt).toLocaleString();
    node.querySelector('.route-upstream').textContent = `upstream: ${route.upstreamBaseUrl}`;
    node.querySelector('.route-base').textContent = `baseUrl\n${window.location.origin}/v1/__gw__/t/${route.token}`;
    routesEl.appendChild(node);
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
    .map((item) => `<option value="${item.id}" ${item.id === active ? 'selected' : ''}>${item.name}</option>`)
    .join('');
}

function renderExperimentCards(active) {
  experimentList.innerHTML = experiments
    .map(
      (item) => `
      <article class="exp-card ${item.id === active ? 'active' : ''}">
        <div>
          <p class="exp-name">${item.name}</p>
          <p class="exp-desc">${item.description}</p>
        </div>
        <span class="pill ${item.severity}">${item.severity}</span>
      </article>`,
    )
    .join('');
}
