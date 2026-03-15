// js/core/nav.js
// Bottom nav bar — switches pages, fires 'page-change' event

/** Switch to a named page, update nav active state */
export function goToPage(name) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const navItem = document.querySelector(`.nav-item[data-page="${name}"]`);
  if (navItem) navItem.classList.add('active');

  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');

  document.dispatchEvent(new CustomEvent('page-change', { detail: { page: name } }));
}

/* Wire up all nav items */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => goToPage(item.dataset.page));
});
