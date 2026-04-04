from fastapi import APIRouter
from app.db.database import SessionLocal
from app.db.models import Worker, Policy

router = APIRouter()

@router.get("/profile/{worker_id}")
def get_profile(worker_id: str):
    db = SessionLocal()
    try:
        worker = db.query(Worker).filter_by(worker_id=worker_id).first()
        if not worker:
            return {"error": "Worker not found"}

        policy = db.query(Policy).filter_by(worker_id=worker_id).first()

        return {
            "worker": {
                "worker_id": worker.worker_id,
                "name": worker.name,
                "city": worker.city,
                "zone": worker.zone,
                "upi_id": worker.upi_id
            },
            "policy": None if not policy else {
                "plan_type": policy.plan_type,
                "premium": policy.premium,
                "coverage_cap": policy.coverage_cap,
                "coverage_left": policy.coverage_left,
                "active": policy.active
            }
        }
    finally:
        db.close()