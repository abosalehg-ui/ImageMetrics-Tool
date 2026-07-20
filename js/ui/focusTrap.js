/**
 * Keep Tab/Shift+Tab focus cycling within `container` instead of leaking to
 * the page behind a modal overlay. Call from a keydown listener scoped to
 * the container (or one of its descendants).
 * @param {KeyboardEvent} e
 * @param {HTMLElement} container
 */
export function trapTabKey(e, container) {
  if (e.key !== 'Tab') return;

  const focusable = /** @type {HTMLElement[]} */ (
    Array.from(container.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])'))
  );
  if (focusable.length === 0) return;

  const lastIndex = focusable.length - 1;
  const currentIndex = focusable.indexOf(/** @type {HTMLElement} */ (document.activeElement));
  e.preventDefault();

  const nextIndex = e.shiftKey
    ? currentIndex <= 0
      ? lastIndex
      : currentIndex - 1
    : currentIndex === lastIndex
      ? 0
      : currentIndex + 1;
  focusable[nextIndex].focus();
}
