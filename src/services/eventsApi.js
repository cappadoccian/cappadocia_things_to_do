// Loads the real events produced by the scheduled scraper (scraper/run_scrapers.py,
// run via .github/workflows/scrape-events.yml) from the two static files it writes
// into public/. Both files are served as-is by Vite, so a plain fetch is enough —
// no backend involved. Failures never throw: the app falls back to the curated
// INITIAL_EVENTS list in src/data/events.js.

export const fetchScrapedEvents = async () => {
  try {
    const res = await fetch('/scraped-events.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const fetchScrapedMeta = async () => {
  try {
    const res = await fetch('/scraped-meta.json', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
