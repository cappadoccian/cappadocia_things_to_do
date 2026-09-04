"""Adapter for NEVÜ (Nevşehir Hacı Bektaş Veli Üniversitesi) events.

https://www.nevsehir.edu.tr/tr/etkinlikler (the site's own "Etkinlikler"
page) is currently an empty table — no rows. The real, actively used
events calendar lives at https://www.nevsehir.edu.tr/tr/ogrenci/etkinlik
(originally built for extracurricular-activity credit tracking), which
carries real title/date/time/venue data — but packed into a Bootstrap
popover's `data-content` HTML attribute rather than plain page text:

    <div class="col-md-4 ogrEtkinlikItem">
      <div class="textBox"><div class="textBoxMain">
        <div class="date"><strong>20</strong><span>May</span></div>
        <p class="ogrEtkinlikText">
          <a id="ogrMenu" data-toggle="popover" title="Event Title"
             data-html="true"
             data-content="<strong>Etkinlik Tarihi :</strong> 20 May 2026 <br>
               <strong> Başlama Zamanı: </strong> 14:00 <br>
               <strong> Bitiş Zamanı: </strong> 16:30 <br>
               <strong> Etkinlik Salonu: </strong> Kültür ve Kongre Merkezi ... <br> ..."
             href="https://www.nevsehir.edu.tr/tr/55848">Event Title</a>
        </p>
        <div class="etkinlikDurum"><i title="TAMAMLANDI"></i></div>
      </div></div>
    </div>

We don't need to special-case the "TAMAMLANDI" (completed) marker —
run_scrapers.py already drops any event whose date is in the past. If the
markup changes, this adapter should fail loudly (raise) so run_scrapers.py
can log it and skip it, rather than silently returning zero events.
"""

import re

import requests
from bs4 import BeautifulSoup

from scraper.schema import normalize_event

SOURCE_ID = "src-6"
SOURCE_NAME = "Nevşehir Hacı Bektaş Veli Üniversitesi (NEVÜ)"
BASE_URL = "https://www.nevsehir.edu.tr"
LISTING_URL = f"{BASE_URL}/tr/ogrenci/etkinlik"

TOWN = "Nevşehir Merkez"
COORDINATES = [38.6285, 34.7180]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; CappadociaEventsBot/1.0; "
        "+https://kapadokya.edu.tr)"
    )
}


def _extract_after_label(data_content, label):
    pattern = rf"{re.escape(label)}\s*:?\s*</strong>\s*([^<]+?)\s*<br"
    match = re.search(pattern, data_content, re.IGNORECASE)
    return match.group(1).strip() if match else None


def fetch():
    response = requests.get(LISTING_URL, headers=HEADERS, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    cards = soup.select("div.ogrEtkinlikItem")
    events = []

    for card in cards:
        link = card.select_one("a[data-content]")
        if not link:
            continue

        data_content = link.get("data-content", "")
        date_text = _extract_after_label(data_content, "Etkinlik Tarihi")
        start_time = _extract_after_label(data_content, "Başlama Zamanı")
        venue = _extract_after_label(data_content, "Etkinlik Salonu")

        event = normalize_event(
            source_id=SOURCE_ID,
            source_name=SOURCE_NAME,
            title=link.get_text(strip=True),
            description="",
            date_text=date_text,
            time=start_time or "",
            town=TOWN,
            location_name=venue or "Nevşehir Hacı Bektaş Veli Üniversitesi",
            coordinates=COORDINATES,
            source_url=link.get("href", ""),
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
