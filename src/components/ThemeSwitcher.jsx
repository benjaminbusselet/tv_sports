import { useEffect, useMemo, useState } from "react";

/**
 * ThemeSwitcher
 * - Applique le thème via document.documentElement.dataset.theme
 * - Persiste le choix dans localStorage("tv_sports_theme")
 * - Propose 3 styles: minimal | retro | glass
 */
export default function ThemeSwitcher() {
  const THEMES = useMemo(
    () => [
      { id: "retro", label: "Retro" },
    ],
    []
  );

  const [theme, setTheme] = useState(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("tv_sports_theme")
        : null;
    return saved || "retro";
  });

  // Applique le thème et le persiste
  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
    try {
      localStorage.setItem("tv_sports_theme", theme);
    } catch {
      // ignore localStorage errors
    }
  }, [theme]);

  return (
    <div
      style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}
      aria-label="Thème"
      role="group"
    >
      {THEMES.map((t) => (
        <button
          key={t.id}
          className="chip"
          aria-pressed={theme === t.id}
          aria-label={`Thème ${t.label}`}
          onClick={() => setTheme(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
