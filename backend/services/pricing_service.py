from datetime import datetime
import random


def calculate_premium(zone: str, event: dict | None = None):
    zone = zone.lower()

    base_risk_map = {
        "velachery": 0.65,
        "adyar": 0.50,
        "tambaram": 0.40,
        "porur": 0.45,
        "anna nagar": 0.35
    }

    base_risk = base_risk_map.get(zone, 0.30)

    hour = datetime.now().hour
    peak_bonus = 0.10 if 18 <= hour <= 22 else 0.0

    random_factor = random.uniform(-0.05, 0.08)

    event_bonus = 0.0
    signal_bonus = 0.0
    event_name = None

    if event:
        event_name = event.get("event")
        severity = event.get("severity", "low")

        # 🔥 event impact
        if severity == "high":
            event_bonus += 0.20
        elif severity == "medium":
            event_bonus += 0.10
        else:
            event_bonus -= 0.05

        signals = event.get("signals", {})

        # 🌧️ Rain impact
        rainfall = signals.get("rainfall")
        if isinstance(rainfall, (int, float)):
            if rainfall > 5:
                signal_bonus += 0.15
            elif rainfall > 1:
                signal_bonus += 0.08

        # 🌫️ AQI
        aqi = signals.get("aqi")
        if isinstance(aqi, int):
            if aqi > 150:
                signal_bonus += 0.10
            elif aqi < 80:
                signal_bonus -= 0.05

        # 🚦 Traffic
        if signals.get("traffic") == "high":
            signal_bonus += 0.10

        # ⚡ Demand
        if signals.get("demand") == "high":
            signal_bonus += 0.05

        # 📍 Zone
        if signals.get("zone_risk") == "high":
            signal_bonus += 0.05

        # 🌡️ Temperature
        temp = signals.get("temperature")
        if isinstance(temp, (int, float)) and temp > 35:
            signal_bonus += 0.05

    final_risk = base_risk + peak_bonus + random_factor + event_bonus + signal_bonus
    final_risk = max(0.0, min(1.0, final_risk))

    if final_risk < 0.35:
        premium = 30
        suggested_plan = "basic"
    elif final_risk < 0.60:
        premium = 50
        suggested_plan = "standard"
    else:
        premium = 70
        suggested_plan = "premium"

    return {
        "zone": zone,
        "risk_score": round(final_risk, 2),
        "premium": premium,
        "suggested_plan": suggested_plan,
        "event_considered": event_name,
        "signal_impact": round(signal_bonus, 2),
        "peak_hour": 18 <= hour <= 22
    }