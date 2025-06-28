import { useEffect, useState } from "react";

const BASE = "https://rss-proxy.ben-tvsports.workers.dev";

const FEEDS = {
  Tous: BASE + "/all", // peut rester vide pour l’instant
  Toulouse: BASE + "/toulouse",
  "Formule 1": BASE + "/formule1",
  "Moto GP": BASE + "/motogp",
};

export default function useFeed(team) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      const url = FEEDS[team] ?? FEEDS["Toulouse"];
      const res = await fetch(url);
      const xml = await res.text();
      console.log("xml", xml);
      // Si la réponse n'est pas du XML/RSS, on abandonne proprement
      if (!res.headers.get("content-type")?.includes("xml")) {
        setEvents([]);
        setLoading(false);
        return;
      }
      // Corrige les entités HTML non valides (&nbsp; etc.) avant le parse XML
      const clean = xml
        .replace(/^\uFEFF/, "") // supprime le BOM éventuel
        .replace(/&nbsp;/g, " ")
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
      let items = [];
      try {
        const doc = new DOMParser().parseFromString(clean, "text/xml");
        items = Array.from(doc.getElementsByTagName("item")).map((it) => {
          const get = (tag) =>
            it.getElementsByTagName(tag)[0]?.textContent ?? "";
          return {
            title: get("title"),
            pubDate: get("pubDate"),
            link: get("link"),
          };
        });
      } catch (err) {
        console.warn("Parse error (non‑XML response?)", err);
      }
      items.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
      setEvents(items);
      setLoading(false);
    }
    fetchFeed();
  }, [team]);

  return { events, loading };
}
