import { useEffect, useRef } from 'react';

export default function OptionStep({ step, total, question, hint, options, selected, onSelect, onBack }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [question]);

  return (
    <section className="step">
      <p className="step-count">{step} of {total}</p>
      <h2 ref={headingRef} tabIndex={-1}>{question}</h2>
      {hint && <p className="hint">{hint}</p>}

      <div className="options" role="group" aria-label={question}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="option"
            aria-pressed={selected === option.value}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {onBack && (
        <button type="button" className="link" onClick={onBack}>← Back</button>
      )}
    </section>
  );
}