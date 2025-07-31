import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Save, X, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TerraformResource } from "@/types/terraform";
import { validateAzureName, generateSuggestedName } from "@/utils/azureNamingStandards";

interface GlobalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: TerraformResource[];
  onResourcesUpdate: (resources: TerraformResource[]) => void;
  onGlobalConfigUpdate?: (config: any) => void;
  selectedLandingZone?: string;
}

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

const AZURE_SUBSCRIPTIONS = [
  { value: "pay-as-you-go", label: "Pay-As-You-Go" },
  { value: "enterprise", label: "Enterprise Agreement" },
  { value: "dev-test", label: "Dev/Test" },
  { value: "free-trial", label: "Free Trial" },
  { value: "student", label: "Azure for Students" },
  { value: "msdn", label: "Visual Studio Subscription" },
];

const AZURE_AD_ROLES = [
  { value: "Reader", label: "Reader" },
  { value: "Owner", label: "Owner" },
  { value: "Contributor", label: "Contributor" },
  { value: "Key Vault Administrator", label: "Key Vault Administrator" },
  { value: "Key Vault Secrets Officer", label: "Key Vault Secrets Officer" },
  { value: "Storage Blob Data Owner", label: "Storage Blob Data Owner" },
  { value: "Storage Blob Data Contributor", label: "Storage Blob Data Contributor" },
  { value: "Virtual Machine Contributor", label: "Virtual Machine Contributor" },
  { value: "Network Contributor", label: "Network Contributor" },
  { value: "SQL DB Contributor", label: "SQL DB Contributor" },
  { value: "SQL Server Contributor", label: "SQL Server Contributor" },
  { value: "AI Developer", label: "AI Developer" },
  { value: "API Management Service Contributor", label: "API Management Service Contributor" },
  { value: "Managed Identity Contributor", label: "Managed Identity Contributor" },
  { value: "Cognitive Services OpenAI Contributor", label: "Cognitive Services OpenAI Contributor" }
];

export default function GlobalInfoModal({
  isOpen,
  onClose,
  resources,
  onResourcesUpdate,
  onGlobalConfigUpdate,
  selectedLandingZone
}: GlobalInfoModalProps) {
  const [resourceName, setResourceName] = useState("");
  const [region, setRegion] = useState("centralus");
  const [subscriptionName, setSubscriptionName] = useState("");
  const [resourceGroupName, setResourceGroupName] = useState("");
  const [tags, setTags] = useState<Record<string, string>>({});
  const [adRoles, setAdRoles] = useState<string[]>([]);
  
  // Validation states
  const [subscriptionValidation, setSubscriptionValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] }>({ isValid: true, errors: [], warnings: [] });
  const [resourceGroupValidation, setResourceGroupValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] }>({ isValid: true, errors: [], warnings: [] });
  const [sendToPreview, setSendToPreview] = useState(false);
  const [checkResourceGroupExists, setCheckResourceGroupExists] = useState(false);
  const [projectName, setProjectName] = useState("project");
  const [environment, setEnvironment] = useState("nonprod");
  const [subscriptionNumber, setSubscriptionNumber] = useState("01");
  const [resourceGroupNumber, setResourceGroupNumber] = useState("01");

  const { toast } = useToast();

  // Global settings key for localStorage
  const GLOBAL_SETTINGS_KEY = 'terraform-builder-global-settings';

  // Save global settings to localStorage
  const saveGlobalSettings = (settings: any) => {
    try {
      localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving global settings:', error);
    }
  };

  // Load global settings from localStorage
  const loadGlobalSettings = () => {
    try {
      const saved = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading global settings:', error);
      return null;
    }
  };

  // Helper function to get region label from value
  const getRegionLabel = (value: string) => {
    const region = AZURE_REGIONS.find(r => r.value === value);
    return region ? region.label : value;
  };

  // Helper function to get subscription label from value
  const getSubscriptionLabel = (value: string) => {
    const subscription = AZURE_SUBSCRIPTIONS.find(s => s.value === value);
    return subscription ? subscription.label : value;
  };

  // Check if subscription already exists in current resources
  const checkSubscriptionExists = (subscriptionValue: string) => {
    const currentSubscriptions = resources.map(r => r.config?.subscription).filter(Boolean);
    return currentSubscriptions.includes(subscriptionValue);
  };

  // Get current subscription state
  const getCurrentSubscriptionState = () => {
    const currentSubscriptions = resources.map(r => r.config?.subscription).filter(Boolean);
    const uniqueSubscriptions = Array.from(new Set(currentSubscriptions));
    return {
      subscriptions: uniqueSubscriptions,
      hasMultipleSubscriptions: uniqueSubscriptions.length > 1,
      currentSubscription: uniqueSubscriptions.length === 1 ? uniqueSubscriptions[0] : null
    };
  };

  // Validation handlers
  const handleSubscriptionNameChange = (newName: string) => {
    setSubscriptionName(newName);
    const validation = validateAzureName(newName, 'subscription');
    setSubscriptionValidation(validation);
  };

  const handleResourceGroupNameChange = (newName: string) => {
    setResourceGroupName(newName);
    const validation = validateAzureName(newName, 'resource_group');
    setResourceGroupValidation(validation);
  };

  const generateSubscriptionSuggestion = () => {
    const suggested = generateSuggestedName('subscription', subscriptionName);
    setSubscriptionName(suggested);
    const validation = validateAzureName(suggested, 'subscription');
    setSubscriptionValidation(validation);
  };

  const generateResourceGroupSuggestion = () => {
    const suggested = generateSuggestedName('resource_group', resourceGroupName);
    setResourceGroupName(suggested);
    const validation = validateAzureName(suggested, 'resource_group');
    setResourceGroupValidation(validation);
  };

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check if resources already have consistent values from canvas
      const resourceLocations = resources.map(r => r.config?.location).filter(Boolean);
      const uniqueLocations = Array.from(new Set(resourceLocations));
      
      const resourceSubscriptions = resources.map(r => r.config?.subscription).filter(Boolean);
      const uniqueSubscriptions = Array.from(new Set(resourceSubscriptions));
      
      const resourceGroups = resources.map(r => r.config?.resourceGroup).filter(Boolean);
      const uniqueResourceGroups = Array.from(new Set(resourceGroups));
      
      // Extract current project name from existing resources
      let currentProjectName = "project";
      let currentEnvironment = "nonprod";
      let currentSubNumber = "01";
      let currentRgNumber = "01";
      
      // First try to get project name from explicitly stored config
      const resourceWithProjectName = resources.find(r => r.config?.projectName);
      if (resourceWithProjectName) {
        currentProjectName = resourceWithProjectName.config.projectName;
      }
      
      // Get environment from explicitly stored config
      const resourceWithEnvironment = resources.find(r => r.config?.environment);
      if (resourceWithEnvironment) {
        currentEnvironment = resourceWithEnvironment.config.environment;
      }
      
      // If no explicit project name, try to extract from subscription/resource group names
      if (currentProjectName === "project") {
        if (uniqueSubscriptions.length > 0) {
          const subName = uniqueSubscriptions[0];
          const subMatch = subName.match(/^sub-([^-]+)-/);
          if (subMatch) {
            currentProjectName = subMatch[1];
          }
          const numMatch = subName.match(/-(\d+)$/);
          if (numMatch) {
            currentSubNumber = numMatch[1];
          }
        } else if (uniqueResourceGroups.length > 0) {
          const rgName = uniqueResourceGroups[0];
          const rgMatch = rgName.match(/^rg-([^-]+)-/);
          if (rgMatch) {
            currentProjectName = rgMatch[1];
          }
          const envMatch = rgName.match(/-(nonprod|prod)-/);
          if (envMatch) {
            currentEnvironment = envMatch[1];
          }
          const numMatch = rgName.match(/-(\d+)$/);
          if (numMatch) {
            currentRgNumber = numMatch[1];
          }
        }
      }
      
      // Initialize state with extracted values
      setEnvironment(currentEnvironment);
      setSubscriptionNumber(currentSubNumber);
      setResourceGroupNumber(currentRgNumber);
      
      // Get current region and convert to dropdown value format
      const currentRegionLabel = uniqueLocations.length === 1 ? uniqueLocations[0] : "Central US";
      const currentRegionValue = AZURE_REGIONS.find(r => r.label === currentRegionLabel)?.value || "centralus";
      setRegion(currentRegionValue);
      
      // Set current subscription and resource group names
      const currentSubscription = uniqueSubscriptions.length === 1 ? uniqueSubscriptions[0] : `sub-${currentProjectName}-${currentRegionValue}-${currentSubNumber}`;
      const currentResourceGroup = uniqueResourceGroups.length === 1 ? uniqueResourceGroups[0] : `rg-${currentProjectName}-${currentRegionValue}-${currentEnvironment}-${currentRgNumber}`;
      
      // Load saved settings from localStorage
      const savedSettings = loadGlobalSettings();
      
      console.log('Loading saved values:');
      console.log('savedSettings:', savedSettings);
      console.log('currentSubscription:', currentSubscription);
      console.log('currentResourceGroup:', currentResourceGroup);
      console.log('All resources:', resources.map(r => ({ id: r.id, config: r.config })));
      
      // Priority: current resource values over localStorage
      // Always use current resource values for location, subscription, and resource group
      setRegion(currentRegionValue);
      setProjectName(currentProjectName);
      setEnvironment(currentEnvironment);
      setSubscriptionNumber(currentSubNumber);
      setResourceGroupNumber(currentRgNumber);
      
      // Clear any old default AD roles from localStorage and start fresh
      localStorage.removeItem('terraform_global_settings');
      
      // Only use localStorage for preferences and user settings
      if (savedSettings) {
        setSendToPreview(savedSettings.sendToPreview || false);
        setCheckResourceGroupExists(savedSettings.checkResourceGroupExists || false);
        setResourceName(savedSettings.resourceName || "");
        setTags(savedSettings.tags || {});
        // Always start with empty AD roles array, don't load from localStorage
        setAdRoles([]);
      } else {
        // Use defaults if no saved settings
        setSendToPreview(false);
        setCheckResourceGroupExists(false);
        setResourceName("");
        setTags({});
        setAdRoles([]);
      }
      
      // Always use current resource values for subscription and resource group names
      setSubscriptionName(currentSubscription);
      setResourceGroupName(currentResourceGroup);
      
      // Validate initial names
      const subValidation = validateAzureName(currentSubscription, 'subscription');
      const rgValidation = validateAzureName(currentResourceGroup, 'resource_group');
      setSubscriptionValidation(subValidation);
      setResourceGroupValidation(rgValidation);
      
      // Get common tags from existing resources
      const allTags: Record<string, string> = {};
      resources.forEach(resource => {
        if (resource.config?.tags) {
          Object.entries(resource.config.tags).forEach(([key, value]) => {
            if (allTags[key] && allTags[key] !== value) {
              // If different values exist for same key, skip it
              delete allTags[key];
            } else if (!allTags[key]) {
              allTags[key] = value;
            }
          });
        }
      });
      
      // Set default values based on landing zone or current canvas values
      if (selectedLandingZone === "ai_studio_landing_zone") {
        setResourceName("AI Studio Environment");
        setProjectName(currentProjectName);
        
        // Add default tags for AI Studio if no existing tags
        if (Object.keys(allTags).length === 0) {
          const today = new Date();
          const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
          setTags({
            "AppName": "Project",
            "Environment": "Dev",
            "ProvisionedBy": "Terraform",
            "ProvisionedDate": formattedDate,
            "Project": "AI-Studio",
            "Owner": "AI-Team",
            "CostCenter": "AI-Development"
          });
        } else {
          setTags(allTags);
        }
      } else if (selectedLandingZone === "application_zone") {
        setResourceName("Application Environment");
        setProjectName(currentProjectName);
        
        // Add default tags for Application Zone if no existing tags
        if (Object.keys(allTags).length === 0) {
          const today = new Date();
          const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
          setTags({
            "AppName": "Project",
            "Environment": "Dev",
            "ProvisionedBy": "Terraform",
            "ProvisionedDate": formattedDate,
            "Project": "Web-Application",
            "Owner": "Development-Team"
          });
        } else {
          setTags(allTags);
        }
      } else if (selectedLandingZone === "test_landing_zone") {
        setResourceName("Test Environment");
        setProjectName(currentProjectName);
        
        // Add default tags for Test Zone if no existing tags
        if (Object.keys(allTags).length === 0) {
          const today = new Date();
          const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
          setTags({
            "AppName": "Project",
            "Environment": "Test",
            "ProvisionedBy": "Terraform",
            "ProvisionedDate": formattedDate,
            "Project": "Testing",
            "Owner": "QA-Team"
          });
        } else {
          setTags(allTags);
        }
      } else {
        // No landing zone selected, use canvas values
        setResourceName(resources.length > 0 ? `${resources.length} Resource Environment` : "New Environment");
        setProjectName(currentProjectName);
        
        // Set common tags from canvas or default
        if (Object.keys(allTags).length === 0) {
          const today = new Date();
          const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
          setTags({
            "AppName": "Project",
            "Environment": "Dev",
            "ProvisionedBy": "Terraform",
            "ProvisionedDate": formattedDate
          });
        } else {
          setTags(allTags);
        }
      }
    }
  }, [isOpen, selectedLandingZone, resources]);



  // Tag management functions
  const addTag = () => {
    const newKey = `tag-${Object.keys(tags).length + 1}`;
    setTags(prev => ({
      ...prev,
      [newKey]: ""
    }));
  };

  const updateTag = (oldKey: string, newKey: string, value: string) => {
    setTags(prev => {
      const newTags = { ...prev };
      if (oldKey !== newKey) {
        delete newTags[oldKey];
      }
      newTags[newKey] = value;
      return newTags;
    });
  };

  const removeTag = (key: string) => {
    setTags(prev => {
      const newTags = { ...prev };
      delete newTags[key];
      return newTags;
    });
  };

  // AD Roles management functions
  const addAdRole = (role: string) => {
    if (!adRoles.includes(role)) {
      const newRoles = [...adRoles, role];
      setAdRoles(newRoles);
      
      // Immediately update global config for real-time preview updates
      if (onGlobalConfigUpdate) {
        const globalConfig = {
          subscriptionId: subscriptionName,
          resourceGroupName: resourceGroupName,
          location: getRegionLabel(region),
          environment: environment,
          project: projectName,
          costCenter: tags['cost-center'] || '',
          owner: tags['owner'] || '',
          tags: tags,
          adRoles: newRoles
        };
        onGlobalConfigUpdate(globalConfig);
      }
    }
  };

  const removeAdRole = (roleToRemove: string) => {
    const newRoles = adRoles.filter(role => role !== roleToRemove);
    setAdRoles(newRoles);
    
    // Immediately update global config for real-time preview updates
    if (onGlobalConfigUpdate) {
      const globalConfig = {
        subscriptionId: subscriptionName,
        resourceGroupName: resourceGroupName,
        location: getRegionLabel(region),
        environment: environment,
        project: projectName,
        costCenter: tags['cost-center'] || '',
        owner: tags['owner'] || '',
        tags: tags,
        adRoles: newRoles
      };
      onGlobalConfigUpdate(globalConfig);
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!subscriptionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Subscription name is required",
        variant: "destructive",
      });
      return;
    }

    if (!resourceGroupName.trim()) {
      toast({
        title: "Validation Error",
        description: "Resource group name is required",
        variant: "destructive",
      });
      return;
    }

    if (!region.trim()) {
      toast({
        title: "Validation Error",
        description: "Deployment region is required",
        variant: "destructive",
      });
      return;
    }

    console.log('Saving values:');
    console.log('subscriptionName:', subscriptionName);
    console.log('sendToPreview:', sendToPreview);
    console.log('checkResourceGroupExists:', checkResourceGroupExists);
    
    // Save global settings to localStorage
    const globalSettings = {
      subscriptionName,
      resourceGroupName,
      sendToPreview,
      checkResourceGroupExists,
      resourceName,
      projectName,
      environment,
      subscriptionNumber,
      resourceGroupNumber,
      region,
      tags,
      adRoles
    };
    saveGlobalSettings(globalSettings);
    
    // Update all resources with the new global configuration
    const updatedResources = resources.map(resource => {
      const updatedResource = {
        ...resource,
        config: {
          ...resource.config,
          // Core Azure properties - convert region value to label format
          location: getRegionLabel(region),
          subscription: subscriptionName,
          resourceGroup: resourceGroupName,
          
          // Store all configuration for persistence
          projectName: projectName,
          environment: environment,
          subscriptionNumber: subscriptionNumber,
          resourceGroupNumber: resourceGroupNumber,
          subscriptionName: subscriptionName,
          resourceGroupName: resourceGroupName,
          sendToPreview: sendToPreview,
          checkResourceGroupExists: checkResourceGroupExists,
          
          // Update resource name with new project name if using structured naming
          name: resource.config?.name?.includes(projectName) ? 
            resource.config.name : resource.config?.name || resource.name,
            
          // Merge tags (new tags override existing ones)
          tags: {
            ...resource.config?.tags,
            ...tags
          },
          
          // Apply global AD roles to supported resources (create independent copies, not references)
          ...(adRoles && adRoles.length > 0 && 
             ['key_vault', 'storage_account', 'virtual_machine', 'sql_database', 'ai_studio', 'container_registry', 
              'api_management', 'managed_identity', 'openai'].includes(resource.type) && {
            resourceSpecificRoles: [...adRoles]  // Independent copy that can be modified per resource
          }),
          
          // Update specific resource properties that depend on global settings
          ...(resource.type === 'resource_group' && {
            name: resourceGroupName
          }),
          
          // Update any region-specific configurations
          ...(resource.type === 'azurerm_virtual_network' && {
            addressSpace: resource.config?.addressSpace || ['10.0.0.0/16']
          }),
          
          // Update storage account names to be region-specific if needed
          ...(resource.type === 'storage_account' && {
            name: resource.config?.name || `${projectName}storage${Math.random().toString(36).substr(2, 5)}`
          }),

          // Update Key Vault specific configurations
          ...(resource.type === 'key_vault' && {
            keyvault_name: resource.config?.keyvault_name || resource.config?.name
          })
        }
      };
      
      // Also update the resource name itself for resource groups
      if (resource.type === 'resource_group') {
        updatedResource.name = resourceGroupName;
      }
      
      return updatedResource;
    });
    
    // Apply the updates
    onResourcesUpdate(updatedResources);
    
    // Update global config if callback is provided
    if (onGlobalConfigUpdate) {
      const globalConfig = {
        subscriptionId: subscriptionName,
        resourceGroupName: resourceGroupName,
        location: getRegionLabel(region),
        environment: environment,
        project: projectName,
        costCenter: tags['cost-center'] || '',
        owner: tags['owner'] || '',
        tags: tags,
        adRoles: adRoles
      };
      onGlobalConfigUpdate(globalConfig);
    }
    
    // Show success message with details
    const tagSummary = Object.keys(tags).length > 0 ? 
      ` with ${Object.keys(tags).length} tag${Object.keys(tags).length > 1 ? 's' : ''}` : '';
    
    toast({
      title: "Configuration Saved Successfully",
      description: `Applied global settings to ${resources.length} resources: ${subscriptionName} → ${resourceGroupName} → ${region}${tagSummary}`,
      variant: "default",
    });
    
    onClose();
  };

  const getResourceCount = () => {
    return resources.length;
  };

  const getCurrentGlobalState = () => {
    const regions = resources.map(r => r.config?.location).filter(Boolean);
    const subscriptions = resources.map(r => r.config?.subscription).filter(Boolean);
    
    const uniqueRegions = Array.from(new Set(regions));
    const uniqueSubscriptions = Array.from(new Set(subscriptions));
    
    return {
      regions: uniqueRegions,
      subscriptions: uniqueSubscriptions,
      hasConsistentRegion: uniqueRegions.length <= 1,
      hasConsistentSubscription: uniqueSubscriptions.length <= 1,
    };
  };

  const globalState = getCurrentGlobalState();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Global Information
          </DialogTitle>
        </DialogHeader>


        
        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">


          {/* Azure Account Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Azure Account</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Where your resources will be created</p>
              </div>
            </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="environment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Environment <span className="text-red-500">*</span>
                  </Label>
                  <Select value={environment} onValueChange={(value) => setEnvironment(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">Development (dev)</SelectItem>
                      <SelectItem value="test">Test (test)</SelectItem>
                      <SelectItem value="nonprod">Non-Production (nonprod)</SelectItem>
                      <SelectItem value="prod">Production (prod)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                Used in resource naming conventions (e.g., rg-{projectName}-{environment})
              </p>

          </div>

          {/* Azure Subscription Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Azure Subscription</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Azure subscription details</p>
              </div>
            </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <Checkbox
                  id="sendToPreview"
                  checked={sendToPreview}
                  onCheckedChange={(checked) => setSendToPreview(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="sendToPreview" className="text-sm font-medium cursor-pointer text-blue-700 dark:text-blue-300">
                    I have an existing Azure Subscription
                  </Label>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Check this if you already have an Azure Subscription set up
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="subscriptionName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subscription Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="subscriptionName"
                    data-allow-select="true"
                    value={subscriptionName}
                    onChange={(e) => handleSubscriptionNameChange(e.target.value)}
                    placeholder="Enter your Azure subscription name"
                    disabled={!sendToPreview}
                    className={`mt-2 ${!sendToPreview ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : !subscriptionValidation.isValid ? 'border-red-500' : subscriptionValidation.warnings.length > 0 ? 'border-yellow-500' : 'border-green-500'}`}
                  />
                  {sendToPreview && subscriptionValidation.isValid && subscriptionValidation.warnings.length === 0 && subscriptionName.length > 0 && (
                    <CheckCircle className="absolute right-3 top-5 h-4 w-4 text-green-500" />
                  )}
                  {sendToPreview && !subscriptionValidation.isValid && (
                    <AlertCircle className="absolute right-3 top-5 h-4 w-4 text-red-500" />
                  )}
                </div>
                
                {/* Subscription validation feedback */}
                {sendToPreview && subscriptionValidation.errors.length > 0 && (
                  <Alert className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {subscriptionValidation.errors.map((error, index) => (
                        <div key={index} className="text-xs">{error}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                
                {sendToPreview && !subscriptionValidation.isValid && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSubscriptionSuggestion}
                      className="text-xs"
                    >
                      Generate Valid Name
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Azure subscription (1-64 characters, letters, numbers, spaces, hyphens)
                </p>
              </div>
          </div>

          {/* Resource Group Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resource Organization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">How your resources will be organized</p>
              </div>
            </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <Checkbox
                  id="checkResourceGroupExists"
                  checked={checkResourceGroupExists}
                  onCheckedChange={(checked) => setCheckResourceGroupExists(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="checkResourceGroupExists" className="text-sm font-medium cursor-pointer text-green-700 dark:text-green-300">
                    I have an existing resource group
                  </Label>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Check this if you want to use an existing resource group
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="resourceGroupName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="resourceGroupName"
                    data-allow-select="true"
                    value={resourceGroupName}
                    onChange={(e) => handleResourceGroupNameChange(e.target.value)}
                    placeholder="Enter a name for your resource group"
                    disabled={!checkResourceGroupExists}
                    className={`mt-2 ${!checkResourceGroupExists ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : !resourceGroupValidation.isValid ? 'border-red-500' : resourceGroupValidation.warnings.length > 0 ? 'border-yellow-500' : 'border-green-500'}`}
                  />
                  {checkResourceGroupExists && resourceGroupValidation.isValid && resourceGroupValidation.warnings.length === 0 && resourceGroupName.length > 0 && (
                    <CheckCircle className="absolute right-3 top-5 h-4 w-4 text-green-500" />
                  )}
                  {checkResourceGroupExists && !resourceGroupValidation.isValid && (
                    <AlertCircle className="absolute right-3 top-5 h-4 w-4 text-red-500" />
                  )}
                </div>
                
                {/* Resource Group validation feedback */}
                {checkResourceGroupExists && resourceGroupValidation.errors.length > 0 && (
                  <Alert className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {resourceGroupValidation.errors.map((error, index) => (
                        <div key={index} className="text-xs">{error}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                
                {checkResourceGroupExists && !resourceGroupValidation.isValid && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateResourceGroupSuggestion}
                      className="text-xs"
                    >
                      Generate Valid Name
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Resource group (1-90 characters, cannot end with period)
                </p>
              </div>
          </div>

          {/* Region Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Location</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Where your resources will be created</p>
              </div>
            </div>

              <div className="space-y-3">
                <Label htmlFor="region" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Location
                </Label>
                <Select key={`region-${region}`} value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {AZURE_REGIONS.map((regionItem) => (
                      <SelectItem key={regionItem.value} value={regionItem.value}>
                        {regionItem.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!globalState.hasConsistentRegion && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      ⚠️ Multiple regions detected: {globalState.regions.join(", ")}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      This will standardize all resources to use the selected region
                    </p>
                  </div>
                )}
              </div>
          </div>

          {/* AD Roles Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3 justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AD Roles</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Global Azure AD roles to apply to all supported services</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* AD Roles Dropdown */}
              <div className="flex items-center space-x-2">
                <Select 
                  value="" 
                  onValueChange={(value) => {
                    if (value) {
                      addAdRole(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AD role to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {AZURE_AD_ROLES.filter(role => !adRoles.includes(role.value)).map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected AD Roles */}
              <div className="space-y-2">
                {adRoles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{role}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdRole(role)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {adRoles.length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="space-y-2">
                      <p>No AD roles selected</p>
                      <p className="text-xs">AD roles will be applied to all supported services (Key Vault, Storage Account, etc.)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3 justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tags</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add tags to organize your resources</p>
                </div>
              </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </Button>
              </div>

              <div className="space-y-3">
                {Object.entries(tags).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Input
                      placeholder="Tag name (e.g., Environment)"
                      value={key}
                      onChange={(e) => updateTag(key, e.target.value, value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Tag value (e.g., Production)"
                      value={value}
                      onChange={(e) => updateTag(key, key, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(key)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {Object.keys(tags).length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="space-y-2">
                      <p>No tags added yet</p>
                      <p className="text-xs">Tags help organize and track your Azure resources</p>
                    </div>
                  </div>
                )}
              </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!subscriptionName.trim() || !resourceGroupName.trim() || !region.trim() || !subscriptionValidation.isValid || !resourceGroupValidation.isValid}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}