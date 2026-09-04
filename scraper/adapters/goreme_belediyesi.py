"""Adapter for the Göreme Belediyesi events widget.

The homepage (https://www.goreme.bel.tr/tr) carries a real "Etkinlikler"
swiper widget with title/date/time/venue per card:

    <div class="event w-100 h-100" ...>
      <a href="https://www.goreme.bel.tr/tr/<slug>" title="...">
        <div class="photo rounded" ...><img src="..."></div>
        <div class="info">
          <div class="name p-2 mt-2"><strong>Title</strong></div>
          <div class="items w-100">
            <div class="row"><div class="col-sm"><div class="item">
              <label><i class="ri-calendar-todo-fill"></i></label>
              <span>08.03.2026</span>
            </div></div></div>
            <div class="row"><div class="col-sm"><div class="item">
              <label><i class="ri-time-line"></i></label>
              <span>21:00</span>
            </div></div></div>
            <div class="d-block"><div class="item">
              <label><i class="ri-map-pin-line"></i></label>
              <span>Göreme Toplantı Salonu</span>
            </div></div>
          </div>
        </div>
      </a>
    </div>

The dedicated "/tr/tum-etkinlikler" page's own content body is empty (its
listing is rendered elsewhere/differently), so the homepage widget is the
reliable target. If the widget's markup changes, this adapter should fail
loudly (raise) so run_scrapers.py can log it and skip it, rather than
silently returning zero events.
"""

import requests
from bs4 import BeautifulSoup

from scraper.schema import normalize_event, parse_numeric_date

SOURCE_ID = "src-16"
SOURCE_NAME = "Göreme Belediyesi"
BASE_URL = "https://www.goreme.bel.tr"
LISTING_URL = f"{BASE_URL}/tr"

TOWN = "Göreme"
COORDINATES = [38.6431, 34.8286]

DEFAULT_CATEGORY = ("kultur", "Belediye Etkinliği", "🏛️")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; CappadociaEventsBot/1.0; "
        "+https://kapadokya.edu.tr)"
    )
}


def _item_text(card, icon_class):
    icon = card.select_one(f"i.{icon_class}")
    if not icon:
        return None
    span = icon.parent.find_next_sibling("span") if icon.parent else None
    if not span:
        # the icon and span both sit inside the same "item" div
        item = icon.find_parent("div", class_="item")
        span = item.select_one("span") if item else None
    return span.get_text(strip=True) if span else None


def fetch():
    response = requests.get(LISTING_URL, headers=HEADERS, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    cards = soup.select("div.event")
    events = []

    for card in cards:
        link = card.select_one("a[href]")
        title_el = card.select_one(".name strong")
        if not link or not title_el:
            continue

        date_text = _item_text(card, "ri-calendar-todo-fill")
        time_text = _item_text(card, "ri-time-line")
        location_text = _item_text(card, "ri-map-pin-line")

        image_el = card.select_one("img")
        image = image_el.get("src") if image_el else None

        event = normalize_event(
            source_id=SOURCE_ID,
            source_name=SOURCE_NAME,
            title=title_el.get_text(strip=True),
            description="",
            iso_date=parse_numeric_date(date_text),
            time=time_text or "",
            town=TOWN,
            location_name=location_text or "Göreme",
            coordinates=COORDINATES,
            source_url=link.get("href", ""),
            image=image,
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
