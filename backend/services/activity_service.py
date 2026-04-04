import requests
from datetime import datetime
import random

# ---------------------------
# NOMINATIM REVERSE GEOCODE
# ---------------------------
def reverse_geocode(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"

        headers = {
            "User-Agent": "gig-worker-insurance-app"
        }

        res = requests.get(url, headers=headers, timeout=3)
        data = res.json()

        address = data.get("address", {})

        # ---------------------------
        # MAP TO CLUSTERS
        # ---------------------------
        if "restaurant" in str(address).lower() or "amenity" in address:
            return "restaurant"

        elif (
            "residential" in str(address).lower()
            or "suburb" in address
            or "neighbourhood" in address
        ):
            return "residential"

        elif "commercial" in str(address).lower():
            return "commercial"

        return "idle"

    except:
        return "idle"


# ---------------------------
# SIMULATE GPS PATH
# ---------------------------
def simulate_gps_path():
    """
    Simulate realistic movement across Chennai
    """

    base_points = [
        (12.9756, 80.2206),  # Velachery
        (13.0068, 80.2572),  # Adyar
        (13.0417, 80.2339),  # T Nagar
    ]

    path = []

    for lat, lon in base_points:
        lat_variation = lat + random.uniform(-0.002, 0.002)
        lon_variation = lon + random.uniform(-0.002, 0.002)

        path.append((lat_variation, lon_variation))

    return path


# ---------------------------
# PATTERN DETECTION
# ---------------------------
def detect_delivery_pattern(sequence):
    """
    Improved realistic activity detection
    """

    restaurant_count = sequence.count("restaurant")
    residential_count = sequence.count("residential")
    idle_count = sequence.count("idle")

    # ✅ Case 1: Movement between pickup & delivery zones
    if restaurant_count >= 1 and residential_count >= 1:
        return True

    # ✅ Case 2: Mostly idle → not active
    if idle_count >= len(sequence) - 1:
        return False

    # ✅ Case 3: Same location repeated (no movement)
    if restaurant_count == len(sequence) or residential_count == len(sequence):
        return False

    return False

# ---------------------------
# MAIN ACTIVITY FUNCTION
# ---------------------------
def check_activity(zone: str):

    gps_points = simulate_gps_path()

    cluster_sequence = []

    for lat, lon in gps_points:
        cluster = reverse_geocode(lat, lon)
        cluster_sequence.append(cluster)

    is_active = detect_delivery_pattern(cluster_sequence)

    return {
        "zone": zone,
        "gps_points": gps_points,
        "cluster_sequence": cluster_sequence,
        "is_active": is_active,
        "activity_type": "delivery" if is_active else "idle",
        "checked_at": str(datetime.now())
    }