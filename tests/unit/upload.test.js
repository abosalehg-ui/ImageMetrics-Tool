import { describe, it, expect } from 'vitest';
import { validateImageDimensions, validateImageFile, MAX_IMAGE_PIXELS } from '../../js/upload.js';

describe('validateImageDimensions', () => {
  it('accepts a normal image', () => {
    expect(validateImageDimensions(4032, 3024)).toEqual({ ok: true });
  });

  it('rejects a zero-size image', () => {
    expect(validateImageDimensions(0, 100).ok).toBe(false);
    expect(validateImageDimensions(100, 0).ok).toBe(false);
  });

  it('accepts exactly the pixel limit', () => {
    expect(validateImageDimensions(10_000, MAX_IMAGE_PIXELS / 10_000).ok).toBe(true);
  });

  it('rejects a decompression bomb past the pixel limit', () => {
    const result = validateImageDimensions(30_000, 30_000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('errorTooManyPixels');
  });
});

describe('validateImageFile', () => {
  it('rejects non-image MIME types', () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    expect(validateImageFile(file).ok).toBe(false);
  });

  it('accepts an image MIME type', () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    expect(validateImageFile(file).ok).toBe(true);
  });
});
