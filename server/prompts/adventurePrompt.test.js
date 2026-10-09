import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAdventurePrompt } from './adventurePrompt.js';

test('the selected mood, time, activity, and difficulty all shape Gemma prompt input', () => {
  const prompt = buildAdventurePrompt({ mood: 'curious', duration: 15, activity: 'observe-nature', difficulty: 'adventurous' });
  assert.match(prompt, /Mood: Curious:/);
  assert.match(prompt, /Time available: 15 minutes/);
  assert.match(prompt, /Activity: Observe nature:/);
  assert.match(prompt, /Difficulty: Adventurous:/);
  assert.match(prompt, /The mood must clearly shape the missions/);
});
