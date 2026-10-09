import { useEffect, useState } from 'react';
import { createTimer, formatClock, pauseTimer, readStoredTimer, remainingAt, startTimer, writeStoredTimer } from './timerModel.js';

function localStore() {
  try { return window.localStorage; } catch { return null; }
}

/**
 * Optional timer for one mission. It only starts when the user starts it, runs from timestamps,
 * and never completes the mission by itself.
 */
export function useMissionTimer(durationMinutes, externalPaused, missionId) {
  const durationMs = Math.max(1, durationMinutes) * 60 * 1000;
  const missionKey = `trailbuddy.timer.v1:${String(missionId)}`;
  const [saved] = useState(() => readStoredTimer(localStore(), missionKey, durationMs));
  const [timer, setTimer] = useState(() => saved?.timer ?? createTimer(durationMs));
  const [userState, setUserState] = useState(() => saved?.status ?? 'idle'); // idle | running | paused | finished
  const [now, setNow] = useState(() => Date.now());

  const shouldRun = userState === 'running' && !externalPaused;

  useEffect(() => {
    const t = Date.now();
    setNow(t);
    setTimer((current) => (shouldRun ? startTimer(current, t) : pauseTimer(current, t)));
  }, [shouldRun]);

  useEffect(() => {
    if (!shouldRun) return undefined;
    const refresh = () => setNow(Date.now());
    const id = setInterval(refresh, 500);
    // A suspended mobile tab skips ticks; recompute from timestamps as soon as it wakes up.
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [shouldRun]);

  const remainingMs = remainingAt(timer, now);

  function finishEarly() {
    setTimer((current) => pauseTimer(current, Date.now()));
    setUserState('finished');
  }

  useEffect(() => {
    writeStoredTimer(localStore(), missionKey, userState, timer);
  }, [missionKey, timer, userState]);

  useEffect(() => {
    if (userState === 'running' && remainingMs <= 0) setUserState('finished');
  }, [userState, remainingMs]);

  return {
    status: userState,
    remainingMs,
    start: () => setUserState('running'),
    pause: () => setUserState('paused'),
    resume: () => setUserState('running'),
    finishEarly,
  };
}

export default function MissionTimer({ minutes, paused, missionId }) {
  const timer = useMissionTimer(minutes, paused, missionId);

  if (timer.status === 'idle') {
    return (
      <div className="timer">
        <button type="button" className="away-link" onClick={timer.start}>
          Start a {minutes}-minute timer (optional)
        </button>
      </div>
    );
  }

  return (
    <div className="timer">
      <p className="timer-clock" role="timer" aria-label="Mission timer">
        {timer.status === 'finished' ? 'Timer finished' : formatClock(timer.remainingMs)}
      </p>
      {timer.status === 'running' && (
        <button type="button" className="away-link" onClick={timer.pause}>Pause timer</button>
      )}
      {timer.status === 'paused' && (
        <button type="button" className="away-link" onClick={timer.resume}>Resume timer</button>
      )}
      {(timer.status === 'running' || timer.status === 'paused') && (
        <button type="button" className="away-link" onClick={timer.finishEarly}>Finish timer early</button>
      )}
      <p className="timer-note">
        This only counts time on the timer. It can't tell whether you were outside, so mark the mission
        done when it feels done.
      </p>
    </div>
  );
}
