import { describe, it, expect, vi } from 'vitest';
import { rafThrottle } from '../../js/utils/throttle.js';

describe('rafThrottle', () => {
  it('coalesces multiple calls into one per frame using the latest args', async () => {
    const rafCallbacks = [];
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    const fn = vi.fn();
    const throttled = rafThrottle(fn);
    throttled(1);
    throttled(2);
    throttled(3);

    expect(fn).not.toHaveBeenCalled();
    // Flush the single scheduled frame.
    rafCallbacks.forEach((cb) => cb());
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);

    rafSpy.mockRestore();
  });
});
