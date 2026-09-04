"""Adapter for the Kozaklı Belediyesi events widget.

The homepage (https://www.kozakli.bel.tr/) carries a real "ETKİNLİKLER"
widget with title/date/time/venue per card:

    <div class="Etkinlik">
    <article>
    <div class="sol row50">
        <div class="thumb"><a href="https://www.kozakli.bel.tr/etkinlik/<slug>/">
            <img src="..." alt="..."></a></div>
    </div>
    <div class="sag">
        <div class="info">
        <a class="title" href="https://www.kozakli.bel.tr/etkinlik/<slug>/">Title</a>
        </div>
    <div class="ettarih"><i class="fa fa-calendar-check-o"></i>29/10/2024</div>
    <div class="etsaat"><i class="fa fa-clock-o"></i>09.00</div>
    <div class="etadres"><i class="fa fa-map-marker"></i>Kozaklı</div>
    </div>
    </article>
    </div>

Only a small rotating handful of slides exist at any time (the events
custom-post-type archive itself 500s, so this widget is the only way in).
If the widget's markup changes, this adapter should fail loudly (raise) so
run_scrapers.py can log it and skip it, rather than silently returning
zero events.
"""

import requests
from bs4 import BeautifulSoup

from scraper.schema import normalize_event, parse_numeric_date

SOURCE_ID = "src-17"
SOURCE_NAME = "Kozaklı Belediyesi"
BASE_URL = "https://www.kozakli.bel.tr"
LISTING_URL = f"{BASE_URL}/"

TOWN = "Kozaklı"
COORDINATES = [38.9280, 34.8140]

DEFAULT_CATEGORY = ("kultur", "Belediye Etkinliği", "🏛️")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; CappadociaEventsBot/1.0; "
        "+https://kapadokya.edu.tr)"
    )
}


def fetch():
    response = requests.get(LISTING_URL, headers=HEADERS, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    cards = soup.select("div.Etkinlik")
    events = []

    for card in cards:
        title_link = card.select_one(".info a.title")
        if not title_link:
            continue

        date_el = card.select_one(".ettarih")
        time_el = card.select_one(".etsaat")
        location_el = card.select_one(".etadres")
        image_el = card.select_one(".thumb img")

        event = normalize_event(
            source_id=SOURCE_ID,
            source_name=SOURCE_NAME,
            title=title_link.get_text(strip=True),
            description="",
            iso_date=parse_numeric_date(date_el.get_text(strip=True) if date_el else None),
            time=time_el.get_text(strip=True) if time_el else "",
            town=TOWN,
            location_name=location_el.get_text(strip=True) if location_el else "Kozaklı",
            coordinates=COORDINATES,
            source_url=title_link.get("href", ""),
            image=image_el.get("src") if image_el else None,
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
