import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../utils/api';
import { setTimezone as setFormatTimezone } from '../utils/format';

const TimezoneContext = createContext();

export function TimezoneProvider({ children }) {
  const [timezone, setTimezoneState] = useState('UTC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimezone = async () => {
      try {
        const response = await getSettings();
        const tz = response.data.data.timezone || 'UTC';
        setTimezoneState(tz);
        setFormatTimezone(tz);
      } catch (error) {
        console.error('Failed to load timezone setting:', error);
        setTimezoneState('UTC');
        setFormatTimezone('UTC');
      } finally {
        setLoading(false);
      }
    };

    loadTimezone();
  }, []);

  const setTimezone = (tz) => {
    setTimezoneState(tz);
    setFormatTimezone(tz);
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, loading }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within TimezoneProvider');
  }
  return context;
}
