import { useState, useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  cooldownMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  cooldownUntil: number | null;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxAttempts, windowMs, cooldownMs } = config;
  
  const stateRef = useRef<RateLimitState>({
    attempts: 0,
    windowStart: Date.now(),
    cooldownUntil: null,
  });
  
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearCooldownInterval = useCallback(() => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  }, []);

  const startCooldownTimer = useCallback((endTime: number) => {
    clearCooldownInterval();
    
    const updateCooldown = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setCooldownRemaining(remaining);
      
      if (remaining <= 0) {
        clearCooldownInterval();
        stateRef.current.cooldownUntil = null;
        stateRef.current.attempts = 0;
        stateRef.current.windowStart = Date.now();
        setRemainingAttempts(maxAttempts);
      }
    };
    
    updateCooldown();
    cooldownIntervalRef.current = setInterval(updateCooldown, 1000);
  }, [clearCooldownInterval, maxAttempts]);

  const checkRateLimit = useCallback((): { allowed: boolean; waitTime: number } => {
    const now = Date.now();
    const state = stateRef.current;
    
    // Check if in cooldown
    if (state.cooldownUntil && now < state.cooldownUntil) {
      return { allowed: false, waitTime: state.cooldownUntil - now };
    }
    
    // Reset window if expired
    if (now - state.windowStart > windowMs) {
      state.attempts = 0;
      state.windowStart = now;
      state.cooldownUntil = null;
      setRemainingAttempts(maxAttempts);
    }
    
    // Check if limit reached
    if (state.attempts >= maxAttempts) {
      const cooldownEnd = now + cooldownMs;
      state.cooldownUntil = cooldownEnd;
      startCooldownTimer(cooldownEnd);
      return { allowed: false, waitTime: cooldownMs };
    }
    
    return { allowed: true, waitTime: 0 };
  }, [windowMs, maxAttempts, cooldownMs, startCooldownTimer]);

  const recordAttempt = useCallback(() => {
    const state = stateRef.current;
    state.attempts++;
    const remaining = Math.max(0, maxAttempts - state.attempts);
    setRemainingAttempts(remaining);
    
    // If we've hit the limit, start cooldown
    if (state.attempts >= maxAttempts) {
      const cooldownEnd = Date.now() + cooldownMs;
      state.cooldownUntil = cooldownEnd;
      startCooldownTimer(cooldownEnd);
    }
  }, [maxAttempts, cooldownMs, startCooldownTimer]);

  const reset = useCallback(() => {
    clearCooldownInterval();
    stateRef.current = {
      attempts: 0,
      windowStart: Date.now(),
      cooldownUntil: null,
    };
    setRemainingAttempts(maxAttempts);
    setCooldownRemaining(0);
  }, [clearCooldownInterval, maxAttempts]);

  return {
    checkRateLimit,
    recordAttempt,
    reset,
    remainingAttempts,
    cooldownRemaining,
    isInCooldown: cooldownRemaining > 0,
  };
};

// Format cooldown time for display
export const formatCooldown = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) {
    return `${seconds} сек.`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} мин.`;
  }
  return `${minutes} мин. ${remainingSeconds} сек.`;
};
