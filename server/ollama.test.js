// Tests the error handling of the Ollama service against a throwaway local HTTP server.
// These tests do NOT exercise a real model; see docs/TESTING.md for real Gemma checks.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

let stub;
let stubHandler = (_req, res) => res.end('{}');
let generate;
let config;

before(async () => {
  stub = http.createServer((req, res) => stubHandler(req, res));
  await new Promise((resolve) => stub.listen(0, '127.0.0.1', resolve));
  process.env.OLLAMA_BASE_URL = `http://127.0.0.1:${stub.address().port}`;
  process.env.OLLAMA_TIMEOUT_MS = '300';
  ({ config } = await import('./config.js'));
  ({ generate } = await import('./services/ollama.js'));
});

after(() => stub.close());

const call = () => generate({ prompt: 'hi', system: 'sys' });

test('returns trimmed text from a well-formed response', async () => {
  stubHandler = (_req, res) => res.end(JSON.stringify({ response: '  hello  ' }));
  assert.equal(await call(), 'hello');
});

test('sends the configured model with streaming disabled', async () => {
  let body = '';
  stubHandler = (req, res) => {
    req.on('data', (c) => (body += c));
    req.on('end', () => res.end(JSON.stringify({ response: 'ok' })));
  };
  await call();
  const sent = JSON.parse(body);
  assert.equal(sent.model, config.ollamaModel);
  assert.equal(sent.stream, false);
});

test('maps 404 to MODEL_NOT_FOUND', async () => {
  stubHandler = (_req, res) => {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "model 'x' not found" }));
  };
  await assert.rejects(call, { code: 'MODEL_NOT_FOUND' });
});

test('maps other non-2xx statuses to OLLAMA_ERROR', async () => {
  stubHandler = (_req, res) => {
    res.statusCode = 500;
    res.end('boom');
  };
  await assert.rejects(call, { code: 'OLLAMA_ERROR' });
});

test('maps invalid JSON and empty responses to MALFORMED_RESPONSE', async () => {
  stubHandler = (_req, res) => res.end('not json');
  await assert.rejects(call, { code: 'MALFORMED_RESPONSE' });
  stubHandler = (_req, res) => res.end(JSON.stringify({ response: '   ' }));
  await assert.rejects(call, { code: 'MALFORMED_RESPONSE' });
});

test('maps a slow response to OLLAMA_TIMEOUT', async () => {
  stubHandler = () => {};
  await assert.rejects(call, { code: 'OLLAMA_TIMEOUT' });
});

test('maps a closed port to OLLAMA_UNAVAILABLE', async () => {
  const port = stub.address().port;
  await new Promise((resolve) => stub.close(resolve));
  await assert.rejects(call, { code: 'OLLAMA_UNAVAILABLE' });
  await new Promise((resolve) => stub.listen(port, '127.0.0.1', resolve));
});