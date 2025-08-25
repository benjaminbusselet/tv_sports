import { dayKey, dayLabel } from "../lib/dateUtils.js";

export default function DayStrip({ value, onChange, countsByDay = {} }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = dayKey(d);
    return { key, d, label: dayLabel(d), count: countsByDay[key] || 0 };
  });
  return (
    <nav className="chips" aria-label="Jours">
      {days.map(({ key, label: labelText, count }) => (
        <button
          key={key}
          className="chip"
          aria-selected={value === key}
          onClick={() => onChange(key)}
        >
          {labelText}
          {count ? ` (${count})` : ""}
        </button>
      ))}
    </nav>
  );
}
