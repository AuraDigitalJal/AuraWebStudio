#!/usr/bin/env python3
"""Resumen de visitas de la web comercial Aura Digital desde Cloudflare RUM.

Este script se ejecuta en GitHub Actions. No publica tokens ni datos individuales.
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

API = "https://api.cloudflare.com/client/v4/graphql"
ALLOWED_HOSTS = {"auradigitaljal.com", "www.auradigitaljal.com"}
TIMEZONE = ZoneInfo("America/Mexico_City")
REPORT_PATH = Path("analytics/visitas.json")

# Consultamos por dominio: el token publico del beacon y el siteTag interno
# de la API de RUM pueden ser diferentes.
QUERY = """
query AuraVisits($account: String!, $today: Time!, $week: Time!, $month: Time!, $until: Time!) {
  viewer {
    accounts(filter: {accountTag: $account}) {
      today: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $today, datetime_lt: $until}) {
        dimensions { requestHost }
        sum { visits }
      }
      week: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $week, datetime_lt: $until}) {
        dimensions { requestHost }
        sum { visits }
      }
      month: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $month, datetime_lt: $until}) {
        dimensions { requestHost }
        sum { visits }
      }
    }
  }
}
"""

def iso_utc(dt):
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def metric(groups):
    if len(groups) >= 1000:
        raise RuntimeError("Limite de grupos alcanzado: no publicar cifras incompletas.")
    return int(round(sum(
        float(group.get("sum", {}).get("visits") or 0)
        for group in groups
        if str(group.get("dimensions", {}).get("requestHost", "")).lower().rstrip(".") in ALLOWED_HOSTS
    )))

def main():
    token = os.getenv("CF_ANALYTICS_TOKEN", "").strip()
    account = os.getenv("CF_ACCOUNT_ID", "").strip()
    if not token or not account:
        raise RuntimeError("Configura los secretos CF_ANALYTICS_TOKEN y CF_ACCOUNT_ID en GitHub Actions.")

    now = datetime.now(timezone.utc)
    midnight = now.astimezone(TIMEZONE).replace(hour=0, minute=0, second=0, microsecond=0)
    values = {
        "account": account,
        "today": iso_utc(midnight),
        "week": iso_utc(midnight - timedelta(days=6)),
        "month": iso_utc(midnight - timedelta(days=29)),
        "until": iso_utc(now + timedelta(seconds=1)),
    }
    req = Request(API,
        data=json.dumps({"query": QUERY, "variables": values}).encode("utf-8"),
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json", "User-Agent": "AuraDigitalWebStudio/1.0"},
        method="POST")
    with urlopen(req, timeout=30) as resp:
        result = json.load(resp)
    if result.get("errors"):
        raise RuntimeError("Cloudflare GraphQL: " + json.dumps(result["errors"], ensure_ascii=False)[:1200])
    accounts = (((result.get("data") or {}).get("viewer") or {}).get("accounts") or [])
    if not accounts:
        raise RuntimeError("Cloudflare no devolvio la cuenta. Verifica el ID y el permiso Account Analytics Read.")
    data = accounts[0]
    for window in ("today", "week", "month"):
        groups = data.get(window) or []
        print("VERIFICACION", window, "grupos:", len(groups), "visitas de sitio comercial:", metric(groups))
    summary = {
        "source": "Cloudflare Web Analytics",
        "host": "auradigitaljal.com",
        "timezone": "America/Mexico_City",
        "updated_at": iso_utc(now),
        "visits": {
            "today": metric(data.get("today") or []),
            "days7": metric(data.get("week") or []),
            "days30": metric(data.get("month") or []),
        },
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Visitas actualizadas", summary["visits"])

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("ERROR:", exc, file=sys.stderr)
        sys.exit(1)
