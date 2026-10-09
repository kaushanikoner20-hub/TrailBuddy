import { useEffect, useRef, useState } from 'react';
import { saveReflection } from '../../state/storage.js';
import './phoneAway.css';

export default function AdventureComplete({ adventure, completedCount, onHome }) {
  const headingRef = useRef(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saved | failed

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  function handleSave() {
    setStatus(saveReflection({ title: adventure.title, text }) ? 'saved' : 'failed');
  }

  const total = adventure.missions.length;

  return (
    <main className="away">
      <div className="away-center">
        <h1 ref={headingRef} tabIndex={-1}>WELCOME BACK 🌿</h1>
        <p className="away-lead">You made space to notice the world around you.</p>
        <p className="away-meta">
          {completedCount} of {total} {total === 1 ? 'mission' : 'missions'} marked complete
        </p>

        <div className="reflection">
          <label htmlFor="reflection-text">WHAT DID YOU NOTICE? <span>(optional)</span></label>
          <textarea
            id="reflection-text"
            rows={4}
            maxLength={2000}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setStatus('idle');
            }}
          />
          <button type="button" className="away-link" onClick={handleSave} disabled={!text.trim()}>
            Save in this browser
          </button>
          <p className="reflection-status" role="status">
            {status === 'saved' && 'Saved on this device only. It was not sent anywhere.'}
            {status === 'failed' && "Couldn't save here (browser storage may be blocked)."}
          </p>
        </div>

        <p className="away-final">THE WORLD WAS HERE ALL ALONG.</p>
        <button type="button" className="away-primary" onClick={onHome}>BACK TO HOME</button>
      </div>
    </main>
  );
}