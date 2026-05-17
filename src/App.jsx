import { useEffect, useMemo, useState } from "react";
import "./App.css";
import SportsTabs from "./components/SportsTabs.jsx";
import DayStrip from "./components/DayStrip.jsx";
import { dayKey } from "./lib/dateUtils.js";
import EventsList from "./components/EventsList.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { fetchEvents, fetchDayCounts } from "./services/api.js";
import { fetchUserSettings } from "./services/userConfig.js";

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
  const [countsByDay, setCountsByDay] = useState({});

  // Charger les compteurs pour les 7 jours du DayStrip (une seule fois au montage)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return dayKey(d);
    });
    fetchDayCounts(days).then(setCountsByDay);
  }, []);

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

  const showGrouped = sport === "football" && sortType === "league";
  const showSortToggle = sport === "football"; // Masquer le toggle pour "all"

  return (
    <>
      <header className="header">
        <h1>TV Sports</h1>
        {/* Centred day navigation (frise / select) moved into header */}
        <DayStrip value={day} onChange={setDay} countsByDay={countsByDay} />
        <div className="header-actions">
          <ThemeSwitcher />
        </div>
      </header>
      <div className="container">
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
        ) : (
          <EventsList events={dayEvents} grouped={showGrouped} />
        )}
      </div>
    </>
  );
}
