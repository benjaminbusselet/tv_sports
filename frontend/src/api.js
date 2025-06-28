export async function fetchFeed() {
  const res = await fetch("https://rss-proxy.ben-tvsports.workers.dev");
  const xml = await res.text();

  // Parse le XML avec DOMParser (API native navigateur)
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const items = [...doc.querySelectorAll("item")].map((item) => ({
    title: item.querySelector("title")?.textContent ?? "",
    pubDate: item.querySelector("pubDate")?.textContent ?? "",
    link: item.querySelector("link")?.textContent ?? "",
  }));

  return items;
}
