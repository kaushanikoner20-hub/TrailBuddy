import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, requestAdventure } from './api.js';

const request = { mood: 'curious', duration: 30, activity: 'explore', difficulty: 'moderate' };
const adventure = {
  title: 'A small discovery', tagline: 'Look a little closer', intro: 'Take a slow breath.', closing: 'Carry the quiet with you.',
  duration: 30, mood: request.mood, activity: request.activity, difficulty: request.difficulty, phone_free: true,
  missions: [
    { id: 1, type: 'vision', title: 'Notice a color', instruction: 'Find a color you have not noticed today.', duration: 5 },
    { id: 2, type: 'hearing', title: 'Listen nearby', instruction: 'Pause and notice a sound close to you.', duration: 5 },
    { id: 3, type: 'curiosity', title: 'Follow a question', instruction: 'Choose one harmless detail to wonder about.', duration: 5 },
  ],
};

async function withFetch(response, run) {
  const original = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    withFetch.lastArgs = args;
    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try { return await run(); } finally { globalThis.fetch = original; }
}

test('sends every selected preference and returns a valid structured adventure', async () => {
  const result = await withFetch({ success: true, model: 'gemma3:4b', adventure }, () => requestAdventure(request));
  assert.deepEqual(JSON.parse(withFetch.lastArgs[1].body), request);
  assert.deepEqual(result, { adventure, model: 'gemma3:4b' });
});

test('rejects an incomplete adventure response instead of rendering it', async () => {
  await assert.rejects(
    withFetch({ success: true, model: 'gemma3:4b', adventure: { title: 'Broken', missions: [] } }, () => requestAdventure(request)),
    (error) => error instanceof ApiError && error.code === 'MALFORMED_RESPONSE',
  );
});

test('keeps actionable backend errors from a non-success response', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, code: 'MODEL_NOT_FOUND', error: 'Check your local Gemma model.' }), { status: 503 });
  try {
    await assert.rejects(requestAdventure(request), /Check your local Gemma model/);
  } finally { globalThis.fetch = original; }
});
