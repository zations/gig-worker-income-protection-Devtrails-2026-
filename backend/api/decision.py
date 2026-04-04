from fastapi import APIRouter
from app.db.database import SessionLocal
from app.db.models import Worker, Policy
from app.services.activity_service import check_activity
from app.services.event_service import detect_event
from app.services.eligibility_service import check_eligibility
from app.services.decision_service import make_decision

router = APIRouter()

@router.get("/decision/{worker_id}")
def get_decision(worker_id: str):
    db = SessionLocal()
    try:
        worker = db.query(Worker).filter_by(worker_id=worker_id).first()
        if not worker:
            return {"error": "Worker not found"}

        policy = db.query(Policy).filter_by(worker_id=worker_id).first()
        activity = check_activity(worker.zone)
        event = detect_event(worker.city, worker.zone)
        eligibility = check_eligibility(policy, activity, event, worker.zone)
        decision = make_decision(eligibility, event, policy) if policy else {
            "approved": False,
            "fraud_score": None,
            "estimated_loss": 0,
            "payout": 0,
            "reason": "No policy found"
        }

        if policy and decision.get("approved"):
            policy.coverage_left = max(0, policy.coverage_left - decision["payout"])
            db.commit()

        return {
            "worker_id": worker_id,
            "worker_zone": worker.zone,
            "event": event,
            "activity": activity,
            "eligibility": eligibility,
            "decision": decision
        }
    finally:
        db.close()