from fastapi import APIRouter
from app.db.database import SessionLocal
from app.db.models import Worker
from app.schemas.schemas import WorkerCreate

router = APIRouter()

@router.post("/onboard")
def onboard(worker: WorkerCreate):
    db = SessionLocal()
    try:
        existing = db.query(Worker).filter_by(worker_id=worker.worker_id).first()
        if existing:
            return {"error": "Worker already exists"}

        new_worker = Worker(**worker.dict())
        db.add(new_worker)
        db.commit()

        return {"message": "Worker onboarded"}
    finally:
        db.close()