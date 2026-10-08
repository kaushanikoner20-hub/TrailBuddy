const ACTIVITIES = [
  { value: 'walking', label: 'Walking' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'photography', label: 'Photography walk' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const DIFFICULTIES = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
];

function Select({ id, label, value, onChange, disabled, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {children}
      </select>
    </div>
  );
}

export default function AdventureForm({ values, onChange, onSubmit, loading }) {
  const set = (key) => (value) => onChange({ ...values, [key]: value });

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Select id="activity" label="Activity" value={values.activity} onChange={set('activity')} disabled={loading}>
        {ACTIVITIES.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </Select>

      <Select
        id="duration"
        label="Duration"
        value={values.duration}
        onChange={(v) => onChange({ ...values, duration: Number(v) })}
        disabled={loading}
      >
        {DURATIONS.map((d) => (
          <option key={d} value={d}>{d} minutes</option>
        ))}
      </Select>

      <Select id="difficulty" label="Difficulty" value={values.difficulty} onChange={set('difficulty')} disabled={loading}>
        {DIFFICULTIES.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </Select>

      <button type="submit" className="primary" disabled={loading}>
        {loading ? 'Gemma is planning…' : 'Generate adventure'}
      </button>
    </form>
  );
}