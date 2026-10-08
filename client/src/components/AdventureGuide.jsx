import { useState } from 'react';
import { DIFFICULTIES, MISSION_ICONS, MOODS, labelFor } from '../options.js';

export default function AdventureGuide({ adventure, model, onRestart }) {
  const [startClicked, setStartClicked] = useState(false);

  return (
    <article className="guide">
      <header className="guide-header">
        <h2>{adventure.title}</h2>
        <p className="guide-meta">
          {adventure.duration} minutes · {labelFor(MOODS, adventure.mood)} · {labelFor(DIFFICULTIES, adventure.difficulty)}
        </p>
        <p className="tagline">{adventure.tagline}</p>
        <p className="intro">{adventure.intro}</p>
      </header>

      <ol className="missions">
        {adventure.missions.map((mission) => (
          <li key={mission.id} className="mission">
            <p className="mission-label">
              Mission {String(mission.id).padStart(2, '0')} · {mission.duration} min
            </p>
            <h3>
              <span aria-hidden="true">{MISSION_ICONS[mission.type] ?? '🌿'}</span> {mission.title}
            </h3>
            <p>{mission.instruction}</p>
          </li>
        ))}
      </ol>

      <p className="closing">{adventure.closing}</p>
      {adventure.phone_free && <p className="phone-free">🔒 Designed for phone-free time</p>}

      <button type="button" className="primary" onClick={() => setStartClicked(true)}>
        Start my adventure
      </button>

      {startClicked && (
        <p className="stage-note" role="status">
          Phone Away Mode isn't built yet (planned for Stage 3). For now: read the missions once,
          then close this tab and head outside.
        </p>
      )}

      <button type="button" className="link" onClick={onRestart}>Plan a different one</button>
      <p className="card-meta">Generated locally by {model}</p>
    </article>
  );
}