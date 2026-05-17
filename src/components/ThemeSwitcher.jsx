import { useState, useEffect } from 'react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Passer au thème ${theme === 'light' ? 'sombre' : 'clair'}`}
      className="inline-flex items-center justify-center min-w-10 h-9 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-transparent cursor-pointer transition-all duration-[120ms] ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-white/20 max-[520px]:h-8 max-[520px]:min-w-9"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
