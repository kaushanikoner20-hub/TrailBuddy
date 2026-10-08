export default function AdventureCard({ adventure, model }) {
  return (
    <article className="card" aria-live="polite">
      <div className="card-text">{adventure}</div>
      <p className="card-meta">Generated locally by {model}</p>
    </article>
  );
}