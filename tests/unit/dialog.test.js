import { describe, it, expect, afterEach } from 'vitest';
import { confirmDialog } from '../../js/ui/dialog.js';

afterEach(() => {
  document.body.innerHTML = '';
});

/** @param {string} key */
function pressKey(key) {
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('confirmDialog', () => {
  it('resolves true when the confirm button is clicked', async () => {
    const result = confirmDialog('Delete?');
    /** @type {HTMLButtonElement} */ (
      document.querySelector('.dialog-actions .btn-danger')
    ).click();
    expect(await result).toBe(true);
  });

  it('resolves false when the cancel button is clicked', async () => {
    const result = confirmDialog('Delete?');
    /** @type {HTMLButtonElement} */ (
      document.querySelector('.dialog-actions .btn-secondary')
    ).click();
    expect(await result).toBe(false);
  });

  it('does not confirm on Enter while Cancel is focused', async () => {
    const result = confirmDialog('Delete?');
    const cancel = /** @type {HTMLButtonElement} */ (
      document.querySelector('.dialog-actions .btn-secondary')
    );
    cancel.focus();
    pressKey('Enter');
    // Enter is left to the focused button's native activation, which jsdom
    // does not synthesize — so the dialog must still be open here.
    expect(document.querySelector('.dialog-overlay')).not.toBeNull();
    cancel.click();
    expect(await result).toBe(false);
  });

  it('resolves false on Escape and removes the overlay', async () => {
    const result = confirmDialog('Delete?');
    pressKey('Escape');
    expect(await result).toBe(false);
    expect(document.querySelector('.dialog-overlay')).toBeNull();
  });
});
