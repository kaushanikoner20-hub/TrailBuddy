import { useEffect, useRef } from 'react';
import MissionTimer from './MissionTimer.jsx';
import { MISSION_ICONS } from '../../options.js';

export default function MissionCard({ mission, index, total, paused, onDone, onSkip }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="mission-card" aria-labelledby="mission-title">
      <p className="away-count">Mission {index + 1} of {total}</p>
      <p className="mission-icon" aria-hidden="true">{MISSION_ICONS[mission.type] ?? '🌿'}</p>
      <h2 id="mission-title" ref={headingRef} tabIndex={-1}>{mission.title}</h2>
      <p className="mission-minutes">{mission.duration} {mission.duration === 1 ? 'minute' : 'minutes'}</p>
      <p className="mission-instruction">{mission.instruction}</p>

      <button type="button" className="away-primary" onClick={onDone}>DONE</button>
      <MissionTimer minutes={mission.duration} paused={paused} />
      <button type="button" className="away-link" onClick={onSkip}>Skip this one</button>

      <p className="away-safety">Only do this somewhere safe. Skip anything that doesn&apos;t feel right.</p>
    </section>
  );
}