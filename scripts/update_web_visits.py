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
query AuraVisits(
  $account: String!, $today: Time!, $week: Time!, $until: Time!,
  $m0: Time!, $m1: Time!, $m2: Time!, $m3: Time!, $m4: Time!
) {
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
      breakdown7: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $week, datetime_lt: $until}) {
        dimensions { requestHost countryName deviceType userAgentOS }
        sum { visits }
      }
      month0: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $m0, datetime_lt: $m1}) {
        dimensions { requestHost }
        sum { visits }
      }
      month1: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $m1, datetime_lt: $m2}) {
        dimensions { requestHost }
        sum { visits }
      }
      month2: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $m2, datetime_lt: $m3}) {
        dimensions { requestHost }
        sum { visits }
      }
      month3: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $m3, datetime_lt: $m4}) {
        dimensions { requestHost }
        sum { visits }
      }
      month4: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: {datetime_geq: $m4, datetime_lt: $until}) {
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

def audience_breakdown(groups):
    """Aggregate anonymous seven-day visits by three Cloudflare dimensions."""
    if len(groups) >= 1000:
        raise RuntimeError("Limite de grupos de audiencia alcanzado; no publicar totales parciales.")
    mappings = {"countries": "countryName", "devices": "deviceType", "systems": "userAgentOS"}
    totals = {category: {} for category in mappings}
    for group in groups:
        dimensions = group.get("dimensions") or {}
        host = str(dimensions.get("requestHost") or "").lower().rstrip(".")
        if host not in ALLOWED_HOSTS:
            continue
        n = float((group.get("sum") or {}).get("visits") or 0)
        for category, field in mappings.items():
            name = str(dimensions.get(field) or "No identificado").strip() or "No identificado"
            totals[category][name] = totals[category].get(name, 0.0) + n
    return {
        "period_days": 7,
        **{
            category: [
                {"name": name, "visits": int(round(visits))}
                for name, visits in sorted(items.items(), key=lambda pair: (-pair[1], pair[0]))[:15]
                if visits > 0
            ]
            for category, items in totals.items()
        },
    }

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
        "m0": iso_utc(midnight - timedelta(days=29)),
        "m1": iso_utc(midnight - timedelta(days=22)),
        "m2": iso_utc(midnight - timedelta(days=15)),
        "m3": iso_utc(midnight - timedelta(days=8)),
        "m4": iso_utc(midnight - timedelta(days=1)),
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
    for window in ("today", "week", "month0", "month1", "month2", "month3", "month4"):
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
            "days30": sum(metric(data.get("month" + str(i)) or []) for i in range(5)),
        },
        "audience": audience_breakdown(data.get("breakdown7") or []),
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
