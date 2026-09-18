import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/api';

type SettingsContextType = {
  currency: string;
  platformName: string;
};

const SettingsContext = createContext<SettingsContextType>({ currency: 'XOF', platformName: 'Swap' });

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsContextType>({ currency: 'XOF', platformName: 'Swap' });

  useEffect(() => {
    getSettings().then(s => {
      setSettings({
        currency: s.currency || 'XOF',
        platformName: s.platformName || 'Swap'
      });
    }).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
