import { useCallback, useEffect, useState } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "denied"
  );

  // Enregistrement du Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((e) => console.warn("SW échec", e));
    }
  }, []);

  // Demande de permission et planification des notifications
  const enableNotifications = useCallback(async (events) => {
    if (!("Notification" in window)) return;

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === "granted") {
      scheduleNotifications(events);
    }
  }, []);

  // Planification des notifications T-15
  const scheduleNotifications = useCallback(
    (events) => {
      if (permission !== "granted") return;

      const now = Date.now();
      events.forEach((ev) => {
        if (!ev.start) return;
        const t0 = new Date(ev.start).getTime() - 15 * 60 * 1000;
        const delay = t0 - now;
        if (delay > 0) {
          setTimeout(() => {
            new Notification(ev.title, {
              body: "Dans 15 minutes",
              icon: "/icons/icon-192.png",
              data: { url: ev.url },
            });
          }, delay);
        }
      });
    },
    [permission]
  );

  return {
    permission,
    enableNotifications,
  };
}
