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

const TURKISH_CHAR_MAP = { ü: 'u', ğ: 'g', ş: 's', ı: 'i', ö: 'o', ç: 'c' };

const normalizeTitle = (title) =>
  (title || '')
    .toLowerCase()
    .replace(/[üğşıöç]/g, (ch) => TURKISH_CHAR_MAP[ch])
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// The same real-world event (e.g. a municipality's festival) often ends up
// both in the curated seed list and in a scraper's output, each pointing at
// a different sourceUrl (the org's homepage vs. a ticketing subdomain) — so
// a plain sourceUrl match can't catch it. Same date + a shared title prefix
// is a good enough signal without pulling in a fuzzy-matching library.
export const isSameEvent = (a, b) => {
  if (a.date !== b.date) return false;
  if (a.sourceUrl && a.sourceUrl === b.sourceUrl) return true;
  const prefixLength = 24;
  const titleA = normalizeTitle(a.title).slice(0, prefixLength);
  const titleB = normalizeTitle(b.title).slice(0, prefixLength);
  return titleA.length >= 12 && titleA === titleB;
};
