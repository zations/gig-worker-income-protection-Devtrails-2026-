from fastapi import APIRouter
from app.services.event_service import detect_event

router = APIRouter()

@router.get("/detect_event")
def get_event(city: str, zone: str):
    event = detect_event(city, zone)

    if event:
        return {"event_detected": True, "data": event}

    return {"event_detected": False, "data": None}