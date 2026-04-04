const NETWORK_LATENCY = {
  fast: 450,
  normal: 900,
  slow: 1300,
};

const simulateLatency = (payload, latency = NETWORK_LATENCY.normal) =>
  new Promise(resolve => {
    setTimeout(() => {
      // Deep clone keeps each caller isolated, similar to a real API response body.
      resolve(JSON.parse(JSON.stringify(payload)));
    }, latency);
  });

const nowIso = () => new Date().toISOString();

const createPayoutActivity = ({
  amount,
  reason,
  reasoningTag = 'Triggered by: 2hr Rainfall > 50mm',
  minutesAgo = 0,
  source = 'Automated',
}) => {
  const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

  return {
    id: `payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    amount,
    reason,
    reasoningTag,
    source,
    timestamp: createdAt,
  };
};

const serverState = {
  location: 'Velachery, Chennai',
  protectionActive: true,
  liveRisk: 'High Flood Risk',
  dynamicRiskScore: 0.72,
  policyTiers: [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 149,
      deductible: 250,
      payoutCap: 1500,
      summary: 'Entry-level weather interruption cover for short shifts.',
    },
    {
      id: 'standard',
      name: 'Standard',
      monthlyPrice: 249,
      deductible: 150,
      payoutCap: 3000,
      summary: 'Balanced protection with faster auto-approval confidence.',
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 399,
      deductible: 0,
      payoutCap: 6000,
      summary: 'Maximum payout ceiling for high-volatility zones.',
    },
  ],
  payoutHistory: [
    createPayoutActivity({
      amount: 820,
      reason: 'Monsoon delay trigger: Shift interruption auto-settlement',
      reasoningTag: 'Triggered by: 90min Rainfall > 52mm',
      minutesAgo: 38,
    }),
    createPayoutActivity({
      amount: 460,
      reason: 'Route closure payout: Waterlogging alert in Zone 12',
      reasoningTag: 'Triggered by: Flood map overlap + blocked route telemetry',
      minutesAgo: 94,
    }),
  ],
  lastPayout: null,
  locationUpdates: [],
};

serverState.lastPayout = serverState.payoutHistory[0];

// GET: Simulates loading the full dashboard state from backend services.
export async function getSystemSnapshot() {
  return simulateLatency(serverState, NETWORK_LATENCY.slow);
}

// POST: Simulates changing the protection status for the active worker policy.
export async function postToggleProtection(nextActive) {
  serverState.protectionActive = Boolean(nextActive);

  return simulateLatency(
    {
      protectionActive: serverState.protectionActive,
      updatedAt: nowIso(),
    },
    NETWORK_LATENCY.fast,
  );
}

// POST: Simulates policy purchase confirmation and dynamic scoring refresh.
export async function postPurchasePolicy(tierId) {
  const selectedTier = serverState.policyTiers.find(tier => tier.id === tierId);

  if (!selectedTier) {
    throw new Error('Selected policy tier is unavailable.');
  }

  serverState.protectionActive = true;
  serverState.dynamicRiskScore = Math.max(
    0.2,
    Number((serverState.dynamicRiskScore - 0.03).toFixed(2)),
  );

  return simulateLatency(
    {
      status: 'ok',
      message: `${selectedTier.name} protection activated successfully.`,
      tier: selectedTier,
      dynamicRiskScore: serverState.dynamicRiskScore,
    },
    NETWORK_LATENCY.normal,
  );
}

// POST: Simulates a rain event judge that auto-creates a payout decision.
export async function postSimulateRainEvent() {
  const newPayout = createPayoutActivity({
    amount: 980,
    reason: 'Rain Event trigger: AI judge approved immediate compensation',
    reasoningTag: 'Triggered by: 2hr Rainfall > 50mm',
    source: 'Simulation',
  });

  const fraudClearanceReport = {
    fraud_score: 0.02,
    location_verified: true,
    telemetry_consistency: 0.97,
    checked_at: nowIso(),
  };

  serverState.lastPayout = newPayout;
  serverState.liveRisk = 'Severe Rainfall Confirmed';
  serverState.payoutHistory = [newPayout, ...serverState.payoutHistory].slice(0, 8);

  return simulateLatency(
    {
      alertTitle: 'Rain Event Simulated',
      alertMessage: 'Automated payout has been released to the worker wallet.',
      payout: newPayout,
      fraudClearanceReport,
      lastPayout: serverState.lastPayout,
      payoutHistory: serverState.payoutHistory,
      liveRisk: serverState.liveRisk,
    },
    NETWORK_LATENCY.normal,
  );
}

// POST: Simulates passive telemetry ingestion from a worker device.
export async function postLocationUpdate(payload) {
  const update = {
    receivedAt: nowIso(),
    payload,
  };

  serverState.locationUpdates = [update, ...serverState.locationUpdates].slice(0, 20);

  return simulateLatency(
    {
      status: 'received',
      endpoint: '/location_update',
      queuedUpdates: serverState.locationUpdates.length,
      receivedAt: update.receivedAt,
    },
    NETWORK_LATENCY.fast,
  );
}

// POST: Simulates field report ingestion that can influence risk display.
export async function postGeoReport(payload) {
  const eventType = payload?.eventType;

  if (eventType === 'Flood') {
    serverState.liveRisk = 'High Flood Risk';
  } else if (eventType === 'Protest') {
    serverState.liveRisk = 'Medium Mobility Disruption';
  } else {
    serverState.liveRisk = 'Moderate Traffic Slowdown';
  }

  return simulateLatency(
    {
      status: 'received',
      liveRisk: serverState.liveRisk,
      referenceId: `geo_${Date.now()}`,
      receivedAt: nowIso(),
      payload,
    },
    NETWORK_LATENCY.fast,
  );
}
