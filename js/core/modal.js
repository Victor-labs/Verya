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
 * @param {object} cfg - { emoji, title, desc, cost, onConfirm, hideConfirm?, input?, inputPlaceholder?, inputMax? }
 */
export function openModal(cfg) {
  document.getElementById('modal-emoji').textContent    = cfg.emoji  || '❓';
  document.getElementById('modal-title').textContent    = cfg.title  || '';
  document.getElementById('modal-desc').textContent     = cfg.desc   || '';
  document.getElementById('modal-cost-val').textContent = cfg.cost   || '';
  modalCfm.style.display = cfg.hideConfirm ? 'none' : '';
  pendingAction = cfg.onConfirm || null;

  // FIX: support optional text input inside modal
  let inputEl = document.getElementById('modal-input-field');
  if (cfg.input) {
    if (!inputEl) {
      inputEl = document.createElement('input');
      inputEl.id          = 'modal-input-field';
      inputEl.type        = 'text';
      inputEl.style.cssText = 'width:100%;padding:10px 14px;margin-top:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;';
      // Insert before confirm button
      modalCfm.parentNode.insertBefore(inputEl, modalCfm);
    }
    inputEl.placeholder = cfg.inputPlaceholder || '';
    inputEl.maxLength   = cfg.inputMax || 50;
    inputEl.value       = '';
    inputEl.style.display = '';
  } else if (inputEl) {
    inputEl.style.display = 'none';
  }

  modal.classList.add('open');
  if (cfg.input && inputEl) setTimeout(() => inputEl.focus(), 100);
}

window.openModal = openModal;

modalCnl.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
modalCfm.addEventListener('click', () => {
  // FIX: pass input value to onConfirm if input field exists and is visible
  const inputEl = document.getElementById('modal-input-field');
  const inputVal = (inputEl && inputEl.style.display !== 'none') ? inputEl.value : undefined;
  modal.classList.remove('open');
  if (pendingAction) pendingAction(inputVal);
});
