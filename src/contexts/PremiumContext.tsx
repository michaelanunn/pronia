"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PremiumContextType {
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialStartDate: Date | null;
  hasUsedTrial: boolean;
  startTrial: () => void;
  upgradeToPremium: () => void;
  openPaywall: () => void;
  closePaywall: () => void;
  isPaywallOpen: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const TRIAL_DURATION_DAYS = 3;
const STORAGE_KEY = "pronia_premium_status";

interface StoredPremiumData {
  isPremium: boolean;
  trialStartDate: string | null;
  hasUsedTrial: boolean;
}

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Load stored data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredPremiumData = JSON.parse(stored);
      setIsPremium(data.isPremium);
      setTrialStartDate(data.trialStartDate ? new Date(data.trialStartDate) : null);
      setHasUsedTrial(data.hasUsedTrial);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const data: StoredPremiumData = {
      isPremium,
      trialStartDate: trialStartDate?.toISOString() || null,
      hasUsedTrial,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [isPremium, trialStartDate, hasUsedTrial]);

  // Calculate trial status
  const calculateTrialStatus = () => {
    if (!trialStartDate) return { isActive: false, daysRemaining: 0 };
    
    const now = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
    
    const timeDiff = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return {
      isActive: daysRemaining > 0,
      daysRemaining: Math.max(0, daysRemaining),
    };
  };

  const { isActive: isTrialActive, daysRemaining: trialDaysRemaining } = calculateTrialStatus();

  const startTrial = () => {
    if (!hasUsedTrial) {
      setTrialStartDate(new Date());
      setHasUsedTrial(true);
    }
  };

  const upgradeToPremium = () => {
    setIsPremium(true);
    setIsPaywallOpen(false);
  };

  const openPaywall = () => setIsPaywallOpen(true);
  const closePaywall = () => setIsPaywallOpen(false);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isTrialActive,
        trialDaysRemaining,
        trialStartDate,
        hasUsedTrial,
        startTrial,
        upgradeToPremium,
        openPaywall,
        closePaywall,
        isPaywallOpen,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
};

