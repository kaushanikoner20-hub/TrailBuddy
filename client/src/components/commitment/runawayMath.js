// Geometry for the playful "NO" button. Pure functions so the rules can be tested:
// the button stays inside the viewport, never lands on the YES button, and never lands under the pointer.

export function rectsOverlap(a, b, margin = 0) {
  return !(
    a.right + margin < b.left ||
    a.left - margin > b.right ||
    a.bottom + margin < b.top ||
    a.top - margin > b.bottom
  );
}

function rectAt(center, size) {
  return {
    left: center.x - size.width / 2,
    right: center.x + size.width / 2,
    top: center.y - size.height / 2,
    bottom: center.y + size.height / 2,
  };
}

/**
 * Picks a new center for the button, or null if nowhere suitable exists.
 * `avoid` is the YES button's rect; `pointer` and `current` are {x, y} in viewport coordinates.
 */
export function pickTarget({
  viewport,
  size,
  avoid,
  pointer,
  current,
  padding = 16,
  avoidMargin = 24,
  minPointerDistance = 200,
  minMove = 140,
  attempts = 40,
  random = Math.random,
}) {
  const minX = padding + size.width / 2;
  const maxX = viewport.width - padding - size.width / 2;
  const minY = padding + size.height / 2;
  const maxY = viewport.height - padding - size.height / 2;
  if (maxX < minX || maxY < minY) return null;

  const acceptable = (center, strict) => {
    if (avoid && rectsOverlap(rectAt(center, size), avoid, avoidMargin)) return false;
    if (Math.hypot(center.x - pointer.x, center.y - pointer.y) < (strict ? minPointerDistance : 80)) return false;
    return !strict || Math.hypot(center.x - current.x, center.y - current.y) >= minMove;
  };

  for (let i = 0; i < attempts; i += 1) {
    const center = { x: minX + random() * (maxX - minX), y: minY + random() * (maxY - minY) };
    if (acceptable(center, true)) return center;
  }

  // Fallback: scan a coarse grid and take the spot farthest from the pointer.
  let best = null;
  let bestDistance = -1;
  for (let gx = 0; gx <= 4; gx += 1) {
    for (let gy = 0; gy <= 4; gy += 1) {
      const center = { x: minX + ((maxX - minX) * gx) / 4, y: minY + ((maxY - minY) * gy) / 4 };
      if (!acceptable(center, false)) continue;
      const distance = Math.hypot(center.x - pointer.x, center.y - pointer.y);
      if (distance > bestDistance) {
        best = center;
        bestDistance = distance;
      }
    }
  }
  return best;
}