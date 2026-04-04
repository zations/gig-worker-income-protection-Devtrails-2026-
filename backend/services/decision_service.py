import random

def make_decision(eligibility: dict, event: dict | None, policy):
    if not eligibility.get("eligible"):
        return {
            "approved": False,
            "fraud_score": None,
            "estimated_loss": 0,
            "payout": 0,
            "reason": eligibility.get("reason")
        }

    fraud_score = round(random.uniform(0.05, 0.35), 2)

    if fraud_score > 0.30:
        return {
            "approved": False,
            "fraud_score": fraud_score,
            "estimated_loss": 0,
            "payout": 0,
            "reason": "High fraud risk"
        }

    base_loss = 150
    if event:
        severity = event.get("severity", "low")
        if severity == "high":
            base_loss = 400
        elif severity == "medium":
            base_loss = 250
        else:
            base_loss = 150

    payout = min(base_loss, policy.coverage_left)

    return {
        "approved": True,
        "fraud_score": fraud_score,
        "estimated_loss": base_loss,
        "payout": payout,
        "reason": "Payout approved"
    }