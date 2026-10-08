export default function ErrorNotice({ message, onRetry, onChange }) {
  return (
    <div className="error" role="alert">
      <p>{message}</p>
      <div className="error-actions">
        <button type="button" className="secondary" onClick={onRetry}>Try again</button>
        <button type="button" className="link" onClick={onChange}>Change my choices</button>
      </div>
    </div>
  );
}