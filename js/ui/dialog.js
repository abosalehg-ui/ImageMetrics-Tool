import { trapTabKey } from './focusTrap.js';

/**
 * Show a modal confirmation dialog and resolve with the user's choice. Replaces
 * the native blocking `confirm()` with an accessible, styleable overlay that
 * traps focus and supports keyboard (Enter confirms, Escape cancels).
 * @param {string} message
 * @param {{ confirmText?: string, cancelText?: string }} [options]
 * @returns {Promise<boolean>}
 */
export function confirmDialog(message, options = {}) {
  const { confirmText = 'OK', cancelText = 'Cancel' } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const box = document.createElement('div');
    box.className = 'dialog-box';

    const text = document.createElement('p');
    text.className = 'dialog-message';
    text.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'dialog-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-secondary';
    cancelBtn.textContent = cancelText;

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'btn-danger';
    confirmBtn.textContent = confirmText;

    actions.append(cancelBtn, confirmBtn);
    box.append(text, actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const previouslyFocused = /** @type {HTMLElement | null} */ (document.activeElement);
    confirmBtn.focus();

    /** @param {boolean} result */
    const close = (result) => {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
      resolve(result);
    };

    /** @param {KeyboardEvent} e */
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close(false);
      } else if (e.key === 'Enter') {
        close(true);
      } else {
        trapTabKey(e, box);
      }
    };

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener('keydown', onKey);
  });
}
