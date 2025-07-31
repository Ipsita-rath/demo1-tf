export interface TerraformResource {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  dependencies?: string[];
}

export interface LandingZoneResource {
  type: string;
  name: string;
  field_state: Record<string, any>;
  position: { x: number; y: number };
  resource_group?: string;
  subscription?: string;
}

export interface LandingZone {
  id: string;
  name: string;
  description: string;
  resources: LandingZoneResource[];
}

export interface TerraformConfiguration {
  id: number;
  name: string;
  description?: string;
  resources: TerraformResource[];
  generatedCode?: string;
  deploymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: number;
  configurationId: number;
  status: string;
  terraformPlanId?: string;
  terraformApplyId?: string;
  logs: DeploymentLog[];
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface TerraformModule {
  id: string;
  name: string;
  namespace: string;
  provider: string;
  version: string;
  description?: string;
}

export type ResourceType = 
  | 'azurerm_resource_group'
  | 'key_vault'
  | 'container_registry'
  | 'cosmosdb'
  | 'log_analytics'
  | 'application_insights'
  | 'functions'
  | 'event_hub'
  | 'api_management'
  | 'ai_studio'
  | 'container_registry'
  | 'cosmos_db'
  | 'event_hub'
  | 'functions'
  | 'log_analytics'
  | 'managed_identity'
  | 'openai'
  | 'private_endpoint'
  | 'redis'
  | 'route_table'
  | 'role_assignment'
  | 'role_definition'
  | 'workbook'
  | 'ad_group'
  | 'ad_group_member';

export interface ResourceConfig {
  location?: string;
  tags?: Record<string, string>;
  subscription?: string;
  resourceGroup?: string;
  // Resource-specific configs
  skuName?: string;
  accountTier?: string;
  replicationType?: string;
  addressSpace?: string[];
  addressPrefixes?: string[];
  size?: string;
  adminUsername?: string;
  osType?: string;
  authType?: string;
  sshKey?: string;
  collation?: string;
  serverName?: string;
  appServicePlanId?: string;
  // New resource configs
  tier?: string;
  capacity?: number;
  kind?: string;
  enableSoftDelete?: boolean;
  consistencyPolicy?: string;
  throughput?: number;
  partitionCount?: number;
  messageRetentionInDays?: number;
  storageAccountType?: string;
  principalType?: string;
  roleDefinitionId?: string;
  deploymentName?: string;
  modelName?: string;
  modelVersion?: string;
  subnetId?: string;
  privateDnsZoneId?: string;
  redisConfiguration?: Record<string, string>;
  routes?: Array<{
    name: string;
    addressPrefix: string;
    nextHopType: string;
    nextHopIpAddress?: string;
  }>;
  // Azure AD role configs
  scope?: string;
  principalId?: string;
  roleName?: string;
  roleType?: string;
  description?: string;
  actions?: string[];
  notActions?: string[];
  dataActions?: string[];
  notDataActions?: string[];
  resourceGroupName?: string;
  // Azure AD group configs
  displayName?: string;
  groupTypes?: string[];
  mailEnabled?: boolean;
  securityEnabled?: boolean;
  owners?: string[];
  members?: string[];
  groupId?: string;
  memberId?: string;
}
