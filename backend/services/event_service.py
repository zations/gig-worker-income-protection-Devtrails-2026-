import requests
import random
from datetime import datetime

AQI_API_KEY = "YOUR_AQI_API_KEY"


def detect_event(city: str, zone: str):

    events = []
    signals = {}

    zone = zone.lower()
    hour = datetime.now().hour

    # ---------------------------
    # WEATHER (WITH RAINFALL)
    # ---------------------------
    try:
        url = "https://api.open-meteo.com/v1/forecast?latitude=13.08&longitude=80.27&current_weather=true&hourly=precipitation"
        res = requests.get(url, timeout=3)
        data = res.json()

        temp = data["current_weather"]["temperature"]
        wind = data["current_weather"]["windspeed"]

        # 👇 FIX: extract rainfall
        rainfall = data["hourly"]["precipitation"][0]

        signals["temperature"] = temp
        signals["wind_speed"] = wind
        signals["rainfall"] = rainfall

        # 🌧️ Rain logic
        if rainfall > 5:
            events.append(("heavy_rain", "high"))
        elif rainfall > 1:
            events.append(("light_rain", "medium"))
        else:
            signals["rain_status"] = "no_rain"

        # 🌪️ Wind logic
        if wind > 20:
            events.append(("storm", "high"))

        # 🌡️ Heat logic
        if temp > 35:
            events.append(("heat_wave", "medium"))

    except Exception as e:
        print("Weather API failed:", e)
        signals["temperature"] = "unknown"
        signals["wind_speed"] = "unknown"
        signals["rainfall"] = "unknown"

    # ---------------------------
    # AQI (REAL)
    # ---------------------------
    try:
        url = f"https://api.waqi.info/feed/{city}/?token={AQI_API_KEY}"
        res = requests.get(url, timeout=3)
        data = res.json()

        if data["status"] == "ok":
            aqi = data["data"]["aqi"]
            signals["aqi"] = aqi

            if aqi > 150:
                events.append(("poor_air_quality", "medium"))
            else:
                signals["aqi_status"] = "safe"

    except Exception as e:
        print("AQI API failed:", e)
        signals["aqi"] = "unknown"

    # ---------------------------
    # TRAFFIC
    # ---------------------------
    if 8 <= hour <= 10 or 18 <= hour <= 21:
        events.append(("traffic", "high"))
        signals["traffic"] = "high"
    else:
        signals["traffic"] = "low"

    # ---------------------------
    # DEMAND
    # ---------------------------
    if 12 <= hour <= 14 or 19 <= hour <= 23:
        events.append(("demand", "medium"))
        signals["demand"] = "high"
    else:
        signals["demand"] = "normal"

    # ---------------------------
    # ZONE RISK
    # ---------------------------
    high_risk_zones = ["velachery", "tambaram", "adyar"]

    if zone in high_risk_zones:
        signals["zone_risk"] = "high"
    else:
        signals["zone_risk"] = "low"

    # ---------------------------
    # FINAL EVENT
    # ---------------------------
    if events:
        severity_rank = {"high": 3, "medium": 2, "low": 1}
        main_event = max(events, key=lambda x: severity_rank[x[1]])
    else:
        main_event = ("normal_conditions", "low")

    return {
        "event": main_event[0],
        "severity": main_event[1],
        "all_triggers": events,
        "signals": signals,
        "time": str(datetime.now())
    }