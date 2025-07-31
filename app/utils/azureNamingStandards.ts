// Azure Resource Naming Standards and Validation
export interface NamingRule {
  resource: string;
  shortCode: string;
  rules: string;
  minLength: number;
  maxLength: number;
  allowHyphens: boolean;
  lowercaseOnly: boolean;
  alphanumericOnly: boolean;
  specialFormat?: boolean;
}

export const AZURE_NAMING_RULES: Record<string, NamingRule> = {
  key_vault: {
    resource: "Key Vault",
    shortCode: "kv",
    rules: "3–24 chars, lowercase only, alphanumeric, no dashes",
    minLength: 3,
    maxLength: 24,
    allowHyphens: false,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  managed_identity: {
    resource: "Managed Identity",
    shortCode: "mi",
    rules: "1–128 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 128,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  private_endpoint: {
    resource: "Private Endpoint",
    shortCode: "pe",
    rules: "1–80 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 80,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  role_assignment: {
    resource: "Role Assignment",
    shortCode: "ra",
    rules: "No name required (ID-based)",
    minLength: 1,
    maxLength: 128,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  role_definition: {
    resource: "Role Definition",
    shortCode: "rd",
    rules: "No name required (GUID only)",
    minLength: 1,
    maxLength: 128,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  ad_group: {
    resource: "Azure AD Group",
    shortCode: "aadg",
    rules: "1–256 chars, letters/numbers/specials allowed",
    minLength: 1,
    maxLength: 256,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: false
  },
  ad_group_member: {
    resource: "AD Group Member",
    shortCode: "aadgm",
    rules: "Not named directly",
    minLength: 1,
    maxLength: 128,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  storage_account: {
    resource: "Storage Account",
    shortCode: "st",
    rules: "3–24 chars, lowercase only, no dashes, alphanumeric only",
    minLength: 3,
    maxLength: 24,
    allowHyphens: false,
    lowercaseOnly: true,
    alphanumericOnly: true,
    specialFormat: true
  },
  container_registry: {
    resource: "Container Registry",
    shortCode: "acr",
    rules: "5–50 chars, lowercase, no dashes",
    minLength: 5,
    maxLength: 50,
    allowHyphens: false,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  virtual_network: {
    resource: "Virtual Network",
    shortCode: "vnet",
    rules: "1–64 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 64,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  subnet: {
    resource: "Subnet",
    shortCode: "snet",
    rules: "1–80 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 80,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  network_security_group: {
    resource: "Network Security Group",
    shortCode: "nsg",
    rules: "1–80 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 80,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  route_table: {
    resource: "Route Table",
    shortCode: "rt",
    rules: "1–80 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 80,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  app_service: {
    resource: "App Service",
    shortCode: "app",
    rules: "2–60 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 2,
    maxLength: 60,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  functions: {
    resource: "Function App",
    shortCode: "func",
    rules: "1–60 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 60,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  sql_database: {
    resource: "SQL Database",
    shortCode: "sql",
    rules: "1–128 chars, alphanumeric only",
    minLength: 1,
    maxLength: 128,
    allowHyphens: false,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  cosmos_db: {
    resource: "Cosmos DB",
    shortCode: "cosmos",
    rules: "3–44 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 3,
    maxLength: 44,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  cosmosdb: {
    resource: "Cosmos DB",
    shortCode: "cosmos",
    rules: "3–44 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 3,
    maxLength: 44,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  redis: {
    resource: "Redis Cache",
    shortCode: "redis",
    rules: "1–63 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 63,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  ai_studio: {
    resource: "AI Studio",
    shortCode: "ai",
    rules: "1–80 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 80,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  openai: {
    resource: "OpenAI",
    shortCode: "openai",
    rules: "1–64 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 64,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  application_insights: {
    resource: "Application Insights",
    shortCode: "appi",
    rules: "1–256 chars, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 256,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  log_analytics: {
    resource: "Log Analytics Workspace",
    shortCode: "log",
    rules: "4–63 chars, alphanumeric, hyphens allowed",
    minLength: 4,
    maxLength: 63,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: true
  },
  workbook: {
    resource: "Azure Workbooks",
    shortCode: "wb",
    rules: "Friendly name only",
    minLength: 1,
    maxLength: 256,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: false
  },
  api_management: {
    resource: "API Management",
    shortCode: "apim",
    rules: "1–50 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 50,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  event_hub: {
    resource: "Event Hub",
    shortCode: "eh",
    rules: "1–50 chars, lowercase, alphanumeric, hyphens allowed",
    minLength: 1,
    maxLength: 50,
    allowHyphens: true,
    lowercaseOnly: true,
    alphanumericOnly: true
  },
  resource_group: {
    resource: "Resource Group",
    shortCode: "rg",
    rules: "1–90 chars, letters/numbers/underscores/periods/hyphens/parentheses, cannot end with period",
    minLength: 1,
    maxLength: 90,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: false
  },
  azurerm_resource_group: {
    resource: "Resource Group",
    shortCode: "rg",
    rules: "1–90 chars, letters/numbers/underscores/periods/hyphens/parentheses, cannot end with period",
    minLength: 1,
    maxLength: 90,
    allowHyphens: true,
    lowercaseOnly: false,
    alphanumericOnly: false
  }
};

export interface GlobalConfig {
  projectCode: string;
  environment: string;
  region: string;
}

export function generateSuggestedName(
  resourceType: string, 
  instanceNumber: number = 1,
  globalConfig: GlobalConfig = { projectCode: 'inid', environment: 'dev', region: 'eastus' }
): string {
  const rule = AZURE_NAMING_RULES[resourceType];
  if (!rule) {
    return `${resourceType}-${instanceNumber.toString().padStart(2, '0')}`;
  }

  const { shortCode, specialFormat } = rule;
  const { projectCode, environment, region } = globalConfig;
  const instanceStr = instanceNumber.toString().padStart(2, '0');

  // Special case for storage account
  if (resourceType === 'storage_account' || specialFormat) {
    return `${shortCode}${projectCode}${environment}${instanceStr}`;
  }

  // Standard naming convention
  return `${shortCode}-${projectCode}-${environment}-${region}-${instanceStr}`;
}

export function validateAzureName(resourceType: string, name: string): { isValid: boolean; errors: string[] } {
  const rule = AZURE_NAMING_RULES[resourceType];
  if (!rule) {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];
  const { minLength, maxLength, allowHyphens, lowercaseOnly, alphanumericOnly } = rule;

  // Length validation
  if (name.length < minLength) {
    errors.push(`Name must be at least ${minLength} characters long`);
  }
  if (name.length > maxLength) {
    errors.push(`Name must be no more than ${maxLength} characters long`);
  }

  // Lowercase validation
  if (lowercaseOnly && name !== name.toLowerCase()) {
    errors.push('Name must be lowercase only');
  }

  // Hyphen validation
  if (!allowHyphens && name.includes('-')) {
    errors.push('Hyphens are not allowed in this resource name');
  }

  // Alphanumeric validation
  if (alphanumericOnly) {
    const allowedPattern = allowHyphens ? /^[a-zA-Z0-9-]+$/ : /^[a-zA-Z0-9]+$/;
    if (!allowedPattern.test(name)) {
      errors.push('Name can only contain letters, numbers' + (allowHyphens ? ', and hyphens' : ''));
    }
  }

  // Special validations for specific resources
  if (resourceType === 'resource_group' && name.endsWith('.')) {
    errors.push('Resource group name cannot end with a period');
  }

  // Storage account specific validation
  if (resourceType === 'storage_account') {
    if (!/^[a-z0-9]+$/.test(name)) {
      errors.push('Storage account name can only contain lowercase letters and numbers');
    }
  }

  // Container registry specific validation
  if (resourceType === 'container_registry') {
    if (!/^[a-z0-9]+$/.test(name)) {
      errors.push('Container registry name can only contain lowercase letters and numbers');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getResourceDisplayName(resourceType: string): string {
  const rule = AZURE_NAMING_RULES[resourceType];
  return rule ? rule.resource : resourceType;
}

export function getResourceShortCode(resourceType: string): string {
  const rule = AZURE_NAMING_RULES[resourceType];
  return rule ? rule.shortCode : resourceType.substring(0, 3);
}