import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const dataDir = path.join(process.cwd(), 'data');
const statePath = path.join(dataDir, 'state.json');
const sessionsPath = path.join(dataDir, 'sessions.json');
const routesPath = path.join(dataDir, 'routes.json');
const sessionLabPath = path.join(dataDir, 'session-lab.json');
const variantsPath = path.join(dataDir, 'session-variants.json');

const defaultState = {
  upstreamBaseUrl: 'http://127.0.0.1:4000/v1',
  apiKey: '',
  activeExperiment: 'none',
  canaryToken: 'AG_CANARY_7F3A',
  enabled: true,
  gatewayKey: '',
};

export async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  if (!existsSync(statePath)) {
    await writeJson(statePath, { ...defaultState, gatewayKey: randomUUID() });
  }
  if (!existsSync(sessionsPath)) {
    await writeJson(sessionsPath, []);
  }
  if (!existsSync(routesPath)) {
    await writeJson(routesPath, []);
  }
  if (!existsSync(sessionLabPath)) {
    await writeJson(sessionLabPath, []);
  }
  if (!existsSync(variantsPath)) {
    await writeJson(variantsPath, []);
  }
}

export async function getState() {
  const state = { ...defaultState, ...(await readJson(statePath, defaultState)) };
  if (!state.gatewayKey) {
    state.gatewayKey = randomUUID();
    await writeJson(statePath, state);
  }
  return state;
}

export async function saveState(nextState) {
  const merged = { ...(await getState()), ...nextState };
  await writeJson(statePath, merged);
  return merged;
}

export async function appendSession(session) {
  const current = await readJson(sessionsPath, []);
  current.unshift(session);
  await writeJson(sessionsPath, current.slice(0, 100));
  return session;
}

export async function listSessions() {
  return readJson(sessionsPath, []);
}

export async function listRoutes() {
  return readJson(routesPath, []);
}

export async function registerRoute(upstreamBaseUrl, note = '') {
  const routes = await listRoutes();
  const route = {
    token: randomUUID().replace(/-/g, ''),
    upstreamBaseUrl,
    note,
    createdAt: new Date().toISOString(),
  };
  routes.unshift(route);
  await writeJson(routesPath, routes.slice(0, 200));
  return route;
}

export async function lookupRoute(token) {
  const routes = await listRoutes();
  return routes.find((route) => route.token === token) || null;
}

export async function unregisterRoute(token) {
  const routes = await listRoutes();
  const nextRoutes = routes.filter((route) => route.token !== token);
  await writeJson(routesPath, nextRoutes);
  return nextRoutes.length !== routes.length;
}

export async function listImportedSessions() {
  return readJson(sessionLabPath, []);
}

export async function saveImportedSession(session) {
  const current = await listImportedSessions();
  current.unshift(session);
  await writeJson(sessionLabPath, current.slice(0, 100));
  return session;
}

export async function getImportedSession(id) {
  const current = await listImportedSessions();
  return current.find((item) => item.id === id) || null;
}

export async function listVariants() {
  return readJson(variantsPath, []);
}

export async function saveVariant(variant) {
  const current = await listVariants();
  current.unshift(variant);
  await writeJson(variantsPath, current.slice(0, 200));
  return variant;
}

async function readJson(file, fallback) {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await writeFile(file, JSON.stringify(value, null, 2));
}
