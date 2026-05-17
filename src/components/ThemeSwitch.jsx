import { useState, useEffect } from 'react';

export default function ThemeSwitch() {
  const [brand, setBrand] = useState('glass');

  useEffect(() => {
    const savedBrand = localStorage.getItem('brand') || 'glass';
    setBrand(savedBrand);
    document.documentElement.setAttribute('data-brand', savedBrand);
  }, []);

  const switchBrand = (newBrand) => {
    setBrand(newBrand);
    document.documentElement.setAttribute('data-brand', newBrand);
    localStorage.setItem('brand', newBrand);
  };

  return (
    <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 gap-0.5">
      <button
        onClick={() => switchBrand('glass')}
        title="Thème Glass"
        className={`px-2.5 py-1 text-sm rounded-md transition-all duration-[120ms] cursor-pointer focus:outline-none
          ${brand === 'glass'
            ? 'bg-white/20 font-medium'
            : 'opacity-50 hover:opacity-80 hover:bg-white/10'
          }`}
      >
        Glass
      </button>
      <button
        onClick={() => switchBrand('sport')}
        title="Thème Sport"
        className={`px-2.5 py-1 text-sm rounded-md transition-all duration-[120ms] cursor-pointer focus:outline-none
          ${brand === 'sport'
            ? 'bg-white/20 font-medium'
            : 'opacity-50 hover:opacity-80 hover:bg-white/10'
          }`}
      >
        Sport
      </button>
    </div>
  );
}
