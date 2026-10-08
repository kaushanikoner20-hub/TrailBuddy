export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export async function requestAdventure({ activity, duration, difficulty }) {
  let response;
  try {
    response = await fetch('/api/adventure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, duration, difficulty }),
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

  if (!response.ok) {
    const detail = data?.details?.length ? ` ${data.details.join('. ')}.` : '';
    throw new ApiError(`${data?.error ?? 'Something went wrong.'}${detail}`, data?.code ?? 'UNKNOWN');
  }
  if (typeof data?.adventure !== 'string') {
    throw new ApiError('The server sent an unreadable response. Try again.', 'MALFORMED_RESPONSE');
  }
  return data;
}