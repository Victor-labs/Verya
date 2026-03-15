// js/core/modal.js
// Shared confirm modal + toast notification
// Export: openModal(), showToast()

/* ── TOAST ── */
const toastEl = document.getElementById('toast');
let toastTimer = null;

export function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

/* Make available globally so inline onclick handlers can call it */
window.showToast = showToast;

/* ── CONFIRM MODAL ── */
const modal      = document.getElementById('modal');
const modalCfm   = document.getElementById('modal-confirm');
const modalCnl   = document.getElementById('modal-cancel');
let   pendingAction = null;

/**
 * Open the shared confirm modal.
 * @param {object} cfg - { emoji, title, desc, cost, onConfirm, hideConfirm? }
 */
export function openModal(cfg) {
  document.getElementById('modal-emoji').textContent    = cfg.emoji  || '❓';
  document.getElementById('modal-title').textContent    = cfg.title  || '';
  document.getElementById('modal-desc').textContent     = cfg.desc   || '';
  document.getElementById('modal-cost-val').textContent = cfg.cost   || '';
  modalCfm.style.display = cfg.hideConfirm ? 'none' : '';
  pendingAction = cfg.onConfirm || null;
  modal.classList.add('open');
}

window.openModal = openModal;

modalCnl.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
modalCfm.addEventListener('click', () => {
  modal.classList.remove('open');
  if (pendingAction) pendingAction();
});
