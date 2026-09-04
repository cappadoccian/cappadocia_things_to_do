"""Runs every registered source adapter and writes the combined result to
public/scraped-events.json + public/scraped-meta.json, which the frontend
fetches at runtime (see src/services/eventsApi.js).

Usage:
    python -m scraper.run_scrapers
"""

import json
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

from scraper.adapters.kun_events import ADAPTER as KUN_ADAPTER

ADAPTERS = [KUN_ADAPTER]

REPO_ROOT = Path(__file__).resolve().parent.parent
EVENTS_OUTPUT = REPO_ROOT / "public" / "scraped-events.json"
META_OUTPUT = REPO_ROOT / "public" / "scraped-meta.json"


def run():
    all_events = []
    source_results = []

    for adapter in ADAPTERS:
        try:
            events = adapter["fetch"]()
            source_results.append({
                "id": adapter["id"],
                "name": adapter["name"],
                "status": "ok",
                "itemsCount": len(events),
            })
            all_events.extend(events)
            print(f"[ok] {adapter['name']}: {len(events)} etkinlik")
        except Exception as exc:  # noqa: BLE001 - one bad source shouldn't kill the run
            source_results.append({
                "id": adapter["id"],
                "name": adapter["name"],
                "status": "error",
                "itemsCount": 0,
                "error": str(exc),
            })
            print(f"[error] {adapter['name']}: {exc}", file=sys.stderr)
            traceback.print_exc()

    EVENTS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    EVENTS_OUTPUT.write_text(
        json.dumps(all_events, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    meta = {
        "lastRunAt": datetime.now(timezone.utc).isoformat(),
        "totalEvents": len(all_events),
        "sources": source_results,
    }
    META_OUTPUT.write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\nToplam {len(all_events)} etkinlik yazıldı -> {EVENTS_OUTPUT}")


if __name__ == "__main__":
    run()
