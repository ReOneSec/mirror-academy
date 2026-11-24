'use client';

/** The light/dark switch shared by the site nav and the admin bar. The choice is kept in `ma-theme`. */
export default function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const dark =
      root.dataset.theme === 'dark' ||
      (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('ma-theme', next);
    } catch {
      /* storage blocked: the choice lasts for this visit */
    }
  }

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggleTheme}
      aria-label="Switch between light and dark"
    />
  );
}
