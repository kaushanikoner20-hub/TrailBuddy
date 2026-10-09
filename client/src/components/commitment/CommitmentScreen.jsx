import { useCallback, useEffect, useRef, useState } from 'react';
import RunawayButton from './RunawayButton.jsx';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion.js';
import './commitment.css';

const PLAYFUL_MESSAGES = [
  'Nice try.',
  'The trees are waiting!',
  'Just 15 minutes?',
  'Your adventure misses you already.',
  'One little walk?',
];
const SETTLED_MESSAGE = "Okay, okay. It's yours to click.";

const LEAVES = Array.from({ length: 9 }, (_, i) => i);

export default function CommitmentScreen({ onGoing, onBack }) {
  const reducedMotion = usePrefersReducedMotion();
  const yesRef = useRef(null);
  const headingRef = useRef(null);
  const declinedRef = useRef(null);
  const [declined, setDeclined] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (declined) declinedRef.current?.focus({ preventScroll: true });
  }, [declined]);

  const handleDodge = useCallback((count, settled) => {
    setMessage(settled ? SETTLED_MESSAGE : PLAYFUL_MESSAGES[(count - 1) % PLAYFUL_MESSAGES.length]);
  }, []);

  return (
    <main className="commit">
      <div className="commit-leaves" aria-hidden="true">
        {LEAVES.map((i) => (
          <span key={i} className={`leaf leaf-${i}`} />
        ))}
      </div>

      <div className="commit-inner">
        <h1 ref={headingRef} tabIndex={-1}>ARE YOU GOING OUT?</h1>
        <p className="commit-sub">Your adventure is ready. The outside world is waiting.</p>

        {!declined && (
          <>
            <div className="commit-buttons">
              <button ref={yesRef} type="button" className="commit-button commit-yes" onClick={onGoing}>
                YES, I&apos;M GOING <span aria-hidden="true">🌿</span>
              </button>
              <RunawayButton
                avoidRef={yesRef}
                reducedMotion={reducedMotion}
                onDodge={handleDodge}
                onClick={() => setDeclined(true)}
              >
                NO, I&apos;M NOT <span aria-hidden="true">😌</span>
              </RunawayButton>
            </div>
            <p className="commit-message" aria-live="polite">{message}</p>
          </>
        )}

        {declined && (
          <div className="commit-declined">
            <p ref={declinedRef} tabIndex={-1} className="commit-declined-text">
              That&apos;s okay. Your adventure will be here when you&apos;re ready.
            </p>
            <div className="commit-buttons">
              <button type="button" className="commit-button commit-quiet" onClick={onBack}>
                Back to my adventure
              </button>
              <button type="button" className="commit-button commit-yes" onClick={onGoing}>
                Take me outside anyway <span aria-hidden="true">🌿</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}