import { storage } from './storage';
import type { InsertSecureStorage } from '@shared/schema';

export class SecureStorageManager {
  private static instance: SecureStorageManager;

  private constructor() {}

  public static getInstance(): SecureStorageManager {
    if (!SecureStorageManager.instance) {
      SecureStorageManager.instance = new SecureStorageManager();
    }
    return SecureStorageManager.instance;
  }

  // Store Terraform Cloud token securely
  public async storeTerraformCloudToken(userId: number, token: string): Promise<boolean> {
    try {
      const data: InsertSecureStorage = {
        userId,
        key: 'terraform_cloud_token',
        encryptedValue: token,
        type: 'token',
        description: 'Terraform Cloud API token for infrastructure deployment',
      };

      await storage.storeSecureData(data);

      // Log the secure storage event
      await storage.logAuditEvent({
        userId,
        action: 'terraform_cloud_token_stored',
        details: { type: 'token', description: 'Terraform Cloud API token' },
        ipAddress: null,
        userAgent: null,
      });

      return true;
    } catch (error) {
      console.error('Error storing Terraform Cloud token:', error);
      return false;
    }
  }

  // Retrieve Terraform Cloud token
  public async getTerraformCloudToken(userId: number): Promise<string | null> {
    try {
      const token = await storage.getSecureData(userId, 'terraform_cloud_token');
      return token || null;
    } catch (error) {
      console.error('Error retrieving Terraform Cloud token:', error);
      return null;
    }
  }

  // Store Azure connection string securely
  public async storeAzureConnectionString(userId: number, connectionString: string): Promise<boolean> {
    try {
      const data: InsertSecureStorage = {
        userId,
        key: 'azure_connection_string',
        encryptedValue: connectionString,
        type: 'connection_string',
        description: 'Azure service connection string for resource management',
      };

      await storage.storeSecureData(data);

      // Log the secure storage event
      await storage.logAuditEvent({
        userId,
        action: 'azure_connection_string_stored',
        details: { type: 'connection_string', description: 'Azure connection string' },
        ipAddress: null,
        userAgent: null,
      });

      return true;
    } catch (error) {
      console.error('Error storing Azure connection string:', error);
      return false;
    }
  }

  // Retrieve Azure connection string
  public async getAzureConnectionString(userId: number): Promise<string | null> {
    try {
      const connectionString = await storage.getSecureData(userId, 'azure_connection_string');
      return connectionString || null;
    } catch (error) {
      console.error('Error retrieving Azure connection string:', error);
      return null;
    }
  }

  // Store generic API key
  public async storeApiKey(userId: number, keyName: string, apiKey: string, description?: string): Promise<boolean> {
    try {
      const data: InsertSecureStorage = {
        userId,
        key: keyName,
        encryptedValue: apiKey,
        type: 'api_key',
        description: description || `API key for ${keyName}`,
      };

      await storage.storeSecureData(data);

      // Log the secure storage event
      await storage.logAuditEvent({
        userId,
        action: 'api_key_stored',
        details: { keyName, type: 'api_key' },
        ipAddress: null,
        userAgent: null,
      });

      return true;
    } catch (error) {
      console.error('Error storing API key:', error);
      return false;
    }
  }

  // Retrieve API key
  public async getApiKey(userId: number, keyName: string): Promise<string | null> {
    try {
      const apiKey = await storage.getSecureData(userId, keyName);
      return apiKey || null;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  // List all stored keys for a user
  public async listStoredKeys(userId: number): Promise<string[]> {
    try {
      return await storage.listSecureDataKeys(userId);
    } catch (error) {
      console.error('Error listing stored keys:', error);
      return [];
    }
  }

  // Delete stored data
  public async deleteStoredData(userId: number, keyName: string): Promise<boolean> {
    try {
      const success = await storage.deleteSecureData(userId, keyName);

      if (success) {
        // Log the deletion event
        await storage.logAuditEvent({
          userId,
          action: 'secure_data_deleted',
          details: { keyName },
          ipAddress: null,
          userAgent: null,
        });
      }

      return success;
    } catch (error) {
      console.error('Error deleting stored data:', error);
      return false;
    }
  }

  // Update stored data
  public async updateStoredData(userId: number, keyName: string, newValue: string): Promise<boolean> {
    try {
      const success = await storage.updateSecureData(userId, keyName, newValue);

      if (success) {
        // Log the update event
        await storage.logAuditEvent({
          userId,
          action: 'secure_data_updated',
          details: { keyName },
          ipAddress: null,
          userAgent: null,
        });
      }

      return success;
    } catch (error) {
      console.error('Error updating stored data:', error);
      return false;
    }
  }
}

export const secureStorageManager = SecureStorageManager.getInstance();