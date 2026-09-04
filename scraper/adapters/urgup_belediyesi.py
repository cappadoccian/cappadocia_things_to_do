"""Adapter for the Ürgüp Belediyesi events/ticketing platform.

https://etkinlik.urgup.bel.tr/tum-etkinlikler lists every event as a card
(unlike urgup.bel.tr's own CMS pages, this listing already carries date,
venue and category, so a single request is enough):

    <div class="group bg-white rounded-2xl ...">
      <img src="...">
      <h5><a href="https://etkinlik.urgup.bel.tr/etkinlikler/<slug>/<id>">Title</a></h5>
      <div class="space-y-2 ...">
        <div><i class="ri-time-line"></i><span>4 Eylül 2026 - </span></div>
        <div><i class="ri-map-pin-line"></i><span>Cumhuriyet Meydani Sölen Alani</span></div>
      </div>
      <span class="... uppercase ...">Festival</span>
    </div>

Note "div.group" alone also matches unrelated sidebar-menu items on this
page, so the selector below pins down the extra classes unique to event
cards. If the site's markup changes, this adapter should fail loudly
(raise) so run_scrapers.py can log it and skip it, rather than silently
returning zero events.
"""

import requests
from bs4 import BeautifulSoup

from scraper.schema import normalize_event

SOURCE_ID = "src-15"
SOURCE_NAME = "Ürgüp Belediyesi"
BASE_URL = "https://etkinlik.urgup.bel.tr"
LISTING_URL = f"{BASE_URL}/tum-etkinlikler"

TOWN = "Ürgüp"
# Ürgüp town-centre coordinate; individual venue addresses aren't geocoded.
COORDINATES = [38.6310, 34.9140]

DEFAULT_CATEGORY = ("kultur", "Belediye Etkinliği", "🏛️")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; CappadociaEventsBot/1.0; "
        "+https://kapadokya.edu.tr)"
    )
}


def _sibling_text(icon):
    if not icon:
        return None
    span = icon.find_next_sibling("span")
    return span.get_text(strip=True) if span else None


def fetch():
    response = requests.get(LISTING_URL, headers=HEADERS, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    cards = soup.select("div.group.bg-white.rounded-2xl")
    events = []

    for card in cards:
        title_link = card.select_one("h5 a[href]")
        if not title_link:
            continue

        date_text = _sibling_text(card.select_one("i.ri-time-line"))
        location_text = _sibling_text(card.select_one("i.ri-map-pin-line"))

        badge = card.select_one("span.uppercase")
        event_type_text = badge.get_text(strip=True) if badge else None

        image_el = card.select_one("img")
        image = image_el.get("src") if image_el else None

        event = normalize_event(
            source_id=SOURCE_ID,
            source_name=SOURCE_NAME,
            title=title_link.get_text(strip=True),
            description="",
            date_text=date_text,
            town=TOWN,
            location_name=location_text or "Ürgüp",
            coordinates=COORDINATES,
            source_url=title_link.get("href", ""),
            image=image,
            event_type_text=event_type_text,
            organizer=SOURCE_NAME,
            default_category=DEFAULT_CATEGORY,
        )
        if event:
            events.append(event)

    return events


ADAPTER = {
    "id": SOURCE_ID,
    "name": SOURCE_NAME,
    "fetch": fetch,
}
