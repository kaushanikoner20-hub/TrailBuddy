// Exercises the request handler end to end against a stub Ollama HTTP server.
// The stub stands in for the model only to test error mapping and retry logic;
// it says nothing about the quality of real Gemma output (see docs/TESTING.md).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

let stub;
let stubBody = () => ({ response: '{}' });
let calls = 0;
let handleAdventureRequest;

const validRequest = { mood: 'calm', duration: 30, activity: 'walk', difficulty: 'gentle' };

const goodAdventure = {
  title: 'The Quiet Observer',
  tagline: 'Slow down enough to notice what normally disappears.',
  intro: 'A slow outdoor reset.',
  missions: [
    { type: 'hearing', title: 'Listen', duration: 5, instruction: 'Name five sounds.' },
    { type: 'vision', title: 'Look Closer', duration: 8, instruction: 'Study something you pass daily.' },
    { type: 'movement', title: 'Slow Down', duration: 7, instruction: 'Walk at half pace.' },
    { type: 'memory', title: 'Remember', duration: 5, instruction: 'Recall three things.' },
  ],
  closing: 'Recall three things you noticed.',
};

before(async () => {
  stub = http.createServer((req, res) => {
    calls += 1;
    const out = stubBody();
    if (out.status) res.statusCode = out.status;
    res.end(typeof out.raw === 'string' ? out.raw : JSON.stringify(out));
  });
  await new Promise((resolve) => stub.listen(0, '127.0.0.1', resolve));
  process.env.OLLAMA_BASE_URL = `http://127.0.0.1:${stub.address().port}`;
  process.env.OLLAMA_TIMEOUT_MS = '300';
  ({ handleAdventureRequest } = await import('./adventureHandler.js'));
});

after(() => stub.close());

const modelSays = (value) => ({ response: typeof value === 'string' ? value : JSON.stringify(value) });

test('400 for invalid input, without calling Ollama', async () => {
  calls = 0;
  const { status, body } = await handleAdventureRequest({ ...validRequest, mood: undefined });
  assert.equal(status, 400);
  assert.equal(body.success, false);
  assert.equal(body.code, 'INVALID_INPUT');
  assert.equal(calls, 0);
});

test('200 with a structured adventure for valid model output', async () => {
  stubBody = () => modelSays(goodAdventure);
  const { status, body } = await handleAdventureRequest(validRequest);
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.adventure.title, 'The Quiet Observer');
  assert.equal(body.adventure.missions[0].id, 1);
  assert.equal(body.adventure.phone_free, true);
});

test('accepts model output wrapped in code fences', async () => {
  stubBody = () => modelSays('```json\n' + JSON.stringify(goodAdventure) + '\n```');
  assert.equal((await handleAdventureRequest(validRequest)).status, 200);
});

test('retries once when the first output is malformed', async () => {
  calls = 0;
  stubBody = () => (calls === 1 ? modelSays('this is not json') : modelSays(goodAdventure));
  const { status } = await handleAdventureRequest(validRequest);
  assert.equal(status, 200);
  assert.equal(calls, 2);
});

test('502 INVALID_MODEL_OUTPUT when both attempts are unusable', async () => {
  calls = 0;
  stubBody = () => modelSays('{"title":"only a title"}');
  const { status, body } = await handleAdventureRequest(validRequest);
  assert.equal(status, 502);
  assert.equal(body.code, 'INVALID_MODEL_OUTPUT');
  assert.equal(calls, 2);
});

test('503 MODEL_NOT_FOUND is not retried', async () => {
  calls = 0;
  stubBody = () => ({ status: 404, error: 'model not found' });
  const { status, body } = await handleAdventureRequest(validRequest);
  assert.equal(status, 503);
  assert.equal(body.code, 'MODEL_NOT_FOUND');
  assert.equal(calls, 1);
});

test('504 when the model is too slow', async () => {
  stub.removeAllListeners('request');
  stub.on('request', () => {});
  const { status, body } = await handleAdventureRequest(validRequest);
  assert.equal(status, 504);
  assert.equal(body.code, 'OLLAMA_TIMEOUT');
});

test('503 OLLAMA_UNAVAILABLE when Ollama is not running', async () => {
  await new Promise((resolve) => stub.close(resolve));
  const { status, body } = await handleAdventureRequest(validRequest);
  assert.equal(status, 503);
  assert.equal(body.code, 'OLLAMA_UNAVAILABLE');
});