import { useEffect, useRef, useState } from 'react';
import { pickTarget } from './runawayMath.js';

const MAX_DODGES = 4; // after this the button stays put and behaves normally
const NEAR_PX = 70; // how close the mouse gets before the button hops away
const MIN_GAP_MS = 450; // at most one hop per this many milliseconds

/**
 * A joke button that hops away from a *mouse* pointer a few times, then settles.
 * It never reacts to touch or keyboard, never disables itself, and is always clickable.
 */
export default function RunawayButton({ onClick, avoidRef, onDodge, reducedMotion, children }) {
  const slotRef = useRef(null);
  const buttonRef = useRef(null);
  const dodgesRef = useRef(0);
  const lastDodgeRef = useRef(0);
  const onDodgeRef = useRef(onDodge);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    onDodgeRef.current = onDodge;
  }, [onDodge]);

  useEffect(() => {
    if (reducedMotion) return undefined;

    function handlePointerMove(event) {
      if (event.pointerType !== 'mouse' || dodgesRef.current >= MAX_DODGES) return;
      const button = buttonRef.current?.getBoundingClientRect();
      const slot = slotRef.current?.getBoundingClientRect();
      if (!button || !slot) return;

      const dx = Math.max(button.left - event.clientX, 0, event.clientX - button.right);
      const dy = Math.max(button.top - event.clientY, 0, event.clientY - button.bottom);
      if (Math.hypot(dx, dy) > NEAR_PX) return;

      const now = performance.now();
      if (now - lastDodgeRef.current < MIN_GAP_MS) return;

      const target = pickTarget({
        viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
        size: { width: button.width, height: button.height },
        avoid: avoidRef.current?.getBoundingClientRect(),
        pointer: { x: event.clientX, y: event.clientY },
        current: { x: button.left + button.width / 2, y: button.top + button.height / 2 },
      });
      if (!target) return;

      lastDodgeRef.current = now;
      dodgesRef.current += 1;
      const settled = dodgesRef.current >= MAX_DODGES;
      setOffset(
        settled
          ? { x: 0, y: 0 }
          : { x: target.x - (slot.left + slot.width / 2), y: target.y - (slot.top + slot.height / 2) },
      );
      onDodgeRef.current?.(dodgesRef.current, settled);
    }

    const handleResize = () => setOffset({ x: 0, y: 0 });

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion, avoidRef]);

  return (
    <span className="runaway-slot" ref={slotRef}>
      <button
        ref={buttonRef}
        type="button"
        className="commit-button commit-no"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onClick={onClick}
      >
        {children}
      </button>
    </span>
  );
}