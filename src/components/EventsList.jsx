export default function EventsList({ events = [] }) {
  return (
    <div>
      {events.map((ev) => {
        const time = ev.start
          ? new Date(ev.start).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        return (
          <article key={ev.uid || ev.start + ev.title} className="card">
            <div className="event-line">
              <h3>
                <span className="event-time">{time}</span> - <span className="event-title">{ev.title}</span>
              </h3>
            </div>
          </article>
        );
      })}
    </div>
  );
}
