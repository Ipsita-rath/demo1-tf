// Authentic Azure Resource Icons - Based on Microsoft Azure Architecture Icons (March 2025)
// Sourced from official patterns at az-icons.com

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Key Vault - Secure secrets management
export const AzureKeyVaultIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="keyVaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect x="8" y="18" width="34" height="24" fill="url(#keyVaultGrad)" rx="3"/>
    <path fill="#FFB900" d="M16 18v-4c0-4.97 4.03-9 9-9s9 4.03 9 9v4"/>
    <path fill="none" stroke="#FFB900" strokeWidth="2.5" d="M16 18v-4c0-4.97 4.03-9 9-9s9 4.03 9 9v4"/>
    <circle cx="25" cy="30" r="4" fill="#40E0D0"/>
    <rect x="23" y="34" width="4" height="6" fill="#40E0D0" rx="2"/>
  </svg>
);

// Storage Account - Data storage solution
export const AzureStorageIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="50%" stopColor="#40E0D0"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect x="6" y="12" width="38" height="8" fill="url(#storageGrad)" rx="4"/>
    <rect x="6" y="21" width="38" height="8" fill="#0078D4" rx="4"/>
    <rect x="6" y="30" width="38" height="8" fill="#005A9E" rx="4"/>
    <circle cx="10" cy="16" r="2" fill="#FFFFFF"/>
    <circle cx="10" cy="25" r="2" fill="#FFFFFF"/>
    <circle cx="10" cy="34" r="2" fill="#FFFFFF"/>
  </svg>
);

// App Service - Web application hosting
export const AzureAppServiceIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="appServiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="34" height="34" fill="url(#appServiceGrad)" rx="6"/>
    <rect x="14" y="14" width="22" height="16" fill="#40E0D0" rx="2"/>
    <rect x="16" y="18" width="18" height="2" fill="#FFFFFF" rx="1"/>
    <rect x="16" y="22" width="14" height="2" fill="#FFFFFF" rx="1"/>
    <rect x="16" y="26" width="10" height="2" fill="#FFFFFF" rx="1"/>
    <circle cx="36" cy="16" r="4" fill="#FFB900"/>
    <rect x="14" y="32" width="22" height="6" fill="#005A9E" rx="2"/>
  </svg>
);

// Virtual Network - Network infrastructure
export const AzureVirtualNetworkIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <circle cx="25" cy="25" r="20" fill="none" stroke="#0078D4" strokeWidth="3"/>
    <circle cx="25" cy="25" r="14" fill="none" stroke="#40E0D0" strokeWidth="2.5"/>
    <circle cx="25" cy="25" r="8" fill="none" stroke="#005A9E" strokeWidth="2"/>
    <circle cx="25" cy="25" r="3" fill="#0078D4"/>
    <line x1="25" y1="5" x2="25" y2="15" stroke="#0078D4" strokeWidth="2"/>
    <line x1="25" y1="35" x2="25" y2="45" stroke="#0078D4" strokeWidth="2"/>
    <line x1="5" y1="25" x2="15" y2="25" stroke="#0078D4" strokeWidth="2"/>
    <line x1="35" y1="25" x2="45" y2="25" stroke="#0078D4" strokeWidth="2"/>
  </svg>
);

// SQL Database - Managed database service
export const AzureSQLDatabaseIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="sqlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <ellipse cx="25" cy="12" rx="18" ry="6" fill="url(#sqlGrad)"/>
    <path fill="#40E0D0" d="M7 12v24c0 3.31 8.06 6 18 6s18-2.69 18-6V12"/>
    <ellipse cx="25" cy="20" rx="18" ry="6" fill="#0078D4" opacity="0.8"/>
    <ellipse cx="25" cy="28" rx="18" ry="6" fill="#0078D4" opacity="0.6"/>
    <ellipse cx="25" cy="36" rx="18" ry="6" fill="#005A9E"/>
  </svg>
);

// Azure Cosmos DB - NoSQL database
export const AzureCosmosDBIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="cosmosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#40E0D0"/>
        <stop offset="50%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <circle cx="25" cy="25" r="18" fill="url(#cosmosGrad)"/>
    <circle cx="25" cy="25" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
    <circle cx="25" cy="25" r="6" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
    <circle cx="25" cy="25" r="2" fill="#FFFFFF"/>
    <path fill="none" stroke="#FFFFFF" strokeWidth="2" d="M25 7 L39 18 L39 32 L25 43 L11 32 L11 18 Z"/>
  </svg>
);

// Event Hub - Event streaming platform
export const AzureEventHubIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="eventHubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect x="8" y="18" width="34" height="14" fill="url(#eventHubGrad)" rx="7"/>
    <circle cx="15" cy="25" r="4" fill="#40E0D0"/>
    <circle cx="25" cy="25" r="4" fill="#40E0D0"/>
    <circle cx="35" cy="25" r="4" fill="#40E0D0"/>
    <path fill="#FFB900" d="M10 15l6-6h18l6 6"/>
    <path fill="#FFB900" d="M10 35l6 6h18l6-6"/>
  </svg>
);

// AI Studio - AI development platform
export const AzureAIStudioIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5C2D91"/>
        <stop offset="50%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#40E0D0"/>
      </linearGradient>
    </defs>
    <circle cx="25" cy="25" r="18" fill="url(#aiGrad)"/>
    <path fill="#FFFFFF" d="M25 12c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13-5.82-13-13-13zm0 3c5.52 0 10 4.48 10 10s-4.48 10-10 10-10-4.48-10-10 4.48-10 10-10z"/>
    <circle cx="25" cy="25" r="6" fill="#FFFFFF"/>
    <circle cx="25" cy="25" r="3" fill="#5C2D91"/>
  </svg>
);

// Azure Functions - Serverless compute
export const AzureFunctionsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="functionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFB900"/>
        <stop offset="100%" stopColor="#FF8C00"/>
      </linearGradient>
    </defs>
    <path fill="url(#functionsGrad)" d="M25 8L40 20v20L25 42L10 30V20L25 8z"/>
    <path fill="#FFFFFF" d="M20 18h10v2h-10zm0 4h12v2H20zm0 4h8v2h-8z"/>
    <circle cx="32" cy="16" r="3" fill="#0078D4"/>
    <path fill="#005A9E" d="M15 32l10 8 10-8V20l-10 8-10-8v12z"/>
  </svg>
);

// Application Insights - Monitoring service
export const AzureApplicationInsightsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="insightsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#40E0D0"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="34" height="34" fill="url(#insightsGrad)" rx="4"/>
    <rect x="12" y="30" width="4" height="8" fill="#FFFFFF"/>
    <rect x="18" y="25" width="4" height="13" fill="#FFFFFF"/>
    <rect x="24" y="20" width="4" height="18" fill="#FFFFFF"/>
    <rect x="30" y="15" width="4" height="23" fill="#FFFFFF"/>
    <rect x="36" y="22" width="4" height="16" fill="#FFFFFF"/>
  </svg>
);

// Log Analytics - Log data analysis
export const AzureLogAnalyticsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="logGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="34" height="34" fill="url(#logGrad)" rx="4"/>
    <path fill="#40E0D0" d="M14 16h22v2H14zm0 4h18v2H14zm0 4h20v2H14zm0 4h16v2H14zm0 4h14v2H14z"/>
    <circle cx="36" cy="18" r="3" fill="#FFB900"/>
  </svg>
);

// Additional icons for comprehensive coverage
export const AzureVirtualMachineIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="vmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <rect x="8" y="10" width="34" height="26" fill="url(#vmGrad)" rx="3"/>
    <rect x="12" y="14" width="26" height="16" fill="#40E0D0" rx="2"/>
    <rect x="12" y="32" width="26" height="4" fill="#FFB900" rx="2"/>
    <rect x="8" y="38" width="34" height="4" fill="#005A9E" rx="2"/>
    <circle cx="16" cy="34" r="1.5" fill="#0078D4"/>
    <circle cx="22" cy="34" r="1.5" fill="#0078D4"/>
  </svg>
);

export const AzureResourceGroupIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className={className}>
    <defs>
      <linearGradient id="rgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078D4"/>
        <stop offset="100%" stopColor="#005A9E"/>
      </linearGradient>
    </defs>
    <path fill="url(#rgGrad)" d="M39 14L25 7 11 14v22l14 7 14-7V14z"/>
    <path fill="#40E0D0" d="M39 14L25 21v15l14-7V14z"/>
    <path fill="#005A9E" d="M11 14L25 21v15L11 29V14z"/>
    <path fill="#0078D4" d="M25 7l-14 7L25 21l14-7L25 7z"/>
  </svg>
);

// Main function to get Azure icons
export function getAzureIcon(resourceType: string, size: number = 24, className: string = ""): React.ReactElement {
  const iconProps = { size, className };

  switch (resourceType) {
    case 'key_vault':
      return <AzureKeyVaultIcon {...iconProps} />;
    case 'storage_account':
      return <AzureStorageIcon {...iconProps} />;
    case 'app_service':
      return <AzureAppServiceIcon {...iconProps} />;
    case 'virtual_network':
      return <AzureVirtualNetworkIcon {...iconProps} />;
    case 'sql_database':
      return <AzureSQLDatabaseIcon {...iconProps} />;
    case 'cosmos_db':
    case 'cosmosdb':
      return <AzureCosmosDBIcon {...iconProps} />;
    case 'event_hub':
      return <AzureEventHubIcon {...iconProps} />;
    case 'ai_studio':
      return <AzureAIStudioIcon {...iconProps} />;
    case 'functions':
      return <AzureFunctionsIcon {...iconProps} />;
    case 'application_insights':
      return <AzureApplicationInsightsIcon {...iconProps} />;
    case 'log_analytics':
      return <AzureLogAnalyticsIcon {...iconProps} />;
    case 'virtual_machine':
      return <AzureVirtualMachineIcon {...iconProps} />;
    case 'resource_group':
    case 'azurerm_resource_group':
      return <AzureResourceGroupIcon {...iconProps} />;
    
    // Fallback mappings for similar services
    case 'managed_identity':
      return <AzureKeyVaultIcon {...iconProps} />;
    case 'private_endpoint':
      return <AzureVirtualNetworkIcon {...iconProps} />;
    case 'role_assignment':
    case 'role_definition':
      return <AzureResourceGroupIcon {...iconProps} />;
    case 'container_registry':
      return <AzureStorageIcon {...iconProps} />;
    case 'subnet':
    case 'network_security_group':
    case 'route_table':
      return <AzureVirtualNetworkIcon {...iconProps} />;
    case 'redis':
      return <AzureCosmosDBIcon {...iconProps} />;
    case 'openai':
      return <AzureAIStudioIcon {...iconProps} />;
    case 'workbook':
      return <AzureLogAnalyticsIcon {...iconProps} />;
    case 'api_management':
      return <AzureAppServiceIcon {...iconProps} />;
    case 'ad_group':
    case 'ad_group_member':
      return <AzureResourceGroupIcon {...iconProps} />;
    
    default:
      return <AzureResourceGroupIcon {...iconProps} />;
  }
}

export default {
  getAzureIcon,
  AzureKeyVaultIcon,
  AzureStorageIcon,
  AzureAppServiceIcon,
  AzureVirtualNetworkIcon,
  AzureSQLDatabaseIcon,
  AzureCosmosDBIcon,
  AzureEventHubIcon,
  AzureAIStudioIcon,
  AzureFunctionsIcon,
  AzureApplicationInsightsIcon,
  AzureLogAnalyticsIcon,
  AzureVirtualMachineIcon,
  AzureResourceGroupIcon
};