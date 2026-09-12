/* eslint-env node */

/**
 * Utilitaires de dates Europe/Paris — format YYYYMMDD.
 * Source unique : anciennement dupliqué dans build.js, dev-check.js,
 * epg.js (ymdParis) et ics.js (parisYMD).
 */

const fmtParis = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Date | string (ISO) | number → "YYYYMMDD" (jour civil Europe/Paris).
 */
export function ymdParis(input) {
  const d = input instanceof Date ? input : new Date(input);
  return fmtParis.format(d).replaceAll("-", "");
}

/** "YYYYMMDD" du jour courant, Europe/Paris. */
export function todayParisYMD() {
  return ymdParis(new Date());
}

/** "YYYYMMDD" + n jours → "YYYYMMDD" (Europe/Paris). */
export function addDaysYMD(ymd, n) {
  const y = +ymd.slice(0, 4),
    m = +ymd.slice(4, 6),
    d = +ymd.slice(6, 8);
  const t = Date.UTC(y, m - 1, d) + n * 86400000;
  return ymdParis(new Date(t));
}
