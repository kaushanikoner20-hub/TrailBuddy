import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTarget, rectsOverlap } from './runawayMath.js';

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const viewport = { width: 1200, height: 800 };
const size = { width: 190, height: 56 };
const avoid = { left: 380, right: 580, top: 500, bottom: 560 };

test('rectsOverlap detects overlap and respects margin', () => {
  const a = { left: 0, right: 10, top: 0, bottom: 10 };
  assert.equal(rectsOverlap(a, { left: 5, right: 15, top: 5, bottom: 15 }), true);
  assert.equal(rectsOverlap(a, { left: 20, right: 30, top: 0, bottom: 10 }), false);
  assert.equal(rectsOverlap(a, { left: 20, right: 30, top: 0, bottom: 10 }, 15), true);
});

test('targets stay inside the viewport, off the YES button, and away from the pointer', () => {
  const random = seeded(42);
  for (let i = 0; i < 300; i += 1) {
    const pointer = { x: random() * viewport.width, y: random() * viewport.height };
    const current = { x: 600, y: 530 };
    const target = pickTarget({ viewport, size, avoid, pointer, current, random });
    assert.ok(target, 'a target should exist in a roomy viewport');
    const rect = {
      left: target.x - size.width / 2, right: target.x + size.width / 2,
      top: target.y - size.height / 2, bottom: target.y + size.height / 2,
    };
    assert.ok(rect.left >= 0 && rect.right <= viewport.width, 'inside horizontally');
    assert.ok(rect.top >= 0 && rect.bottom <= viewport.height, 'inside vertically');
    assert.equal(rectsOverlap(rect, avoid), false, 'does not overlap YES');
    assert.ok(Math.hypot(target.x - pointer.x, target.y - pointer.y) >= 80, 'not under the pointer');
  }
});

test('returns null when the viewport is too small to move anywhere', () => {
  const target = pickTarget({
    viewport: { width: 150, height: 100 }, size, avoid, pointer: { x: 0, y: 0 }, current: { x: 75, y: 50 },
  });
  assert.equal(target, null);
});