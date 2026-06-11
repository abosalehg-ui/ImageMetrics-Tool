/** @typedef {'info' | 'success' | 'error' | 'warning'} ToastType */

let container = /** @type {HTMLElement | null} */ (null);

/**
 * Lazily create (or reuse) the live region that hosts toasts. The region is
 * announced politely so screen readers pick up new messages.
 * @returns {HTMLElement}
 */
function getContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a transient, accessible toast notification.
 * @param {string} message
 * @param {ToastType} [type]
 * @param {number} [duration] milliseconds before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 3500) {
  const host = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  host.appendChild(toast);

  // Force reflow so the entrance transition plays.
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  const remove = () => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Safety net in case transitionend never fires.
    setTimeout(() => toast.remove(), 400);
  };

  setTimeout(remove, duration);
}
