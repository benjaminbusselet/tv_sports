import { useState, useEffect } from 'react';

export default function LightSwitch() {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('mode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode || (systemPrefersDark ? 'dark' : 'light');
    setMode(initialMode);
    document.documentElement.setAttribute('data-mode', initialMode);
  }, []);

  const toggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    localStorage.setItem('mode', newMode);
  };

  return (
    <button
      onClick={toggle}
      title={`Passer en mode ${mode === 'light' ? 'sombre' : 'clair'}`}
      className="inline-flex items-center justify-center min-w-10 h-9 px-2.5 rounded-lg bg-white/[0.04] border border-transparent cursor-pointer transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 max-[520px]:h-8 max-[520px]:min-w-9"
    >
      {mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
