// Timestamp-based timer math. Remaining time is always computed from timestamps,
// never from counting interval ticks, so a suspended mobile browser cannot make it drift.

export function createTimer(durationMs) {
  return { durationMs, elapsedMs: 0, runningSince: null };
}

export function elapsedAt(timer, now) {
  const running = timer.runningSince == null ? 0 : Math.max(0, now - timer.runningSince);
  return Math.min(timer.durationMs, timer.elapsedMs + running);
}

export function remainingAt(timer, now) {
  return timer.durationMs - elapsedAt(timer, now);
}

export function startTimer(timer, now) {
  return timer.runningSince == null ? { ...timer, runningSince: now } : timer;
}

export function pauseTimer(timer, now) {
  if (timer.runningSince == null) return timer;
  return { ...timer, elapsedMs: elapsedAt(timer, now), runningSince: null };
}

export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}