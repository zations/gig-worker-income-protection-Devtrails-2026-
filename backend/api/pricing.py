from fastapi import APIRouter
from app.services.pricing_service import calculate_premium
from app.services.event_service import detect_event

router = APIRouter()

@router.get("/weekly_premium")
def weekly_premium(zone: str, city: str):
    event = detect_event(city, zone)
    return calculate_premium(zone, event)