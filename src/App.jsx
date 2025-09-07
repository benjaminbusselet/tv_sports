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
import { getTeamNames } from "./services/sources.js";
import { fetchUserSettings } from "./services/userConfig.js";
import "./components/LoadingSpinner.css";

const teams = getTeamNames();

export default function App() {
  const [sport, setSport] = useState("all");
  const [userSettings, setUserSettings] = useState(null);
  const [day, setDay] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return dayKey(t);
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("league"); // "league" ou "time"

  // Charger les préférences utilisateur
  useEffect(() => {
    async function loadUserSettings() {
      const settings = await fetchUserSettings();
      setUserSettings(settings);
      // Utiliser l'onglet par défaut configuré
      setSport(settings.display?.defaultTab || "all");
    }
    loadUserSettings();
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function loadEvents() {
      try {
        const data = await fetchEvents({ day, sport });
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

  // Les événements sont déjà filtrés par jour côté serveur (progs_YYYYMMDD.json)
  /* const dayEvents = useMemo(() => {
    if (!events?.length) return [];

    // Simple validation : garder seulement les événements valides
    const validEvents = events.filter((ev) => {
      if (!ev || !ev.start) {
        console.warn("Invalid event (missing start):", ev);
        return false;
      }
      return true;
    });

    return validEvents;
  }, [events]);
 */

  const dayEvents = useMemo(() => {
    if (!events?.length) return [];

    // Simple validation : garder seulement les événements valides
    const validEvents = events.filter((ev) => {
      if (!ev || !ev.start) {
        console.warn("Invalid event (missing start):", ev);
        return false;
      }
      return true;
    });

    // Si sport="all" ou (football + time), trier par horaire
    if (sport === "all" || (sport === "football" && sortType === "time")) {
      return validEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    return validEvents;
  }, [events, sport, sortType]);

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

    return map;
  }, [events]);

  const showGrouped = sport === "football" && sortType === "league";
  const showSortToggle = sport === "football"; // Masquer le toggle pour "all"
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
                <SportsTabs 
          activeSport={sport} 
          setSport={setSport} 
          userSettings={userSettings}
        />
        {showSortToggle && (
          <div className="controls">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="league">Par Ligue</option>
              <option value="time">Par Horaire</option>
            </select>
          </div>
        )}
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
