const OPTIONS = {
  football: [
    { value: "all", label: "Tous" },
    { value: "marseille", label: "Olympique de Marseille" },
    { value: "barcelone", label: "FC Barcelone" },
    { value: "france", label: "France" },
    { value: "espagne", label: "Espagne" },
  ],
  rugby: [
    { value: "all", label: "Tous" },
    { value: "toulouse", label: "Stade Toulousain" },
    { value: "france_rugby", label: "France" },
  ],
  f1: [{ value: "all", label: "Tous" }],
  ufc: [{ value: "all", label: "Tous" }],
};

export default function TeamSelect({ sport, value, onChange }) {
  const opts = OPTIONS[sport] || [{ value: "all", label: "Tous" }];
  return (
    <div className="controls">
      <label htmlFor="team">Équipe&nbsp;:</label>
      <select
        id="team"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
