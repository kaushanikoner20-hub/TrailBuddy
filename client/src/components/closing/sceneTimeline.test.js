import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, FLIGHT_START, PERCH, PERCH_TREE, birdPose, cameraPose, phaseAt, treeLayout } from './sceneTimeline.js';

test('phases run arrival, takeoff, message, settled in order within the 5-8 second target', () => {
  assert.equal(phaseAt(0), 'arrival');
  assert.equal(phaseAt(FLIGHT_START - 0.01), 'arrival');
  assert.equal(phaseAt(FLIGHT_START), 'takeoff');
  assert.equal(phaseAt(3.4), 'message');
  assert.equal(phaseAt(DURATION), 'settled');
  assert.ok(DURATION >= 5 && DURATION <= 8);
});

test('the bird starts perched with folded wings and does not move until takeoff', () => {
  const start = birdPose(0);
  assert.equal(start.airborne, false);
  assert.ok(Math.abs(start.position[0] - PERCH[0]) < 1e-9);
  assert.ok(Math.abs(start.position[2] - PERCH[2]) < 1e-9);
  assert.ok(start.wingAngle < -1);
});

test('after takeoff the bird flaps, climbs, and recedes from the viewer', () => {
  const early = birdPose(FLIGHT_START + 0.5);
  const late = birdPose(DURATION);
  assert.equal(early.airborne, true);
  assert.ok(late.position[1] > PERCH[1] + 5, 'climbed');
  assert.ok(late.position[2] < PERCH[2] - 40, 'flew away from the camera');
  const angles = new Set([0.05, 0.1, 0.15, 0.2, 0.25].map((d) => birdPose(FLIGHT_START + d).wingAngle.toFixed(2)));
  assert.ok(angles.size > 1, 'wings move');
});

test('poses are finite numbers for any time, including before 0 and after the end', () => {
  for (const t of [-1, 0, 0.5, 1.5, 3, 7, 12]) {
    const bird = birdPose(t);
    const cam = cameraPose(t);
    for (const v of [...bird.position, ...bird.tangent, bird.wingAngle, ...cam.position, ...cam.look]) {
      assert.ok(Number.isFinite(v), `t=${t}`);
    }
  }
});

test('tree layout is deterministic and keeps the view and perch tree clear', () => {
  const a = treeLayout();
  const b = treeLayout();
  assert.deepEqual(a, b);
  assert.equal(a.length, 34);
  for (const tree of a) {
    assert.ok(!(Math.abs(tree.x) < 3.2 && tree.z > -30), 'center corridor clear');
    assert.ok(Math.hypot(tree.x - PERCH_TREE.x, tree.z - PERCH_TREE.z) >= 4, 'perch area clear');
    assert.ok(tree.z <= -3 && tree.z >= -73);
  }
});