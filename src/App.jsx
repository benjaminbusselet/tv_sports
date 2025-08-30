import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import SportsTabs from "./components/SportsTabs.jsx";
import DayStrip from "./components/DayStrip.jsx";
import { dayKey } from "./lib/dateUtils.js";
import EventsList from "./components/EventsList.jsx";
import EventsGrouped from "./components/EventsGrouped.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { useNotifications } from "./hooks/useNotifications.js";
import { fetchEvents } from "./services/api.js";
import "./components/LoadingSpinner.css";

export default function App() {
  const [sport, setSport] = useState("football");
  const [day, setDay] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return dayKey(t);
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function loadEvents() {
      try {
        console.log("Fetching events for:", { day, sport });
        const data = await fetchEvents({ day, sport });
        console.log("Received events:", data);
        if (!isCancelled) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        if (!isCancelled) {
          setError(error.message);
          setEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [sport, day]);

  // ✅ CORRECTION : Suppression du double filtrage par date
  // Les événements sont déjà filtrés par jour côté serveur (progs_YYYYMMDD.json)
  const dayEvents = useMemo(() => {
    if (!events?.length) return [];
    console.log("Events ready for display:", events.length);

    // Simple validation : garder seulement les événements valides
    const validEvents = events.filter((ev) => {
      if (!ev || !ev.start) {
        console.warn("Invalid event (missing start):", ev);
        return false;
      }
      return true;
    });

    console.log("Valid events after filtering:", validEvents.length);
    return validEvents;
  }, [events]);

  // Compteurs pour la frise (7 jours) – calculé sur tous les événements disponibles
  const countsByDay = useMemo(() => {
    const map = {};

    // Pour les compteurs, on peut garder la logique de groupement par jour
    // car on veut afficher le nombre d'événements sur plusieurs jours
    for (const ev of events) {
      if (!ev.start) continue;
      try {
        const d = new Date(ev.start);
        const k = dayKey(d);
        map[k] = (map[k] || 0) + 1;
      } catch (error) {
        console.warn("Invalid date for event:", ev.start);
      }
    }

    console.log("Counts by day:", map);
    return map;
  }, [events]);

  const showGrouped = sport === "football";
  const { permission, enableNotifications } = useNotifications();

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
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {permission !== "granted" && (
            <button
              className="notifyBtn"
              onClick={() => enableNotifications(events)}
            >
              Activer les notifications
            </button>
          )}
          <ThemeSwitcher />
        </div>
      </header>
      <div className="container">
        <DayStrip value={day} onChange={setDay} countsByDay={countsByDay} />
        <SportsTabs value={sport} onChange={setSport} />
        {error ? (
          <div className="error-message">Erreur : {error}</div>
        ) : loading ? (
          <LoadingSpinner />
        ) : dayEvents.length === 0 ? (
          <div className="no-events">Aucun événement pour ce jour</div>
        ) : showGrouped ? (
          <EventsGrouped events={dayEvents} />
        ) : (
          <EventsList events={dayEvents} />
        )}
      </div>
    </>
  );
}
