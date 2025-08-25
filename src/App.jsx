import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import SportsTabs from "./components/SportsTabs.jsx";
import TeamSelect from "./components/TeamSelect.jsx";
import DayStrip from "./components/DayStrip.jsx";
import { dayKey } from "./lib/dateUtils.js";
import EventsList from "./components/EventsList.jsx";
import EventsGrouped from "./components/EventsGrouped.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";

export default function App() {
  const [sport, setSport] = useState("football");
  const [team, setTeam] = useState("all");
  const [day, setDay] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return dayKey(t);
  });
  const [events, setEvents] = useState([]);

  // TODO API: fetch /events?sport or ?team + ?day
  useEffect(() => {
    setEvents([]); // reset while loading
    // Placeholder: on branchera l’API réelle à l’étape suivante
    // Pour visualiser le squelette, on met 2 faux matchs “aujourd’hui”
    const today = new Date();
    today.setHours(18, 45, 0, 0);
    const mock = [
      {
        uid: "1",
        title: "Rennes vs Marseille",
        start: today.toISOString(),
        competition: "Ligue 1",
      },
      {
        uid: "2",
        title: "Barça vs Sevilla",
        start: new Date(today.getTime() + 3600000).toISOString(),
        competition: "La Liga",
      },
    ];
    setTimeout(() => setEvents(mock), 150);
  }, [sport, team, day]);

  // Filtrage par jour (le serveur le fera plus tard ; on garde ici pour le squelette)
  const dayEvents = useMemo(() => {
    if (!events?.length) return [];
    const k = day;
    return events.filter((ev) => {
      if (!ev.start) return false;
      const d = new Date(ev.start);
      return dayKey(d) === k;
    });
  }, [events, day]);

  // Compteurs pour la frise (7 jours) – simple, sur le set en mémoire
  const countsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!ev.start) continue;
      const d = new Date(ev.start);
      const k = dayKey(d);
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [events]);

  const showGrouped = sport === "football" && team === "all";

  return (
    <>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>TV Sports</h1>
        <ThemeSwitcher />
      </header>
      <div className="container">
        <DayStrip value={day} onChange={setDay} countsByDay={countsByDay} />
        <SportsTabs
          value={sport}
          onChange={(s) => {
            setSport(s);
            setTeam("all");
          }}
        />
        <TeamSelect sport={sport} value={team} onChange={setTeam} />
        {showGrouped ? (
          <EventsGrouped events={dayEvents} />
        ) : (
          <EventsList events={dayEvents} />
        )}
      </div>
    </>
  );
}
