import { DIFFICULTIES, MISSION_ICONS, MOODS, labelFor } from '../options.js';
import OfflinePreparation from './OfflinePreparation.jsx';

export default function AdventureGuide({ adventure, model, prepared, onPrepared, onStart, onRestart }) {
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

      <OfflinePreparation prepared={prepared} onPrepared={onPrepared} />

      <button type="button" className="primary" onClick={onStart}>
        Start my adventure
      </button>
      {!prepared && <p className="offline-note">Check readiness before heading out if you want to use the app without a connection.</p>}

      <button type="button" className="link" onClick={onRestart}>Plan a different one</button>
      <p className="card-meta">Generated locally by {model}</p>
    </article>
  );
}
