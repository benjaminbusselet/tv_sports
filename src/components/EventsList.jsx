import { useMemo } from "react";
// import "./Events.css"; // CSS supprimé - repartir de zéro

function groupByCompetition(events) {
  const byComp = new Map();
  
  for (const ev of events) {
    const comp = ev.competition || "Autres";
    if (!byComp.has(comp)) byComp.set(comp, []);
    byComp.get(comp).push(ev);
  }
  
  // Trier les événements dans chaque compétition par heure
  for (const [, list] of byComp) {
    list.sort((a, b) => new Date(a.start) - new Date(b.start));
  }
  
  return byComp;
}

export default function EventsList({ events = [], grouped = false }) {
  const competitionOrder = useMemo(() => {
    if (!grouped) return [];
    
    const competitions = new Set();
    events.forEach((ev) => {
      if (ev.competition) {
        competitions.add(ev.competition);
      }
    });
    
    // Tri alphabétique des compétitions
    return Array.from(competitions).sort((a, b) => a.localeCompare(b));
  }, [events, grouped]);

  if (grouped) {
    // Affichage groupé par compétition
    const byComp = groupByCompetition(events);
    const elements = [];
    
    competitionOrder.forEach((comp) => {
      const list = byComp.get(comp);
      if (!list || !list.length) return;

      elements.push(
        <div key={"comp-" + comp} className="sectionTitle">
          {comp}
        </div>
      );

      list.forEach((ev) => {
        const time = ev.start
          ? new Date(ev.start).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
          
        elements.push(
          <article key={(ev.uid || "") + ev.start + ev.title} className="card">
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
      });
    });

    return <div className="events-container">{elements}</div>;
  }

  // Affichage chronologique simple
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
            className="card"
            tabIndex={0}
          >
            <div className="event-title">
              {time} – {ev.title}
              {ev.status && (
                <span className={`status-badge status-${ev.status}`}>
                  {ev.status === "live" ? "Live" : ev.status === "upcoming" ? "À venir" : "Terminé"}
                </span>
              )}
            </div>
            <div className="event-subtitle">
              {ev.competition} · {ev.broadcasters?.join(", ")}
            </div>
          </article>
        );
      })}
    </div>
  );
}
