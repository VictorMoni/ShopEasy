(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const read = () => { try { return localStorage.getItem('shopeasy-theme'); } catch { return null; } };
  const apply = () => {
    const saved = read();
    const theme = saved === 'light' || saved === 'dark' ? saved : media.matches ? 'dark' : 'light';
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.dispatchEvent(new Event('themechange'));
  };
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('storage', event => { if (event.key === 'shopeasy-theme' || event.key === null) apply(); });
})();