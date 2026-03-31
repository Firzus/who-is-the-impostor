import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "onboarding-lobby-seen";

function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markOnboardingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // storage unavailable
  }
}

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (hasSeenOnboarding()) return;

    const timer = setTimeout(() => {
      setDismissed(false);
      setCurrentStep(0);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const totalSteps = 4;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= totalSteps) {
        setTimeout(() => {
          setDismissed(true);
          markOnboardingSeen();
        }, 0);
        return -1;
      }
      return next;
    });
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setCurrentStep(-1);
    markOnboardingSeen();
  }, []);

  const isStepActive = useCallback(
    (step: number) => !dismissed && currentStep === step,
    [dismissed, currentStep],
  );

  return { currentStep, dismissed, nextStep, dismiss, isStepActive, totalSteps };
}
