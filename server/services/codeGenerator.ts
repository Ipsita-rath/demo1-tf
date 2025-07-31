import { 
  TERRAFORM_PROVIDER_TEMPLATE, 
  RESOURCE_GROUP_TEMPLATE, 
  KEY_VAULT_TEMPLATE,
  STORAGE_ACCOUNT_TEMPLATE,
  VIRTUAL_NETWORK_TEMPLATE,
  SUBNET_TEMPLATE,
  NETWORK_SECURITY_GROUP_TEMPLATE,
  VIRTUAL_MACHINE_TEMPLATE,
  APP_SERVICE_TEMPLATE,
  SQL_DATABASE_TEMPLATE,
  AI_STUDIO_TEMPLATE,
  API_MANAGEMENT_TEMPLATE,
  APPLICATION_INSIGHTS_TEMPLATE,
  CONTAINER_REGISTRY_TEMPLATE,
  COSMOS_DB_TEMPLATE,
  EVENT_HUB_TEMPLATE,
  FUNCTIONS_TEMPLATE,
  LOG_ANALYTICS_TEMPLATE,
  MANAGED_IDENTITY_TEMPLATE,
  OPENAI_TEMPLATE,
  PRIVATE_ENDPOINT_TEMPLATE,
  REDIS_TEMPLATE,
  ROUTE_TABLE_TEMPLATE,
  ROLE_ASSIGNMENT_TEMPLATE,
  ROLE_DEFINITION_TEMPLATE,
  WORKBOOK_TEMPLATE,
  AD_GROUP_TEMPLATE,
  AD_GROUP_MEMBER_TEMPLATE,
  ROLE_ASSIGNMENT_WITH_GROUP_TEMPLATE
} from '../utils/templates';
import { 
  generateRemoteModuleCall, 
  REMOTE_MODULE_CONFIGS,
  validateTerraformCloudToken
} from './privateModules';

interface TerraformResource {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  dependencies?: string[];
}

// export async function generateTerraformCodeWithValidation(
//   resources: TerraformResource[],
//   terraformToken?: string,
//   globalConfig?: any,
//   selectedLandingZoneId?: string // Added this to filter 2 resources
// ): Promise<{ code: string; useRemoteModules: boolean; tokenValid: boolean }> {


  
//   let code = TERRAFORM_PROVIDER_TEMPLATE;

//   const isTestLandingZone = globalConfig?.landingZoneId === 'test_landing_zone';


// const cleanResources = isTestLandingZone    // Filter role_definition and both role_assignment types
//   ? resources.filter(r =>
//       r.type !== 'role_definition' &&
//       r.type !== 'role_assignment' &&
//       r.type !== 'azurerm_role_assignment'
//     )
//   : resources;


  
//   // Find resource group configuration from the input resources
//   const resourceGroupResource = cleanResources.find(resource => resource.type === 'resource_group');
  

  
//   // Filter out resource groups from the input (we'll add our own standard one)
//   const filteredResources = cleanResources.filter(resource => resource.type !== 'azurerm_resource_group' && resource.type !== 'resource_group');
  
//   // Add the standard resource group module if we have any resources that need it
//   if (filteredResources.length > 0 || resourceGroupResource) {
//     code += '\n\n' + generateStandardResourceGroupModule(resourceGroupResource, globalConfig);
//   }
  
//   // Generate code for all other resources
//   for (const resource of filteredResources) {
//     const resourceCode = generateResourceCode(resource, useRemoteModules, globalConfig);
//     if (resourceCode) {
//       code += '\n\n' + resourceCode;
//     }
//   }
  
//   return code;
// }
export async function generateTerraformCodeWithValidation(
  resources: TerraformResource[],
  terraformToken?: string,
  globalConfig?: any,
  selectedLandingZoneId?: string
): Promise<{ code: string; useRemoteModules: boolean; tokenValid: boolean }> {
  const useRemoteModules = true;
  let tokenValid = false;

  if (terraformToken) {
    try {
      console.log('Validating token:', terraformToken);
      tokenValid = await validateTerraformCloudToken(terraformToken);
      console.log('Token validation result:', { tokenValid });
    } catch (error) {
      console.error('Token validation failed:', error);
    }
  }

  const isTestLandingZone = globalConfig?.landingZoneId === 'test_landing_zone';

  const cleanResources = isTestLandingZone
    ? resources.filter(r =>
        r.type !== 'role_definition' &&
        r.type !== 'role_assignment' &&
        r.type !== 'azurerm_role_assignment'
      )
    : resources;

  // Separate resources into regular and VNet resource groups
  const regularResourceGroups = cleanResources.filter(resource => 
    resource.type === 'resource_group' && !resource.name.startsWith('rg-vnet-')
  );
  const vnetResourceGroups = cleanResources.filter(resource => 
    resource.type === 'resource_group' && resource.name.startsWith('rg-vnet-')
  );

  // Identify VNet-related resources
  const vnetRelatedResources = cleanResources.filter(resource => 
    resource.type === 'virtual_network' || 
    resource.type === 'subnet' || 
    resource.type === 'network_security_group' || 
    resource.type === 'route_table'
  );

  // Filter out all resource groups (we'll add our own modules)
  const filteredResources = cleanResources.filter(
    resource => resource.type !== 'azurerm_resource_group' && resource.type !== 'resource_group'
  );

  // Start code with terraform provider
  let code = TERRAFORM_PROVIDER_TEMPLATE;

  // Add standard resource group module if needed
  const regularResourceGroup = regularResourceGroups[0];
  if (filteredResources.some(r => !vnetRelatedResources.includes(r)) || regularResourceGroup) {
    code += '\n\n' + generateStandardResourceGroupModule(regularResourceGroup, globalConfig);
  }

  // Add VNet resource group module if needed
  const vnetResourceGroup = vnetResourceGroups[0];
  if (vnetRelatedResources.length > 0 || vnetResourceGroup) {
    code += '\n\n' + generateVNetResourceGroupModule(vnetResourceGroup, globalConfig);
  }

  for (const resource of filteredResources) {
    const resourceCode = generateResourceCode(resource, useRemoteModules, globalConfig, vnetRelatedResources);
    if (resourceCode) {
      code += '\n\n' + resourceCode;
    }
  }

  return {
    code,
    useRemoteModules,
    tokenValid
  };
}


// Generate the standard resource group module that all resources will reference
function generateStandardResourceGroupModule(resourceGroupResource?: TerraformResource, globalConfig?: any): string {
  // Use proper Azure naming from globalConfig
  const projectName = globalConfig?.projectName || 'iim';
  const environment = globalConfig?.environment || 'nonprod';
  const region = globalConfig?.region || 'Central US';
  
  // Convert region to short format
  const getShortRegionName = (region: string) => {
    const regionMap: { [key: string]: string } = {
      'East US': 'eastus',
      'East US 2': 'eastus2',
      'West US': 'westus',
      'West US 2': 'westus2',
      'Central US': 'centralus',
      'North Central US': 'northcentralus',
      'South Central US': 'southcentralus',
      'West Central US': 'westcentralus'
    };
    return regionMap[region] || 'centralus';
  };
  
  const shortRegion = getShortRegionName(region);
  const name = `rg-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
  const location = globalConfig?.location || region || "Central US";
  
  // Use globalConfig tags if available
  const defaultTags = {
    Environment: environment === "nonprod" ? "Non-Prod" : 
                environment === "dev" ? "Dev" :
                environment === "test" ? "Test" :
                environment === "prod" ? "Prod" : environment,
    Project: projectName
  };
  
  const tags = { ...defaultTags, ...(globalConfig?.tags || {}) };
  
  console.log('generateStandardResourceGroupModule - name:', name, 'location:', location);
  
  // Format tags properly
  const formattedTags = Object.entries(tags).map(([key, value]) => `    ${key}       = "${value}"`).join('\n');
  
  return `module "resource_group" {
  source   = "git::https://github.com/mukeshbharathigeakminds/terraform-azurerm-landing-zone.git//modules/resource_group"
  name     = "${name}"
  location = "${location}"

  tags = {
${formattedTags}
  }
}`;
}

// Generate the VNet resource group module for virtual network resources
function generateVNetResourceGroupModule(vnetResourceGroup?: TerraformResource, globalConfig?: any): string {
  // Use proper Azure naming from globalConfig for VNet resource group
  const projectName = globalConfig?.projectName || 'iim';
  const environment = globalConfig?.environment || 'nonprod';
  const region = globalConfig?.region || 'Central US';
  
  // Convert region to short format
  const getShortRegionName = (region: string) => {
    const regionMap: { [key: string]: string } = {
      'East US': 'eastus',
      'East US 2': 'eastus2',
      'West US': 'westus',
      'West US 2': 'westus2',
      'Central US': 'centralus',
      'North Central US': 'northcentralus',
      'South Central US': 'southcentralus',
      'West Central US': 'westcentralus'
    };
    return regionMap[region] || 'centralus';
  };
  
  const shortRegion = getShortRegionName(region);
  const name = `rg-vnet-${shortRegion}-${environment}-01`;
  const location = globalConfig?.location || region || "Central US";
  
  console.log('generateVNetResourceGroupModule - name:', name, 'location:', location);
  
  return `module "vnet_resource_group" {
  source   = "git::https://github.com/mukeshbharathigeakminds/terraform-azurerm-landing-zone.git//modules/resource_group"
  name     = "${name}"
  location = "${location}"
}`;
}

// Generate VNet resource group name with proper format
function generateVNetResourceGroupName(globalConfig?: any): string {
  const projectName = globalConfig?.projectName || 'project';
  const environment = globalConfig?.environment || 'nonprod';
  const region = globalConfig?.region || 'Central US';
  
  // Convert region to short format
  const getShortRegionName = (region: string) => {
    const regionMap: { [key: string]: string } = {
      'East US': 'eastus',
      'East US 2': 'eastus2',
      'West US': 'westus',
      'West US 2': 'westus2',
      'West US 3': 'westus3',
      'Central US': 'centralus',
      'North Central US': 'northcentralus',
      'South Central US': 'southcentralus',
      'West Central US': 'westcentralus',
      'Canada Central': 'canadacentral',
      'Canada East': 'canadaeast',
      'UK South': 'uksouth',
      'UK West': 'ukwest',
      'North Europe': 'northeurope',
      'West Europe': 'westeurope',
      'France Central': 'francecentral',
      'France South': 'francesouth',
      'Germany West Central': 'germanywestcentral',
      'Germany North': 'germanynorth',
      'Switzerland North': 'switzerlandnorth',
      'Switzerland West': 'switzerlandwest',
      'Norway East': 'norwayeast',
      'Norway West': 'norwaywest',
      'Southeast Asia': 'southeastasia',
      'East Asia': 'eastasia',
      'Australia East': 'australiaeast',
      'Australia Southeast': 'australiasoutheast',
      'Australia Central': 'australiacentral',
      'Australia Central 2': 'australiacentral2',
      'Japan East': 'japaneast',
      'Japan West': 'japanwest',
      'Korea Central': 'koreacentral',
      'Korea South': 'koreasouth',
      'South India': 'southindia',
      'Central India': 'centralindia',
      'West India': 'westindia',
      'Brazil South': 'brazilsouth',
      'Brazil Southeast': 'brazilsoutheast',
      'South Africa North': 'southafricanorth',
      'South Africa West': 'southafricawest',
      'UAE North': 'uaenorth',
      'UAE Central': 'uaecentral'
    };
    return regionMap[region] || 'centralus';
  };
  
  const shortRegion = getShortRegionName(region);
  return `rg-vnet-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
}

// Generate proper Azure resource names following naming conventions
function generateAzureResourceName(resourceType: string, globalConfig?: any): string {
  const projectName = globalConfig?.projectName || 'iim';
  const environment = globalConfig?.environment || 'nonprod';
  const region = globalConfig?.region || 'Central US';
  
  // Convert region to short format
  const getShortRegionName = (region: string) => {
    const regionMap: { [key: string]: string } = {
      'East US': 'eastus',
      'East US 2': 'eastus2',
      'West US': 'westus',
      'West US 2': 'westus2',
      'West US 3': 'westus3',
      'Central US': 'centralus',
      'North Central US': 'northcentralus',
      'South Central US': 'southcentralus',
      'West Central US': 'westcentralus'
    };
    return regionMap[region] || 'centralus';
  };
  
  const shortRegion = getShortRegionName(region);
  
  switch (resourceType) {
    case 'virtual_network':
      // Format: vnet-<Project Name>-<Location>-<Environment>-01
      return `vnet-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'storage_account':
      // Format: sa<Project Name><Location><Environment>01 (no hyphens, lowercase)
      return `sa${projectName.toLowerCase()}${shortRegion}${environment}01`.substring(0, 24);
    case 'key_vault':
      return `kv-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'virtual_machine':
      return `vm-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'app_service':
      return `app-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'sql_database':
      return `sqldb-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'subnet':
      return `snet-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'network_security_group':
      return `nsg-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'route_table':
      return `rt-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    case 'managed_identity':
      return `id-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
    default:
      return `${resourceType.replace(/_/g, '')}-${projectName.toLowerCase()}-${shortRegion}-${environment}-01`;
  }
}

// Extract globalConfig from resources if not provided
function extractGlobalConfigFromResources(resources: TerraformResource[]): any {
  const defaultConfig = {
    projectName: 'iim',
    environment: 'nonprod',
    region: 'Central US',
    location: 'Central US'
  };

  // Try to extract from resource configurations
  for (const resource of resources) {
    if (resource.config) {
      if (resource.config.projectName) defaultConfig.projectName = resource.config.projectName;
      if (resource.config.environment) defaultConfig.environment = resource.config.environment;
      if (resource.config.region) defaultConfig.region = resource.config.region;
      if (resource.config.location) defaultConfig.location = resource.config.location;
    }
  }

  return defaultConfig;
}

function sortResourcesByDependencies(resources: TerraformResource[]): TerraformResource[] {
  const resourceGroups = resources.filter(r => r.type === 'azurerm_resource_group');
  const others = resources.filter(r => r.type !== 'azurerm_resource_group');
  
  // Resource groups first, then others
  return [...resourceGroups, ...others];
}



function generateResourceCode(resource: TerraformResource, useRemoteModules: boolean = true, globalConfig?: any, vnetRelatedResources?: TerraformResource[]): string {
  const { type, name, config } = resource;
  
  // Use the configured name from the Resource Name input field, fallback to generate proper Azure naming
  const resourceName = config.name || generateAzureResourceName(type, globalConfig);
  
  // Determine which resource group to use based on resource type
  const isVNetRelated = vnetRelatedResources?.some(vr => vr.id === resource.id) || 
    resource.type === 'virtual_network' || 
    resource.type === 'subnet' || 
    resource.type === 'network_security_group' || 
    resource.type === 'route_table';
    
  const resourceGroupName = isVNetRelated ? 'module.vnet_resource_group.name' : 'module.resource_group.name';
  const location = globalConfig?.location || config.location || 'East US';
  
  console.log('generateResourceCode - resourceName:', resourceName, 'resourceGroupName:', resourceGroupName, 'location:', location);
  
  // Skip resource groups entirely - they're handled by generateStandardResourceGroupModule
  if (type === 'azurerm_resource_group' || type === 'resource_group') {
    return '';
  }
  
  // Use remote modules if enabled and configuration exists
  if (useRemoteModules && REMOTE_MODULE_CONFIGS[type]) {
    try {
      return generateRemoteModuleCall(type, resourceName, config);
    } catch (error) {
      console.error(`Failed to generate remote module for ${type}:`, error);
      // Fall back to regular resource generation
    }
  }
  
  switch (type) {
    case 'resource_group':
    case 'azurerm_resource_group':
      // Skip resource groups entirely
      return '';
        
    case 'key_vault':
      return KEY_VAULT_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{sku_name}}', config.skuName || 'standard')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'storage_account':
      console.log('Storage account - resourceName:', resourceName, 'config.name:', config.name);
      console.log('Storage account - resourceGroupName:', resourceGroupName, 'location:', location);
      return STORAGE_ACCOUNT_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{account_tier}}', config.accountTier || 'Standard')
        .replace('{{account_replication_type}}', config.replicationType || 'LRS')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'virtual_network':
      return VIRTUAL_NETWORK_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{address_space}}', JSON.stringify(config.addressSpace || ['10.0.0.0/16']))
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'subnet':
      return SUBNET_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{virtual_network_name}}', config.virtualNetworkName || 'azurerm_virtual_network.main.name')
        .replace('{{address_prefixes}}', JSON.stringify(config.addressPrefixes || ['10.0.1.0/24']));
        
    case 'network_security_group':
      return NETWORK_SECURITY_GROUP_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{security_rules}}', generateSecurityRules(config.securityRules || []))
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'virtual_machine':
      return VIRTUAL_MACHINE_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{size}}', config.size || 'Standard_B2s')
        .replace('{{admin_username}}', config.adminUsername || 'azureuser')
        .replace('{{disable_password_authentication}}', config.disablePasswordAuth || 'true')
        .replace('{{network_interface_ids}}', generateNetworkInterfaceIds(config.networkInterfaces || []))
        .replace('{{admin_ssh_key}}', generateSshKey(config.sshKey))
        .replace('{{os_disk}}', generateOsDisk(config.osDisk))
        .replace('{{source_image_reference}}', generateSourceImageReference(config.sourceImage))
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'app_service':
      return APP_SERVICE_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{app_service_plan_id}}', config.appServicePlanId || 'azurerm_app_service_plan.main.id')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'sql_database':
      return SQL_DATABASE_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{server_name}}', config.serverName || 'azurerm_mssql_server.main.name')
        .replace('{{collation}}', config.collation || 'SQL_Latin1_General_CP1_CI_AS')
        .replace('{{sku_name}}', config.skuName || 'S0')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'ai_studio':
      return AI_STUDIO_TEMPLATE
        .replace(/\{\{name\}\}/g, resourceName)
        .replace(/\{\{location\}\}/g, `"${location}"`)
        .replace(/\{\{resource_group\}\}/g, `"${resourceGroupName}"`)
        .replace('{{application_insights_id}}', config.applicationInsightsId || 'azurerm_application_insights.main.id')
        .replace('{{key_vault_id}}', config.keyVaultId || 'azurerm_key_vault.main.id')
        .replace('{{storage_account_id}}', config.storageAccountId || 'azurerm_storage_account.main.id')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'api_management':
      return API_MANAGEMENT_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{publisher_name}}', config.publisherName || 'Publisher')
        .replace('{{publisher_email}}', config.publisherEmail || 'publisher@example.com')
        .replace('{{sku_name}}', config.skuName || 'Developer_1')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'application_insights':
      return APPLICATION_INSIGHTS_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{application_type}}', config.applicationType || 'web')
        .replace('{{workspace_id}}', config.workspaceId || 'azurerm_log_analytics_workspace.main.id')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'container_registry':
      return CONTAINER_REGISTRY_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{sku}}', config.sku || 'Basic')
        .replace('{{admin_enabled}}', config.adminEnabled || 'false')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'cosmos_db':
      return COSMOS_DB_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{kind}}', config.kind || 'GlobalDocumentDB')
        .replace('{{consistency_level}}', config.consistencyLevel || 'Session')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'event_hub':
      return EVENT_HUB_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{sku}}', config.sku || 'Standard')
        .replace('{{capacity}}', config.capacity || '1')
        .replace('{{partition_count}}', config.partitionCount || '2')
        .replace('{{message_retention}}', config.messageRetentionInDays || '1')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'functions':
      return FUNCTIONS_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{storage_account_name}}', config.storageAccountName || 'azurerm_storage_account.main.name')
        .replace('{{storage_account_access_key}}', config.storageAccountAccessKey || 'azurerm_storage_account.main.primary_access_key')
        .replace('{{service_plan_id}}', config.servicePlanId || 'azurerm_service_plan.main.id')
        .replace('{{application_stack}}', config.applicationStack || 'node_version = "18"')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'log_analytics':
      return LOG_ANALYTICS_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{sku}}', config.sku || 'PerGB2018')
        .replace('{{retention_in_days}}', config.retentionInDays || '30')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'managed_identity':
      return MANAGED_IDENTITY_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'openai':
      return OPENAI_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{sku_name}}', config.skuName || 'S0')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'private_endpoint':
      return PRIVATE_ENDPOINT_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{subnet_id}}', config.subnetId || 'azurerm_subnet.main.id')
        .replace('{{private_connection_resource_id}}', config.privateConnectionResourceId || 'resource_id')
        .replace('{{subresource_names}}', config.subresourceNames || '"vault"')
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'redis':
      return REDIS_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{capacity}}', config.capacity || '1')
        .replace('{{family}}', config.family || 'C')
        .replace('{{sku_name}}', config.skuName || 'Standard')
        .replace('{{enable_non_ssl_port}}', config.enableNonSslPort || 'false')
        .replace('{{minimum_tls_version}}', config.minimumTlsVersion || '1.2')
        .replace('{{redis_configuration}}', generateRedisConfiguration(config.redisConfiguration))
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'route_table':
      return ROUTE_TABLE_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resource_group}}', config.resourceGroup || 'azurerm_resource_group.main.name')
        .replace('{{routes}}', generateRoutes(config.routes))
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'role_assignment':
      return ROLE_ASSIGNMENT_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{scope}}', config.scope || 'azurerm_resource_group.main.id')
        .replace('{{role_definition_id}}', config.roleDefinitionId || '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c')
        .replace('{{principal_id}}', config.principalId || '{user-or-group-object-id}')
        .replace('{{principal_type}}', config.principalType || 'User');
        
    case 'role_definition':
      return ROLE_DEFINITION_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{role_name}}', config.roleName || 'Custom Role')
        .replace('{{scope}}', config.scope || 'azurerm_resource_group.main.id')
        .replace('{{description}}', config.description || 'Custom role definition')
        .replace('{{actions}}', JSON.stringify(config.actions || ['Microsoft.Resources/subscriptions/resourceGroups/read']))
        .replace('{{not_actions}}', JSON.stringify(config.notActions || []))
        .replace('{{data_actions}}', JSON.stringify(config.dataActions || []))
        .replace('{{not_data_actions}}', JSON.stringify(config.notDataActions || []));
        
    case 'workbook':
      return WORKBOOK_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{location}}', config.location || 'East US')
        .replace('{{resourceGroupName}}', config.resourceGroupName || 'azurerm_resource_group.main.name')
        .replace('{{displayName}}', config.displayName || resourceName)
        .replace('{{tags}}', generateTags(config.tags));
        
    case 'ad_group':
      return AD_GROUP_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{displayName}}', config.displayName || resourceName)
        .replace('{{description}}', config.description || 'Azure AD Group')
        .replace('{{securityEnabled}}', config.securityEnabled || 'true')
        .replace('{{mailEnabled}}', config.mailEnabled || 'false')
        .replace('{{groupTypes}}', JSON.stringify(config.groupTypes || []))
        .replace('{{owners}}', JSON.stringify(config.owners || []))
        .replace('{{members}}', JSON.stringify(config.members || []));
        
    case 'ad_group_member':
      return AD_GROUP_MEMBER_TEMPLATE
        .replace('{{name}}', resourceName)
        .replace('{{groupId}}', config.groupId || 'azuread_group.main.id')
        .replace('{{memberId}}', config.memberId || 'data.azuread_client_config.current.object_id');
        
    case 'azuread_group':
      const cleanName = resourceName.replace(/[^a-zA-Z0-9_]/g, '_');
      const mailNickname = config.mailNickname || resourceName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `# Create Azure AD Group
resource "azuread_group" "${cleanName}" {
  display_name     = "${config.displayName || config.name || resourceName}"
  description      = "${config.description || 'Azure AD Group'}"
  security_enabled = ${config.securityEnabled || 'true'}
  mail_enabled     = ${config.mailEnabled || 'false'}
  mail_nickname    = "${mailNickname}"
}`;
        
    case 'azurerm_role_assignment':
      const cleanAssignmentName = resourceName.replace(/[^a-zA-Z0-9_]/g, '_');
      const groupReference = config.principalId?.replace('azuread_group.', '')?.replace('.object_id', '') || 'main';
      return `# Create Role Assignment with AD Group
resource "azurerm_role_assignment" "${cleanAssignmentName}" {
  scope                = ${config.scope || 'data.azurerm_subscription.current.id'}
  role_definition_name = "${config.roleDefinitionName || 'Owner'}"
  principal_id         = azuread_group.${groupReference}.object_id
  principal_type       = "Group"
}`;
        
    default:
      return '';
  }
}

function generateTags(tags: Record<string, string> = {}): string {
  if (Object.keys(tags).length === 0) {
    return '';
  }
  
  const tagLines = Object.entries(tags).map(([key, value]) => `    ${key} = "${value}"`);
  return `tags = {
${tagLines.join('\n')}
  }`;
}

function generateModuleTags(tags: Record<string, string> = {}): string {
  if (Object.keys(tags).length === 0) {
    return '';
  }
  
  const tagLines = Object.entries(tags).map(([key, value]) => `    ${key} = "${value}"`);
  return `
  tags = {
${tagLines.join('\n')}
  }`;
}

function generateSecurityRules(rules: any[]): string {
  if (rules.length === 0) return '';
  
  return rules.map(rule => `
  security_rule {
    name                       = "${rule.name}"
    priority                   = ${rule.priority}
    direction                  = "${rule.direction}"
    access                     = "${rule.access}"
    protocol                   = "${rule.protocol}"
    source_port_range          = "${rule.sourcePortRange}"
    destination_port_range     = "${rule.destinationPortRange}"
    source_address_prefix      = "${rule.sourceAddressPrefix}"
    destination_address_prefix = "${rule.destinationAddressPrefix}"
  }`).join('\n');
}

function generateNetworkInterfaceIds(interfaces: string[]): string {
  if (interfaces.length === 0) {
    return '[azurerm_network_interface.main.id]';
  }
  return `[${interfaces.map(id => `"${id}"`).join(', ')}]`;
}

function generateSshKey(sshKey: any): string {
  if (!sshKey) {
    return `admin_ssh_key {
    username   = "azureuser"
    public_key = "ssh-rsa AAAAB3NzaC1yc2E... (your public key)"
  }`;
  }
  
  return `admin_ssh_key {
    username   = "${sshKey.username || 'azureuser'}"
    public_key = "${sshKey.publicKey}"
  }`;
}

function generateOsDisk(osDisk: any): string {
  if (!osDisk) {
    return `os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }`;
  }
  
  return `os_disk {
    caching              = "${osDisk.caching || 'ReadWrite'}"
    storage_account_type = "${osDisk.storageAccountType || 'Premium_LRS'}"
  }`;
}

function generateSourceImageReference(sourceImage: any): string {
  if (!sourceImage) {
    return `source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }`;
  }
  
  return `source_image_reference {
    publisher = "${sourceImage.publisher || 'Canonical'}"
    offer     = "${sourceImage.offer || '0001-com-ubuntu-server-focal'}"
    sku       = "${sourceImage.sku || '20_04-lts-gen2'}"
    version   = "${sourceImage.version || 'latest'}"
  }`;
}

function generateRedisConfiguration(config: Record<string, string> = {}): string {
  if (Object.keys(config).length === 0) {
    return `redis_configuration {
    maxmemory_policy = "allkeys-lru"
  }`;
  }
  
  const configLines = Object.entries(config).map(([key, value]) => `    ${key} = "${value}"`);
  return `redis_configuration {
${configLines.join('\n')}
  }`;
}

function generateRoutes(routes: Array<{
  name: string;
  addressPrefix: string;
  nextHopType: string;
  nextHopIpAddress?: string;
}> = []): string {
  if (routes.length === 0) {
    return `route {
    name           = "default"
    address_prefix = "0.0.0.0/0"
    next_hop_type  = "Internet"
  }`;
  }
  
  return routes.map(route => `
  route {
    name           = "${route.name}"
    address_prefix = "${route.addressPrefix}"
    next_hop_type  = "${route.nextHopType}"${route.nextHopIpAddress ? `
    next_hop_in_ip_address = "${route.nextHopIpAddress}"` : ''}
  }`).join('\n');
}
