import { readFile, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';

export function expandHome(inputPath) {
  if (!inputPath) return inputPath;
  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

export async function parseSessionJsonl(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const lines = raw.split('\n').filter(Boolean);
  const messages = [];
  let meta = null;

  for (const line of lines) {
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    if (parsed.type === 'session_meta' && parsed.payload) {
      meta = {
        sessionId: parsed.payload.id,
        timestamp: parsed.payload.timestamp,
        cwd: parsed.payload.cwd,
        source: parsed.payload.source,
        originator: parsed.payload.originator,
        modelProvider: parsed.payload.model_provider,
      };
      continue;
    }

    const normalized = normalizeLineToMessage(parsed);
    if (normalized) messages.push(normalized);
  }

  return {
    meta,
    messages: coalesceMessages(messages).filter((message) => message.role === 'user' || message.role === 'assistant'),
  };
}

export async function copyImportedSession(sourcePath, importedDir) {
  await mkdir(importedDir, { recursive: true });
  const sourceName = path.basename(sourcePath);
  const id = randomUUID();
  const destinationPath = path.join(importedDir, `${id}-${sourceName}`);
  await copyFile(sourcePath, destinationPath);
  return { id, destinationPath };
}

function normalizeLineToMessage(entry) {
  if (entry.type === 'response_item' && entry.payload?.type === 'message') {
    return {
      role: entry.payload.role || 'assistant',
      content: flattenContent(entry.payload.content),
      timestamp: entry.timestamp,
    };
  }

  if (entry.type === 'event_msg' && entry.payload?.type === 'agent_message') {
    return {
      role: 'assistant',
      content: entry.payload.message || '',
      timestamp: entry.timestamp,
    };
  }

  if (entry.type === 'event_msg' && entry.payload?.type === 'user_message') {
    return {
      role: 'user',
      content: entry.payload.message || '',
      timestamp: entry.timestamp,
    };
  }

  return null;
}

function flattenContent(content) {
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      return part?.text || '';
    })
    .join('\n')
    .trim();
}

function coalesceMessages(messages) {
  const out = [];
  for (const message of messages) {
    if (!message.content) continue;
    const last = out[out.length - 1];
    if (last && last.role === message.role) {
      last.content = `${last.content}\n${message.content}`.trim();
      continue;
    }
    out.push({ role: message.role, content: message.content });
  }
  return out;
}

export function isReadableSessionFile(filePath) {
  return existsSync(filePath) && filePath.endsWith('.jsonl');
}
