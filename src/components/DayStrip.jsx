import { dayKey, dayLabel } from "../lib/dateUtils.js";
// import "./DayStrip.css"; // CSS supprimé - repartir de zéro

export default function DayStrip({ value, onChange, countsByDay = {} }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = dayKey(d);
    return { key, d, label: dayLabel(d), count: countsByDay[key] || 0 };
  });

  // Trouver le jour sélectionné pour l'afficher dans le select
  const selectedDay = days.find((d) => d.key === value) || days[0];

  return (
    <div className="days-navigation">
      {/* Version mobile: select */}
      <select
        className="days-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {days.map(({ key, label: labelText, count }) => (
          <option key={key} value={key}>
            {labelText}
            {count ? ` (${count})` : ""}
          </option>
        ))}
      </select>

      {/* Version desktop: pills glassmorphism */}
      <nav className={document.body.classList.contains("theme-ios26") ? "pills-ios26" : "days-chips"} aria-label="Jours">
        {days.map(({ key, label: labelText, count }) => (
          <button
            key={key}
            className={document.body.classList.contains("theme-ios26") ? "pill-ios26" : "chip"}
            aria-selected={value === key}
            onClick={() => onChange(key)}
            style={document.body.classList.contains("theme-ios26") ? {
              transition: "box-shadow 0.2s var(--lg-pill-morph), background 0.2s, transform 0.18s var(--lg-pill-morph)",
              fontFamily: "SF Pro Display, Inter, Arial, sans-serif"
            } : {}}
          >
            {labelText}
            {count ? ` (${count})` : ""}
          </button>
        ))}
      </nav>
    </div>
  );
}
