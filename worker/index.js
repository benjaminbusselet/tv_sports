/* index.js – Cloudflare Worker RSS proxy
   Ajoutez autant de lignes que nécessaire dans FEEDS
   Chemin  →  URL RSS source                                         */

import { XMLParser, XMLBuilder } from "fast-xml-parser";

const FEEDS = {
  "/toulouse": "https://tv-sports.fr/rss/equipe/176/toulouse?direct=1",
  "/formule1": "https://tv-sports.fr/rss/sport/102/formule-1?direct=1",
  "/motogp": "https://tv-sports.fr/rss/sport/252/motogp?direct=1",
};

addEventListener("fetch", (event) => event.respondWith(handle(event.request)));

async function handle(request) {
  /* 1. Choisir la source amont */
  const { pathname } = new URL(request.url);
  const upstream = FEEDS[pathname] ?? FEEDS["/toulouse"]; // défaut = Toulouse

  /* 2. Télécharger le flux d’origine */
  const xml = await (await fetch(upstream)).text();

  const clean = xml
    .replace(/^\uFEFF/, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  /* 3. Parser → JSON pour éventuelles transformations */
  const parser = new XMLParser({ ignoreAttributes: false });
  const builder = new XMLBuilder({ ignoreAttributes: false });
  const json = parser.parse(clean);

  /* 4. Filtrage spécifique (seulement pour /toulouse) */
  if (pathname === "/toulouse") {
    json.rss.channel.item = (json.rss.channel.item || []).filter((i) =>
      i.title?.includes("Toulouse")
    );
  }

  /* 5. Reconstruire le XML et renvoyer avec CORS */
  const filtered = builder.build(json);
  // Corrige les attributs guid isPermaLink sans valeur
  const fixedGuid = filtered.replace(
    /<guid\s+isPermaLink(\s*\/?>)/g,
    '<guid isPermaLink="true"$1'
  );
  // Puis échappe les &
  const safeXml = fixedGuid.replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;");

  const allGuids = safeXml.match(/<guid[^>]*>/g);

  return new Response(safeXml, {
    headers: {
      "Content-Type": "application/rss+xml",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
