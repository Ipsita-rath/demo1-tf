// Remote GitHub module configuration and validation
export interface RemoteModuleConfig {
  resourceType: string;
  moduleName: string;
  githubOrg: string;
  repository: string;
  moduleFolder?: string;
  ref: string;
}

// Remote module configurations for Azure resources using GitHub repository
// Note: Resource group modules are excluded to avoid duplicates in test landing zones
export const REMOTE_MODULE_CONFIGS: Record<string, RemoteModuleConfig> = {
  key_vault: {
    resourceType: 'key_vault',
    moduleName: 'key_vault',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/key_vault',
    ref: ''
  },
  container_registry: {
    resourceType: 'container_registry',
    moduleName: 'container_registry',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/container-registry',
    ref: 'main'
  },
  cosmosdb: {
    resourceType: 'cosmosdb',
    moduleName: 'cosmosdb',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/cosmosdb',
    ref: 'main'
  },
  log_analytics: {
    resourceType: 'log_analytics',
    moduleName: 'log_analytics',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/log-analytics',
    ref: 'main'
  },
  application_insights: {
    resourceType: 'application_insights',
    moduleName: 'application_insights',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/application-insights',
    ref: 'main'
  },
  functions: {
    resourceType: 'functions',
    moduleName: 'functions',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/functions',
    ref: 'main'
  },
  event_hub: {
    resourceType: 'event_hub',
    moduleName: 'event_hub',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/event-hub',
    ref: 'main'
  },
  api_management: {
    resourceType: 'api_management',
    moduleName: 'api_management',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/api-management',
    ref: 'main'
  },
  ai_studio: {
    resourceType: 'ai_studio',
    moduleName: 'ai_studio',
    githubOrg: 'mukeshbharathigeakminds',
    repository: 'terraform-azurerm-landing-zone',
    moduleFolder: 'modules/ai-studio',
    ref: 'main'
  }
};

// Generate remote GitHub module source URL
export function generateRemoteModuleSource(config: RemoteModuleConfig): string {
  const modulePath = config.moduleFolder ? `//${config.moduleFolder}` : '';
  const refParam = config.ref ? `?ref=${config.ref}` : '';
  return `git::https://github.com/${config.githubOrg}/${config.repository}.git${modulePath}${refParam}`;
}

// Validate Terraform Cloud token for private module access
export async function validateTerraformCloudToken(token: string): Promise<boolean> {
  // Allow test tokens for demo purposes
  if (token.startsWith('test-token') || token === 'demo-token') {
    console.log('Using test token for demo purposes');
    return true;
  }
  
  try {
    const response = await fetch('https://app.terraform.io/api/v2/account/details', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

// Get private module registry information
export async function getPrivateModuleInfo(token: string, organization: string, moduleName: string, provider: string): Promise<any> {
  try {
    const response = await fetch(`https://app.terraform.io/api/v2/organizations/${organization}/registry-modules/${moduleName}/${provider}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch module info: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch module info:', error);
    throw error;
  }
}

// Generate module call with remote GitHub source
export function generateRemoteModuleCall(resourceType: string, resourceName: string, config: Record<string, any>): string {
  const moduleConfig = REMOTE_MODULE_CONFIGS[resourceType];
  
  if (!moduleConfig) {
    throw new Error(`No remote module configuration found for resource type: ${resourceType}`);
  }

  const source = generateRemoteModuleSource(moduleConfig);
  // Use the moduleName from config instead of sanitized resource name
  const moduleName = moduleConfig.moduleName;
  
  let moduleCall = `module "${moduleName}" {
  source = "${source}"
`;

  // Add configuration variables based on resource type
  const variables = generateModuleVariables(resourceType, config);
  
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        moduleCall += `  ${key} = "${value}"\n`;
      } else if (typeof value === 'boolean') {
        moduleCall += `  ${key} = ${value}\n`;
      } else if (typeof value === 'object') {
        moduleCall += `  ${key} = ${JSON.stringify(value)}\n`;
      } else {
        moduleCall += `  ${key} = ${value}\n`;
      }
    }
  }

  moduleCall += '}';
  
  // Key Vault module doesn't need output blocks in the module call
  // Outputs should be defined separately if needed
  
  return moduleCall;
}

// Generate module variables based on resource type and configuration
function generateModuleVariables(resourceType: string, config: Record<string, any>): Record<string, any> {
  const variables: Record<string, any> = {};

  // Only use configured tags, no default tags
  const userTags = config.tags || {};

  switch (resourceType) {
    case 'azurerm_resource_group':
      variables.name = config.name || 'rg-inid-dev-eastus-01';
      variables.location = config.location || 'East US';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'key_vault':
      variables.location = config.location || 'East US';
      variables.resource_group_name = 'module.resource_group';
      variables.keyvault_name = config.keyvault_name || config.name || 'kv-inid-dev-eastus-01';
      variables.use_hsm = config.use_hsm !== undefined ? config.use_hsm : true;
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      
      // Optional configurations for Key Vault
      if (config.secrets) {
        variables.secrets = config.secrets;
      } else {
        variables.secrets = [
          {
            name: 'my-secret',
            value: 'supersecure'
          }
        ];
      }
      
      if (config.certificates) {
        variables.certificates = config.certificates;
      } else {
        variables.certificates = [
          {
            name: 'my-cert',
            subject: 'CN=myapp.local',
            validity_months: 12
          }
        ];
      }
      break;

    case 'container_registry':
      variables.name = config.name || 'acriniddeveastus001';
      variables.location = config.location || 'East US';
      variables.resource_group_name = 'module.resource_group.rg_name';
      variables.sku = config.sku || 'Basic';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'cosmosdb':
      variables.name = config.name || 'cosmos-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.kind = config.kind || 'GlobalDocumentDB';
      variables.consistency_level = config.consistencyLevel || 'Session';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'log_analytics':
      variables.name = config.name || 'log-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.sku = config.sku || 'PerGB2018';
      variables.retention_in_days = config.retentionInDays || 30;
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'application_insights':
      variables.name = config.name || 'appi-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.application_type = config.applicationType || 'web';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'functions':
      variables.name = config.name || 'func-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.os_type = config.osType || 'Linux';
      variables.sku_name = config.skuName || 'Y1';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'event_hub':
      variables.name = config.name || 'evhns-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.sku = config.sku || 'Standard';
      variables.capacity = config.capacity || 1;
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'api_management':
      variables.name = config.name || 'apim-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.publisher_name = config.publisherName || 'INID';
      variables.publisher_email = config.publisherEmail || 'admin@inid.com';
      variables.sku_name = config.skuName || 'Developer_1';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    case 'ai_studio':
      variables.name = config.name || 'mlw-inid-dev-eastus-001';
      variables.location = config.location || 'East US';
      variables.resource_group = 'module.resource_group.rg_name';
      variables.description = config.description || 'AI Studio workspace';
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;

    // Add more resource types as needed
    default:
      // Generic variable mapping
      Object.keys(config).forEach(key => {
        if (key !== 'resourceGroup' && config[key] !== undefined) {
          variables[key] = config[key];
        }
      });
      if (Object.keys(userTags).length > 0) {
        variables.tags = userTags;
      }
      break;
  }

  return variables;
}