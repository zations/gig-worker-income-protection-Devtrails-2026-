from fastapi import FastAPI
from app.api import user, policy, pricing, profile, event, activity, eligibility, decision
from app.db.database import Base, engine

app = FastAPI(title="Gig Worker Protection API")

Base.metadata.create_all(bind=engine)

app.include_router(user.router)
app.include_router(policy.router)
app.include_router(pricing.router)
app.include_router(profile.router)
app.include_router(event.router)
app.include_router(activity.router)
app.include_router(eligibility.router)
app.include_router(decision.router)