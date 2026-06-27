import { useState, useEffect, useRef } from 'react';

/**
 * Animates a numeric counter from 0 to `target` over `duration` ms.
 *
 * Uses `requestAnimationFrame` for smooth 60 fps updates and cleans
 * up properly if the component unmounts mid-animation.
 *
 * @param {number} target   - The final value to count up to.
 * @param {number} [duration=1000] - Animation duration in milliseconds.
 * @returns {number} The current (animated) value.
 *
 * @example
 * const count = useAnimatedCounter(250, 1500);
 * // count smoothly goes from 0 → 250 over 1.5 s
 */
export const useAnimatedCounter = (target, duration = 1000) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    // Nothing to animate
    if (target === 0 || target === null || target === undefined) {
      setValue(0);
      return undefined;
    }

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quad for a natural deceleration feel
      const eased = 1 - (1 - progress) * (1 - progress);

      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return value;
};
