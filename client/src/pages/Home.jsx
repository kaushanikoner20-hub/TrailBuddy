import { useState } from 'react';
import OptionStep from '../components/OptionStep.jsx';
import ReadyStep from '../components/ReadyStep.jsx';
import AdventureGuide from '../components/AdventureGuide.jsx';
import ErrorNotice from '../components/ErrorNotice.jsx';
import LoadingNotice from '../components/LoadingNotice.jsx';
import { ACTIVITIES, DIFFICULTIES, DURATIONS, MOODS } from '../options.js';
import { requestAdventure } from '../services/api.js';

const QUESTIONS = [
  { key: 'mood', question: 'How do you want to feel after the next few minutes?', options: MOODS },
  { key: 'duration', question: 'How much time do you have?', options: DURATIONS },
  {
    key: 'activity',
    question: 'What would you like to do?',
    hint: 'Not sure? Pick "Surprise me".',
    options: ACTIVITIES,
  },
  { key: 'difficulty', question: 'How adventurous?', options: DIFFICULTIES },
];

const EMPTY = { mood: null, duration: null, activity: null, difficulty: null };

export default function Home() {
  const [values, setValues] = useState(EMPTY);
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState('choosing');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const ready = stepIndex >= QUESTIONS.length;

  function choose(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setStepIndex((i) => i + 1);
  }

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

  function restart() {
    setValues(EMPTY);
    setStepIndex(0);
    setResult(null);
    setStatus('choosing');
  }

  function backToChoices() {
    setStepIndex(QUESTIONS.length);
    setStatus('choosing');
  }

  return (
    <main className="page">
      <p className="wordmark">🌿 TrailBuddy</p>

      {status === 'choosing' && !ready && (
        <OptionStep
          step={stepIndex + 1}
          total={QUESTIONS.length}
          question={QUESTIONS[stepIndex].question}
          hint={QUESTIONS[stepIndex].hint}
          options={QUESTIONS[stepIndex].options}
          selected={values[QUESTIONS[stepIndex].key]}
          onSelect={(value) => choose(QUESTIONS[stepIndex].key, value)}
          onBack={stepIndex > 0 ? () => setStepIndex((i) => i - 1) : null}
        />
      )}

      {status === 'choosing' && ready && (
        <ReadyStep values={values} onGo={generate} onBack={() => setStepIndex(QUESTIONS.length - 1)} />
      )}

      {status === 'loading' && <LoadingNotice />}
      {status === 'error' && <ErrorNotice message={error} onRetry={generate} onChange={backToChoices} />}
      {status === 'done' && result && (
        <AdventureGuide adventure={result.adventure} model={result.model} onRestart={restart} />
      )}
    </main>
  );
}