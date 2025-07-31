interface TerraformModule {
  id: string;
  name: string;
  namespace: string;
  provider: string;
  version: string;
  description?: string;
}

export class TerraformCloudService {
  private baseUrl = 'https://app.terraform.io/api/v2';
  private token: string;

  constructor() {
    this.token = process.env.TERRAFORM_CLOUD_TOKEN || process.env.TF_CLOUD_TOKEN || '';
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/account/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async getModules(): Promise<TerraformModule[]> {
    try {
      if (!this.token) {
        // Return mock modules for development
        return [
          {
            id: 'azure-key-vault',
            name: 'key-vault',
            namespace: 'azure',
            provider: 'azurerm',
            version: '1.0.0',
            description: 'Azure Key Vault module'
          },
          {
            id: 'azure-storage-account',
            name: 'storage-account',
            namespace: 'azure',
            provider: 'azurerm',
            version: '1.0.0',
            description: 'Azure Storage Account module'
          },
          {
            id: 'azure-virtual-network',
            name: 'virtual-network',
            namespace: 'azure',
            provider: 'azurerm',
            version: '1.0.0',
            description: 'Azure Virtual Network module'
          },
        ];
      }

      const response = await fetch(`${this.baseUrl}/modules`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch modules: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((module: any) => ({
        id: module.id,
        name: module.attributes.name,
        namespace: module.attributes.namespace,
        provider: module.attributes.provider,
        version: module.attributes.version,
        description: module.attributes.description,
      }));
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      // Return mock modules as fallback
      return [
        {
          id: 'azure-key-vault',
          name: 'key-vault',
          namespace: 'azure',
          provider: 'azurerm',
          version: '1.0.0',
          description: 'Azure Key Vault module'
        },
        {
          id: 'azure-storage-account',
          name: 'storage-account',
          namespace: 'azure',
          provider: 'azurerm',
          version: '1.0.0',
          description: 'Azure Storage Account module'
        },
      ];
    }
  }

  async createWorkspace(name: string, organization: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/organizations/${organization}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'workspaces',
            attributes: {
              name,
              'auto-apply': false,
              'terraform-version': '1.0.0',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create workspace: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }

  async uploadConfiguration(workspaceId: string, configContent: string): Promise<any> {
    try {
      // This is a simplified version - in production, you'd need to create a tar.gz file
      const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}/configuration-versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'configuration-versions',
            attributes: {
              'auto-queue-runs': false,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload configuration: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload configuration:', error);
      throw error;
    }
  }
}
