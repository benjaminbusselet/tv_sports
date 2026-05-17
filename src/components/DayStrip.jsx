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
    <div className="flex items-center justify-center gap-2 min-w-0 max-w-full">
      {/* Version mobile: select */}
      <select
        className="md:hidden appearance-none px-2.5 py-1.5 rounded-lg border border-transparent bg-white/[0.04] text-inherit cursor-pointer transition-all duration-[160ms] hover:bg-white/[0.07] focus:outline-none w-full max-w-[280px]"
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
      <nav className="hidden md:flex gap-2 items-center" aria-label="Jours">
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
    </div>
  );
}
