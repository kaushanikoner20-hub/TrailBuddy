export default function LoadingNotice() {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>Your local model is writing the adventure. The first run can take a minute while the model loads.</p>
    </div>
  );
}