import { useEffect } from 'react';
import ThemeSwitch from './ThemeSwitch.jsx';
import LightSwitch from './LightSwitch.jsx';

export default function Drawer({ open, onClose }) {
  // Fermer avec Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Bloquer le scroll du body quand le drawer est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed top-0 right-0 h-full w-72 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'var(--header-bg)',
          borderLeft: '1px solid var(--header-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* En-tête du drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--header-border)' }}>
          <span className="font-semibold text-base" style={{ color: 'var(--ui-text)' }}>
            Menu
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
            style={{ color: 'var(--ui-text)' }}
            aria-label="Fermer le menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">

          {/* Section Apparence */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mb-3"
              style={{ color: 'var(--ui-text)' }}>
              Apparence
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--ui-text)' }}>Thème</span>
                <ThemeSwitch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--ui-text)' }}>Mode</span>
                <LightSwitch />
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr style={{ borderColor: 'var(--header-border)' }} />

          {/* Section Compte — placeholder */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mb-3"
              style={{ color: 'var(--ui-text)' }}>
              Compte
            </p>
            <button
              className="w-full text-left text-sm px-3 py-2.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
              style={{ color: 'var(--ui-text)' }}
            >
              Connexion
            </button>
          </section>

        </div>
      </aside>
    </>
  );
}
