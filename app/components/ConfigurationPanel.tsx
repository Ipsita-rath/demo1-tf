import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import type { TerraformResource } from "@/types/terraform";
import { validateAzureName, generateSuggestedName, getResourceDisplayName, AZURE_NAMING_RULES } from "@/utils/azureNamingStandards";

const AZURE_REGIONS = [
  { value: "eastus", label: "East US" },
  { value: "eastus2", label: "East US 2" },
  { value: "westus", label: "West US" },
  { value: "westus2", label: "West US 2" },
  { value: "centralus", label: "Central US" },
  { value: "northcentralus", label: "North Central US" },
  { value: "southcentralus", label: "South Central US" },
  { value: "westcentralus", label: "West Central US" },
  { value: "canadacentral", label: "Canada Central" },
  { value: "canadaeast", label: "Canada East" },
  { value: "brazilsouth", label: "Brazil South" },
  { value: "northeurope", label: "North Europe" },
  { value: "westeurope", label: "West Europe" },
  { value: "uksouth", label: "UK South" },
  { value: "ukwest", label: "UK West" },
  { value: "francecentral", label: "France Central" },
  { value: "germanywestcentral", label: "Germany West Central" },
  { value: "norwayeast", label: "Norway East" },
  { value: "switzerlandnorth", label: "Switzerland North" },
  { value: "swedencentral", label: "Sweden Central" },
  { value: "australiaeast", label: "Australia East" },
  { value: "australiasoutheast", label: "Australia Southeast" },
  { value: "southeastasia", label: "Southeast Asia" },
  { value: "eastasia", label: "East Asia" },
  { value: "japaneast", label: "Japan East" },
  { value: "japanwest", label: "Japan West" },
  { value: "koreacentral", label: "Korea Central" },
  { value: "southafricanorth", label: "South Africa North" },
  { value: "centralindia", label: "Central India" },
  { value: "southindia", label: "South India" },
  { value: "westindia", label: "West India" },
];

interface ConfigurationPanelProps {
  resource: TerraformResource;
  onUpdate: (resource: TerraformResource) => void;
  onDelete: (resourceId: string) => void;
  onClose?: () => void;
  globalConfig?: any;
  allResources?: TerraformResource[];
}

export default function ConfigurationPanel({ resource, onUpdate, onDelete, onClose = () => {}, globalConfig, allResources = [] }: ConfigurationPanelProps) {
  const [config, setConfig] = useState(resource.config);
  const [name, setName] = useState(resource.name);
  const [DefaultValues, setDefaultValues] = useState<any>(null)
  const [nameValidation, setNameValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] }>({ isValid: true, errors: [], warnings: [] });

  // Update local state when resource prop changes (e.g., after global settings are applied)
  useEffect(() => {
    const saved = localStorage.getItem("terraform-builder-global-settings");
    const parsed = saved && JSON.parse(saved)
    setDefaultValues(parsed)
    
    // Clean up any hardcoded individual roles that shouldn't be there
    const cleanConfig = { ...resource.config };
    
    // Remove any hardcoded individual roles like Owner, Contributor, Reader that might be stored separately
    delete cleanConfig.Owner;
    delete cleanConfig.Contributor;
    delete cleanConfig.Reader;
    delete cleanConfig['Key Vault Administrator'];
    delete cleanConfig['Key Vault Secrets Officer'];
    delete cleanConfig['Storage Blob Data Contributor'];
    
    // CRITICAL FIX: Clear any old hardcoded role arrays that might contain default roles
    // Only keep resource-specific roles, remove the global adRoles reference
    if (cleanConfig.adRoles && Array.isArray(cleanConfig.adRoles)) {
      // Remove global adRoles reference to prevent circular updates
      delete cleanConfig.adRoles;
    }
    
    setConfig(cleanConfig);
    setName(resource.name);
    // Validate the initial name
    const validation = validateAzureName(resource.type, resource.name);
    setNameValidation({ 
      isValid: validation.isValid, 
      errors: validation.errors, 
      warnings: [] 
    });

    console.log('ConfigurationPanel useEffect loaded for resource:', resource.type);
    console.log('Global settings:', parsed);
    console.log('Resource config:', resource.config);
    console.log('Resource-specific excluded roles:', resource.config?.excludedRoles);
  }, [resource]);

  // Validate resource name using Azure naming rules
  const handleNameChange = (newName: string) => {
    setName(newName);
    const validation = validateAzureName(resource.type, newName);
    setNameValidation({ 
      isValid: validation.isValid, 
      errors: validation.errors, 
      warnings: [] 
    });
  };

  // Generate suggested name if current name is invalid
  const generateSuggestion = () => {
    const suggested = generateSuggestedName(resource.type, 1, {
      projectCode: 'inid',
      environment: 'dev', 
      region: 'eastus'
    });
    setName(suggested);
    const validation = validateAzureName(resource.type, suggested);
    setNameValidation({ 
      isValid: validation.isValid, 
      errors: validation.errors, 
      warnings: [] 
    });
  };

  // Get naming rule for current resource type
  const namingRule = AZURE_NAMING_RULES[resource.type];

  const handleConfigChange = (key: string, value: any) => {
    console.log(`ConfigurationPanel: Updating ${key} to:`, value);
    setConfig({ ...config, [key]: value });
  };

  // Helper function to render location dropdown with all Azure regions
  const renderLocationField = () => (
    <div>
      <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
      <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {AZURE_REGIONS.map((region) => (
            <SelectItem key={region.value} value={region.label}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const handleTagsChange = (tags: Record<string, string>) => {
    setConfig({ ...config, tags });
  };

  const handleApplyConfiguration = () => {
    // Validate using Azure naming rules
    if (!nameValidation.isValid) {
      return; // Don't proceed if name is invalid
    }

    // Check for duplicate names (excluding the current resource)
    const isDuplicate = allResources.some(r => 
      r.id !== resource.id && 
      r.name.toLowerCase() === name.toLowerCase()
    );
    
    if (isDuplicate) {
      setNameValidation({
        isValid: false,
        errors: [`A resource with the name "${name}" already exists. Please choose a different name.`],
        warnings: []
      });
      return;
    }

    console.log('ConfigurationPanel: Applying configuration:', {
      name,
      config,
      excludedRoles: config.excludedRoles
    });

    const updatedResource = {
      ...resource,
      name,
      config: { ...config, name },
    };
    
    console.log('ConfigurationPanel: Final updated resource:', updatedResource);
    console.log('ConfigurationPanel: config.name is now:', updatedResource.config.name);

    onUpdate(updatedResource);
  };

  const handleReset = () => {
    setConfig(resource.config);
    setName(resource.name);
    const validation = validateAzureName(resource.type, resource.name);
    setNameValidation({ 
      isValid: validation.isValid, 
      errors: validation.errors, 
      warnings: [] 
    });
  };

  const renderResourceIcon = (type: string) => {
    const icons: Record<string, string> = {
      'resource_group': '📁',
      'key_vault': '🔑',
      'storage_account': '💾',
      'virtual_network': '🌐',
      'subnet': '🔗',
      'network_security_group': '🔒',
      'virtual_machine': '💻',
      'app_service': '🌍',
      'sql_database': '🗄️',
      'ai_studio': '🤖',
      'api_management': '🔌',
      'application_insights': '📊',
      'container_registry': '🐳',
      'cosmos_db': '🌍',
      'event_hub': '📡',
      'functions': '⚡',
      'log_analytics': '📈',
      'managed_identity': '🆔',
      'openai': '🧠',
      'private_endpoint': '🔐',
      'redis': '⚡',
      'route_table': '🛣️',
      'role_assignment': '👤',
      'role_definition': '🛡️',
      'workbook': '📋',
      'ad_group': '👥',
      'ad_group_member': '👤',
    };
    return icons[type] || '📦';
  };

  // FIXED AD Roles Configuration Component
  const renderADRolesSection = () => {
    // Only show the section if resource supports AD roles
    const supportsADRoles = ['key_vault', 'storage_account', 'virtual_machine', 'sql_database', 'ai_studio', 'container_registry', 'api_management', 'managed_identity', 'openai'].includes(resource.type);
    if (!supportsADRoles) return null;

    // Get global roles from DefaultValues
    const globalRoles = DefaultValues?.adRoles || [];
    
    // Get resource-specific excluded roles (roles that have been removed from this specific resource)
    const excludedRoles = config.excludedRoles || [];
    
    // Calculate displayed roles: global roles minus excluded roles for this resource
    const displayedRoles = globalRoles.filter((role: string) => !excludedRoles.includes(role));

    console.log('=== FIXED ROLE DEBUG START ===');
    console.log('ConfigurationPanel - Resource type:', resource.type);
    console.log('ConfigurationPanel - globalRoles:', globalRoles);
    console.log('ConfigurationPanel - excludedRoles:', excludedRoles);
    console.log('ConfigurationPanel - displayedRoles (final):', displayedRoles);
    console.log('=== FIXED ROLE DEBUG END ===');

    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Azure AD Roles (from Global Configuration)
        </div>
        
        {displayedRoles.length > 0 ? (
          <div className="space-y-2">
            {displayedRoles.map((role: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{role}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    console.log('Removing role from this resource only:', role);
                    console.log('Current excluded roles:', excludedRoles);
                    
                    // Add this role to the excluded list for this specific resource
                    const newExcludedRoles = [...excludedRoles, role];
                    
                    console.log('New excluded roles:', newExcludedRoles);
                    
                    // Update the config to exclude this role from this resource only
                    handleConfigChange('excludedRoles', newExcludedRoles);
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove role from this resource only (does not affect global configuration)"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              These roles were set globally. You can remove them from this specific resource without affecting other services or the global configuration.
            </div>
            {excludedRoles.length > 0 && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-700">
                <strong>Excluded from this resource:</strong> {excludedRoles.join(', ')}
                <br />
                <button 
                  className="text-blue-600 hover:text-blue-800 underline mt-1"
                  onClick={() => handleConfigChange('excludedRoles', [])}
                >
                  Reset to show all global roles
                </button>
              </div>
            )}
          </div>
        ) : globalRoles.length > 0 ? (
          <div className="text-center py-4 text-orange-600 dark:text-orange-400 text-sm bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="space-y-2">
              <p>All global roles have been excluded from this resource</p>
              <button 
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={() => handleConfigChange('excludedRoles', [])}
              >
                Reset to show all global roles
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              <p>No global AD roles configured</p>
              <p className="text-xs">Configure AD roles in the Global Information panel to apply them to this resource</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConfigurationForm = () => {
    switch (resource.type) {
      case 'resource_group':
        return (
          <div className="space-y-4">
            {renderLocationField()}
          </div>
        );

      case 'key_vault':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            
            {/* Key Vault Name Field */}
            <div>
              <Label htmlFor="keyvault_name">Key Vault Name <span className="text-red-500">*</span></Label>
              <Input
                id="keyvault_name"
                value={config.keyvault_name || config.name || ''}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase(); // Force lowercase
                  handleConfigChange('keyvault_name', value);
                  // Also validate the name according to Azure Key Vault rules
                  const validation = validateAzureName('key_vault', value);
                  setNameValidation({
                    isValid: validation.isValid,
                    errors: validation.errors,
                    warnings: []
                  });
                }}
                placeholder="kviniddev001"
                className={nameValidation?.isValid === false ? 'border-red-500' : ''}
              />
              <div className="text-xs text-gray-500 mt-1">
                3-24 characters, lowercase letters and numbers only
              </div>
              {nameValidation?.errors && nameValidation.errors.length > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  {nameValidation.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="use_hsm"
                checked={config.use_hsm !== undefined ? config.use_hsm : true}
                onCheckedChange={(checked) => handleConfigChange('use_hsm', checked)}
              />
              <Label htmlFor="use_hsm">Use HSM (Hardware Security Module)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="softDeleteEnabled"
                checked={config.softDeleteEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('softDeleteEnabled', checked)}
              />
              <Label htmlFor="softDeleteEnabled">Enable Soft Delete</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="purgeProtectionEnabled"
                checked={config.purgeProtectionEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('purgeProtectionEnabled', checked)}
              />
              <Label htmlFor="purgeProtectionEnabled">Enable Purge Protection</Label>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'storage_account':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accountTier">Account Tier <span className="text-red-500">*</span></Label>
              <Select value={config.accountTier} onValueChange={(value) => handleConfigChange('accountTier', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="replicationType">Replication Type <span className="text-red-500">*</span></Label>
              <Select value={config.replicationType} onValueChange={(value) => handleConfigChange('replicationType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LRS">LRS (Locally Redundant)</SelectItem>
                  <SelectItem value="GRS">GRS (Geo Redundant)</SelectItem>
                  <SelectItem value="ZRS">ZRS (Zone Redundant)</SelectItem>
                  <SelectItem value="GZRS">GZRS (Geo Zone Redundant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accessTier">Access Tier</Label>
              <Select value={config.accessTier || 'Hot'} onValueChange={(value) => handleConfigChange('accessTier', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Cool">Cool</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="httpsTrafficOnly"
                checked={config.httpsTrafficOnly ?? true}
                onCheckedChange={(checked) => handleConfigChange('httpsTrafficOnly', checked)}
              />
              <Label htmlFor="httpsTrafficOnly">HTTPS Traffic Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="blobPublicAccess"
                checked={config.blobPublicAccess || false}
                onCheckedChange={(checked) => handleConfigChange('blobPublicAccess', checked)}
              />
              <Label htmlFor="blobPublicAccess">Allow Blob Public Access</Label>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'virtual_network':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="addressSpace">Address Space <span className="text-red-500">*</span></Label>
              <Input
                id="addressSpace"
                value={config.addressSpace || '10.0.0.0/16'}
                onChange={(e) => handleConfigChange('addressSpace', e.target.value)}
                placeholder="10.0.0.0/16"
              />
              <div className="text-xs text-gray-500 mt-1">CIDR notation (e.g., 10.0.0.0/16)</div>
            </div>
            <div>
              <Label htmlFor="dnsServers">DNS Servers</Label>
              <Input
                id="dnsServers"
                value={config.dnsServers || ''}
                onChange={(e) => handleConfigChange('dnsServers', e.target.value)}
                placeholder="8.8.8.8,8.8.4.4"
              />
              <div className="text-xs text-gray-500 mt-1">Comma-separated list of DNS servers</div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableDdosProtection"
                checked={config.enableDdosProtection || false}
                onCheckedChange={(checked) => handleConfigChange('enableDdosProtection', checked)}
              />
              <Label htmlFor="enableDdosProtection">Enable DDoS Protection</Label>
            </div>
          </div>
        );

      case 'subnet':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="virtualNetworkName">Virtual Network <span className="text-red-500">*</span></Label>
              <Input
                id="virtualNetworkName"
                value={config.virtualNetworkName || ''}
                onChange={(e) => handleConfigChange('virtualNetworkName', e.target.value)}
                placeholder="vnet-main"
              />
            </div>
            <div>
              <Label htmlFor="addressPrefix">Address Prefix <span className="text-red-500">*</span></Label>
              <Input
                id="addressPrefix"
                value={config.addressPrefix || '10.0.1.0/24'}
                onChange={(e) => handleConfigChange('addressPrefix', e.target.value)}
                placeholder="10.0.1.0/24"
              />
              <div className="text-xs text-gray-500 mt-1">CIDR notation (e.g., 10.0.1.0/24)</div>
            </div>
            <div>
              <Label htmlFor="serviceEndpoints">Service Endpoints</Label>
              <Input
                id="serviceEndpoints"
                value={config.serviceEndpoints || ''}
                onChange={(e) => handleConfigChange('serviceEndpoints', e.target.value)}
                placeholder="Microsoft.Storage,Microsoft.Sql"
              />
              <div className="text-xs text-gray-500 mt-1">Comma-separated list of service endpoints</div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="privateEndpointNetworkPoliciesEnabled"
                checked={config.privateEndpointNetworkPoliciesEnabled ?? true}
                onCheckedChange={(checked) => handleConfigChange('privateEndpointNetworkPoliciesEnabled', checked)}
              />
              <Label htmlFor="privateEndpointNetworkPoliciesEnabled">Private Endpoint Network Policies</Label>
            </div>
          </div>
        );

      case 'network_security_group':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label>Security Rules</Label>
              <div className="space-y-2">
                {(config.securityRules || []).map((rule: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={rule.name || ''}
                        onChange={(e) => {
                          const newRules = [...(config.securityRules || [])];
                          newRules[index] = { ...rule, name: e.target.value };
                          handleConfigChange('securityRules', newRules);
                        }}
                        placeholder="Rule name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newRules = [...(config.securityRules || [])];
                          newRules.splice(index, 1);
                          handleConfigChange('securityRules', newRules);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={rule.access || 'Allow'}
                        onValueChange={(value) => {
                          const newRules = [...(config.securityRules || [])];
                          newRules[index] = { ...rule, access: value };
                          handleConfigChange('securityRules', newRules);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Allow">Allow</SelectItem>
                          <SelectItem value="Deny">Deny</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={rule.direction || 'Inbound'}
                        onValueChange={(value) => {
                          const newRules = [...(config.securityRules || [])];
                          newRules[index] = { ...rule, direction: value };
                          handleConfigChange('securityRules', newRules);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inbound">Inbound</SelectItem>
                          <SelectItem value="Outbound">Outbound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={rule.sourcePortRange || '*'}
                        onChange={(e) => {
                          const newRules = [...(config.securityRules || [])];
                          newRules[index] = { ...rule, sourcePortRange: e.target.value };
                          handleConfigChange('securityRules', newRules);
                        }}
                        placeholder="Source port"
                      />
                      <Input
                        value={rule.destinationPortRange || '*'}
                        onChange={(e) => {
                          const newRules = [...(config.securityRules || [])];
                          newRules[index] = { ...rule, destinationPortRange: e.target.value };
                          handleConfigChange('securityRules', newRules);
                        }}
                        placeholder="Destination port"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRules = [...(config.securityRules || []), {
                      name: '',
                      access: 'Allow',
                      direction: 'Inbound',
                      sourcePortRange: '*',
                      destinationPortRange: '*',
                      protocol: 'Tcp',
                      priority: 100 + (config.securityRules?.length || 0) * 10
                    }];
                    handleConfigChange('securityRules', newRules);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Security Rule
                </Button>
              </div>
            </div>
          </div>
        );

      case 'virtual_machine':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size">VM Size <span className="text-red-500">*</span></Label>
              <Select value={config.size} onValueChange={(value) => handleConfigChange('size', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard_B1s">Standard_B1s (1 vCPU, 1 GB RAM)</SelectItem>
                  <SelectItem value="Standard_B2s">Standard_B2s (2 vCPU, 4 GB RAM)</SelectItem>
                  <SelectItem value="Standard_D2s_v3">Standard_D2s_v3 (2 vCPU, 8 GB RAM)</SelectItem>
                  <SelectItem value="Standard_D4s_v3">Standard_D4s_v3 (4 vCPU, 16 GB RAM)</SelectItem>
                  <SelectItem value="Standard_D8s_v3">Standard_D8s_v3 (8 vCPU, 32 GB RAM)</SelectItem>
                  <SelectItem value="Standard_E2s_v3">Standard_E2s_v3 (2 vCPU, 16 GB RAM)</SelectItem>
                  <SelectItem value="Standard_E4s_v3">Standard_E4s_v3 (4 vCPU, 32 GB RAM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adminUsername">Admin Username <span className="text-red-500">*</span></Label>
              <Input
                id="adminUsername"
                value={config.adminUsername || ''}
                onChange={(e) => handleConfigChange('adminUsername', e.target.value)}
                placeholder="Enter admin username"
              />
            </div>
            <div>
              <Label>Operating System <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={config.osType || 'ubuntu'} 
                onValueChange={(value) => handleConfigChange('osType', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="windows" id="windows" />
                  <Label htmlFor="windows">Windows Server 2022</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ubuntu" id="ubuntu" />
                  <Label htmlFor="ubuntu">Ubuntu 20.04 LTS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="centos" id="centos" />
                  <Label htmlFor="centos">CentOS 8</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Authentication Type <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={config.authType || 'ssh'} 
                onValueChange={(value) => handleConfigChange('authType', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="password" id="password" />
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ssh" id="ssh" />
                  <Label htmlFor="ssh">SSH Key</Label>
                </div>
              </RadioGroup>
            </div>
            {config.authType === 'ssh' && (
              <div>
                <Label htmlFor="sshKey">SSH Public Key <span className="text-red-500">*</span></Label>
                <Textarea
                  id="sshKey"
                  value={config.sshKey || ''}
                  onChange={(e) => handleConfigChange('sshKey', e.target.value)}
                  placeholder="ssh-rsa AAAAB3NzaC1..."
                  rows={3}
                />
              </div>
            )}
            <div>
              <Label htmlFor="availabilityZone">Availability Zone</Label>
              <Select value={config.availabilityZone || 'none'} onValueChange={(value) => handleConfigChange('availabilityZone', value === 'none' ? '' : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1">Zone 1</SelectItem>
                  <SelectItem value="2">Zone 2</SelectItem>
                  <SelectItem value="3">Zone 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableBootDiagnostics"
                checked={config.enableBootDiagnostics || false}
                onCheckedChange={(checked) => handleConfigChange('enableBootDiagnostics', checked)}
              />
              <Label htmlFor="enableBootDiagnostics">Enable Boot Diagnostics</Label>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'app_service':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="servicePlanId">Service Plan ID <span className="text-red-500">*</span></Label>
              <Input
                id="servicePlanId"
                value={config.servicePlanId || ''}
                onChange={(e) => handleConfigChange('servicePlanId', e.target.value)}
                placeholder="app-service-plan-id"
              />
            </div>
            <div>
              <Label htmlFor="runtime">Runtime Stack <span className="text-red-500">*</span></Label>
              <Select value={config.runtime} onValueChange={(value) => handleConfigChange('runtime', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dotnet|8.0">ASP.NET 8.0</SelectItem>
                  <SelectItem value="dotnet|6.0">ASP.NET 6.0</SelectItem>
                  <SelectItem value="node|18-lts">Node.js 18 LTS</SelectItem>
                  <SelectItem value="node|16-lts">Node.js 16 LTS</SelectItem>
                  <SelectItem value="python|3.11">Python 3.11</SelectItem>
                  <SelectItem value="python|3.10">Python 3.10</SelectItem>
                  <SelectItem value="java|11">Java 11</SelectItem>
                  <SelectItem value="java|8">Java 8</SelectItem>
                  <SelectItem value="php|8.2">PHP 8.2</SelectItem>
                  <SelectItem value="php|8.1">PHP 8.1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="httpsOnly"
                checked={config.httpsOnly ?? true}
                onCheckedChange={(checked) => handleConfigChange('httpsOnly', checked)}
              />
              <Label htmlFor="httpsOnly">HTTPS Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="alwaysOn"
                checked={config.alwaysOn || false}
                onCheckedChange={(checked) => handleConfigChange('alwaysOn', checked)}
              />
              <Label htmlFor="alwaysOn">Always On</Label>
            </div>
            <div>
              <Label htmlFor="appSettings">App Settings</Label>
              <Textarea
                id="appSettings"
                value={config.appSettings || ''}
                onChange={(e) => handleConfigChange('appSettings', e.target.value)}
                placeholder="KEY1=value1\nKEY2=value2"
                rows={4}
              />
              <div className="text-xs text-gray-500 mt-1">One setting per line in KEY=value format</div>
            </div>
          </div>
        );

      case 'sql_database':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serverName">SQL Server Name <span className="text-red-500">*</span></Label>
              <Input
                id="serverName"
                value={config.serverName || ''}
                onChange={(e) => handleConfigChange('serverName', e.target.value)}
                placeholder="sql-server-name"
              />
            </div>
            <div>
              <Label htmlFor="administratorLogin">Administrator Login <span className="text-red-500">*</span></Label>
              <Input
                id="administratorLogin"
                value={config.administratorLogin || ''}
                onChange={(e) => handleConfigChange('administratorLogin', e.target.value)}
                placeholder="sqladmin"
              />
            </div>
            <div>
              <Label htmlFor="administratorPassword">Administrator Password <span className="text-red-500">*</span></Label>
              <Input
                id="administratorPassword"
                type="password"
                value={config.administratorPassword || ''}
                onChange={(e) => handleConfigChange('administratorPassword', e.target.value)}
                placeholder="Enter strong password"
              />
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="GP_Gen5_2">General Purpose Gen5 2 vCores</SelectItem>
                  <SelectItem value="GP_Gen5_4">General Purpose Gen5 4 vCores</SelectItem>
                  <SelectItem value="GP_Gen5_8">General Purpose Gen5 8 vCores</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxSizeGb">Max Size (GB)</Label>
              <Input
                id="maxSizeGb"
                type="number"
                value={config.maxSizeGb || '5'}
                onChange={(e) => handleConfigChange('maxSizeGb', e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableThreatDetection"
                checked={config.enableThreatDetection || false}
                onCheckedChange={(checked) => handleConfigChange('enableThreatDetection', checked)}
              />
              <Label htmlFor="enableThreatDetection">Enable Threat Detection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableTransparentDataEncryption"
                checked={config.enableTransparentDataEncryption ?? true}
                onCheckedChange={(checked) => handleConfigChange('enableTransparentDataEncryption', checked)}
              />
              <Label htmlFor="enableTransparentDataEncryption">Enable Transparent Data Encryption</Label>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'ai_studio':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label htmlFor="keyVaultId">Key Vault ID <span className="text-red-500">*</span></Label>
              <Input
                id="keyVaultId"
                value={config.keyVaultId || ''}
                onChange={(e) => handleConfigChange('keyVaultId', e.target.value)}
                placeholder="Key Vault resource ID"
              />
            </div>
            <div>
              <Label htmlFor="storageAccountId">Storage Account ID <span className="text-red-500">*</span></Label>
              <Input
                id="storageAccountId"
                value={config.storageAccountId || ''}
                onChange={(e) => handleConfigChange('storageAccountId', e.target.value)}
                placeholder="Storage Account resource ID"
              />
            </div>
            <div>
              <Label htmlFor="applicationInsightsId">Application Insights ID</Label>
              <Input
                id="applicationInsightsId"
                value={config.applicationInsightsId || ''}
                onChange={(e) => handleConfigChange('applicationInsightsId', e.target.value)}
                placeholder="Application Insights resource ID"
              />
            </div>
            <div>
              <Label htmlFor="containerRegistryId">Container Registry ID</Label>
              <Input
                id="containerRegistryId"
                value={config.containerRegistryId || ''}
                onChange={(e) => handleConfigChange('containerRegistryId', e.target.value)}
                placeholder="Container Registry resource ID"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="publicNetworkAccess"
                checked={config.publicNetworkAccess || false}
                onCheckedChange={(checked) => handleConfigChange('publicNetworkAccess', checked)}
              />
              <Label htmlFor="publicNetworkAccess">Public Network Access</Label>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'openai':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                  <SelectItem value="Southeast Asia">Southeast Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S0">S0 (Standard)</SelectItem>
                  <SelectItem value="S1">S1 (Standard Plus)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customSubdomainName">Custom Subdomain Name</Label>
              <Input
                id="customSubdomainName"
                value={config.customSubdomainName || ''}
                onChange={(e) => handleConfigChange('customSubdomainName', e.target.value)}
                placeholder="my-openai-service"
              />
            </div>
            <div>
              <Label htmlFor="publicNetworkAccess">Public Network Access</Label>
              <Select value={config.publicNetworkAccess || 'Enabled'} onValueChange={(value) => handleConfigChange('publicNetworkAccess', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enabled">Enabled</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model Deployments</Label>
              <div className="space-y-2">
                {(config.modelDeployments || []).map((deployment: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={deployment.name || ''}
                        onChange={(e) => {
                          const newDeployments = [...(config.modelDeployments || [])];
                          newDeployments[index] = { ...deployment, name: e.target.value };
                          handleConfigChange('modelDeployments', newDeployments);
                        }}
                        placeholder="Deployment name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDeployments = [...(config.modelDeployments || [])];
                          newDeployments.splice(index, 1);
                          handleConfigChange('modelDeployments', newDeployments);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={deployment.model || 'gpt-35-turbo'}
                        onValueChange={(value) => {
                          const newDeployments = [...(config.modelDeployments || [])];
                          newDeployments[index] = { ...deployment, model: value };
                          handleConfigChange('modelDeployments', newDeployments);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-35-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-32k">GPT-4 32K</SelectItem>
                          <SelectItem value="text-embedding-ada-002">Text Embedding Ada 002</SelectItem>
                          <SelectItem value="text-davinci-003">Text Davinci 003</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={deployment.capacity || '20'}
                        onChange={(e) => {
                          const newDeployments = [...(config.modelDeployments || [])];
                          newDeployments[index] = { ...deployment, capacity: e.target.value };
                          handleConfigChange('modelDeployments', newDeployments);
                        }}
                        placeholder="Capacity"
                        type="number"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDeployments = [...(config.modelDeployments || []), {
                      name: '',
                      model: 'gpt-35-turbo',
                      capacity: '20'
                    }];
                    handleConfigChange('modelDeployments', newDeployments);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Model Deployment
                </Button>
              </div>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'cosmos_db':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label htmlFor="kind">Database API <span className="text-red-500">*</span></Label>
              <Select value={config.kind} onValueChange={(value) => handleConfigChange('kind', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GlobalDocumentDB">SQL (Core)</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                  <SelectItem value="Parse">Cassandra</SelectItem>
                  <SelectItem value="Gremlin">Gremlin (Graph)</SelectItem>
                  <SelectItem value="GlobalDocumentDB">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="consistencyLevel">Consistency Level <span className="text-red-500">*</span></Label>
              <Select value={config.consistencyLevel} onValueChange={(value) => handleConfigChange('consistencyLevel', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strong">Strong</SelectItem>
                  <SelectItem value="BoundedStaleness">Bounded Staleness</SelectItem>
                  <SelectItem value="Session">Session</SelectItem>
                  <SelectItem value="ConsistentPrefix">Consistent Prefix</SelectItem>
                  <SelectItem value="Eventual">Eventual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxThroughput">Max Throughput (RU/s)</Label>
              <Input
                id="maxThroughput"
                type="number"
                value={config.maxThroughput || '4000'}
                onChange={(e) => handleConfigChange('maxThroughput', e.target.value)}
                placeholder="4000"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableAutomaticFailover"
                checked={config.enableAutomaticFailover || false}
                onCheckedChange={(checked) => handleConfigChange('enableAutomaticFailover', checked)}
              />
              <Label htmlFor="enableAutomaticFailover">Enable Automatic Failover</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableMultipleWriteLocations"
                checked={config.enableMultipleWriteLocations || false}
                onCheckedChange={(checked) => handleConfigChange('enableMultipleWriteLocations', checked)}
              />
              <Label htmlFor="enableMultipleWriteLocations">Enable Multiple Write Locations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableFreeTier"
                checked={config.enableFreeTier || false}
                onCheckedChange={(checked) => handleConfigChange('enableFreeTier', checked)}
              />
              <Label htmlFor="enableFreeTier">Enable Free Tier</Label>
            </div>
          </div>
        );

      case 'redis':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="family">Family <span className="text-red-500">*</span></Label>
              <Select value={config.family} onValueChange={(value) => handleConfigChange('family', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">C (Basic/Standard)</SelectItem>
                  <SelectItem value="P">P (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity <span className="text-red-500">*</span></Label>
              <Select value={config.capacity} onValueChange={(value) => handleConfigChange('capacity', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">C0 (250 MB)</SelectItem>
                  <SelectItem value="1">C1 (1 GB)</SelectItem>
                  <SelectItem value="2">C2 (2.5 GB)</SelectItem>
                  <SelectItem value="3">C3 (6 GB)</SelectItem>
                  <SelectItem value="4">C4 (13 GB)</SelectItem>
                  <SelectItem value="5">C5 (26 GB)</SelectItem>
                  <SelectItem value="6">C6 (53 GB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minimumTlsVersion">Minimum TLS Version</Label>
              <Select value={config.minimumTlsVersion || '1.2'} onValueChange={(value) => handleConfigChange('minimumTlsVersion', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">1.0</SelectItem>
                  <SelectItem value="1.1">1.1</SelectItem>
                  <SelectItem value="1.2">1.2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableNonSslPort"
                checked={config.enableNonSslPort || false}
                onCheckedChange={(checked) => handleConfigChange('enableNonSslPort', checked)}
              />
              <Label htmlFor="enableNonSslPort">Enable Non-SSL Port</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="redisDataPersistence"
                checked={config.redisDataPersistence || false}
                onCheckedChange={(checked) => handleConfigChange('redisDataPersistence', checked)}
              />
              <Label htmlFor="redisDataPersistence">Redis Data Persistence</Label>
            </div>
          </div>
        );

      case 'functions':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="servicePlanId">Service Plan ID <span className="text-red-500">*</span></Label>
              <Input
                id="servicePlanId"
                value={config.servicePlanId || ''}
                onChange={(e) => handleConfigChange('servicePlanId', e.target.value)}
                placeholder="Service Plan resource ID"
              />
            </div>
            <div>
              <Label htmlFor="storageAccountName">Storage Account Name <span className="text-red-500">*</span></Label>
              <Input
                id="storageAccountName"
                value={config.storageAccountName || ''}
                onChange={(e) => handleConfigChange('storageAccountName', e.target.value)}
                placeholder="Storage Account name"
              />
            </div>
            <div>
              <Label htmlFor="runtime">Runtime <span className="text-red-500">*</span></Label>
              <Select value={config.runtime} onValueChange={(value) => handleConfigChange('runtime', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dotnet">Azure Functions .NET</SelectItem>
                  <SelectItem value="node">Azure Functions Node.js</SelectItem>
                  <SelectItem value="python">Azure Functions Python</SelectItem>
                  <SelectItem value="java">Azure Functions Java</SelectItem>
                  <SelectItem value="powershell">Azure Functions PowerShell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="runtimeVersion">Runtime Version</Label>
              <Input
                id="runtimeVersion"
                value={config.runtimeVersion || ''}
                onChange={(e) => handleConfigChange('runtimeVersion', e.target.value)}
                placeholder="e.g., ~4, 18, 3.11"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="httpsOnly"
                checked={config.httpsOnly ?? true}
                onCheckedChange={(checked) => handleConfigChange('httpsOnly', checked)}
              />
              <Label htmlFor="httpsOnly">HTTPS Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableApplicationInsights"
                checked={config.enableApplicationInsights ?? true}
                onCheckedChange={(checked) => handleConfigChange('enableApplicationInsights', checked)}
              />
              <Label htmlFor="enableApplicationInsights">Enable Application Insights</Label>
            </div>
          </div>
        );

      case 'api_management':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Consumption">Consumption</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="publisherName">Publisher Name <span className="text-red-500">*</span></Label>
              <Input
                id="publisherName"
                value={config.publisherName || ''}
                onChange={(e) => handleConfigChange('publisherName', e.target.value)}
                placeholder="My Company"
              />
            </div>
            <div>
              <Label htmlFor="publisherEmail">Publisher Email <span className="text-red-500">*</span></Label>
              <Input
                id="publisherEmail"
                type="email"
                value={config.publisherEmail || ''}
                onChange={(e) => handleConfigChange('publisherEmail', e.target.value)}
                placeholder="admin@mycompany.com"
              />
            </div>
            <div>
              <Label htmlFor="virtualNetworkType">Virtual Network Type</Label>
              <Select value={config.virtualNetworkType || 'None'} onValueChange={(value) => handleConfigChange('virtualNetworkType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="External">External</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customProperties">Custom Properties</Label>
              <Textarea
                id="customProperties"
                value={config.customProperties || ''}
                onChange={(e) => handleConfigChange('customProperties', e.target.value)}
                placeholder="Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls10=False"
                rows={3}
              />
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'application_insights':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="applicationType">Application Type <span className="text-red-500">*</span></Label>
              <Select value={config.applicationType} onValueChange={(value) => handleConfigChange('applicationType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Application</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workspaceId">Log Analytics Workspace ID</Label>
              <Input
                id="workspaceId"
                value={config.workspaceId || ''}
                onChange={(e) => handleConfigChange('workspaceId', e.target.value)}
                placeholder="Log Analytics Workspace resource ID"
              />
            </div>
            <div>
              <Label htmlFor="samplingPercentage">Sampling Percentage</Label>
              <Input
                id="samplingPercentage"
                type="number"
                min="0"
                max="100"
                value={config.samplingPercentage || '100'}
                onChange={(e) => handleConfigChange('samplingPercentage', e.target.value)}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="retentionInDays">Retention in Days</Label>
              <Select value={config.retentionInDays || '90'} onValueChange={(value) => handleConfigChange('retentionInDays', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="120">120 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="270">270 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                  <SelectItem value="550">550 days</SelectItem>
                  <SelectItem value="730">730 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="disableIpMasking"
                checked={config.disableIpMasking || false}
                onCheckedChange={(checked) => handleConfigChange('disableIpMasking', checked)}
              />
              <Label htmlFor="disableIpMasking">Disable IP Masking</Label>
            </div>
          </div>
        );

      case 'container_registry':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="adminUserEnabled"
                checked={config.adminUserEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('adminUserEnabled', checked)}
              />
              <Label htmlFor="adminUserEnabled">Admin User Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="georeplications"
                checked={config.georeplications || false}
                onCheckedChange={(checked) => handleConfigChange('georeplications', checked)}
              />
              <Label htmlFor="georeplications">Enable Geo-replication</Label>
            </div>
            <div>
              <Label htmlFor="networkRuleSet">Network Rule Set</Label>
              <Select value={config.networkRuleSet || 'Allow'} onValueChange={(value) => handleConfigChange('networkRuleSet', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allow">Allow</SelectItem>
                  <SelectItem value="Deny">Deny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quarantinePolicy">Quarantine Policy</Label>
              <Select value={config.quarantinePolicy || 'disabled'} onValueChange={(value) => handleConfigChange('quarantinePolicy', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="trustPolicy"
                checked={config.trustPolicy || false}
                onCheckedChange={(checked) => handleConfigChange('trustPolicy', checked)}
              />
              <Label htmlFor="trustPolicy">Trust Policy</Label>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'event_hub':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={config.capacity || '1'}
                onChange={(e) => handleConfigChange('capacity', e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="messageRetention">Message Retention (Days)</Label>
              <Input
                id="messageRetention"
                type="number"
                min="1"
                max="7"
                value={config.messageRetention || '1'}
                onChange={(e) => handleConfigChange('messageRetention', e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="partitionCount">Partition Count</Label>
              <Input
                id="partitionCount"
                type="number"
                min="2"
                max="32"
                value={config.partitionCount || '2'}
                onChange={(e) => handleConfigChange('partitionCount', e.target.value)}
                placeholder="2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="zoneRedundant"
                checked={config.zoneRedundant || false}
                onCheckedChange={(checked) => handleConfigChange('zoneRedundant', checked)}
              />
              <Label htmlFor="zoneRedundant">Zone Redundant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoInflateEnabled"
                checked={config.autoInflateEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('autoInflateEnabled', checked)}
              />
              <Label htmlFor="autoInflateEnabled">Auto Inflate Enabled</Label>
            </div>
            {config.autoInflateEnabled && (
              <div>
                <Label htmlFor="maximumThroughputUnits">Maximum Throughput Units</Label>
                <Input
                  id="maximumThroughputUnits"
                  type="number"
                  min="1"
                  max="20"
                  value={config.maximumThroughputUnits || '20'}
                  onChange={(e) => handleConfigChange('maximumThroughputUnits', e.target.value)}
                  placeholder="20"
                />
              </div>
            )}
          </div>
        );

      case 'log_analytics':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Standalone">Standalone</SelectItem>
                  <SelectItem value="Unlimited">Unlimited</SelectItem>
                  <SelectItem value="PerGB2018">Per GB 2018</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="retentionInDays">Retention in Days</Label>
              <Select value={config.retentionInDays || '30'} onValueChange={(value) => handleConfigChange('retentionInDays', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="31">31 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="120">120 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="270">270 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                  <SelectItem value="550">550 days</SelectItem>
                  <SelectItem value="730">730 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dailyQuotaGb">Daily Quota (GB)</Label>
              <Input
                id="dailyQuotaGb"
                type="number"
                min="0.023"
                value={config.dailyQuotaGb || ''}
                onChange={(e) => handleConfigChange('dailyQuotaGb', e.target.value)}
                placeholder="0.1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="internetIngestionEnabled"
                checked={config.internetIngestionEnabled ?? true}
                onCheckedChange={(checked) => handleConfigChange('internetIngestionEnabled', checked)}
              />
              <Label htmlFor="internetIngestionEnabled">Internet Ingestion Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="internetQueryEnabled"
                checked={config.internetQueryEnabled ?? true}
                onCheckedChange={(checked) => handleConfigChange('internetQueryEnabled', checked)}
              />
              <Label htmlFor="internetQueryEnabled">Internet Query Enabled</Label>
            </div>
          </div>
        );

      case 'managed_identity':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Identity Type <span className="text-red-500">*</span></Label>
              <Select value={config.type} onValueChange={(value) => handleConfigChange('type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UserAssigned">User Assigned</SelectItem>
                  <SelectItem value="SystemAssigned">System Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Description of the managed identity"
                rows={3}
              />
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'private_endpoint':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label htmlFor="subnetId">Subnet ID <span className="text-red-500">*</span></Label>
              <Input
                id="subnetId"
                value={config.subnetId || ''}
                onChange={(e) => handleConfigChange('subnetId', e.target.value)}
                placeholder="Subnet resource ID"
              />
            </div>
            <div>
              <Label htmlFor="privateServiceConnectionName">Private Service Connection Name <span className="text-red-500">*</span></Label>
              <Input
                id="privateServiceConnectionName"
                value={config.privateServiceConnectionName || ''}
                onChange={(e) => handleConfigChange('privateServiceConnectionName', e.target.value)}
                placeholder="private-service-connection"
              />
            </div>
            <div>
              <Label htmlFor="privateLinkServiceId">Private Link Service ID <span className="text-red-500">*</span></Label>
              <Input
                id="privateLinkServiceId"
                value={config.privateLinkServiceId || ''}
                onChange={(e) => handleConfigChange('privateLinkServiceId', e.target.value)}
                placeholder="Private Link Service resource ID"
              />
            </div>
            <div>
              <Label htmlFor="subresourceNames">Subresource Names</Label>
              <Input
                id="subresourceNames"
                value={config.subresourceNames || ''}
                onChange={(e) => handleConfigChange('subresourceNames', e.target.value)}
                placeholder="blob,file,queue,table"
              />
              <div className="text-xs text-gray-500 mt-1">Comma-separated list of subresource names</div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isManualConnection"
                checked={config.isManualConnection || false}
                onCheckedChange={(checked) => handleConfigChange('isManualConnection', checked)}
              />
              <Label htmlFor="isManualConnection">Manual Connection</Label>
            </div>
          </div>
        );

      case 'route_table':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="disableBgpRoutePropagation"
                checked={config.disableBgpRoutePropagation || false}
                onCheckedChange={(checked) => handleConfigChange('disableBgpRoutePropagation', checked)}
              />
              <Label htmlFor="disableBgpRoutePropagation">Disable BGP Route Propagation</Label>
            </div>
            <div>
              <Label>Routes</Label>
              <div className="space-y-2">
                {(config.routes || []).map((route: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={route.name || ''}
                        onChange={(e) => {
                          const newRoutes = [...(config.routes || [])];
                          newRoutes[index] = { ...route, name: e.target.value };
                          handleConfigChange('routes', newRoutes);
                        }}
                        placeholder="Route name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newRoutes = [...(config.routes || [])];
                          newRoutes.splice(index, 1);
                          handleConfigChange('routes', newRoutes);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={route.addressPrefix || ''}
                        onChange={(e) => {
                          const newRoutes = [...(config.routes || [])];
                          newRoutes[index] = { ...route, addressPrefix: e.target.value };
                          handleConfigChange('routes', newRoutes);
                        }}
                        placeholder="Address prefix (e.g., 0.0.0.0/0)"
                      />
                      <Select
                        value={route.nextHopType || 'Internet'}
                        onValueChange={(value) => {
                          const newRoutes = [...(config.routes || [])];
                          newRoutes[index] = { ...route, nextHopType: value };
                          handleConfigChange('routes', newRoutes);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Internet">Internet</SelectItem>
                          <SelectItem value="VirtualAppliance">Virtual Appliance</SelectItem>
                          <SelectItem value="VirtualNetworkGateway">Virtual Network Gateway</SelectItem>
                          <SelectItem value="VnetLocal">VNet Local</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {route.nextHopType === 'VirtualAppliance' && (
                      <Input
                        value={route.nextHopIpAddress || ''}
                        onChange={(e) => {
                          const newRoutes = [...(config.routes || [])];
                          newRoutes[index] = { ...route, nextHopIpAddress: e.target.value };
                          handleConfigChange('routes', newRoutes);
                        }}
                        placeholder="Next hop IP address"
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRoutes = [...(config.routes || []), {
                      name: '',
                      addressPrefix: '',
                      nextHopType: 'Internet',
                      nextHopIpAddress: ''
                    }];
                    handleConfigChange('routes', newRoutes);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Route
                </Button>
              </div>
            </div>
          </div>
        );

      case 'role_assignment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="scope">Scope <span className="text-red-500">*</span></Label>
              <Input
                id="scope"
                value={config.scope || ''}
                onChange={(e) => handleConfigChange('scope', e.target.value)}
                placeholder="Resource scope (e.g., /subscriptions/xxx/resourceGroups/xxx)"
              />
            </div>
            <div>
              <Label htmlFor="roleDefinitionId">Role Definition ID <span className="text-red-500">*</span></Label>
              <Select value={config.roleDefinitionId} onValueChange={(value) => handleConfigChange('roleDefinitionId', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="b24988ac-6180-42a0-ab88-20f7382dd24c">Contributor</SelectItem>
                  <SelectItem value="acdd72a7-3385-48ef-bd42-f606fba81ae7">Reader</SelectItem>
                  <SelectItem value="8e3af657-a8ff-443c-a75c-2fe8c4bcb635">Owner</SelectItem>
                  <SelectItem value="f1a07417-d97a-45cb-824c-7a7467783830">Managed Identity Operator</SelectItem>
                  <SelectItem value="e40ec5ca-96e0-45a2-b4ff-59039f2c2b59">Managed Identity Contributor</SelectItem>
                  <SelectItem value="ba92f5b4-2d11-453d-a403-e96b0029c9fe">Storage Blob Data Contributor</SelectItem>
                  <SelectItem value="2a2b9908-6ea1-4ae2-8e65-a410df84e7d1">Storage Blob Data Reader</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="principalId">Principal ID <span className="text-red-500">*</span></Label>
              <Input
                id="principalId"
                value={config.principalId || ''}
                onChange={(e) => handleConfigChange('principalId', e.target.value)}
                placeholder="Object ID of user, group, or service principal"
              />
            </div>
            <div>
              <Label htmlFor="principalType">Principal Type</Label>
              <Select value={config.principalType || 'User'} onValueChange={(value) => handleConfigChange('principalType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                  <SelectItem value="ServicePrincipal">Service Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Description of the role assignment"
                rows={3}
              />
            </div>
          </div>
        );

      case 'role_definition':
        const formatActionsArray = (actions: string[] | string) => {
          if (Array.isArray(actions)) {
            return actions.join('\n');
          }
          return actions || '';
        };
        
        const parseActionsString = (actionsString: string) => {
          return actionsString
            .split('\n')
            .map(action => action.trim())
            .filter(action => action.length > 0);
        };

        return (
          <div className="space-y-4">
            {/* Role Name Field */}
            <div>
              <Label htmlFor="roleName">Role Name <span className="text-red-500">*</span></Label>
              <Input
                id="roleName"
                value={config.roleName || ''}
                onChange={(e) => handleConfigChange('roleName', e.target.value)}
                placeholder="Custom Role Name"
              />
            </div>
            
            {/* Scope Field */}
            <div>
              <Label htmlFor="scope">Scope <span className="text-red-500">*</span></Label>
              <Select value={config.scope || 'subscription'} onValueChange={(value) => handleConfigChange('scope', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="resource_group">Resource Group</SelectItem>
                  <SelectItem value="management_group">Management Group</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">Defines where this role can be assigned</div>
            </div>
            
            {/* Description Field */}
            <div>
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Description of the custom role and its purpose"
                rows={3}
              />
            </div>
            
            {/* Role Template Quick Actions */}
            <div>
              <Label>Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleConfigChange('roleName', 'AI Studio Automation Role');
                    handleConfigChange('description', 'Custom role for AI Studio environment automation');
                    handleConfigChange('actions', [
                      'Microsoft.Resources/subscriptions/resourceGroups/*',
                      'Microsoft.KeyVault/vaults/*',
                      'Microsoft.Storage/storageAccounts/*',
                      'Microsoft.CognitiveServices/accounts/*',
                      'Microsoft.MachineLearningServices/workspaces/*',
                      'Microsoft.Network/virtualNetworks/*',
                      'Microsoft.ContainerRegistry/registries/*'
                    ]);
                  }}
                >
                  AI Studio Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleConfigChange('roleName', 'Application Automation Role');
                    handleConfigChange('description', 'Custom role for application environment automation');
                    handleConfigChange('actions', [
                      'Microsoft.Web/serverfarms/*',
                      'Microsoft.Web/sites/*',
                      'Microsoft.Sql/servers/*',
                      'Microsoft.Sql/servers/databases/*',
                      'Microsoft.Insights/components/*',
                      'Microsoft.Storage/storageAccounts/read',
                      'Microsoft.Network/virtualNetworks/read'
                    ]);
                  }}
                >
                  App Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleConfigChange('roleName', 'Storage Automation Role');
                    handleConfigChange('description', 'Custom role for storage resource management');
                    handleConfigChange('actions', [
                      'Microsoft.Storage/storageAccounts/*',
                      'Microsoft.Storage/storageAccounts/blobServices/*',
                      'Microsoft.Storage/storageAccounts/fileServices/*',
                      'Microsoft.Storage/storageAccounts/queueServices/*',
                      'Microsoft.Storage/storageAccounts/tableServices/*'
                    ]);
                  }}
                >
                  Storage Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleConfigChange('roleName', 'Network Automation Role');
                    handleConfigChange('description', 'Custom role for network resource management');
                    handleConfigChange('actions', [
                      'Microsoft.Network/virtualNetworks/*',
                      'Microsoft.Network/networkSecurityGroups/*',
                      'Microsoft.Network/routeTables/*',
                      'Microsoft.Network/privateEndpoints/*',
                      'Microsoft.Network/loadBalancers/*'
                    ]);
                  }}
                >
                  Network Template
                </Button>
              </div>
            </div>
            
            {/* Actions Field */}
            <div>
              <Label htmlFor="actions">Actions <span className="text-red-500">*</span></Label>
              <Textarea
                id="actions"
                value={formatActionsArray(config.actions)}
                onChange={(e) => handleConfigChange('actions', parseActionsString(e.target.value))}
                placeholder="Microsoft.Storage/storageAccounts/read&#10;Microsoft.Storage/storageAccounts/write&#10;Microsoft.Network/virtualNetworks/*"
                rows={6}
              />
              <div className="text-xs text-gray-500 mt-1">One action per line. Use * for wildcard permissions</div>
            </div>
            
            {/* Not Actions Field */}
            <div>
              <Label htmlFor="notActions">Not Actions (Exclusions)</Label>
              <Textarea
                id="notActions"
                value={formatActionsArray(config.notActions)}
                onChange={(e) => handleConfigChange('notActions', parseActionsString(e.target.value))}
                placeholder="Microsoft.Storage/storageAccounts/delete&#10;Microsoft.Authorization/*/delete"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">Actions to explicitly deny (one per line)</div>
            </div>
            
            {/* Data Actions Field */}
            <div>
              <Label htmlFor="dataActions">Data Actions</Label>
              <Textarea
                id="dataActions"
                value={formatActionsArray(config.dataActions)}
                onChange={(e) => handleConfigChange('dataActions', parseActionsString(e.target.value))}
                placeholder="Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read&#10;Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">Data plane actions (one per line)</div>
            </div>
            
            {/* Not Data Actions Field */}
            <div>
              <Label htmlFor="notDataActions">Not Data Actions</Label>
              <Textarea
                id="notDataActions"
                value={formatActionsArray(config.notDataActions)}
                onChange={(e) => handleConfigChange('notDataActions', parseActionsString(e.target.value))}
                placeholder="Microsoft.Storage/storageAccounts/blobServices/containers/blobs/delete"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">Data plane actions to deny (one per line)</div>
            </div>
            
            {/* Assignable Scopes Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Role Scope:</strong> {config.scope === 'subscription' ? 'Can be assigned at subscription and resource group levels' : 
                config.scope === 'resource_group' ? 'Can only be assigned at resource group level' : 
                'Can be assigned at management group level and below'}
              </div>
            </div>
          </div>
        );

      case 'workbook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Select value={config.location} onValueChange={(value) => handleConfigChange('location', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="East US">East US</SelectItem>
                  <SelectItem value="West US">West US</SelectItem>
                  <SelectItem value="Central US">Central US</SelectItem>
                  <SelectItem value="North Europe">North Europe</SelectItem>
                  <SelectItem value="West Europe">West Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="displayName">Display Name <span className="text-red-500">*</span></Label>
              <Input
                id="displayName"
                value={config.displayName || ''}
                onChange={(e) => handleConfigChange('displayName', e.target.value)}
                placeholder="My Workbook"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Description of the workbook"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={config.category || 'workbook'} onValueChange={(value) => handleConfigChange('category', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="workbook">Workbook</SelectItem>
                  <SelectItem value="tsg">TSG</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="serializedData">Serialized Data</Label>
              <Textarea
                id="serializedData"
                value={config.serializedData || ''}
                onChange={(e) => handleConfigChange('serializedData', e.target.value)}
                placeholder="JSON serialized workbook data"
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="sourceId">Source ID</Label>
              <Input
                id="sourceId"
                value={config.sourceId || ''}
                onChange={(e) => handleConfigChange('sourceId', e.target.value)}
                placeholder="Source resource ID"
              />
            </div>
          </div>
        );

      case 'ad_group':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name <span className="text-red-500">*</span></Label>
              <Input
                id="displayName"
                value={config.displayName || ''}
                onChange={(e) => handleConfigChange('displayName', e.target.value)}
                placeholder="My Azure AD Group"
              />
            </div>
            <div>
              <Label htmlFor="mailNickname">Mail Nickname</Label>
              <Input
                id="mailNickname"
                value={config.mailNickname || ''}
                onChange={(e) => handleConfigChange('mailNickname', e.target.value)}
                placeholder="my-group"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Description of the Azure AD group"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="groupTypes">Group Types</Label>
              <Select value={config.groupTypes || 'security'} onValueChange={(value) => handleConfigChange('groupTypes', value === 'security' ? '' : value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Security Group</SelectItem>
                  <SelectItem value="Unified">Microsoft 365 Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="securityEnabled"
                checked={config.securityEnabled ?? true}
                onCheckedChange={(checked) => handleConfigChange('securityEnabled', checked)}
              />
              <Label htmlFor="securityEnabled">Security Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="mailEnabled"
                checked={config.mailEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('mailEnabled', checked)}
              />
              <Label htmlFor="mailEnabled">Mail Enabled</Label>
            </div>
          </div>
        );

      case 'ad_group_member':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupObjectId">Group Object ID <span className="text-red-500">*</span></Label>
              <Input
                id="groupObjectId"
                value={config.groupObjectId || ''}
                onChange={(e) => handleConfigChange('groupObjectId', e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="memberObjectId">Member Object ID <span className="text-red-500">*</span></Label>
              <Input
                id="memberObjectId"
                value={config.memberObjectId || ''}
                onChange={(e) => handleConfigChange('memberObjectId', e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="memberType">Member Type</Label>
              <Select value={config.memberType || 'User'} onValueChange={(value) => handleConfigChange('memberType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                  <SelectItem value="ServicePrincipal">Service Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'ad_group':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name <span className="text-red-500">*</span></Label>
              <Input
                id="displayName"
                value={config.displayName || ''}
                onChange={(e) => handleConfigChange('displayName', e.target.value)}
                placeholder="My Azure AD Group"
              />
            </div>
            <div>
              <Label htmlFor="mailNickname">Mail Nickname <span className="text-red-500">*</span></Label>
              <Input
                id="mailNickname"
                value={config.mailNickname || ''}
                onChange={(e) => handleConfigChange('mailNickname', e.target.value)}
                placeholder="mygroup"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Group description"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="groupTypes">Group Types</Label>
              <Select value={config.groupTypes || 'Security'} onValueChange={(value) => handleConfigChange('groupTypes', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Unified">Microsoft 365</SelectItem>
                  <SelectItem value="DynamicMembership">Dynamic Membership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="securityEnabled"
                checked={config.securityEnabled ?? true}
                onCheckedChange={(checked) => handleConfigChange('securityEnabled', checked)}
              />
              <Label htmlFor="securityEnabled">Security Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="mailEnabled"
                checked={config.mailEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('mailEnabled', checked)}
              />
              <Label htmlFor="mailEnabled">Mail Enabled</Label>
            </div>
            <div>
              <Label htmlFor="members">Members</Label>
              <Textarea
                id="members"
                value={config.members || ''}
                onChange={(e) => handleConfigChange('members', e.target.value)}
                placeholder="user1@domain.com&#10;user2@domain.com"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">One email per line</div>
            </div>
            <div>
              <Label htmlFor="owners">Owners</Label>
              <Textarea
                id="owners"
                value={config.owners || ''}
                onChange={(e) => handleConfigChange('owners', e.target.value)}
                placeholder="owner1@domain.com&#10;owner2@domain.com"
                rows={2}
              />
              <div className="text-xs text-gray-500 mt-1">One email per line</div>
            </div>
          </div>
        );

      case 'ad_group_member':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupObjectId">Group Object ID <span className="text-red-500">*</span></Label>
              <Input
                id="groupObjectId"
                value={config.groupObjectId || ''}
                onChange={(e) => handleConfigChange('groupObjectId', e.target.value)}
                placeholder="Azure AD Group Object ID"
              />
            </div>
            <div>
              <Label htmlFor="memberObjectId">Member Object ID <span className="text-red-500">*</span></Label>
              <Input
                id="memberObjectId"
                value={config.memberObjectId || ''}
                onChange={(e) => handleConfigChange('memberObjectId', e.target.value)}
                placeholder="User/Service Principal Object ID"
              />
            </div>
            <div>
              <Label htmlFor="memberType">Member Type</Label>
              <Select value={config.memberType || 'User'} onValueChange={(value) => handleConfigChange('memberType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="ServicePrincipal">Service Principal</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'postgresql':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label htmlFor="serverName">Server Name <span className="text-red-500">*</span></Label>
              <Input
                id="serverName"
                value={config.serverName || ''}
                onChange={(e) => handleConfigChange('serverName', e.target.value)}
                placeholder="postgresql-server-name"
              />
            </div>
            <div>
              <Label htmlFor="administratorLogin">Administrator Login <span className="text-red-500">*</span></Label>
              <Input
                id="administratorLogin"
                value={config.administratorLogin || ''}
                onChange={(e) => handleConfigChange('administratorLogin', e.target.value)}
                placeholder="psqladmin"
              />
            </div>
            <div>
              <Label htmlFor="administratorPassword">Administrator Password <span className="text-red-500">*</span></Label>
              <Input
                id="administratorPassword"
                type="password"
                value={config.administratorPassword || ''}
                onChange={(e) => handleConfigChange('administratorPassword', e.target.value)}
                placeholder="Enter strong password"
              />
            </div>
            <div>
              <Label htmlFor="version">PostgreSQL Version <span className="text-red-500">*</span></Label>
              <Select value={config.version || '13'} onValueChange={(value) => handleConfigChange('version', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">PostgreSQL 11</SelectItem>
                  <SelectItem value="12">PostgreSQL 12</SelectItem>
                  <SelectItem value="13">PostgreSQL 13</SelectItem>
                  <SelectItem value="14">PostgreSQL 14</SelectItem>
                  <SelectItem value="15">PostgreSQL 15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skuName">SKU Name <span className="text-red-500">*</span></Label>
              <Select value={config.skuName || 'B_Gen5_1'} onValueChange={(value) => handleConfigChange('skuName', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="B_Gen5_1">Basic Gen5 1 vCore</SelectItem>
                  <SelectItem value="B_Gen5_2">Basic Gen5 2 vCores</SelectItem>
                  <SelectItem value="GP_Gen5_2">General Purpose Gen5 2 vCores</SelectItem>
                  <SelectItem value="GP_Gen5_4">General Purpose Gen5 4 vCores</SelectItem>
                  <SelectItem value="GP_Gen5_8">General Purpose Gen5 8 vCores</SelectItem>
                  <SelectItem value="MO_Gen5_2">Memory Optimized Gen5 2 vCores</SelectItem>
                  <SelectItem value="MO_Gen5_4">Memory Optimized Gen5 4 vCores</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="storageMb">Storage (MB)</Label>
              <Select value={config.storageMb || '5120'} onValueChange={(value) => handleConfigChange('storageMb', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5120">5 GB</SelectItem>
                  <SelectItem value="10240">10 GB</SelectItem>
                  <SelectItem value="20480">20 GB</SelectItem>
                  <SelectItem value="51200">50 GB</SelectItem>
                  <SelectItem value="102400">100 GB</SelectItem>
                  <SelectItem value="1048576">1 TB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sslEnforcement"
                checked={config.sslEnforcement ?? true}
                onCheckedChange={(checked) => handleConfigChange('sslEnforcement', checked)}
              />
              <Label htmlFor="sslEnforcement">SSL Enforcement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="backupRetentionEnabled"
                checked={config.backupRetentionEnabled ?? true}
                onCheckedChange={(checked) => handleConfigChange('backupRetentionEnabled', checked)}
              />
              <Label htmlFor="backupRetentionEnabled">Backup Retention Enabled</Label>
            </div>
            <div>
              <Label htmlFor="backupRetentionDays">Backup Retention Days</Label>
              <Select value={config.backupRetentionDays || '7'} onValueChange={(value) => handleConfigChange('backupRetentionDays', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="21">21 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="35">35 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      case 'azurerm_resource_group':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Resource group description"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="preventDeletion"
                checked={config.preventDeletion || false}
                onCheckedChange={(checked) => handleConfigChange('preventDeletion', checked)}
              />
              <Label htmlFor="preventDeletion">Prevent Deletion</Label>
            </div>
          </div>
        );

      case 'cosmos_db':
        return (
          <div className="space-y-4">
            {renderLocationField()}
            <div>
              <Label htmlFor="offerType">Offer Type <span className="text-red-500">*</span></Label>
              <Select value={config.offerType || 'Standard'} onValueChange={(value) => handleConfigChange('offerType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kind">Database Kind <span className="text-red-500">*</span></Label>
              <Select value={config.kind || 'GlobalDocumentDB'} onValueChange={(value) => handleConfigChange('kind', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GlobalDocumentDB">Core (SQL)</SelectItem>
                  <SelectItem value="MongoDB">Azure Cosmos DB for MongoDB</SelectItem>
                  <SelectItem value="Parse">Parse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="consistencyLevel">Consistency Level <span className="text-red-500">*</span></Label>
              <Select value={config.consistencyLevel || 'Session'} onValueChange={(value) => handleConfigChange('consistencyLevel', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eventual">Eventual</SelectItem>
                  <SelectItem value="Session">Session</SelectItem>
                  <SelectItem value="BoundedStaleness">Bounded Staleness</SelectItem>
                  <SelectItem value="ConsistentPrefix">Consistent Prefix</SelectItem>
                  <SelectItem value="Strong">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableAutomaticFailover"
                checked={config.enableAutomaticFailover || false}
                onCheckedChange={(checked) => handleConfigChange('enableAutomaticFailover', checked)}
              />
              <Label htmlFor="enableAutomaticFailover">Enable Automatic Failover</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableMultipleWriteLocations"
                checked={config.enableMultipleWriteLocations || false}
                onCheckedChange={(checked) => handleConfigChange('enableMultipleWriteLocations', checked)}
              />
              <Label htmlFor="enableMultipleWriteLocations">Enable Multiple Write Locations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isVirtualNetworkFilterEnabled"
                checked={config.isVirtualNetworkFilterEnabled || false}
                onCheckedChange={(checked) => handleConfigChange('isVirtualNetworkFilterEnabled', checked)}
              />
              <Label htmlFor="isVirtualNetworkFilterEnabled">Virtual Network Filter</Label>
            </div>
            <div>
              <Label htmlFor="ipRangeFilter">IP Range Filter</Label>
              <Input
                id="ipRangeFilter"
                value={config.ipRangeFilter || ''}
                onChange={(e) => handleConfigChange('ipRangeFilter', e.target.value)}
                placeholder="104.42.195.92,40.76.54.131,52.176.6.30,52.169.50.45/32"
              />
            </div>
            
            {/* AD Roles Section */}
            {renderADRolesSection()}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {renderLocationField()}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
      <div className="p-4 w-full border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Resource Header */}
        <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">{renderResourceIcon(resource.type)}</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {resource.type.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Configure the selected {resource.type.replace('_', ' ')} resource
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto">
        <form className="space-y-4 w-full p-4">
          <div className="w-full">
            <Label htmlFor="name">Resource Name <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="name"
                data-allow-select="true"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={`Enter ${resource.type.replace('_', ' ')} name`}
                className={`w-full ${!nameValidation.isValid ? 'border-red-500' : nameValidation.warnings.length > 0 ? 'border-yellow-500' : 'border-green-500'}`}
              />
              {nameValidation.isValid && nameValidation.warnings.length === 0 && name.length > 0 && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
              {!nameValidation.isValid && (
                <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            
            {/* Name validation feedback */}
            {nameValidation.errors.length > 0 && (
              <Alert className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {nameValidation.errors.map((error, index) => (
                    <div key={index} className="text-xs">{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            
            {nameValidation.warnings.length > 0 && (
              <Alert className="mt-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  {nameValidation.warnings.map((warning, index) => (
                    <div key={index} className="text-xs">{warning}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            
            {!nameValidation.isValid && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSuggestion}
                  className="text-xs"
                >
                  Generate Valid Name
                </Button>
              </div>
            )}
            
            {/* Azure naming rules info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <div className="font-medium">Azure naming rules:</div>
              <div>• Length: {namingRule.minLength}-{namingRule.maxLength} characters</div>
              {namingRule && typeof namingRule.rules === 'string' && (
                <div>• {namingRule.rules}</div>
              )}
            </div>
          </div>

          {/* Subscription Field */}
          <div className="w-full">
            <Label htmlFor="subscription">Subscription</Label>
            <Input
              id="subscription"
              data-allow-select="true"
              value={config.subscription || 'Azure Subscription'}
              onChange={(e) => handleConfigChange('subscription', e.target.value)}
              placeholder="Enter subscription name"
              disabled={resource.type !== 'resource_group'}
              className={`w-full ${resource.type !== 'resource_group' ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {resource.type === 'resource_group' ? 'Azure subscription name (1-64 characters)' : 'Inherited from resource group'}
            </div>
          </div>

          {/* Resource Group Field */}
          <div className="w-full">
            <Label htmlFor="resourceGroup">Resource Group</Label>
            <Input
              id="resourceGroup"
              data-allow-select="true"
              value={config.resourceGroup || (resource.type === 'resource_group' ? resource.name : 'Default Resource Group')}
              onChange={(e) => handleConfigChange('resourceGroup', e.target.value)}
              placeholder="Enter resource group name"
              disabled={resource.type !== 'resource_group'}
              className={`w-full ${resource.type !== 'resource_group' ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {resource.type === 'resource_group' ? 'Azure resource group name (1-90 characters, cannot end with period)' : 'Inherited from parent resource group'}
            </div>
          </div>

          {renderConfigurationForm()}

          {/* Tags Section */}
          <div>
            <Label>Tags</Label>
            <TagsEditor 
              tags={config.tags || {}} 
              onTagsChange={handleTagsChange}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              onClick={handleApplyConfiguration}
              disabled={!nameValidation.isValid || !name.trim()}
              className="flex-1"
            >
              Apply Configuration
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TagsEditorProps {
  tags: Record<string, string>;
  onTagsChange: (tags: Record<string, string>) => void;
}

function TagsEditor({ tags, onTagsChange }: TagsEditorProps) {
  const addTag = () => {
    const newTags = { ...tags, '': '' };
    onTagsChange(newTags);
  };

  const updateTag = (oldKey: string, newKey: string, value: string) => {
    const newTags = { ...tags };
    if (oldKey !== newKey) {
      delete newTags[oldKey];
    }
    newTags[newKey] = value;
    onTagsChange(newTags);
  };

  const removeTag = (key: string) => {
    const newTags = { ...tags };
    delete newTags[key];
    onTagsChange(newTags);
  };

  return (
    <div className="space-y-2">
      {Object.entries(tags).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <Input
            value={key}
            onChange={(e) => updateTag(key, e.target.value, value)}
            placeholder="Key"
            className="flex-1"
          />
          <Input
            value={value}
            onChange={(e) => updateTag(key, key, e.target.value)}
            placeholder="Value"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeTag(key)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addTag}
        className="text-primary"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Tag
      </Button>
    </div>
  );
}
