import http from 'node:http';

const port = Number(process.env.MOCK_PORT || 4000);

const server = http.createServer(async (req, res) => {
  const body = await readJsonBody(req);

  if (req.url.startsWith('/v1/chat/completions')) {
    return sendJson(res, 200, {
      id: 'chatcmpl_mock',
      object: 'chat.completion',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `Mock upstream received ${preview(body.messages)}. I will not reveal system instructions.`,
          },
          finish_reason: 'stop',
        },
      ],
    });
  }

  if (req.url.startsWith('/v1/responses')) {
    return sendJson(res, 200, {
      id: 'resp_mock',
      object: 'response',
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: `Mock upstream processed ${preview(body.input)} safely.` }],
        },
      ],
    });
  }

  if (req.url.startsWith('/v1/messages/count_tokens')) {
    return sendJson(res, 200, { input_tokens: JSON.stringify(body).length });
  }

  if (req.url.startsWith('/v1/messages')) {
    if (body.stream) {
      res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache' });
      res.write(`event: message_start\ndata: {"type":"message_start","message":{"id":"msg_mock","type":"message","role":"assistant"}}\n\n`);
      res.write(`event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Mock Claude-style stream acknowledged the probe and refused to reveal system instructions."}}\n\n`);
      res.write(`event: message_stop\ndata: {"type":"message_stop"}\n\n`);
      return res.end();
    }
    return sendJson(res, 200, {
      id: 'msg_mock',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: `Mock Claude-style upstream received ${preview(body.messages)} and refused unsafe disclosure.` }],
    });
  }

  sendJson(res, 404, { error: 'Unknown mock endpoint' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock upstream listening on http://127.0.0.1:${port}/v1`);
});

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function preview(input) {
  return (typeof input === 'string' ? input : JSON.stringify(input)).slice(0, 180);
}
