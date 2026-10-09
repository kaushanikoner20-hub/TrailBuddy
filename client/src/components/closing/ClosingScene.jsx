import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion.js';
import { hasWebGL } from './webgl.js';
import './closing.css';

// The 3D code (and the three.js library) is only downloaded when this screen is opened.
const OutdoorScene = lazy(() => import('./OutdoorScene.jsx'));

const SCENE_TIMEOUT_MS = 10000;

class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Calm CSS-only backdrop used when 3D rendering is unavailable. It is NOT a 3D scene. */
function FallbackBackdrop() {
  return (
    <div className="fallback-backdrop" aria-hidden="true">
      <div className="hill hill-back" />
      <div className="hill hill-mid" />
      <div className="hill hill-front" />
    </div>
  );
}

export default function ClosingScene({ onContinue }) {
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState(() => (hasWebGL() ? 'loading' : 'fallback')); // loading | 3d | fallback
  const [phase, setPhase] = useState('arrival');
  const [playKey, setPlayKey] = useState(0);
  const [skipKey, setSkipKey] = useState(0);
  const continueRef = useRef(null);

  const fallBack = useCallback(() => setMode('fallback'), []);
  const handleReady = useCallback(() => setMode('3d'), []);

  // If the 3D scene never reports ready (slow download, failure), use the plain fallback.
  useEffect(() => {
    if (mode !== 'loading') return undefined;
    const id = setTimeout(fallBack, SCENE_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [mode, fallBack]);

  // Fallback timing: the same text sequence, without the bird.
  useEffect(() => {
    if (mode !== 'fallback') return undefined;
    if (reducedMotion) {
      setPhase('settled');
      return undefined;
    }
    setPhase('arrival');
    // Functional updates so a Skip pressed early is never undone by a timer that fires later.
    const first = setTimeout(() => setPhase((current) => (current === 'arrival' ? 'message' : current)), 500);
    const second = setTimeout(() => setPhase('settled'), 3000);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [mode, playKey, reducedMotion]);

  const settled = phase === 'settled';
  const revealed = phase === 'message' || settled;

  useEffect(() => {
    if (settled) continueRef.current?.focus({ preventScroll: true });
  }, [settled]);

  const skip = () => {
    if (mode === 'fallback') setPhase('settled');
    else setSkipKey((k) => k + 1);
  };

  const replay = () => {
    setPhase('arrival');
    setPlayKey((k) => k + 1);
  };

  return (
    <main className="outro" data-phase={phase} data-mode={mode}>
      {mode === 'fallback' && <FallbackBackdrop />}
      {mode !== 'fallback' && (
        <div className="scene-layer" aria-hidden="true">
          <SceneBoundary onError={fallBack}>
            <Suspense fallback={null}>
              <OutdoorScene
                playKey={playKey}
                skipKey={skipKey}
                reducedMotion={reducedMotion}
                onPhase={setPhase}
                onReady={handleReady}
                onError={fallBack}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}

      <p className="visually-hidden">
        {mode === '3d'
          ? 'An animated forest scene: a bird takes off from a branch and flies away.'
          : 'A calm outdoor backdrop.'}
      </p>

      <div className="closing-shade" aria-hidden="true" />

      <div className="closing-text" data-revealed={revealed}>
        <h1 className="reveal r1">LET&apos;S MEET OUTSIDE NOW</h1>
        <p className="reveal r2 closing-sub">Your adventure is waiting.</p>
        <p className="reveal r3 closing-small">You&apos;re going out now.</p>
      </div>

      <div className="closing-bottom" data-revealed={revealed}>
        <p className="reveal r4 closing-away">
          <span aria-hidden="true">🌿</span> PUT YOUR PHONE AWAY
        </p>
        {settled && (
          <button ref={continueRef} type="button" className="closing-continue" onClick={onContinue}>
            Continue
          </button>
        )}
      </div>

      <div className="closing-tools">
        {!settled && (
          <button type="button" className="closing-tool" onClick={skip}>Skip animation</button>
        )}
        {settled && !reducedMotion && (
          <button type="button" className="closing-tool" onClick={replay}>Replay</button>
        )}
      </div>
    </main>
  );
}