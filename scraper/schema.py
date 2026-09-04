"""Shared event schema and normalization helpers used by every source adapter.

The output shape mirrors the event objects the frontend already expects
(see src/data/events.js) so scraped events can be merged directly into
the app's event list without any further mapping.
"""

import hashlib
import re
from datetime import date, timedelta

TR_MONTHS = {
    "ocak": 1, "şubat": 2, "subat": 2, "mart": 3, "nisan": 4, "mayıs": 5, "mayis": 5,
    "haziran": 6, "temmuz": 7, "ağustos": 8, "agustos": 8, "eylül": 9, "eylul": 9,
    "ekim": 10, "kasım": 11, "kasim": 11, "aralık": 12, "aralik": 12,
    # Short forms used by some sites (e.g. NEVÜ's "20 May 2026", "Şub", "Eki")
    "oca": 1, "şub": 2, "sub": 2, "mar": 3, "nis": 4, "may": 5,
    "haz": 6, "tem": 7, "ağu": 8, "agu": 8, "eyl": 9,
    "eki": 10, "kas": 11, "ara": 12,
}

CATEGORY_MAP = {
    "konferans": ("kultur", "Konferans", "🎙️"),
    "kongre": ("kultur", "Kongre", "🎙️"),
    "seminer": ("kultur", "Seminer", "🎙️"),
    "söyleşi": ("kultur", "Söyleşi", "🎙️"),
    "eğitim": ("kultur", "Eğitim", "📚"),
    "çalıştay": ("kultur", "Çalıştay", "🛠️"),
    "kültür-sanat": ("kultur", "Kültür & Sanat", "🎭"),
    "sinema": ("kultur", "Sinema", "🎬"),
    "tiyatro": ("kultur", "Tiyatro", "🎭"),
    "müzik": ("konser", "Müzik", "🎵"),
    "konser": ("konser", "Konser", "🎵"),
    "festival": ("konser", "Festival", "🎪"),
    "spor": ("doga", "Spor", "🏃"),
    "doğa": ("doga", "Doğa", "🥾"),
    "gastronomi": ("gastronomi", "Gastronomi", "🍇"),
}

DEFAULT_CATEGORY = ("kultur", "Akademik Etkinlik", "🎓")


def parse_turkish_date(text):
    """Parse a Turkish date like '9 Eylül 2026' into an ISO 'YYYY-MM-DD' string.

    Returns None if the text can't be parsed (caller should skip the event
    rather than guess a date).
    """
    if not text:
        return None
    match = re.search(r"(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})", text)
    if not match:
        return None
    day, month_name, year = match.groups()
    month = TR_MONTHS.get(month_name.lower())
    if not month:
        return None
    try:
        return date(int(year), month, int(day)).isoformat()
    except ValueError:
        return None


def parse_numeric_date(text):
    """Parse a numeric date like '08.03.2026' or '29/10/2024' into ISO form."""
    if not text:
        return None
    match = re.search(r"(\d{1,2})[./](\d{1,2})[./](\d{4})", text)
    if not match:
        return None
    day, month, year = match.groups()
    try:
        return date(int(year), int(month), int(day)).isoformat()
    except ValueError:
        return None


def categorize(event_type_text, default_category=None):
    fallback = default_category or DEFAULT_CATEGORY
    if not event_type_text:
        return fallback
    key = event_type_text.strip().lower()
    return CATEGORY_MAP.get(key, fallback)


def make_event_id(source_id, source_url):
    """Deterministic id so re-running the scraper doesn't duplicate events."""
    digest = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:10]
    return f"{source_id}-{digest}"


def is_weekend(iso_date):
    try:
        return date.fromisoformat(iso_date).weekday() >= 5
    except ValueError:
        return False


def is_today(iso_date, today=None):
    today = today or date.today()
    try:
        return date.fromisoformat(iso_date) == today
    except ValueError:
        return False


def normalize_event(
    *,
    source_id,
    source_name,
    title,
    description,
    town,
    location_name,
    coordinates,
    source_url,
    date_text=None,
    iso_date=None,
    time="",
    image=None,
    event_type_text=None,
    organizer=None,
    default_category=None,
):
    """Build one event object matching the app's schema. Returns None if the
    event can't be dated (we never guess a date for a real event).

    Pass either `date_text` (Turkish-month-name text, e.g. "9 Eylül 2026",
    parsed via parse_turkish_date) or a pre-parsed `iso_date` (e.g. from
    parse_numeric_date for "DD.MM.YYYY"/"DD/MM/YYYY" sources) — whichever
    the adapter's source format needs.

    default_category lets an adapter set a source-appropriate fallback
    (e.g. "Belediye Etkinliği" instead of the generic default) for events
    whose type text doesn't match anything in CATEGORY_MAP.
    """
    iso_date = iso_date or parse_turkish_date(date_text)
    if not iso_date:
        return None

    category, category_name, category_icon = categorize(event_type_text, default_category)

    return {
        "id": make_event_id(source_id, source_url),
        "title": title.strip(),
        "category": category,
        "categoryName": category_name,
        "categoryIcon": category_icon,
        "town": town,
        "locationName": location_name,
        "coordinates": coordinates,
        "date": iso_date,
        "time": time or "",
        "price": 0,
        "isFree": True,
        "priceLabel": "Ücretsiz",
        "ticketUrl": None,
        "organizer": organizer or source_name,
        "organizerContact": "",
        "image": image or "/images/concert.jpg",
        "description": (description or "").strip(),
        "highlights": [],
        "sourceName": source_name,
        "sourceUrl": source_url,
        "verificationStatus": "Kaynak Sitesinden Otomatik Doğrulandı",
        "verificationBadge": "🟢 Otomatik Doğrulanmış (Resmi Kaynak)",
        "isPopular": False,
        "isToday": is_today(iso_date),
        "isWeekend": is_weekend(iso_date),
    }
