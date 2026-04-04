from sqlalchemy import Column, String, Integer, Boolean
from .database import Base

class Worker(Base):
    __tablename__ = "workers"

    worker_id = Column(String, primary_key=True)
    name = Column(String)
    city = Column(String)
    zone = Column(String)
    upi_id = Column(String)


class Policy(Base):
    __tablename__ = "policies"

    worker_id = Column(String, primary_key=True)
    plan_type = Column(String)
    premium = Column(Integer)
    coverage_cap = Column(Integer)
    coverage_left = Column(Integer)
    active = Column(Boolean)