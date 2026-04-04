from fastapi import APIRouter
from app.db.database import SessionLocal
from app.db.models import Policy, Worker
from app.schemas.schemas import PolicyCreate

router = APIRouter()

@router.post("/buy_protection")
def buy_protection(data: PolicyCreate):

    db = SessionLocal()

    worker = db.query(Worker).filter_by(worker_id=data.worker_id).first()

    if not worker:
        return {"error": "Worker not found"}

    if data.plan_type == "basic":
        premium, coverage = 30, 500
    elif data.plan_type == "standard":
        premium, coverage = 50, 1000
    else:
        premium, coverage = 70, 1500

    policy = Policy(
        worker_id=data.worker_id,
        plan_type=data.plan_type,
        premium=premium,
        coverage_cap=coverage,
        coverage_left=coverage,
        active=True
    )

    db.add(policy)
    db.commit()

    return {"message": "Protection activated"}