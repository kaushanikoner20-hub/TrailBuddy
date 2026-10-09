import { useEffect, useState } from 'react';
import { createTimer, formatClock, pauseTimer, remainingAt, startTimer } from './timerModel.js';

/**
 * Optional timer for one mission. It only starts when the user starts it, runs from timestamps,
 * and never completes the mission by itself.
 */
export function useMissionTimer(durationMinutes, externalPaused) {
  const durationMs = Math.max(1, durationMinutes) * 60 * 1000;
  const [timer, setTimer] = useState(() => createTimer(durationMs));
  const [userState, setUserState] = useState('idle'); // idle | running | paused | finished
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

  useEffect(() => {
    if (userState === 'running' && remainingMs <= 0) setUserState('finished');
  }, [userState, remainingMs]);

  return {
    status: userState,
    remainingMs,
    start: () => setUserState('running'),
    pause: () => setUserState('paused'),
    resume: () => setUserState('running'),
  };
}

export default function MissionTimer({ minutes, paused }) {
  const timer = useMissionTimer(minutes, paused);

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
      <p className="timer-note">
        This only counts time on the timer. It can't tell whether you were outside, so mark the mission
        done when it feels done.
      </p>
    </div>
  );
}