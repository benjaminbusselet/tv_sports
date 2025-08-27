import "./Events.css";

export default function EventsList({ events = [] }) {
  return (
    <div className="events-container">
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
                {time} - {ev.title}
              </h3>
              <div className="broadcasters">
                {ev.broadcasters?.length > 0
                  ? ev.broadcasters.join(", ")
                  : "\u00A0"}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
