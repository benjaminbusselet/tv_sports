import "./Events.css";

export default function EventsList({ events = [] }) {
  const isIos26 = document.body.classList.contains("theme-ios26");
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
          <article
            key={ev.uid || ev.start + ev.title}
            className={isIos26 ? "card-ios26" : "card"}
            tabIndex={0}
            style={isIos26 ? {
              transition: "box-shadow 0.22s, transform 0.22s cubic-bezier(.4,1.4,.6,1)",
              fontFamily: "SF Pro Display, Inter, Arial, sans-serif"
            } : {}}
          >
            <div className="event-title-ios26">
              {time} – {ev.title}
              {ev.status && (
                <span
                  className={`status-badge-ios26 status-${ev.status}-ios26`}
                  style={{
                    animation: "fadeIn 0.4s cubic-bezier(.4,1.4,.6,1)",
                  }}
                >
                  {ev.status === "live" ? "Live" : ev.status === "upcoming" ? "À venir" : "Terminé"}
                </span>
              )}
            </div>
            <div className="event-subtitle-ios26">
              {ev.competition} · {ev.broadcasters?.join(", ")}
            </div>
          </article>
        );
      })}
    </div>
  );
}
