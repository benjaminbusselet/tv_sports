function groupEvents(events) {
  const groups = {};
  events.forEach((ev) => {
    const match = ev.title.match(/^(.+?)\s*\((.+?)\)/);
    // Si pas de parenthèses, on prend tout le titre
    const event = match ? match[1].trim() : ev.title.trim();
    if (!groups[event]) {
      groups[event] = { event, dates: [] };
    }
    groups[event].dates.push(ev.pubDate);
  });
  return Object.values(groups);
}

export default function MatchList({ events }) {
  const grouped = groupEvents(events);

  if (grouped.length === 0) return <p>Aucun match à venir pour l’instant.</p>;

  return (
    <div>
      {grouped.map(({ event, dates }) => (
        <div key={event} style={{ marginBottom: "2em" }}>
          <h2>{event}</h2>
          <ul>
            {dates.map((date) => (
              <li key={date}>{new Date(date).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
