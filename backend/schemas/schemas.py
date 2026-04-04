from pydantic import BaseModel

class WorkerCreate(BaseModel):
    worker_id: str
    name: str
    city: str
    zone: str
    upi_id: str


class PolicyCreate(BaseModel):
    worker_id: str
    plan_type: str