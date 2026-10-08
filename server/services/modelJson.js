/**
 * Pulls a JSON object out of model text.
 * Handles clean JSON, ```json fences, and extra words around the object.
 * Returns the parsed value, or null if no valid JSON object can be found.
 */
export function extractJson(text) {
  if (typeof text !== 'string') return null;

  const trimmed = text.trim();
  const direct = tryParse(trimmed);
  if (direct) return direct;

  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const fromFence = tryParse(unfenced);
  if (fromFence) return fromFence;

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) return tryParse(trimmed.slice(start, end + 1));

  return null;
}

function tryParse(text) {
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}