// Client-side shared storage using browser's persistent storage
export class SharedStorageManager {
  private static instance: SharedStorageManager;
  private storageKey = 'terraform-automation-shared-storage';
  
  private constructor() {}

  public static getInstance(): SharedStorageManager {
    if (!SharedStorageManager.instance) {
      SharedStorageManager.instance = new SharedStorageManager();
    }
    return SharedStorageManager.instance;
  }

  // Store database connection strings
  public async storeConnectionString(key: string, connectionString: string): Promise<void> {
    try {
      const storage = await this.getSharedStorage();
      storage.connectionStrings = storage.connectionStrings || {};
      storage.connectionStrings[key] = connectionString;
      await this.saveSharedStorage(storage);
    } catch (error) {
      console.error('Error storing connection string:', error);
    }
  }

  // Get database connection string
  public async getConnectionString(key: string): Promise<string | null> {
    try {
      const storage = await this.getSharedStorage();
      return storage.connectionStrings?.[key] || null;
    } catch (error) {
      console.error('Error retrieving connection string:', error);
      return null;
    }
  }

  // Store user session data
  public async storeUserSession(sessionData: any): Promise<void> {
    try {
      const storage = await this.getSharedStorage();
      storage.userSession = sessionData;
      await this.saveSharedStorage(storage);
    } catch (error) {
      console.error('Error storing user session:', error);
    }
  }

  // Get user session data
  public async getUserSession(): Promise<any> {
    try {
      const storage = await this.getSharedStorage();
      return storage.userSession || null;
    } catch (error) {
      console.error('Error retrieving user session:', error);
      return null;
    }
  }

  // Store API tokens
  public async storeToken(key: string, token: string): Promise<void> {
    try {
      const storage = await this.getSharedStorage();
      storage.tokens = storage.tokens || {};
      storage.tokens[key] = token;
      await this.saveSharedStorage(storage);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Get API token
  public async getToken(key: string): Promise<string | null> {
    try {
      const storage = await this.getSharedStorage();
      return storage.tokens?.[key] || null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Store Terraform configurations
  public async storeTerraformConfig(configId: string, config: any): Promise<void> {
    try {
      const storage = await this.getSharedStorage();
      storage.terraformConfigs = storage.terraformConfigs || {};
      storage.terraformConfigs[configId] = config;
      await this.saveSharedStorage(storage);
    } catch (error) {
      console.error('Error storing Terraform config:', error);
    }
  }

  // Get Terraform configuration
  public async getTerraformConfig(configId: string): Promise<any> {
    try {
      const storage = await this.getSharedStorage();
      return storage.terraformConfigs?.[configId] || null;
    } catch (error) {
      console.error('Error retrieving Terraform config:', error);
      return null;
    }
  }

  // Get all Terraform configurations
  public async getAllTerraformConfigs(): Promise<any[]> {
    try {
      const storage = await this.getSharedStorage();
      return Object.values(storage.terraformConfigs || {});
    } catch (error) {
      console.error('Error retrieving all Terraform configs:', error);
      return [];
    }
  }

  // Store user preferences
  public async storeUserPreferences(preferences: any): Promise<void> {
    try {
      const storage = await this.getSharedStorage();
      storage.userPreferences = preferences;
      await this.saveSharedStorage(storage);
    } catch (error) {
      console.error('Error storing user preferences:', error);
    }
  }

  // Get user preferences
  public async getUserPreferences(): Promise<any> {
    try {
      const storage = await this.getSharedStorage();
      return storage.userPreferences || {};
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return {};
    }
  }

  // Clear all stored data
  public async clearAllData(): Promise<void> {
    try {
      await this.saveSharedStorage({});
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Delete specific data
  public async deleteData(category: string, key?: string): Promise<void> {
    try {
      const storage = await this.getSharedStorage();
      
      if (key && storage[category]) {
        delete storage[category][key];
      } else {
        delete storage[category];
      }
      
      await this.saveSharedStorage(storage);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }

  // Get all stored data for debugging
  public async getAllData(): Promise<any> {
    try {
      return await this.getSharedStorage();
    } catch (error) {
      console.error('Error retrieving all data:', error);
      return {};
    }
  }

  // Private methods for storage management
  private async getSharedStorage(): Promise<any> {
    try {
      // Try IndexedDB first (most persistent)
      if ('indexedDB' in window) {
        return await this.getFromIndexedDB();
      }
      
      // Fallback to localStorage
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error accessing shared storage:', error);
      return {};
    }
  }

  private async saveSharedStorage(data: any): Promise<void> {
    try {
      // Try IndexedDB first
      if ('indexedDB' in window) {
        await this.saveToIndexedDB(data);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to shared storage:', error);
    }
  }

  private async getFromIndexedDB(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TerraformAutomationDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['storage'], 'readonly');
        const store = transaction.objectStore('storage');
        const getRequest = store.get(this.storageKey);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || {});
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage', { keyPath: 'key' });
        }
      };
    });
  }

  private async saveToIndexedDB(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TerraformAutomationDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['storage'], 'readwrite');
        const store = transaction.objectStore('storage');
        const putRequest = store.put({
          key: this.storageKey,
          data: data,
          timestamp: new Date().toISOString()
        });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage', { keyPath: 'key' });
        }
      };
    });
  }
}

export const sharedStorageManager = SharedStorageManager.getInstance();