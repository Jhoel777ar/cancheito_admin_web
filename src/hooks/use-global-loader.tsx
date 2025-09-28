
"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type GlobalLoaderContextType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  showLoader: () => void;
  hideLoader: () => void;
};

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = useCallback(() => setIsLoading(true), []);
  const hideLoader = useCallback(() => setIsLoading(false), []);

  const value = useMemo(() => ({
    isLoading,
    setIsLoading,
    showLoader,
    hideLoader,
  }), [isLoading, showLoader, hideLoader]);

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider');
  }
  return context;
}
