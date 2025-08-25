export function dayKey(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return x.toISOString();
}

export function dayLabel(d) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}
