"""Adapter for the Kapadokya Üniversitesi (KUN) events page.

https://kapadokya.edu.tr/etkinlikler lists upcoming events as a grid of
cards inside <div class="row g-4">. Each card is an <a> whose structure is:

    <a href="/etkinlikler/<slug>" class="col-md-6 ...">
      <div ...>
        <div ...>
          <h5 class="fw-bold mb-2">Title</h5>
          <p class="small">Description</p>
          <ul class="list-unstyled small text-muted mt-3">
            <li><i class="fas fa-calendar-alt ..."></i>9 Eylül 2026 - </li>
            <li><i class="fas fa-map-marker-alt ..."></i>Mustafapaşa Yerleşkesi</li>
            <li><i class="fas fa-user-check ..."></i>Yüzyüze</li>
          </ul>
        </div>
        <div style="...background-image: url('...');..."></div>
      </div>
    </a>

If the site's markup changes, this adapter should fail loudly (raise) so
run_scrapers.py can log it and skip it, rather than silently returning
zero events.
"""

import re

import requests
from bs4 import BeautifulSoup

from scraper.schema import normalize_event

SOURCE_ID = "src-5"
SOURCE_NAME = "Kapadokya Üniversitesi (KUN) Kültür Merkezi"
BASE_URL = "https://kapadokya.edu.tr"
LISTING_URL = f"{BASE_URL}/etkinlikler"

# The campus is in Mustafapaşa (Ürgüp); events list either that or the
# "Fabrika Yerleşkesi" (Nevşehir Merkez) campus.
CAMPUS_TOWNS = {
    "Mustafapaşa Yerleşkesi": ("Ürgüp", [38.6120, 34.9280]),
    "Fabrika Yerleşkesi": ("Nevşehir Merkez", [38.6285, 34.7180]),
    "Sabiha Gökçen Yerleşkesi": ("Nevşehir Merkez", [38.6285, 34.7180]),
}
DEFAULT_TOWN = ("Nevşehir Merkez", [38.6285, 34.7180])

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; CappadociaEventsBot/1.0; "
        "+https://kapadokya.edu.tr)"
    )
}


def _extract_image(style_attr):
    if not style_attr:
        return None
    match = re.search(r"background-image:\s*url\(['\"]?(.*?)['\"]?\)", style_attr)
    return match.group(1) if match else None


def fetch():
    response = requests.get(LISTING_URL, headers=HEADERS, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    cards = soup.select("div.row.g-4 > a[href]")
    events = []

    for card in cards:
        title_el = card.select_one("h5")
        if not title_el:
            continue

        description_el = card.select_one("p.small")
        list_items = card.select("ul li")

        date_text = None
        location_text = None
        for li in list_items:
            icon = li.select_one("i")
            classes = icon.get("class", []) if icon else []
            text = li.get_text(strip=True)
            if "fa-calendar-alt" in classes:
                date_text = text
            elif "fa-map-marker-alt" in classes:
                location_text = text

        town, coordinates = CAMPUS_TOWNS.get(location_text, DEFAULT_TOWN)

        image_el = card.select_one("div[style*='background-image']")
        image = _extract_image(image_el.get("style") if image_el else None)

        href = card.get("href", "")
        source_url = href if href.startswith("http") else f"{BASE_URL}{href}"

        event = normalize_event(
            source_id=SOURCE_ID,
            source_name=SOURCE_NAME,
            title=title_el.get_text(strip=True),
            description=description_el.get_text(strip=True) if description_el else "",
            date_text=date_text,
            town=town,
            location_name=location_text or "Kapadokya Üniversitesi",
            coordinates=coordinates,
            source_url=source_url,
            image=None,
            organizer=SOURCE_NAME,
        )
        if event:
            events.append(event)

    return events


ADAPTER = {
    "id": SOURCE_ID,
    "name": SOURCE_NAME,
    "fetch": fetch,
}
