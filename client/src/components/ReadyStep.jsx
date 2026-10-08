import { ACTIVITIES, DIFFICULTIES, MOODS, labelFor } from '../options.js';

export default function ReadyStep({ values, onGo, onBack }) {
  return (
    <section className="step">
      <h2>Ready when you are.</h2>
      <ul className="summary">
        <li>{labelFor(MOODS, values.mood)}</li>
        <li>{values.duration} minutes</li>
        <li>{labelFor(ACTIVITIES, values.activity)}</li>
        <li>{labelFor(DIFFICULTIES, values.difficulty)}</li>
      </ul>
      <button type="button" className="primary" onClick={onGo}>Get me outside</button>
      <button type="button" className="link" onClick={onBack}>← Change something</button>
    </section>
  );
}