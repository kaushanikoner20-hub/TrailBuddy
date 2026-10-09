import { useEffect, useRef, useState } from 'react';
import MissionCard from './MissionCard.jsx';
import './phoneAway.css';

function Intro({ adventure, resuming, onBegin, onRestartMissions, onExit }) {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="away">
      <div className="away-center">
        <h1 ref={headingRef} tabIndex={-1}>YOUR ADVENTURE STARTS NOW</h1>
        <p className="away-lead">Your missions are ready. You don&apos;t need to keep looking at your phone.</p>
        <p className="away-title">{adventure.title}</p>
        <p className="away-meta">{adventure.duration} minutes · {adventure.missions.length} missions</p>
        <p className="away-safety">
          Stop somewhere safe before you read each mission. Never use your phone while crossing a road or cycling.
        </p>
        <button type="button" className="away-primary" onClick={onBegin}>
          {resuming ? 'RESUME PHONE AWAY MODE' : 'BEGIN PHONE AWAY MODE'}
        </button>
        {resuming && (
          <button type="button" className="away-link" onClick={onRestartMissions}>Start the missions over</button>
        )}
        <button type="button" className="away-link" onClick={onExit}>Not now, back to my adventure</button>
      </div>
    </main>
  );
}

function PauseOverlay({ onResume, onExit }) {
  const resumeRef = useRef(null);
  useEffect(() => {
    resumeRef.current?.focus();
  }, []);

  return (
    <div className="away-pause" role="dialog" aria-modal="true" aria-label="Paused">
      <h2>Paused</h2>
      <p>Take all the time you need.</p>
      <button ref={resumeRef} type="button" className="away-primary" onClick={onResume}>RESUME</button>
      <button type="button" className="away-link" onClick={onExit}>Exit Phone Away Mode</button>
    </div>
  );
}

export default function PhoneAwayMode({
  view,
  adventure,
  adventureId,
  missionIndex,
  resuming,
  onBegin,
  onRestartMissions,
  onDone,
  onSkip,
  onExit,
}) {
  const [paused, setPaused] = useState(false);

  if (view === 'intro') {
    return <Intro adventure={adventure} resuming={resuming} onBegin={onBegin} onRestartMissions={onRestartMissions} onExit={onExit} />;
  }

  const total = adventure.missions.length;
  const mission = adventure.missions[missionIndex];

  return (
    <main className="away">
      <header className="away-bar">
        <button type="button" className="away-link" onClick={() => setPaused(true)} aria-label="Pause adventure">Pause</button>
        <div
          className="away-progress"
          role="progressbar"
          aria-label="Adventure progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={missionIndex}
        >
          {adventure.missions.map((m, i) => (
            <span key={m.id} className={i < missionIndex ? 'done' : i === missionIndex ? 'current' : ''} />
          ))}
        </div>
        <button type="button" className="away-link" onClick={onExit} aria-label="Exit Phone Away Mode">Exit</button>
      </header>

      <div className="away-center">
        <MissionCard
          key={mission.id}
          mission={mission}
          adventureId={adventureId}
          index={missionIndex}
          total={total}
          paused={paused}
          onDone={onDone}
          onSkip={onSkip}
        />
      </div>

      {paused && <PauseOverlay onResume={() => setPaused(false)} onExit={onExit} />}
    </main>
  );
}
