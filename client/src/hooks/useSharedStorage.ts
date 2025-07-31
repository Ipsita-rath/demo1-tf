import { useState, useEffect } from 'react';
import { sharedStorageManager } from '@/utils/sharedStorage';

// Hook for managing connection strings
export function useConnectionString(key: string) {
  const [connectionString, setConnectionString] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConnectionString = async () => {
      try {
        const stored = await sharedStorageManager.getConnectionString(key);
        setConnectionString(stored);
      } catch (error) {
        console.error('Error loading connection string:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConnectionString();
  }, [key]);

  const updateConnectionString = async (newConnectionString: string) => {
    try {
      await sharedStorageManager.storeConnectionString(key, newConnectionString);
      setConnectionString(newConnectionString);
    } catch (error) {
      console.error('Error updating connection string:', error);
    }
  };

  return { connectionString, updateConnectionString, loading };
}

// Hook for managing user session
export function useUserSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await sharedStorageManager.getUserSession();
        setSession(stored);
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const updateSession = async (sessionData: any) => {
    try {
      await sharedStorageManager.storeUserSession(sessionData);
      setSession(sessionData);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const clearSession = async () => {
    try {
      await sharedStorageManager.storeUserSession(null);
      setSession(null);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return { session, updateSession, clearSession, loading };
}

// Hook for managing API tokens
export function useToken(key: string) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await sharedStorageManager.getToken(key);
        setToken(stored);
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, [key]);

  const updateToken = async (newToken: string) => {
    try {
      await sharedStorageManager.storeToken(key, newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Error updating token:', error);
    }
  };

  const clearToken = async () => {
    try {
      await sharedStorageManager.deleteData('tokens', key);
      setToken(null);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  };

  return { token, updateToken, clearToken, loading };
}

// Hook for managing Terraform configurations
export function useTerraformConfigs() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const stored = await sharedStorageManager.getAllTerraformConfigs();
        setConfigs(stored);
      } catch (error) {
        console.error('Error loading Terraform configs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const saveConfig = async (configId: string, config: any) => {
    try {
      await sharedStorageManager.storeTerraformConfig(configId, config);
      const updated = await sharedStorageManager.getAllTerraformConfigs();
      setConfigs(updated);
    } catch (error) {
      console.error('Error saving Terraform config:', error);
    }
  };

  const deleteConfig = async (configId: string) => {
    try {
      await sharedStorageManager.deleteData('terraformConfigs', configId);
      const updated = await sharedStorageManager.getAllTerraformConfigs();
      setConfigs(updated);
    } catch (error) {
      console.error('Error deleting Terraform config:', error);
    }
  };

  return { configs, saveConfig, deleteConfig, loading };
}

// Hook for managing user preferences
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await sharedStorageManager.getUserPreferences();
        setPreferences(stored);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const updatePreferences = async (newPreferences: any) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      await sharedStorageManager.storeUserPreferences(updated);
      setPreferences(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return { preferences, updatePreferences, loading };
}