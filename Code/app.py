from fastapi import FastAPI
import random

app = FastAPI()

workers = {}

# onboarding
@app.post("/onboard")
def onboard(worker_id: str, zone: str):
    workers[worker_id] = {
        "zone": zone,
        "premium_paid": False,
        "active": True
    }
    return {"message": "Worker onboarded"}

# weekly protection purchase
@app.post("/buy_protection")
def buy_protection(worker_id: str):
    workers[worker_id]["premium_paid"] = True
    return {"message": "Protection activated"}

# simulate disruption event
@app.get("/detect_event")
def detect_event(zone: str):

    rain_probability = random.random()

    if rain_probability > 0.6:
        return {
            "event": "heavy_rain",
            "zone": zone,
            "severity": "high"
        }

    return {"event": "none"}

# payout calculation
@app.get("/calculate_payout")
def calculate_payout(worker_id: str):

    worker = workers.get(worker_id)

    if not worker:
        return {"error": "worker not found"}

    if not worker["premium_paid"]:
        return {"message": "No protection active"}

    # simulate impact estimation
    loss = random.randint(200,1000)

    if loss < 200:
        payout = 100
    elif loss < 500:
        payout = 250
    elif loss < 1000:
        payout = 450
    else:
        payout = 700

    return {
        "estimated_loss": loss,
        "payout": payout
    }