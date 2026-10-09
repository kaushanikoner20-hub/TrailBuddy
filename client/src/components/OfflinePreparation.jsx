import { useState } from 'react';
import { checkOfflineReadiness } from '../services/offline.js';
import { loadSession } from '../state/storage.js';

export default function OfflinePreparation({ prepared, onPrepared }) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  async function check() {
    setChecking(true);
    const checked = await checkOfflineReadiness({ hasAdventure: Boolean(loadSession()) });
    setResult(checked);
    setChecking(false);
    if (checked.ready) onPrepared();
  }
  return <section className="offline-prep" aria-labelledby="offline-heading">
    <h3 id="offline-heading">YOUR ADVENTURE IS READY</h3>
    <p>Let&apos;s make sure you won&apos;t need the internet outside.</p>
    {prepared && !result && <p className="offline-ready">This adventure was prepared on this device.</p>}
    {result && <>
      <h4 className={result.ready ? 'offline-ready' : 'offline-missing'}>{result.ready ? 'READY FOR OFFLINE USE' : 'NOT READY YET'}</h4>
      <ul>{result.results.map((item) => <li key={item.label}><span aria-hidden="true">{item.ready ? '✓' : '○'}</span> {item.label}{!item.ready && item.detail && <small>{item.detail}</small>}</li>)}</ul>
    </>}
    <button type="button" className="offline-check" disabled={checking} onClick={check}>{checking ? 'CHECKING READINESS…' : prepared ? 'CHECK AGAIN' : 'PREPARE MY ADVENTURE'}</button>
    <p className="offline-note">Adventure generation still needs your configured local backend and Ollama/Gemma. This check prepares the app for the time outside.</p>
  </section>;
}
