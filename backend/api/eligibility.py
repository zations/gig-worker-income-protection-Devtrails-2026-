from fastapi import APIRouter
from app.db.database import SessionLocal
from app.db.models import Worker, Policy
from app.services.activity_service import check_activity
from app.services.event_service import detect_event
from app.services.eligibility_service import check_eligibility

router = APIRouter()

@router.get("/check_eligibility/{worker_id}")
def get_eligibility(worker_id: str):
    db = SessionLocal()
    try:
        worker = db.query(Worker).filter_by(worker_id=worker_id).first()
        if not worker:
            return {"error": "Worker not found"}

        policy = db.query(Policy).filter_by(worker_id=worker_id).first()
        activity = check_activity(worker.zone)
        event = detect_event(worker.city, worker.zone)

        eligibility = check_eligibility(policy, activity, event, worker.zone)

        return {
            "worker_id": worker_id,
            "activity": activity,
            "event": event,
            "eligibility": eligibility
        }
    finally:
        db.close()