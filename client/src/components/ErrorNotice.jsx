export default function ErrorNotice({ message, onRetry }) {
  return (
    <div className="error" role="alert">
      <p>{message}</p>
      <button type="button" className="secondary" onClick={onRetry}>Try again</button>
    </div>
  );
}