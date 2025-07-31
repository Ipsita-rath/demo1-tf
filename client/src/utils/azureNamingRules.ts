/**
 * Azure-compliant naming rules and validation utilities
 * Based on official Azure naming conventions and requirements
 */

export interface NamingRule {
  minLength: number;
  maxLength: number;
  allowedChars: RegExp;
  caseSensitive: boolean;
  globallyUnique: boolean;
  cannotStartWith?: string[];
  cannotEndWith?: string[];
  cannotContain?: string[];
  additionalRules?: string[];
}

export const AZURE_NAMING_RULES: Record<string, NamingRule> = {
  // Subscription naming rules
  subscription: {
    minLength: 1,
    maxLength: 64,
    allowedChars: /^[a-zA-Z0-9\s\-_.()]+$/,
    caseSensitive: false,
    globallyUnique: false,
    cannotEndWith: ['.'],
    additionalRules: [
      'Can contain letters, numbers, spaces, hyphens, underscores, parentheses, and periods',
      'Cannot end with a period'
    ]
  },

  // Resource Group naming rules
  resource_group: {
    minLength: 1,
    maxLength: 90,
    allowedChars: /^[a-zA-Z0-9\-_.()]+$/,
    caseSensitive: false,
    globallyUnique: false,
    cannotEndWith: ['.'],
    additionalRules: [
      'Can contain letters, numbers, underscores, parentheses, hyphens, and periods',
      'Cannot end with a period',
      'Case insensitive'
    ]
  },

  // Storage Account naming rules (strictest)
  storage_account: {
    minLength: 3,
    maxLength: 24,
    allowedChars: /^[a-z0-9]+$/,
    caseSensitive: true,
    globallyUnique: true,
    additionalRules: [
      'Only lowercase letters and numbers',
      'Must be globally unique across all Azure',
      'No special characters allowed'
    ]
  },

  // Key Vault naming rules - Updated to match Azure specifications
  key_vault: {
    minLength: 3,
    maxLength: 24,
    allowedChars: /^[a-z0-9]+$/,
    caseSensitive: true,
    globallyUnique: true,
    additionalRules: [
      'Only lowercase letters and numbers',
      'No hyphens, underscores, or special characters allowed',
      'Must be globally unique across all Azure',
      'Must be globally unique'
    ]
  },

  // Virtual Machine naming rules
  virtual_machine: {
    minLength: 1,
    maxLength: 15, // Windows VM limit (Linux can be up to 64)
    allowedChars: /^[a-zA-Z0-9\-]+$/,
    caseSensitive: false,
    globallyUnique: false,
    cannotStartWith: ['-'],
    cannotEndWith: ['-'],
    cannotContain: ['--'],
    additionalRules: [
      'Letters, numbers, and hyphens only',
      'Cannot start or end with hyphen',
      'No consecutive hyphens',
      'Windows VMs: 1-15 characters, Linux VMs: 1-64 characters'
    ]
  },

  // Virtual Network naming rules
  virtual_network: {
    minLength: 2,
    maxLength: 64,
    allowedChars: /^[a-zA-Z0-9\-_.]+$/,
    caseSensitive: false,
    globallyUnique: false,
    cannotStartWith: ['-', '_'],
    cannotEndWith: ['-', '_', '.'],
    additionalRules: [
      'Letters, numbers, hyphens, underscores, and periods',
      'Cannot start with hyphen or underscore',
      'Cannot end with hyphen, underscore, or period'
    ]
  },

  // SQL Database naming rules
  sql_database: {
    minLength: 1,
    maxLength: 128,
    allowedChars: /^[a-zA-Z0-9\-_]+$/,
    caseSensitive: false,
    globallyUnique: false,
    cannotStartWith: ['-', '_'],
    cannotEndWith: ['-', '_'],
    cannotContain: ['\\', '/', '"', "'", '<', '>', '*', '%', '&', ':', '|', '?'],
    additionalRules: [
      'Letters, numbers, hyphens, and underscores',
      'Cannot start or end with hyphen or underscore',
      'Cannot contain special characters like \\, /, ", \', <, >, *, %, &, :, |, ?'
    ]
  },

  // App Service naming rules
  app_service: {
    minLength: 2,
    maxLength: 60,
    allowedChars: /^[a-zA-Z0-9\-]+$/,
    caseSensitive: false,
    globallyUnique: true,
    cannotStartWith: ['-'],
    cannotEndWith: ['-'],
    cannotContain: ['--'],
    additionalRules: [
      'Letters, numbers, and hyphens only',
      'Cannot start or end with hyphen',
      'No consecutive hyphens',
      'Must be globally unique'
    ]
  },

  // Azure Functions naming rules
  functions: {
    minLength: 2,
    maxLength: 60,
    allowedChars: /^[a-zA-Z0-9\-]+$/,
    caseSensitive: false,
    globallyUnique: true,
    cannotStartWith: ['-'],
    cannotEndWith: ['-'],
    cannotContain: ['--'],
    additionalRules: [
      'Letters, numbers, and hyphens only',
      'Cannot start or end with hyphen',
      'No consecutive hyphens',
      'Must be globally unique'
    ]
  },

  // Container Registry naming rules
  container_registry: {
    minLength: 5,
    maxLength: 50,
    allowedChars: /^[a-zA-Z0-9]+$/,
    caseSensitive: false,
    globallyUnique: true,
    additionalRules: [
      'Only alphanumeric characters',
      'Must be globally unique',
      'No special characters allowed'
    ]
  },

  // Cosmos DB naming rules
  cosmos_db: {
    minLength: 3,
    maxLength: 44,
    allowedChars: /^[a-zA-Z0-9\-]+$/,
    caseSensitive: false,
    globallyUnique: true,
    cannotStartWith: ['-'],
    cannotEndWith: ['-'],
    cannotContain: ['--'],
    additionalRules: [
      'Letters, numbers, and hyphens only',
      'Cannot start or end with hyphen',
      'No consecutive hyphens',
      'Must be globally unique'
    ]
  },

  // Redis Cache naming rules
  redis_cache: {
    minLength: 1,
    maxLength: 63,
    allowedChars: /^[a-zA-Z0-9\-]+$/,
    caseSensitive: false,
    globallyUnique: true,
    cannotStartWith: ['-'],
    cannotEndWith: ['-'],
    cannotContain: ['--'],
    additionalRules: [
      'Letters, numbers, and hyphens only',
      'Cannot start or end with hyphen',
      'No consecutive hyphens',
      'Must be globally unique'
    ]
  },

  // Default rule for other resources
  default: {
    minLength: 1,
    maxLength: 64,
    allowedChars: /^[a-zA-Z0-9\-_]+$/,
    caseSensitive: false,
    globallyUnique: false,
    cannotStartWith: ['-', '_'],
    cannotEndWith: ['-', '_'],
    additionalRules: [
      'Letters, numbers, hyphens, and underscores',
      'Cannot start or end with hyphen or underscore'
    ]
  }
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAzureName(name: string, resourceType: string): ValidationResult {
  const rule = AZURE_NAMING_RULES[resourceType] || AZURE_NAMING_RULES.default;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check length
  if (name.length < rule.minLength) {
    errors.push(`Name must be at least ${rule.minLength} character(s) long`);
  }
  if (name.length > rule.maxLength) {
    errors.push(`Name cannot exceed ${rule.maxLength} characters`);
  }

  // Check allowed characters
  if (!rule.allowedChars.test(name)) {
    errors.push(`Name contains invalid characters. ${rule.additionalRules?.[0] || 'Check allowed characters'}`);
  }

  // Check case sensitivity for storage accounts
  if (resourceType === 'storage_account' && name !== name.toLowerCase()) {
    errors.push('Storage account names must be lowercase');
  }

  // Check start restrictions
  if (rule.cannotStartWith) {
    for (const prefix of rule.cannotStartWith) {
      if (name.startsWith(prefix)) {
        errors.push(`Name cannot start with "${prefix}"`);
      }
    }
  }

  // Check end restrictions
  if (rule.cannotEndWith) {
    for (const suffix of rule.cannotEndWith) {
      if (name.endsWith(suffix)) {
        errors.push(`Name cannot end with "${suffix}"`);
      }
    }
  }

  // Check forbidden substrings
  if (rule.cannotContain) {
    for (const forbidden of rule.cannotContain) {
      if (name.includes(forbidden)) {
        errors.push(`Name cannot contain "${forbidden}"`);
      }
    }
  }

  // Add warnings for globally unique resources
  if (rule.globallyUnique && errors.length === 0) {
    if (resourceType === 'key_vault') {
      warnings.push('Key Vault names must be globally unique across all Azure (like domain names)');
    } else if (resourceType === 'storage_account') {
      warnings.push('Storage Account names must be globally unique across all Azure');
    } else if (resourceType === 'container_registry') {
      warnings.push('Container Registry names must be globally unique across all Azure');
    } else if (resourceType === 'cosmos_db') {
      warnings.push('Cosmos DB names must be globally unique across all Azure');
    } else if (resourceType === 'redis_cache') {
      warnings.push('Redis Cache names must be globally unique across all Azure');
    } else {
      warnings.push('This resource name must be globally unique across all Azure');
    }
  } else if (errors.length === 0 && name.length > 0) {
    warnings.push('This resource name must be unique within its resource group');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getResourceNamingRule(resourceType: string): NamingRule {
  return AZURE_NAMING_RULES[resourceType] || AZURE_NAMING_RULES.default;
}

export function generateSuggestedName(resourceType: string, baseName: string): string {
  const rule = getResourceNamingRule(resourceType);
  let suggestedName = baseName;

  // Apply case rules
  if (resourceType === 'storage_account') {
    suggestedName = suggestedName.toLowerCase();
  }

  // Remove invalid characters
  suggestedName = suggestedName.replace(/[^a-zA-Z0-9\-_.()]/g, '');

  // Handle specific resource type rules
  switch (resourceType) {
    case 'storage_account':
      suggestedName = suggestedName.replace(/[^a-z0-9]/g, '');
      break;
    case 'key_vault':
    case 'virtual_machine':
    case 'app_service':
    case 'functions':
    case 'cosmos_db':
    case 'redis_cache':
      suggestedName = suggestedName.replace(/[^a-zA-Z0-9\-]/g, '');
      break;
    case 'container_registry':
      suggestedName = suggestedName.replace(/[^a-zA-Z0-9]/g, '');
      break;
  }

  // Ensure length constraints
  if (suggestedName.length > rule.maxLength) {
    suggestedName = suggestedName.substring(0, rule.maxLength);
  }

  // Ensure minimum length
  if (suggestedName.length < rule.minLength) {
    suggestedName = suggestedName.padEnd(rule.minLength, '1');
  }

  // Remove forbidden start/end characters
  if (rule.cannotStartWith) {
    for (const prefix of rule.cannotStartWith) {
      while (suggestedName.startsWith(prefix)) {
        suggestedName = suggestedName.substring(1);
      }
    }
  }

  if (rule.cannotEndWith) {
    for (const suffix of rule.cannotEndWith) {
      while (suggestedName.endsWith(suffix)) {
        suggestedName = suggestedName.substring(0, suggestedName.length - 1);
      }
    }
  }

  return suggestedName;
}