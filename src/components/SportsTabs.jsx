export default function SportsTabs({ value, onChange }) {
  const sports = [
    { id: "football", label: "Football" },
    { id: "teams", label: "Équipes" },
    { id: "f1", label: "F1" },
    { id: "ufc", label: "UFC" },
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
