// Simple types for in-memory storage (no database dependency)
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TerraformConfiguration {
  id: number;
  userId: number;
  name: string;
  description?: string;
  resources: any[];
  variables: Record<string, any>;
  outputs: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  
  // Terraform configurations (the main functionality)
  getTerraformConfiguration(id: number): Promise<TerraformConfiguration | undefined>;
  getTerraformConfigurations(userId?: number): Promise<TerraformConfiguration[]>;
  createTerraformConfiguration(config: Partial<TerraformConfiguration>): Promise<TerraformConfiguration>;
  updateTerraformConfiguration(id: number, config: Partial<TerraformConfiguration>): Promise<TerraformConfiguration | undefined>;
  deleteTerraformConfiguration(id: number): Promise<boolean>;
  
  // Simple settings storage
  getSetting(key: string): Promise<any>;
  setSetting(key: string, value: any): Promise<boolean>;
}

// Simple memory storage - no database complexity
export class SimpleMemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private terraformConfigurations: Map<number, TerraformConfiguration> = new Map();
  private settings: Map<string, any> = new Map();
  
  private nextUserId = 1;
  private nextConfigId = 1;

  // User management (basic)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      username: userData.username || 'user',
      email: userData.email || '',
      password: userData.password || '',
      role: userData.role || 'user',
      company: userData.company,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Terraform configurations (main focus)
  async getTerraformConfiguration(id: number): Promise<TerraformConfiguration | undefined> {
    return this.terraformConfigurations.get(id);
  }

  async getTerraformConfigurations(userId?: number): Promise<TerraformConfiguration[]> {
    const configs = Array.from(this.terraformConfigurations.values());
    if (userId) {
      return configs.filter(config => config.userId === userId);
    }
    return configs;
  }

  async createTerraformConfiguration(config: Partial<TerraformConfiguration>): Promise<TerraformConfiguration> {
    const newConfig: TerraformConfiguration = {
      id: this.nextConfigId++,
      userId: config.userId || 1,
      name: config.name || 'Untitled Configuration',
      description: config.description,
      resources: config.resources || [],
      variables: config.variables || {},
      outputs: config.outputs || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.terraformConfigurations.set(newConfig.id, newConfig);
    return newConfig;
  }

  async updateTerraformConfiguration(id: number, config: Partial<TerraformConfiguration>): Promise<TerraformConfiguration | undefined> {
    const existingConfig = this.terraformConfigurations.get(id);
    if (!existingConfig) return undefined;

    const updatedConfig = { ...existingConfig, ...config, updatedAt: new Date() };
    this.terraformConfigurations.set(id, updatedConfig);
    return updatedConfig;
  }

  async deleteTerraformConfiguration(id: number): Promise<boolean> {
    return this.terraformConfigurations.delete(id);
  }

  // Simple settings
  async getSetting(key: string): Promise<any> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: any): Promise<boolean> {
    this.settings.set(key, value);
    return true;
  }
}

// Use simple memory storage - exactly what you wanted
export const storage = new SimpleMemoryStorage();
