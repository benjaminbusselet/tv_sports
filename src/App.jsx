import { useEffect, useMemo, useState } from "react";
import SportsTabs from "./components/SportsTabs.jsx";
import DayStrip from "./components/DayStrip.jsx";
import { dayKey } from "./lib/dateUtils.js";
import EventsList from "./components/EventsList.jsx";
import Drawer from "./components/Drawer.jsx";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <header className="header grid grid-cols-[auto_1fr_auto] items-center gap-4 px-[0.9rem] py-[0.65rem] mx-4 my-3 rounded-2xl max-[767px]:px-3 max-[767px]:py-1.5 max-[767px]:min-h-[44px] max-[767px]:my-2 max-[520px]:mx-2">
        <h1 className="m-0 text-2xl font-semibold leading-none max-[767px]:text-lg max-[767px]:max-w-[100px] max-[767px]:overflow-hidden max-[767px]:text-ellipsis max-[767px]:whitespace-nowrap max-[520px]:text-base">TV Sports</h1>
        <DayStrip value={day} onChange={setDay} countsByDay={countsByDay} />
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={drawerOpen}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-transparent cursor-pointer transition-all duration-[120ms] hover:bg-white/[0.08] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/20 flex-none"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </header>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="max-w-[1200px] mx-auto px-4">
        <SportsTabs
          activeSport={sport}
          setSport={setSport}
          userSettings={userSettings}
        />
        {showSortToggle && (
          <div className="flex justify-end gap-4 my-4 px-4">
            <select
              className="appearance-none px-3 py-1.5 rounded-lg border border-transparent bg-white/[0.04] text-inherit cursor-pointer text-sm transition-all duration-[160ms] hover:bg-white/[0.07] focus:outline-none"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="league">Par Ligue</option>
              <option value="time">Par Horaire</option>
            </select>
          </div>
        )}
        {error ? (
          <div className="text-center py-8 text-red-400">Erreur : {error}</div>
        ) : loading ? (
          <LoadingSpinner />
        ) : dayEvents.length === 0 ? (
          <div className="text-center py-8 opacity-60">Aucun événement pour ce jour</div>
        ) : (
          <EventsList events={dayEvents} grouped={showGrouped} />
        )}
      </div>
    </>
  );
}
