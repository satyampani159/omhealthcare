const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.12 });

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

  // Mark active nav link
  const current = location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('a.nav-link').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    const clean = href.replace(/\/+$/, '') || '/';
    if (clean === current) a.classList.add('active');
  });

  // tiny loading overlay helper if present
  const loading = document.getElementById('loadingOverlay');
  if (loading) {
    setTimeout(() => loading.classList.remove('active'), 200);
  }
});
