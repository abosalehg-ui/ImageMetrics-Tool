import { describe, it, expect, vi } from 'vitest';
import { throttle, rafThrottle } from '../../js/utils/throttle.js';

describe('throttle', () => {
  it('calls on the leading edge', () => {
    const fn = vi.fn();
    const now = 1000;
    const throttled = throttle(fn, 100, () => now);
    throttled('a');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('suppresses calls within the wait window', () => {
    const fn = vi.fn();
    let now = 0;
    const throttled = throttle(fn, 100, () => now);
    throttled();
    now = 50;
    throttled();
    now = 99;
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows the next call after the window elapses', () => {
    const fn = vi.fn();
    let now = 0;
    const throttled = throttle(fn, 100, () => now);
    throttled();
    now = 100;
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

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
