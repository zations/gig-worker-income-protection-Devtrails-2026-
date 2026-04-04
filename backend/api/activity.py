from fastapi import APIRouter
from app.services.activity_service import check_activity

router = APIRouter()


@router.get("/check_activity")
def get_activity(zone: str):
    return check_activity(zone)