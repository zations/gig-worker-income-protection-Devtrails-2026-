def check_eligibility(policy, activity: dict, event: dict | None, worker_zone: str):
    if not policy:
        return {
            "eligible": False,
            "reason": "No policy found"
        }

    if not policy.active:
        return {
            "eligible": False,
            "reason": "Policy inactive"
        }

    if policy.coverage_left <= 0:
        return {
            "eligible": False,
            "reason": "No coverage left"
        }

    if not activity.get("is_active"):
        return {
            "eligible": False,
            "reason": "Worker not active"
        }

    if not event:
        return {
            "eligible": False,
            "reason": "No disruptive event detected"
        }

    if event.get("affected_zone", "").lower() != worker_zone.lower():
        return {
            "eligible": False,
            "reason": "Worker not in affected zone"
        }

    return {
        "eligible": True,
        "reason": "Worker qualifies for protection"
    }