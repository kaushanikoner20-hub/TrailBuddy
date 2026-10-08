import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateModelAdventure } from './adventureSchema.js';

const request = { mood: 'calm', duration: 30, activity: 'walk', difficulty: 'gentle' };

const goodOutput = () => ({
  title: 'The Quiet Observer',
  tagline: 'Slow down enough to notice what normally disappears.',
  intro: 'A slow outdoor reset built around noticing small things.',
  missions: [
    { type: 'hearing', title: 'Listen', duration: 5, instruction: 'Stop somewhere safe and name five sounds.' },
    { type: 'vision', title: 'Look Closer', duration: 8, instruction: 'Find something you usually walk past.' },
    { type: 'movement', title: 'Slow Down', duration: 7, instruction: 'Walk at half your normal pace.' },
    { type: 'memory', title: 'Remember', duration: 5, instruction: 'Pick three things to remember.' },
  ],
  closing: 'Before you go back inside, recall three things you noticed.',
});

test('builds the public adventure shape from valid model output', () => {
  const { adventure } = validateModelAdventure(goodOutput(), request);
  assert.equal(adventure.title, 'The Quiet Observer');
  assert.equal(adventure.duration, 30);
  assert.equal(adventure.mood, 'calm');
  assert.equal(adventure.activity, 'walk');
  assert.equal(adventure.difficulty, 'gentle');
  assert.equal(adventure.phone_free, true);
  assert.deepEqual(adventure.missions.map((m) => m.id), [1, 2, 3, 4]);
});

test('rejects non-object output', () => {
  for (const raw of [null, 'text', 42, [], undefined]) {
    assert.ok(validateModelAdventure(raw, request).errors);
  }
});

test('rejects missing or empty text fields', () => {
  for (const field of ['title', 'tagline', 'intro', 'closing']) {
    const raw = goodOutput();
    raw[field] = '   ';
    assert.ok(validateModelAdventure(raw, request).errors.some((e) => e.startsWith(field)), field);
  }
});

test('rejects too few, too many, or non-array missions', () => {
  const few = goodOutput();
  few.missions = few.missions.slice(0, 2);
  assert.ok(validateModelAdventure(few, request).errors);

  const many = goodOutput();
  many.missions = Array.from({ length: 8 }, () => many.missions[0]);
  assert.ok(validateModelAdventure(many, request).errors);

  const notArray = goodOutput();
  notArray.missions = 'listen';
  assert.ok(validateModelAdventure(notArray, request).errors);
});

test('rejects a mission with a bad type, title, instruction, or duration', () => {
  const cases = [
    ['type', 'smelling'],
    ['title', ''],
    ['instruction', ''],
    ['duration', 0],
    ['duration', 2.5],
    ['duration', '5'],
    ['duration', 31],
  ];
  for (const [field, value] of cases) {
    const raw = goodOutput();
    raw.missions[0][field] = value;
    assert.ok(validateModelAdventure(raw, request).errors, `${field}=${value}`);
  }
});

test('rejects mission totals that do not fit the requested time', () => {
  const tooShort = goodOutput();
  tooShort.missions.forEach((m) => (m.duration = 1));
  assert.match(validateModelAdventure(tooShort, request).errors[0], /add up to 4 minutes/);

  const tooLong = goodOutput();
  tooLong.missions.forEach((m) => (m.duration = 12));
  assert.match(validateModelAdventure(tooLong, request).errors[0], /add up to 48 minutes/);
});

test('trims surrounding whitespace', () => {
  const raw = goodOutput();
  raw.title = '  Padded  ';
  assert.equal(validateModelAdventure(raw, request).adventure.title, 'Padded');
});