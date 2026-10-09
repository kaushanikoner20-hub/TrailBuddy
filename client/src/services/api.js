import { isAdventure } from '../state/storage.js';

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export async function requestAdventure({ mood, duration, activity, difficulty }) {
  let response;
  try {
    response = await fetch('/api/adventure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, duration, activity, difficulty }),
    });
  } catch {
    throw new ApiError("TrailBuddy can't reach its server. Make sure the backend is running.", 'SERVER_UNREACHABLE');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON body; handled below.
  }

  if (!response.ok || !data?.success) {
    const detail = data?.details?.length ? ` ${data.details.join('. ')}.` : '';
    throw new ApiError(`${data?.error ?? 'Something went wrong.'}${detail}`, data?.code ?? 'UNKNOWN');
  }
  if (!isAdventure(data.adventure)) {
    throw new ApiError('The server sent an unreadable adventure. Try again.', 'MALFORMED_RESPONSE');
  }
  return { adventure: data.adventure, model: data.model };
}
