/**
 * Throttle a function to at most one call per animation frame. The most recent
 * arguments win; intermediate calls within the same frame are coalesced. This
 * keeps expensive work (e.g. canvas getImageData) off the mousemove hot path.
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @returns {(...args: Parameters<F>) => void}
 */
export function rafThrottle(fn) {
  let scheduled = false;
  /** @type {Parameters<F> | null} */
  let lastArgs = null;

  return (...args) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (lastArgs) fn(...lastArgs);
    });
  };
}

/**
 * Throttle a function to at most one call every `wait` milliseconds (leading
 * edge). Pure and timer-injectable for testing.
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @param {number} wait milliseconds between allowed calls
 * @param {() => number} [now] clock source, defaults to Date.now
 * @returns {(...args: Parameters<F>) => void}
 */
export function throttle(fn, wait, now = Date.now) {
  let last = -Infinity;
  return (...args) => {
    const t = now();
    if (t - last >= wait) {
      last = t;
      fn(...args);
    }
  };
}
