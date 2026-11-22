(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'hoque-theme';
  let preference;
  let toggle;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') preference = stored;
  } catch {
    // The theme still works when the browser blocks storage.
  }

  function applyTheme() {
    const theme = preference ?? (systemTheme.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  applyTheme();
  systemTheme.addEventListener('change', applyTheme);

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header-row');
    if (!header) return;

    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Dark mode');
    toggle.title = 'Toggle dark mode';
    toggle.innerHTML = `
      <svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.6 15.1A9 9 0 0 1 8.9 3.4a9 9 0 1 0 11.7 11.7Z"/>
      </svg>
      <svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>
      </svg>`;
    toggle.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      try {
        localStorage.setItem(storageKey, preference);
      } catch {
        // The current page keeps the chosen theme.
      }
    });
    applyTheme();
    header.append(toggle);
  });
})();
