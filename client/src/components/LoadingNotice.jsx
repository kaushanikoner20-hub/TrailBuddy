export default function LoadingNotice() {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>
        Gemma is designing your adventure on this computer.
        <br />
        The first run can take a minute while the model loads.
      </p>
    </div>
  );
}