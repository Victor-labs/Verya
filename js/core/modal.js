// js/core/modal.js
// Shared confirm modal + toast
// Uses window load event to attach listeners safely

export function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'toast show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}
window.showToast = showToast;

export function openModal(cfg) {
  const modal = document.getElementById('modal'); if (!modal) return;
  document.getElementById('modal-emoji').textContent  = cfg.emoji  || '❓';
  document.getElementById('modal-title').textContent  = cfg.title  || '';
  document.getElementById('modal-desc').textContent   = cfg.desc   || '';
  document.getElementById('modal-cost').textContent   = cfg.cost   || '';
  document.getElementById('modal-cost').style.display = cfg.cost ? '' : 'none';

  const confirmBtn = document.getElementById('modal-confirm');
  confirmBtn.textContent = cfg.confirmLabel || 'Confirm';
  confirmBtn.className   = 'modal-confirm-btn' + (cfg.danger ? ' danger' : '');

  const inputWrap = document.getElementById('modal-input-wrap');
  const inputEl   = document.getElementById('modal-input');
  if (cfg.input) {
    inputWrap.style.display  = '';
    inputEl.placeholder      = cfg.inputPlaceholder || '';
    inputEl.maxLength        = cfg.inputMax || 50;
    inputEl.value            = '';
  } else {
    inputWrap.style.display = 'none';
  }

  confirmBtn.onclick = () => {
    const val = cfg.input ? inputEl.value : undefined;
    modal.classList.remove('open');
    if (cfg.onConfirm) cfg.onConfirm(val);
  };
  document.getElementById('modal-cancel').onclick = () =>
    modal.classList.remove('open');

  modal.classList.add('open');
}
window.openModal = openModal;

/* Attach backdrop click listener on load */
window.addEventListener('load', () => {
  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target.id === 'modal')
      document.getElementById('modal').classList.remove('open');
  });
});
