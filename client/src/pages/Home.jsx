import { useState } from 'react';
import AdventureForm from '../components/AdventureForm.jsx';
import AdventureCard from '../components/AdventureCard.jsx';
import ErrorNotice from '../components/ErrorNotice.jsx';
import LoadingNotice from '../components/LoadingNotice.jsx';
import { requestAdventure } from '../services/api.js';

const INITIAL_VALUES = { activity: 'walking', duration: 30, difficulty: 'relaxed' };

export default function Home() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function generate() {
    setStatus('loading');
    setError('');
    try {
      setResult(await requestAdventure(values));
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <main className="page">
      <header>
        <h1>🌿 TrailBuddy</h1>
        <p className="tagline">Get outside. Let local AI plan the adventure.</p>
      </header>

      <AdventureForm values={values} onChange={setValues} onSubmit={generate} loading={status === 'loading'} />

      {status === 'loading' && <LoadingNotice />}
      {status === 'error' && <ErrorNotice message={error} onRetry={generate} />}
      {status === 'done' && result && <AdventureCard adventure={result.adventure} model={result.model} />}
    </main>
  );
}