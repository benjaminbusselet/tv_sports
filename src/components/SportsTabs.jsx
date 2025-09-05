export default function SportsTabs({ value, onChange }) {
  const sports = [
    { id: "all", label: "Toutes" },
    { id: "football", label: "Football" },
    { id: "teams", label: "Équipes" },
    { id: "f1", label: "F1" },
  ];
  return (
    <nav className="tabs" role="tablist" aria-label="Sports">
      {sports.map((s) => (
        <button
          key={s.id}
          role="tab"
          className="tab"
          aria-selected={value === s.id}
          onClick={() => onChange(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
