import { Suspense, lazy, useEffect, useReducer } from 'react';
import Home from './pages/Home.jsx';
import AdventureGuide from './components/AdventureGuide.jsx';
import CommitmentScreen from './components/commitment/CommitmentScreen.jsx';
import PhoneAwayMode from './components/phone-away/PhoneAwayMode.jsx';
import AdventureComplete from './components/phone-away/AdventureComplete.jsx';
import { SCREENS, hasProgress, initialJourney, journeyReducer } from './state/journey.js';
import { loadSession, saveSession } from './state/storage.js';

// The closing scene (and three.js with it) is only downloaded when the user gets there.
const ClosingScene = lazy(() => import('./components/closing/ClosingScene.jsx'));

const initJourney = () => loadSession() ?? initialJourney;

function Shell({ children }) {
  return (
    <main className="page">
      <p className="wordmark">🌿 TrailBuddy</p>
      {children}
    </main>
  );
}

export default function App() {
  const [journey, dispatch] = useReducer(journeyReducer, undefined, initJourney);
  const { screen, adventure, model, missionIndex, completedIds } = journey;

  useEffect(() => {
    saveSession(journey);
  }, [journey]);

  switch (screen) {
    case SCREENS.ADVENTURE:
      return (
        <Shell>
          <AdventureGuide
            adventure={adventure}
            model={model}
            onStart={() => dispatch({ type: 'open-commitment' })}
            onRestart={() => dispatch({ type: 'restart' })}
          />
        </Shell>
      );

    case SCREENS.COMMITMENT:
      return (
        <CommitmentScreen
          onGoing={() => dispatch({ type: 'confirm-going' })}
          onBack={() => dispatch({ type: 'back-to-adventure' })}
        />
      );

    case SCREENS.CLOSING:
      return (
        <Suspense fallback={<div className="closing-loading" aria-hidden="true" />}>
          <ClosingScene onContinue={() => dispatch({ type: 'closing-done' })} />
        </Suspense>
      );

    case SCREENS.INTRO:
    case SCREENS.MISSION:
      return (
        <PhoneAwayMode
          view={screen === SCREENS.INTRO ? 'intro' : 'mission'}
          adventure={adventure}
          missionIndex={missionIndex}
          resuming={hasProgress(journey)}
          onBegin={() => dispatch({ type: 'begin' })}
          onRestartMissions={() => dispatch({ type: 'restart-missions' })}
          onDone={() => dispatch({ type: 'complete-mission' })}
          onSkip={() => dispatch({ type: 'skip-mission' })}
          onExit={() => dispatch({ type: 'exit-phone-away' })}
        />
      );

    case SCREENS.COMPLETE:
      return (
        <AdventureComplete
          adventure={adventure}
          completedCount={completedIds.length}
          onHome={() => dispatch({ type: 'finish' })}
        />
      );

    default:
      return (
        <Shell>
          <Home onGenerated={({ adventure: generated, model: usedModel }) =>
            dispatch({ type: 'generated', adventure: generated, model: usedModel })}
          />
        </Shell>
      );
  }
}