import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getSystemSnapshot,
  postGeoReport,
  postPurchasePolicy,
  postSimulateRainEvent,
  postToggleProtection,
} from '../../services/mockApi';
import { logger } from '../utils/logger';

export type EventType = 'Flood' | 'Protest' | 'Traffic';

export interface PolicyTier {
  id: string;
  name: 'Basic' | 'Standard' | 'Premium';
  monthlyPrice: number;
  deductible: number;
  payoutCap: number;
  summary: string;
}

export interface PayoutActivity {
  id: string;
  amount: number;
  reason: string;
  reasoningTag: string;
  source: string;
  timestamp: string;
}

export interface FraudClearanceReport {
  fraud_score: number;
  location_verified: boolean;
  telemetry_consistency: number;
  checked_at: string;
}

interface SystemSnapshot {
  location: string;
  protectionActive: boolean;
  liveRisk: string;
  dynamicRiskScore: number;
  policyTiers: PolicyTier[];
  payoutHistory: PayoutActivity[];
  lastPayout: PayoutActivity | null;
}

export interface RainEventResult {
  alertTitle: string;
  alertMessage: string;
  payout: PayoutActivity;
  fraudClearanceReport: FraudClearanceReport;
  payoutHistory: PayoutActivity[];
  lastPayout: PayoutActivity;
  liveRisk: string;
}

interface GeoReportPayload {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface SystemStateContextValue {
  location: string;
  protectionActive: boolean;
  liveRisk: string;
  dynamicRiskScore: number;
  policyTiers: PolicyTier[];
  payoutHistory: PayoutActivity[];
  lastPayout: PayoutActivity | null;
  isBootstrapping: boolean;
  isMutating: boolean;
  toggleProtection: (nextActive: boolean) => Promise<void>;
  activatePolicy: (tierId: string) => Promise<string>;
  simulateRainEvent: () => Promise<RainEventResult>;
  submitGeoReport: (
    eventType: EventType,
    payload: GeoReportPayload,
  ) => Promise<string>;
}

const SystemStateContext = createContext<SystemStateContextValue | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export function SystemStateProvider({ children }: ProviderProps) {
  // WHY: A centralized state shape mirrors the single source-of-truth backend that judges and payouts rely on.
  const [location, setLocation] = useState('Velachery, Chennai');
  const [protectionActive, setProtectionActive] = useState(true);
  const [liveRisk, setLiveRisk] = useState('High Flood Risk');
  const [dynamicRiskScore, setDynamicRiskScore] = useState(0.72);
  const [policyTiers, setPolicyTiers] = useState<PolicyTier[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutActivity[]>([]);
  const [lastPayout, setLastPayout] = useState<PayoutActivity | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapState = async () => {
      try {
        const snapshot = (await getSystemSnapshot()) as SystemSnapshot;

        if (!isMounted) {
          return;
        }

        setLocation(snapshot.location);
        setProtectionActive(snapshot.protectionActive);
        setLiveRisk(snapshot.liveRisk);
        setDynamicRiskScore(snapshot.dynamicRiskScore);
        setPolicyTiers(snapshot.policyTiers);
        setPayoutHistory(snapshot.payoutHistory);
        setLastPayout(snapshot.lastPayout);
      } catch (error) {
        logger.warn('Failed to bootstrap mock state.', error);
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapState().catch(error => {
      logger.warn('Unexpected system bootstrap failure.', error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleProtection = useCallback(async (nextActive: boolean) => {
    setIsMutating(true);

    try {
      const response = (await postToggleProtection(nextActive)) as {
        protectionActive: boolean;
      };

      setProtectionActive(response.protectionActive);
    } finally {
      setIsMutating(false);
    }
  }, []);

  const activatePolicy = useCallback(async (tierId: string) => {
    setIsMutating(true);

    try {
      const response = (await postPurchasePolicy(tierId)) as {
        message: string;
        dynamicRiskScore: number;
      };

      setProtectionActive(true);
      setDynamicRiskScore(response.dynamicRiskScore);

      return response.message;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const simulateRainEvent = useCallback(async () => {
    setIsMutating(true);

    try {
      const response = (await postSimulateRainEvent()) as RainEventResult;

      setLiveRisk(response.liveRisk);
      setLastPayout(response.lastPayout);
      setPayoutHistory(response.payoutHistory);

      return response;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const submitGeoReport = useCallback(
    async (eventType: EventType, payload: GeoReportPayload) => {
      setIsMutating(true);

      try {
        const response = (await postGeoReport({
          eventType,
          ...payload,
        })) as {
          referenceId: string;
          liveRisk: string;
        };

        setLiveRisk(response.liveRisk);

        return response.referenceId;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const contextValue = useMemo<SystemStateContextValue>(
    () => ({
      location,
      protectionActive,
      liveRisk,
      dynamicRiskScore,
      policyTiers,
      payoutHistory,
      lastPayout,
      isBootstrapping,
      isMutating,
      toggleProtection,
      activatePolicy,
      simulateRainEvent,
      submitGeoReport,
    }),
    [
      location,
      protectionActive,
      liveRisk,
      dynamicRiskScore,
      policyTiers,
      payoutHistory,
      lastPayout,
      isBootstrapping,
      isMutating,
      toggleProtection,
      activatePolicy,
      simulateRainEvent,
      submitGeoReport,
    ],
  );

  return (
    <SystemStateContext.Provider value={contextValue}>
      {children}
    </SystemStateContext.Provider>
  );
}

export function useSystemState() {
  const context = useContext(SystemStateContext);

  if (!context) {
    throw new Error('useSystemState must be used within SystemStateProvider.');
  }

  return context;
}
