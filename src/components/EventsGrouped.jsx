import { useMemo } from "react";
import "./Events.css";

function groupByDayAndCompetition(events) {
  const byDay = new Map();
  for (const ev of events) {
    if (!ev.start) continue;
    const d = new Date(ev.start);
    const key = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).toISOString();
    if (!byDay.has(key)) byDay.set(key, new Map());
    const comp = ev.competition || "Autres";
    const byComp = byDay.get(key);
    if (!byComp.has(comp)) byComp.set(comp, []);
    byComp.get(comp).push(ev);
  }
  for (const [, byComp] of byDay) {
    for (const [, list] of byComp)
      list.sort((a, b) => new Date(a.start) - new Date(b.start));
  }
  return byDay;
}

export default function EventsGrouped({ events = [] }) {
  // Génération dynamique de l'ordre des compétitions
  const competitionOrder = useMemo(() => {
    const competitions = new Set();
    events.forEach((ev) => {
      if (ev.competition) {
        competitions.add(ev.competition);
      }
    });

    // Tri alphabétique par défaut
    // Vous pouvez personnaliser cette logique selon vos besoins
    return Array.from(competitions).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const elts = [];
  const byDay = groupByDayAndCompetition(events);
  const dayKeys = Array.from(byDay.keys()).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  dayKeys.forEach((k) => {
    const d = new Date(k);
    elts.push(
      <div key={"day-" + k} className="dayTitle">
        {d.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })}
      </div>
    );

    const byComp = byDay.get(k);

    // Utilisation de la liste dynamique au lieu de COMP_ORDER
    competitionOrder.forEach((comp) => {
      const list = byComp.get(comp);
      if (!list || !list.length) return;

      elts.push(
        <div key={"comp-" + k + comp} className="sectionTitle">
          {comp}
        </div>
      );

      list.forEach((ev) => {
        elts.push(
          <article key={(ev.uid || "") + ev.start + ev.title} className="card">
            <div className="event-line">
              <h3>
                {new Date(ev.start).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {ev.title}
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
  });

  return <div className="events-container">{elts}</div>;
}
