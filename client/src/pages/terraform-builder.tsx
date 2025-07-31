import { useState, useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { useLocation } from "wouter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, X } from "lucide-react";
import Header from "@/components/Header";
import ResourceSidebar from "@/components/ResourceSidebar";
import Canvas from "@/components/Canvas";
import ConfigurationPanel from "@/components/ConfigurationPanel";
import CodePreviewPanel from "@/components/CodePreviewPanel";
import GlobalInfoModal from "@/components/GlobalInfoModal";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { TerraformResource, LandingZone } from "@/types/terraform";
import { incrementRoleAssignmentCount, resetSessionRoleCount } from "../utils/roleAssignmentStorage";

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

export default function TerraformBuilder() {
  const [resources, setResources] = useState<TerraformResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<TerraformResource | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'code' | 'deployment' | 'logs'>('code');
  const [error, setError] = useState<string | null>(null);
  const [showGlobalInfo, setShowGlobalInfo] = useState(false);
  const [selectedLandingZone, setSelectedLandingZone] = useState<string | undefined>(undefined);
  const [showConfigurationPanel, setShowConfigurationPanel] = useState(false);
  const [configurationMode, setConfigurationMode] = useState<'subscription' | 'resource_group' | 'resource'>('subscription');
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string | null>(null);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [roleCount, setRoleCount] = useState(0);
  
  // Role Assignment form state
  const [roleAssignmentForm, setRoleAssignmentForm] = useState({
    groupName: '',
    groupEmail: '',
    description: '',
    roleType: 'owner' // 'owner', 'contributor' or 'reader'
  });
  
  // Validation error state for role assignment form
  const [roleAssignmentErrors, setRoleAssignmentErrors] = useState({
    groupName: ''
  });
  
  // Resource Group configuration state
  const [resourceGroupConfig, setResourceGroupConfig] = useState({
    subscriptionName: '',
    resourceGroupName: '',
    location: '',
    tags: {} as Record<string, string>
  });

  // Global settings state for Canvas
  const [globalSettings, setGlobalSettings] = useState<{
    subscriptionName?: string;
    projectName?: string;
    environment?: string;
    region?: string;
  }>({});

  // Global settings handler to update both global settings and resource group config in real-time
  const handleGlobalSettingsUpdate = (settings: {
    subscriptionName?: string;
    resourceGroupName?: string;
    projectName?: string;
    environment?: string;
    region?: string;
    tags?: Record<string, string>;
  }) => {
    console.log('📥 Received global settings update:', settings);
    
    // Update global settings state for Canvas
    setGlobalSettings(prev => ({
      ...prev,
      subscriptionName: settings.subscriptionName || prev.subscriptionName,
      projectName: settings.projectName || prev.projectName,
      environment: settings.environment || prev.environment,
      region: settings.region || prev.region
    }));
    
    // Update resource group config for Configuration panels
    setResourceGroupConfig(prev => ({
      ...prev,
      subscriptionName: settings.subscriptionName || prev.subscriptionName,
      resourceGroupName: settings.resourceGroupName || prev.resourceGroupName,
      location: settings.region || prev.location,
      tags: settings.tags || prev.tags
    }));
    
    console.log('✅ Global settings and resource group config updated');
  };

  const roleScopePrefix =
  configurationMode === 'resource_group' && selectedResourceGroup === null
    ? 'rg'
    : 'sub';
  
  // Undo/Redo state management
  const [history, setHistory] = useState<TerraformResource[][]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const { socket, isConnected } = useWebSocket();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Global settings helper functions
  const GLOBAL_SETTINGS_KEY = 'terraform-builder-global-settings';
  
  const loadGlobalSettings = () => {
    try {
      const saved = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading global settings:', error);
      return null;
    }
  };

  const saveResourceGroupConfig = (config: typeof resourceGroupConfig) => {
    // Find the resource group resource and update it
    const updatedResources = resources.map(resource => {
      if (resource.type === 'resource_group' && resource.name === selectedResourceGroup) {
        return {
          ...resource,
          config: {
            ...resource.config,
            subscriptionName: config.subscriptionName,
            resourceGroupName: config.resourceGroupName,
            location: config.location,
            tags: config.tags
          }
        };
      }
      return resource;
    });
    
    setResources(updatedResources);
    toast({
      title: "Resource Group Updated",
      description: "Resource group configuration has been saved successfully.",
    });
  };

  // TagsEditor component for resource group configuration
  const TagsEditor = ({ tags, onTagsChange }: { tags: Record<string, string>; onTagsChange: (tags: Record<string, string>) => void; }) => {
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

 useEffect(() => {
  const subscriptionId = `sub-${project}-${region}-${env}-01`.toLowerCase();
  resetSessionRoleCount(subscriptionId);
}, []);

console.log(globalSettings);

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
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'deployment_update') {
          console.log('Deployment update:', message.data);
          // Handle deployment status updates
        }
      };
    }
  }, [socket]);

  // Initialize global settings with default values that match GlobalInfoModal
  useEffect(() => {
    // Always use default values to match GlobalInfoModal, not cached localStorage values
    // This ensures Canvas and Configuration panels show consistent values from start
    const defaultSettings = {
      subscriptionName: `sub-project-centralus-nonprod-01`,
      projectName: 'project',
      environment: 'nonprod',
      region: 'Central US'
    };
    
    console.log('🚀 Initializing globalSettings with defaults:', defaultSettings);
    setGlobalSettings(defaultSettings);
  }, []);

  // Helper function to get subscription display values using current globalSettings
  const getSubscriptionDisplayValues = () => {
    // Use current globalSettings state for real-time updates
    const currentProjectName = globalSettings.projectName || 'project';
    const currentEnvironment = globalSettings.environment || 'nonprod';
    const currentRegion = globalSettings.region || 'Central US';
    const currentSubscriptionName = globalSettings.subscriptionName || `sub-${currentProjectName.toLowerCase()}-centralus-${currentEnvironment.toLowerCase()}-01`;
    
    // Generate environment label
    const environmentLabel = currentEnvironment === "nonprod" ? "Non-Prod" : 
                            currentEnvironment === "dev" ? "Dev" :
                            currentEnvironment === "test" ? "Test" :
                            currentEnvironment === "prod" ? "Prod" : currentEnvironment;
    
    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    const currentTags = {
      "AppName": currentProjectName,
      "Environment": environmentLabel,
      "ProvisionedBy": "Terraform", 
      "ProvisionedDate": formattedDate
    };
    
    console.log('📊 Configuration Panel Display Values:', {
      subscriptionName: currentSubscriptionName,
      region: currentRegion,
      environment: currentEnvironment,
      projectName: currentProjectName,
      fromGlobalSettings: globalSettings
    });
    
    return {
      subscriptionName: currentSubscriptionName,
      region: currentRegion,
      environment: currentEnvironment,
      projectName: currentProjectName,
      tags: currentTags
    };
  };

  // Helper function to get role assignment data from Test Landing Zone
  const getRoleAssignmentFromTestLandingZone = () => {
    // Only work with Test Landing Zone
    if (selectedLandingZone !== 'test_landing_zone') {
      return null;
    }
    
    // Find role assignment and role definition resources in current resources
    const roleAssignmentResource = resources.find(r => r.type === 'role_assignment');
    const roleDefinitionResource = resources.find(r => r.type === 'role_definition');
    
    if (roleAssignmentResource && roleDefinitionResource) {
      // Generate role name in format: azad.rg-{project}-{environment}.{roleType}
      const currentProjectName = globalSettings.projectName || 'project';
      const currentEnvironment = globalSettings.environment || 'nonprod';
      
      // Extract role type from role definition name (e.g., "automation" from "Test Environment Automation Role")
      const roleDefinitionName = roleDefinitionResource.config?.roleName || 'Test Environment Automation Role';
      const roleType = roleDefinitionName.toLowerCase().includes('automation') ? 'automation' : 'owner';
      
      const formattedRoleName = `azad.rg-${currentProjectName.toLowerCase()}-${currentEnvironment.toLowerCase()}.${roleType}`;
      
      return {
        roleName: formattedRoleName,
        principalType: roleAssignmentResource.config?.principalType || 'User'
      };
    }
    
    return null;
  };

  // Helper function to get resource group display values using current globalSettings
  const getResourceGroupDisplayValues = () => {
    // Use current globalSettings state for real-time updates
    const currentProjectName = globalSettings.projectName || 'project';
    const currentEnvironment = globalSettings.environment || 'nonprod';
    const currentRegion = globalSettings.region || 'Central US';
    const currentSubscriptionName = globalSettings.subscriptionName || `sub-${currentProjectName.toLowerCase()}-centralus-${currentEnvironment.toLowerCase()}-01`;
    
    // Generate resource group name using same logic as GlobalInfoModal
    const getShortRegionName = (regionLabel: string) => {
      const regionMappings: { [key: string]: string } = {
        'East US': 'eastus',
        'East US 2': 'eastus2',
        'West US': 'westus',
        'West US 2': 'westus2',
        'Central US': 'centralus',
        'North Central US': 'ncentralus',
        'South Central US': 'scentralus',
        'West Central US': 'wcentralus'
      };
      return regionMappings[regionLabel] || 'centralus';
    };
    
    const shortRegion = getShortRegionName(currentRegion);
    const currentResourceGroupName = `rg-${currentProjectName.toLowerCase()}-${shortRegion}-${currentEnvironment}-01`;
    
    // Generate environment label
    const environmentLabel = currentEnvironment === "nonprod" ? "Non-Prod" : 
                            currentEnvironment === "dev" ? "Dev" :
                            currentEnvironment === "test" ? "Test" :
                            currentEnvironment === "prod" ? "Prod" : currentEnvironment;
    
    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    const currentTags = {
      "AppName": currentProjectName,
      "Environment": environmentLabel,
      "ProvisionedBy": "Terraform", 
      "ProvisionedDate": formattedDate
    };
    
    console.log('📁 Resource Group Display Values:', {
      subscriptionName: currentSubscriptionName,
      resourceGroupName: currentResourceGroupName,
      location: currentRegion,
      fromGlobalSettings: globalSettings
    });
    
    return {
      subscriptionName: currentSubscriptionName,
      resourceGroupName: currentResourceGroupName,
      location: currentRegion,
      tags: currentTags
    };
  };

  // Load global settings and populate resource group config when mode changes
  useEffect(() => {
    if (configurationMode === 'resource_group' && selectedResourceGroup) {
      const globalSettings = loadGlobalSettings();
      const resourceGroup = resources.find(r => r.type === 'resource_group' && r.name === selectedResourceGroup);
      
      setResourceGroupConfig({
        subscriptionName: resourceGroup?.config?.subscriptionName || globalSettings?.subscriptionName || '',
        resourceGroupName: resourceGroup?.config?.resourceGroupName || selectedResourceGroup || '',
        location: resourceGroup?.config?.location || globalSettings?.region || '',
        tags: resourceGroup?.config?.tags || globalSettings?.tags || {}
      });
    }
  }, [configurationMode, selectedResourceGroup, resources]);

  // Add resources to history when they change (but not during undo/redo)
  useEffect(() => {
    if (!isUndoRedoAction) {
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push([...resources]);
      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
  }, [resources, isUndoRedoAction]);

  // Undo functionality
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setIsUndoRedoAction(true);
      const previousState = history[currentHistoryIndex - 1];
      setResources([...previousState]);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setSelectedResource(null);
      setTimeout(() => setIsUndoRedoAction(false), 0);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      const nextState = history[currentHistoryIndex + 1];
      setResources([...nextState]);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setSelectedResource(null);
      setTimeout(() => setIsUndoRedoAction(false), 0);
    }
  };

  // Add to history helper
  const addToHistory = (newResources: TerraformResource[]) => {
    if (!isUndoRedoAction) {
      const newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push([...newResources]);
      setHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
  };

  // Check if resource name already exists
  const isResourceNameExists = (name: string, existingResources: TerraformResource[]) => {
    return existingResources.some(r => r.name.toLowerCase() === name.toLowerCase());
  };

  // Generate unique resource name based on existing resources
  const generateUniqueResourceName = (resourceType: string, existingResources: TerraformResource[]) => {
    // Get base name for the resource type
    const getBaseName = (type: string) => {
      const baseNames: { [key: string]: string } = {
        'storage_account': 'storageaccount',
        'virtual_machine': 'vm',
        'key_vault': 'keyvault',
        'virtual_network': 'vnet',
        'network_security_group': 'nsg',

        'app_service': 'app',
        'sql_database': 'sqldb',
        'ai_studio': 'aistudio',
        'api_management': 'apim',
        'application_insights': 'appinsights',
        'container_registry': 'acr',
        'cosmos_db': 'cosmosdb',
        'event_hub': 'eventhub',
        'functions': 'func',
        'log_analytics': 'loganalytics',
        'managed_identity': 'identity',
        'openai': 'openai',
        'private_endpoint': 'privateendpoint',
        'redis': 'redis',
        'route_table': 'routetable',
        'role_assignment': 'roleassignment',
        'role_definition': 'roledefinition',
        'subnet': 'subnet',
        'ad_group': 'adgroup',
        'ad_group_member': 'adgroupmember',
        'workbook': 'workbook'
      };
      return baseNames[type] || type.replace(/_/g, '');
    };

    const baseName = getBaseName(resourceType);
    const existingOfType = existingResources.filter(r => r.type === resourceType);
    
    // If no existing resources of this type, use baseName + 1
    if (existingOfType.length === 0) {
      return `${baseName}1`;
    }
    
    // Find the highest number used for this resource type
    let highestNumber = 0;
    existingOfType.forEach(resource => {
      const match = resource.name.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    return `${baseName}${highestNumber + 1}`;
  };

  const handleResourceDrop = (resourceType: string, position: { x: number; y: number }) => {
    try {
      console.log('🔄 TERRAFORM BUILDER: handleResourceDrop called with:', resourceType, 'at position:', position);
      
      const newResources = [...resources];
      let resourceGroup: TerraformResource | undefined;
      
      // Skip resource group creation if dropping a resource group itself
      if (resourceType !== 'resource_group') {
        // For Virtual Network resources, create VNet resource group if it doesn't exist
        if (resourceType === 'virtual_network' || resourceType === 'subnet' || resourceType === 'network_security_group' || resourceType === 'route_table') {
          const existingVNetRG = resources.find(r => r.type === 'resource_group' && r.name.startsWith('rg-vnet-'));
          if (!existingVNetRG) {
            console.log('🌐 Creating new VNet Resource Group automatically');
            const vnetResourceGroup = {
              id: `vnet-resource-group-${Date.now()}`,
              type: 'resource_group',
              name: `rg-vnet-${Date.now()}`, // Will be updated by Global Info
              config: getDefaultConfig('resource_group'),
              position: { x: position.x - 50, y: position.y - 100 },
              dependencies: []
            };
            newResources.push(vnetResourceGroup);
            resourceGroup = vnetResourceGroup;
            console.log('✅ VNet Resource Group created:', vnetResourceGroup.name);
          } else {
            resourceGroup = existingVNetRG;
            console.log('🌐 Using existing VNet Resource Group:', existingVNetRG.name);
          }
        } else {
          // Auto-create regular Resource Group if no Resource Group exists
          if (!resources.some(r => r.type === 'resource_group' && !r.name.startsWith('rg-vnet-'))) {
            console.log('📁 Creating new Resource Group automatically');
            resourceGroup = {
              id: `resource-group-${Date.now()}`,
              type: 'resource_group',
              name: generateUniqueResourceName('resource_group', resources),
              config: getDefaultConfig('resource_group'),
              position: { x: position.x - 50, y: position.y - 50 },
              dependencies: []
            };
            newResources.push(resourceGroup);
            console.log('✅ Resource Group created:', resourceGroup.name);
          } else {
            // Use existing regular resource group (not VNet)
            resourceGroup = resources.find(r => r.type === 'resource_group' && !r.name.startsWith('rg-vnet-'));
            console.log('📁 Using existing Resource Group:', resourceGroup?.name);
          }
        }
      } else {
        console.log('📁 Creating standalone Resource Group');
      }
      
      const config = getDefaultConfig(resourceType);
      console.log('⚙️ Default config for', resourceType, ':', config);
      
      // Associate resource with resource group (except for resource_group itself)
      if (resourceType !== 'resource_group' && resourceGroup) {
        // For Virtual Network resources, assign to VNet resource group if it exists
        if (resourceType === 'virtual_network' || resourceType === 'subnet' || resourceType === 'network_security_group' || resourceType === 'route_table') {
          const vnetResourceGroup = resources.find(r => r.type === 'resource_group' && r.name.startsWith('rg-vnet-'));
          if (vnetResourceGroup) {
            config.resourceGroup = vnetResourceGroup.name;
            console.log('🌐 Associated VNet resource with VNet Resource Group:', vnetResourceGroup.name);
          } else {
            config.resourceGroup = resourceGroup.name;
            console.log('🔗 Associated with default Resource Group:', resourceGroup.name);
          }
        } else {
          config.resourceGroup = resourceGroup.name;
          console.log('🔗 Associated with Resource Group:', resourceGroup.name);
        }
      }
      
      // Generate unique name for the new resource
      const uniqueName = generateUniqueResourceName(resourceType, resources);
      console.log('🏷️ Generated unique name:', uniqueName);
      
      const newResource: TerraformResource = {
        id: `${resourceType}-${Date.now()}`,
        type: resourceType,
        name: uniqueName,
        config,
        position,
        dependencies: [],
      };
      
      console.log('✅ Created new resource:', newResource);
      console.log('📊 Total resources after drop:', newResources.length);
      
      newResources.push(newResource);
      setResources(newResources);
      setSelectedResource(newResource);
      addToHistory(newResources);
      
      // Show success notification
      toast({
        title: "Resource Added",
        description: `${resourceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} "${uniqueName}" has been added to the canvas.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Error dropping resource:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to create ${resourceType}: ${errorMessage}`);
      toast({
        title: "Resource Drop Error",
        description: `Failed to create ${resourceType}: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const handleResourceSelect = (resource: TerraformResource) => {
    setSelectedResource(resource);
  };

  const handleResourceUpdate = (updatedResource: TerraformResource) => {
    // Check for duplicate names (excluding the current resource being updated)
    const isDuplicate = resources.some(r => 
      r.id !== updatedResource.id && 
      r.name.toLowerCase() === updatedResource.name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate Resource Name",
        description: `A resource with the name "${updatedResource.name}" already exists. Please choose a different name.`,
        variant: "destructive"
      });
      return;
    }
    
    setResources(resources.map(r => 
      r.id === updatedResource.id ? updatedResource : r
    ));
    setSelectedResource(updatedResource);
  };

  const handleResourceDelete = (resourceId: string) => {
    setResources(resources.filter(r => r.id !== resourceId));
    if (selectedResource?.id === resourceId) {
      setSelectedResource(null);
    }
  };

  const handleResourceMove = (resourceId: string, position: { x: number; y: number }) => {
    setResources(resources.map(r => 
      r.id === resourceId ? { ...r, position } : r
    ));
  };

  const handleLandingZoneSelect = (landingZone: LandingZone) => {
  // Convert landing zone resources to TerraformResource format
  let terraformResources: TerraformResource[] = landingZone.resources.map((lzResource, index) => ({
    id: `${lzResource.type}-${Date.now()}-${index}`,
    type: lzResource.type,
    name: lzResource.name,
    config: {
      ...lzResource.field_state,
      resourceGroup: lzResource.resource_group || (lzResource.type === 'resource_group' ? undefined : 'ai-studio-rg')
    },
    position: lzResource.position,
    dependencies: []
  }));

  // ✅ Filter out role_definition and role_assignment if it's test_landing_zone
  if (landingZone.id === 'test_landing_zone') {
    terraformResources = terraformResources.filter(
      (res) => res.type !== 'role_definition' && res.type !== 'role_assignment'
    );
  }

  // Replace current resources with landing zone resources
  setResources(terraformResources);
  setSelectedResource(null);

  // Auto-open Global Info modal for Test Landing Zone and AI Studio Landing Zone
  if (landingZone.id === 'ai_studio_landing_zone' || landingZone.id === 'test_landing_zone') {
    setSelectedLandingZone(landingZone.id);
    setShowGlobalInfo(true);
  }

  // Auto-select configuration based on landing zone type
  if (terraformResources.length > 0) {
    if (landingZone.id === 'application_zone') {
      // For Application Zone, show Subscription Configuration by default
      setShowConfigurationPanel(true);
      setConfigurationMode('subscription');
      setSelectedResource(null);
    } else {
      // For other landing zones, auto-select the first resource for configuration
      setSelectedResource(terraformResources[0]);
    }
  }
};


  // Handle Configuration Panel trigger from Global Info Modal
  const handleConfigurationPanelTrigger = () => {
    setShowConfigurationPanel(true);
    setConfigurationMode('subscription');
    setSelectedResource(null); // Clear any selected resource to show subscription config
  };

  // Handle resource group card click
  const handleResourceGroupClick = (resourceGroupName: string) => {
    setShowConfigurationPanel(true);
    
    if (resourceGroupName === 'subscription') {
      setConfigurationMode('subscription');
      setSelectedResourceGroup(null);
      setShowRoleAssignment(false);
    } else if (resourceGroupName === 'owner') {
      setConfigurationMode('subscription');
      setSelectedResourceGroup(null);
      setShowRoleAssignment(true);
    }else if (resourceGroupName === 'RG-owner') {
      setConfigurationMode('resource_group');
      setSelectedResourceGroup(null);
      setShowRoleAssignment(true);
    } 
    else {
      setConfigurationMode('resource_group');
      setSelectedResourceGroup(resourceGroupName);
      setShowRoleAssignment(false);
    }
    
    setSelectedResource(null); // Clear selected resource when switching modes
  };

  const handleRoleAssignmentClick = (resourceGroupName: string) => {
    setShowConfigurationPanel(true);
    setConfigurationMode('role_assignment');
    setSelectedResourceGroup(resourceGroupName);
    setShowRoleAssignment(true);
    setSelectedResource(null);
  };

  const getDefaultConfig = (resourceType: string) => {
    switch (resourceType) {
      case 'resource_group':
        return { location: 'East US', tags: { Environment: 'Development' } };
      case 'key_vault':
        return { 
          location: 'East US', 
          skuName: 'standard', 
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'Key Vault Administrator', 'Key Vault Secrets Officer'],
          tags: { Environment: 'Development' }
        };
      case 'storage_account':
        return { 
          location: 'East US', 
          accountTier: 'Standard', 
          replicationType: 'LRS', 
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'Storage Blob Data Owner', 'Storage Blob Data Contributor'],
          tags: { Environment: 'Development' }
        };
      case 'virtual_network':
        return { location: 'East US', addressSpace: ['10.0.0.0/16'], tags: { Environment: 'Development' } };
      case 'subnet':
        return { addressPrefixes: ['10.0.1.0/24'] };
      case 'network_security_group':
        return { location: 'East US', securityRules: [], tags: { Environment: 'Development' } };
      case 'virtual_machine':
        return { 
          location: 'East US', 
          size: 'Standard_B2s', 
          adminUsername: 'azureuser',
          disablePasswordAuth: true,
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'Virtual Machine Contributor', 'Network Contributor'],
          tags: { Environment: 'Development' }
        };
      case 'app_service':
        return { location: 'East US', tags: { Environment: 'Development' } };
      case 'sql_database':
        return { 
          location: 'East US', 
          collation: 'SQL_Latin1_General_CP1_CI_AS', 
          skuName: 'S0', 
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'SQL DB Contributor', 'SQL Server Contributor'],
          tags: { Environment: 'Development' }
        };
      case 'role_assignment':
        return { 
          location: 'East US', 
          principalType: 'User', 
          roleDefinitionId: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
          roleName: 'Contributor',
          principalId: 'data.azurerm_client_config.current.object_id',
          scope: 'azurerm_resource_group.main.id',
          availableRoles: [
            { id: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635', name: 'Owner' },
            { id: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c', name: 'Contributor' },
            { id: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7', name: 'Reader' }
          ],
          tags: { Environment: 'Development' }
        };
      case 'role_definition':
        return { 
          location: 'East US', 
          roleName: 'Custom Role', 
          description: 'Custom role definition',
          scope: 'azurerm_resource_group.main.id',
          actions: ['Microsoft.Resources/subscriptions/resourceGroups/read'],
          notActions: [],
          tags: { Environment: 'Development' }
        };
      case 'ad_group':
        return { 
          displayName: 'Azure AD Group', 
          description: 'Azure Active Directory group for role assignments',
          groupTypes: ['Unified'],
          mailEnabled: false,
          securityEnabled: true,
          owners: [],
          members: [],
          tags: { Environment: 'Development' }
        };
      case 'ad_group_member':
        return { 
          groupId: 'azuread_group.main.id',
          memberId: 'data.azuread_client_config.current.object_id',
          tags: { Environment: 'Development' }
        };
      case 'ai_studio':
        return { 
          location: 'East US', 
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'AI Developer'],
          tags: { Environment: 'Development' }
        };
      case 'container_registry':
        return { 
          location: 'East US', 
          sku: 'Basic',
          adminEnabled: false,
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'AcrPush', 'AcrPull'],
          tags: { Environment: 'Development' }
        };
      case 'api_management':
        return { 
          location: 'East US', 
          skuName: 'Developer_1',
          publisherName: 'API Publisher',
          publisherEmail: 'admin@company.com',
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'API Management Service Contributor'],
          tags: { Environment: 'Development' }
        };
      case 'managed_identity':
        return { 
          location: 'East US', 
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'Managed Identity Contributor'],
          tags: { Environment: 'Development' }
        };
      case 'openai':
        return { 
          location: 'East US', 
          skuName: 'S0',
          enableRoleAssignments: true,
          adRoles: ['Owner', 'Contributor', 'Reader', 'Cognitive Services OpenAI Contributor'],
          tags: { Environment: 'Development' }
        };
      default:
        return { location: 'East US', tags: { Environment: 'Development' } };
    }
  };



  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      setError(error.message);
      toast({
        title: "Application Error",
        description: error.message,
        variant: "destructive"
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  // Global Info handler
  const handleGlobalInfo = () => {
    setShowGlobalInfo(true);
  };

  // Handle resources update from Global Info modal
  const handleResourcesUpdate = (updatedResources: TerraformResource[]) => {
    setResources(updatedResources);
    
    // Update selectedResource if it exists, to ensure configuration panel shows updated data
    if (selectedResource) {
      const updatedSelectedResource = updatedResources.find(r => r.id === selectedResource.id);
      if (updatedSelectedResource) {
        setSelectedResource(updatedSelectedResource);
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setResources([]);
              setSelectedResource(null);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden" style={{height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}>
        <Header 
          isConnected={isConnected}
          onPreviewCode={() => setShowCodePreview(!showCodePreview)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={currentHistoryIndex > 0}
          canRedo={currentHistoryIndex < history.length - 1}
          onGlobalInfo={handleGlobalInfo}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <PanelGroup direction="horizontal" className="flex-1" style={{height: '100%'}}>
            <Panel defaultSize={25} minSize={15} maxSize={45} style={{overflow: 'hidden'}}>
              <div className="h-full overflow-hidden bg-slate-800">
                <ResourceSidebar onLandingZoneSelect={handleLandingZoneSelect} />
              </div>
            </Panel>
            
            <PanelResizeHandle className="sidebar-resize-handle" style={{backgroundColor: 'transparent', width: '4px', cursor: 'col-resize', border: 'none', minWidth: '4px', flexShrink: 0}}>
            </PanelResizeHandle>
            
            <Panel minSize={40}>
              <div className="flex flex-col h-full">
                {showCodePreview ? (
                  <PanelGroup direction="vertical" className="flex-1">
                    <Panel defaultSize={60} minSize={40}>
                      <div className="h-full">
                        <Canvas 
                          resources={resources}
                          onResourceDrop={handleResourceDrop}
                          onResourceSelect={handleResourceSelect}
                          onResourceDelete={handleResourceDelete}
                          onResourceMove={handleResourceMove}
                          selectedResource={selectedResource}
                          onRoleAssignmentClick={handleRoleAssignmentClick}
                          globalSettings={globalSettings}
                          roleCount={roleCount}
                        />
                      </div>
                    </Panel>
                    
                    <PanelResizeHandle className="h-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-600 cursor-row-resize flex items-center justify-center group relative transition-colors">
                      <div className="h-1 w-12 bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors rounded-full"></div>
                    </PanelResizeHandle>
                    
                    <Panel defaultSize={40} minSize={30}>
                      <div className="h-full">
                        <CodePreviewPanel 
                          resources={resources}
                          activeTab={activeBottomTab}
                          onTabChange={setActiveBottomTab}
                          onClose={() => setShowCodePreview(false)}
                        />
                      </div>
                    </Panel>
                  </PanelGroup>
                ) : (
                  <div className="h-full">
                    <Canvas 
                      resources={resources}
                      onResourceDrop={handleResourceDrop}
                      onResourceSelect={handleResourceSelect}
                      onResourceDelete={handleResourceDelete}
                      onResourceMove={handleResourceMove}
                      selectedResource={selectedResource}
                      onResourceGroupClick={handleResourceGroupClick}
                      onRoleAssignmentClick={handleRoleAssignmentClick}
                      globalSettings={globalSettings}
                      roleCount={roleCount}
                    />
                  </div>
                )}
              </div>
            </Panel>
            
            {(selectedResource || showConfigurationPanel) && (
              <>
                <PanelResizeHandle className="config-resize-handle" style={{backgroundColor: 'transparent', width: '4px', cursor: 'col-resize', border: 'none', minWidth: '4px', flexShrink: 0}}>
                </PanelResizeHandle>
                
                <Panel defaultSize={30} minSize={20} maxSize={45}>
                  <div className="h-full animate-slide-in-right">
                    {selectedResource ? (
                      <div className="animate-fade-in-up">
                        <ConfigurationPanel 
                          resource={selectedResource}
                          onResourceUpdate={handleResourceUpdate}
                          onClose={() => setSelectedResource(null)}
                          allResources={resources}
                        />
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-full animate-fade-in-up flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {configurationMode === 'subscription' ? 'Subscription Configuration' : 
                             configurationMode === 'resource_group' ? 'Resource Group Configuration' : 
                             'Configuration'}
                          </h3>
                          <button 
                            onClick={() => setShowConfigurationPanel(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Close configuration panel"
                          >
                            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          {(configurationMode === "subscription" || configurationMode === "resource_group"  )&& (
                            <div className="space-y-6">
                              {/* Show subscription details and tags only when NOT showing role assignment form */}
                              {!showRoleAssignment && (
                                <>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Subscription Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium">Name:</span> {getSubscriptionDisplayValues().subscriptionName}
                                      </div>
                                      <div>
                                        <span className="font-medium">Region:</span> {getSubscriptionDisplayValues().region}
                                      </div>
                                      <div>
                                        <span className="font-medium">Environment:</span> {getSubscriptionDisplayValues().environment}
                                      </div>
                                      <div>
                                        <span className="font-medium">Project:</span> {getSubscriptionDisplayValues().projectName}
                                      </div>
                                    </div>
                                  </div>

                                  {/* AD Roles Section */}
                                  {resources && resources.length > 0 && resources[0].config?.resourceSpecificRoles && resources[0].config.resourceSpecificRoles.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Role Assignments</h4>
                                      <div className="space-y-2">
                                        {resources[0].config.resourceSpecificRoles?.map((role: string, index: number) => (
                                          <div key={index} className="flex items-center space-x-2 text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-green-800 dark:text-green-200">{role}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tags Section */}
                                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Resource Tags</h4>
                                    <div className="space-y-2">
                                      {Object.entries(getSubscriptionDisplayValues().tags).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between text-sm">
                                          <span className="font-medium text-purple-800 dark:text-purple-200">{key}:</span>
                                          <span className="text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-800/50 px-2 py-1 rounded">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Role Assignment Section - Only show for Test Landing Zone */}
                                  {getRoleAssignmentFromTestLandingZone() && (
                                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700">
                                      <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-3">Role Assignment</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="font-medium text-cyan-800 dark:text-cyan-200">Role Name:</span>
                                          <span className="text-cyan-600 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-800/50 px-2 py-1 rounded">
                                            {getRoleAssignmentFromTestLandingZone()?.roleName}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="font-medium text-cyan-800 dark:text-cyan-200">Principle Type:</span>
                                          <span className="text-cyan-600 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-800/50 px-2 py-1 rounded">
                                            {getRoleAssignmentFromTestLandingZone()?.principalType}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Role Assignment Form - Only show when owner card is clicked */}
                              {showRoleAssignment && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4">Role Assignment</h4>
                                  <div className="space-y-4">
                                    {/* Group Name Field */}
                                    <div>
                                      <Label htmlFor="groupName" className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Group Name <span className="text-red-500">*</span>
                                      </Label>

                                      <Input
                                        id="groupName"
                                        type="text"
                                        value={roleAssignmentForm.groupName}
                                        onChange={(e) => {
                                          setRoleAssignmentForm(prev => ({ ...prev, groupName: e.target.value }));
                                          // Clear validation error when user starts typing
                                          if (roleAssignmentErrors.groupName) {
                                            setRoleAssignmentErrors({ groupName: '' });
                                          }
                                        }}
                                        placeholder={`name-${roleScopePrefix}-${globalSettings.projectName || 'project'}-${roleAssignmentForm.roleType}`}
                                        
                                        className="mt-1"
                                      />
                                      {roleAssignmentErrors.groupName ? (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                          {roleAssignmentErrors.groupName}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                          Format: name-${roleScopePrefix}-{globalSettings.projectName || 'project'}-{roleAssignmentForm.roleType}
                                        </p>
                                      )}
                                    </div>

                                    {/* Group Email Field */}
                                    <div>
                                      <Label htmlFor="groupEmail" className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Group Email <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id="groupEmail"
                                        type="email"
                                        value={roleAssignmentForm.groupEmail}
                                        onChange={(e) => setRoleAssignmentForm(prev => ({ ...prev, groupEmail: e.target.value }))}
                                        placeholder="Enter group email address"
                                        className="mt-1"
                                      />
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                      <Label htmlFor="description" className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Description
                                      </Label>
                                      <Textarea
                                        id="description"
                                        value={roleAssignmentForm.description}
                                        onChange={(e) => setRoleAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter role description"
                                        className="mt-1"
                                        rows={3}
                                      />
                                    </div>

                                    {/* Role Type Radio Buttons */}
                                    <div>
                                      <Label className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3 block">
                                        Role Type <span className="text-red-500">*</span>
                                      </Label>
                                      <RadioGroup
                                        value={roleAssignmentForm.roleType}
                                        onValueChange={(value) => setRoleAssignmentForm(prev => ({ ...prev, roleType: value }))}
                                        className="flex space-x-6"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="owner" id="owner" />
                                          <Label htmlFor="owner" className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Owner
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="contributor" id="contributor" />
                                          <Label htmlFor="contributor" className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Contributor
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="reader" id="reader" />
                                          <Label htmlFor="reader" className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Reader
                                          </Label>
                                        </div>
                                      </RadioGroup>
                                    </div>

                                    
                                    {/* Create Button */}
                                    <div style={{marginTop: '16px', textAlign: 'center'}}>
                                      <button 
                                        type="button"
                                        style={{
                                          padding: '8px 24px',
                                          backgroundColor: '#2563eb',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          fontSize: '14px',
                                          fontWeight: '500',
                                          cursor: 'pointer'
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log('🚀 Role Assignment Create button clicked');
                                          try {
                                            console.log('📝 Creating role assignment:', roleAssignmentForm);
                                            console.log('📚 Current resources:', resources);
                                            console.log('🌐 Global settings:', globalSettings);
                                            
                                            // Validate form data
                                            if (!roleAssignmentForm.groupName || !roleAssignmentForm.roleType) {
                                              alert('Please fill in all required fields');
                                              return;
                                            }

                                            // Validate naming standard: name-sub-projectname-owner/contributor/reader
                                            const currentProject = globalSettings.projectName || 'project';
                                            const expectedPattern = `.*-${roleScopePrefix}-${currentProject}-(owner|contributor|reader)$`;
                                            const regex = new RegExp(expectedPattern);
                                            
                                            if (!regex.test(roleAssignmentForm.groupName)) {
                                              setRoleAssignmentErrors({
                                                groupName: `Group name must follow the naming standard: name-${roleScopePrefix}-${currentProject}-${roleAssignmentForm.roleType} (Example: mygroup-sub-${currentProject}-${roleAssignmentForm.roleType})`
                                              });
                                              return;
                                            }
                                            
                                              // Clear validation errors if valid
                                            console.log('✅ Validation passed, clearing errors');
                                            setRoleAssignmentErrors({ groupName: '' });
                                          
                                          // Generate unique ID for the role assignment
                                          console.log('🆔 Generating unique IDs');
                                          const roleAssignmentId = `role_assignment_${Date.now()}`;
                                          const adGroupId = `ad_group_${Date.now()}`;
                                          console.log('🆔 Generated IDs:', { roleAssignmentId, adGroupId });
                                          
                                          // Use the validated group name as provided (already follows naming standard)
                                          const formattedGroupName = roleAssignmentForm.groupName;
                                          console.log('📝 Using group name:', formattedGroupName);
                                          
                                          // Create AD Group resource
                                          console.log('👥 Creating AD Group resource');
                                          const adGroupResource: TerraformResource = {
                                            id: adGroupId,
                                            name: formattedGroupName,
                                            type: 'azuread_group',
                                            position: { x: 100, y: 300 },
                                            config: {
                                              name: formattedGroupName,
                                              displayName: formattedGroupName,
                                              description: roleAssignmentForm.description || `AD Group for ${roleAssignmentForm.roleType} role assignment`,
                                              mailEnabled: false,
                                              securityEnabled: true,
                                              mailNickname: (roleAssignmentForm.groupName || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'defaultgroup',
                                              resourceGroup: `rg-${currentProject}-${globalSettings.environment || 'nonprod'}-${(globalSettings.region || 'centralus').toLowerCase().replace(/\s+/g, '')}-01`
                                            }
                                          };
                                          
                                          // Create Role Assignment resource
                                          const roleAssignmentName = `${roleAssignmentForm.groupName}_${roleAssignmentForm.roleType}_assignment`;
                                          const roleAssignmentResource: TerraformResource = {
                                            id: roleAssignmentId,
                                            name: roleAssignmentName,
                                            type: 'azurerm_role_assignment',
                                            position: { x: 300, y: 300 },
                                            config: {
                                              name: roleAssignmentName,
                                              scope: 'data.azurerm_subscription.current.id',
                                              roleDefinitionName: roleAssignmentForm.roleType.charAt(0).toUpperCase() + roleAssignmentForm.roleType.slice(1),
                                              principalId: `azuread_group.${(adGroupResource.config?.name || 'default_group').replace(/[^a-zA-Z0-9_]/g, '_')}.object_id`,
                                              principalType: 'Group',
                                              resourceGroup: `rg-${currentProject}-${globalSettings.environment || 'nonprod'}-${(globalSettings.region || 'centralus').toLowerCase().replace(/\s+/g, '')}-01`
                                            }
                                          };
                                          
                                          // Add both resources to the canvas
                                          console.log('📋 Adding resources to canvas');
                                          console.log('👥 AD Group Resource:', adGroupResource);
                                          console.log('🔐 Role Assignment Resource:', roleAssignmentResource);
                                          
                                          setResources(prev => {
                                            console.log('📋 Previous resources:', prev);
                                            const currentResources = prev || [];
                                            const newResources = [...currentResources, adGroupResource, roleAssignmentResource];
                                            console.log('📋 New resources array:', newResources);
                                            return newResources;
                                          });

                                        // 🧠 Increment localStorage role count
                                  // 🧠 Increment role count conditionally for RG or Subscription
                                  let counterKey = '';

                                  if (configurationMode === 'resource_group' && selectedResourceGroup !== null) {
                                    counterKey = `rg-${selectedResourceGroup}`;
                                  } else {
                                    counterKey = `sub-${currentProject}-${(globalSettings.region || 'centralus')}-${(globalSettings.environment || 'nonprod')}-01`.toLowerCase();
                                  }

                                  const updatedCount = incrementRoleAssignmentCount(counterKey);
                                  setRoleCount(updatedCount);


                                          
                                          // Reset form and close panel
                                          setRoleAssignmentForm({
                                            groupName: '',
                                            groupEmail: '',
                                            description: '',
                                            roleType: 'owner'
                                          });
                                          setRoleAssignmentErrors({ groupName: '' });
                                          setShowRoleAssignment(false);
                                          setShowConfigurationPanel(false);
                                          
                                          toast({
                                            title: "Role Assignment Created",
                                            description: "Click on Preview Code button to see the generated Terraform configuration.",
                                          });
                                          } catch (error) {
                                            console.error('Error creating role assignment:', error);
                                            alert(`Error creating role assignment: ${error.message || 'Unknown error'}`);
                                          }
                                        }}
                                      >
                                        Create
                                      </button>
                                    </div>
                                  </div>
                                </div>
                               )
                              };

                              {/* Show Edit Global Settings button only when NOT showing role assignment form */}
                              {!showRoleAssignment && (
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => setShowGlobalInfo(true)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn-primary-enhanced ripple text-sm btn-content-center"
                                  >
                                    <span className="icon-container rotate-on-hover">⚙️</span>
                                    Edit Global Settings
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {configurationMode === 'resource_group' && selectedResourceGroup && (
                            <div className="space-y-6">
                              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Resource Group: {selectedResourceGroup}</h4>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                  Configure the settings and properties for this resource group.
                                </p>
                              </div>

                              {/* Resource Group Details - Read-only display like subscription config */}
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Resource Group Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Subscription:</span> {getResourceGroupDisplayValues().subscriptionName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Name:</span> {getResourceGroupDisplayValues().resourceGroupName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Location:</span> {getResourceGroupDisplayValues().location}
                                  </div>
                                </div>
                              </div>

                              {/* Tags Section - Read-only display, from Global Info */}
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Resource Tags</h4>
                                <div className="space-y-2">
                                  {Object.entries(getResourceGroupDisplayValues().tags).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                      <span className="font-medium text-purple-800 dark:text-purple-200">{key}:</span>
                                      <span className="text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-800/50 px-2 py-1 rounded">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Edit Global Settings Button */}
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => setShowGlobalInfo(true)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <span className="icon-container rotate-on-hover">⚙️</span>
                                  Edit Global Settings
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
      
      {/* Global Info Modal */}
      <GlobalInfoModal
        isOpen={showGlobalInfo}
        onClose={() => setShowGlobalInfo(false)}
        resources={resources}
        onResourcesUpdate={handleResourcesUpdate}
        selectedLandingZone={selectedLandingZone}
        onConfigurationPanelTrigger={handleConfigurationPanelTrigger}
        currentGlobalSettings={globalSettings}
        onGlobalSettingsUpdate={handleGlobalSettingsUpdate}
      />
      
      <Toaster />
    </DndProvider>
  );
}
