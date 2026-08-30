import { useMemo } from "react";
import "./EventsList.css";

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
        <div key={"comp-" + comp} className="section-title text-xl font-semibold mt-6 mb-3 ml-2 pb-2 border-b">
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
          <article key={(ev.uid || "") + ev.start + ev.title} className="card grid grid-cols-[4rem_1fr_12rem] max-[767px]:grid-cols-[2.5rem_1fr_6rem] items-center gap-2 w-full my-2 px-4 py-3 max-[767px]:px-3 max-[767px]:py-2 rounded-2xl">
            <div className="font-mono text-sm font-semibold opacity-90 max-[767px]:text-[11px]">{time}</div>
            <div className="overflow-hidden min-w-0">
              <div className="text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap max-[767px]:text-[13px]">{ev.title}</div>
            </div>
            <div className="text-sm text-right whitespace-nowrap overflow-hidden text-ellipsis flex justify-end items-center gap-2 max-[767px]:text-[10px]">{ev.broadcasters?.join(", ") || ""}</div>
          </article>
        );
      });
    });

    return <div className="px-3 w-full max-w-[800px] mx-auto max-[767px]:px-2">{elements}</div>;
  }

  // Affichage chronologique simple
  return (
    <div className="px-3 w-full max-w-[800px] mx-auto max-[767px]:px-2">
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
            className="card grid grid-cols-[4rem_1fr_12rem] max-[767px]:grid-cols-[2.5rem_1fr_6rem] items-center gap-2 w-full my-2 px-4 py-3 max-[767px]:px-3 max-[767px]:py-2 rounded-2xl"
            tabIndex={0}
          >
            <div className="font-mono text-sm font-semibold opacity-90 max-[767px]:text-[11px]">{time}</div>
            <div className="overflow-hidden min-w-0">
              <div className="text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap max-[767px]:text-[13px]">{ev.title}</div>
            </div>
            <div className="text-sm text-right whitespace-nowrap overflow-hidden text-ellipsis flex justify-end items-center gap-2 max-[767px]:text-[10px]">
              {ev.broadcasters?.join(", ") || ""}
              {ev.status && (
                <span className={`status-badge status-${ev.status}`}>
                  {ev.status === "live" ? "Live" : ev.status === "upcoming" ? "À venir" : "Terminé"}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
