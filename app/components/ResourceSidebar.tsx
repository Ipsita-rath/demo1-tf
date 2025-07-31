import { useState } from "react";
import { useDrag } from "react-dnd";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Shield, 
  Database, 
  Network, 
  Server, 
  Globe, 
  Folder,
  Search,
  HardDrive,
  Brain,
  Link
} from "lucide-react";
import type { LandingZone, LandingZoneResource } from "@/types/terraform";
import { getAzureIcon } from "./AzureIcons";


interface ResourceItem {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const resources: ResourceItem[] = [
  // Core Infrastructure
  { type: 'azurerm_resource_group', name: 'Resource Group', description: 'Logical container for Azure resources', icon: getAzureIcon('azurerm_resource_group', 18), category: 'Core Infrastructure' },
  
  // Security & Identity
  { type: 'key_vault', name: 'Key Vault', description: 'Secure key and secret management', icon: getAzureIcon('key_vault', 18), category: 'Security & Identity' },
  { type: 'managed_identity', name: 'Managed Identity', description: 'Azure identity service', icon: getAzureIcon('managed_identity', 18), category: 'Security & Identity' },
  { type: 'private_endpoint', name: 'Private Endpoint', description: 'Private network connection', icon: getAzureIcon('private_endpoint', 18), category: 'Security & Identity' },
  { type: 'role_assignment', name: 'Role Assignment', description: 'Assign roles to users/groups', icon: getAzureIcon('role_assignment', 18), category: 'Security & Identity' },
  { type: 'role_definition', name: 'Role Definition', description: 'Define custom roles', icon: getAzureIcon('role_definition', 18), category: 'Security & Identity' },
  { type: 'ad_group', name: 'Azure AD Group', description: 'Azure Active Directory group', icon: getAzureIcon('ad_group', 18), category: 'Security & Identity' },
  { type: 'ad_group_member', name: 'AD Group Member', description: 'Azure AD group membership', icon: getAzureIcon('ad_group_member', 18), category: 'Security & Identity' },
  
  // Storage
  { type: 'storage_account', name: 'Storage Account', description: 'Blob, file, queue storage', icon: getAzureIcon('storage_account', 18), category: 'Storage' },
  { type: 'container_registry', name: 'Container Registry', description: 'Docker container registry', icon: getAzureIcon('container_registry', 18), category: 'Storage' },
  
  // Networking
  { type: 'virtual_network', name: 'Virtual Network', description: 'Private network in Azure', icon: getAzureIcon('virtual_network', 18), category: 'Networking' },
  { type: 'subnet', name: 'Subnet', description: 'Network segment', icon: getAzureIcon('subnet', 18), category: 'Networking' },
  { type: 'network_security_group', name: 'Network Security Group', description: 'Network firewall rules', icon: getAzureIcon('network_security_group', 18), category: 'Networking' },
  { type: 'route_table', name: 'Route Table', description: 'Network routing rules', icon: getAzureIcon('route_table', 18), category: 'Networking' },
  
  // Compute
  { type: 'virtual_machine', name: 'Virtual Machine', description: 'Compute instance', icon: getAzureIcon('virtual_machine', 18), category: 'Compute' },
  { type: 'app_service', name: 'App Service', description: 'Web app hosting', icon: getAzureIcon('app_service', 18), category: 'Compute' },
  { type: 'functions', name: 'Functions', description: 'Serverless compute', icon: getAzureIcon('functions', 18), category: 'Compute' },
  
  // Database
  { type: 'sql_database', name: 'SQL Database', description: 'Managed SQL database', icon: getAzureIcon('sql_database', 18), category: 'Database' },
  { type: 'cosmos_db', name: 'Cosmos DB', description: 'NoSQL database service', icon: getAzureIcon('cosmos_db', 18), category: 'Database' },
  { type: 'postgresql', name: 'PostgreSQL', description: 'Managed PostgreSQL database', icon: getAzureIcon('postgresql', 18), category: 'Database' },
  { type: 'redis', name: 'Redis Cache', description: 'In-memory cache', icon: getAzureIcon('redis', 18), category: 'Database' },
  
  // AI & Analytics
  { type: 'ai_studio', name: 'AI Studio', description: 'AI model development', icon: getAzureIcon('ai_studio', 18), category: 'AI & Analytics' },
  { type: 'openai', name: 'OpenAI', description: 'OpenAI service integration', icon: getAzureIcon('openai', 18), category: 'AI & Analytics' },
  { type: 'application_insights', name: 'Application Insights', description: 'App performance monitoring', icon: getAzureIcon('application_insights', 18), category: 'AI & Analytics' },
  { type: 'log_analytics', name: 'Log Analytics', description: 'Log data analysis', icon: getAzureIcon('log_analytics', 18), category: 'AI & Analytics' },
  { type: 'workbook', name: 'Azure Workbooks', description: 'Interactive monitoring dashboards', icon: getAzureIcon('workbook', 18), category: 'AI & Analytics' },
  
  // Integration
  { type: 'api_management', name: 'API Management', description: 'API gateway and management', icon: getAzureIcon('api_management', 18), category: 'Integration' },
  { type: 'event_hub', name: 'Event Hub', description: 'Event streaming platform', icon: getAzureIcon('event_hub', 18), category: 'Integration' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Core Infrastructure': <Folder className="h-4 w-4" />,
  'Security & Identity': <Shield className="h-4 w-4" />,
  'Storage': <HardDrive className="h-4 w-4" />,
  'Networking': <Network className="h-4 w-4" />,
  'Compute': <Server className="h-4 w-4" />,
  'Database': <Database className="h-4 w-4" />,
  'AI & Analytics': <Brain className="h-4 w-4" />,
  'Integration': <Link className="h-4 w-4" />,
};

interface DraggableResourceCardProps {
  resource: ResourceItem;
}

function DraggableResourceCard({ resource }: DraggableResourceCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'resource',
    item: { type: resource.type, name: resource.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card 
      ref={drag as any}
      data-allow-drag="true"
      className={`p-3 cursor-grab active:cursor-grabbing hover-lift transition-all duration-300 ease-out group animate-fade-in-up backdrop-blur-sm shadow-sm hover:shadow-xl border-2 ${
        isDragging ? 'opacity-70 scale-95 rotate-1 shadow-2xl' : 'opacity-100 scale-100'
      } bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/30 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/60 dark:hover:border-blue-600/60`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-primary">{resource.icon}</div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900 dark:text-white">{resource.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{resource.description}</div>
        </div>
      </div>
    </Card>
  );
}

// Landing Zone definitions
const landingZones: LandingZone[] = [
  {
    id: 'ai_studio_landing_zone',
    name: 'AI Studio Landing Zone',
    description: 'Complete AI development environment with all 13 required Azure services',
    resources: [
      // === AI STUDIO RESOURCE GROUP ===
      {
        type: 'resource_group',
        name: 'ai-studio-rg',
        field_state: {
          location: 'East US',
          tags: {}
        },
        position: { x: 600, y: 80 }
      },
      
      // === SECURITY & IDENTITY LAYER ===
      {
        type: 'role_definition',
        name: 'ai-studio-custom-role',
        field_state: {
          roleName: 'AI Studio Automation Role',
          description: 'Custom role for AI Studio environment automation',
          scope: 'subscription',
          actions: [
            'Microsoft.Resources/subscriptions/resourceGroups/*',
            'Microsoft.KeyVault/vaults/*',
            'Microsoft.Storage/storageAccounts/*',
            'Microsoft.CognitiveServices/accounts/*',
            'Microsoft.MachineLearningServices/workspaces/*',
            'Microsoft.Network/virtualNetworks/*',
            'Microsoft.ContainerRegistry/registries/*'
          ],
          tags: {}
        },
        position: { x: 100, y: 200 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'key_vault',
        name: 'ai-studio-kv',
        field_state: {
          location: 'East US',
          skuName: 'premium',
          enableSoftDelete: true,
          tags: {}
        },
        position: { x: 200, y: 200 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'role_assignment',
        name: 'ai-studio-role-assignment',
        field_state: {
          scope: 'subscription',
          roleDefinitionName: 'AI Studio Automation Role',
          principalType: 'User',
          tags: {}
        },
        position: { x: 300, y: 200 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'managed_identity',
        name: 'ai-studio-identity',
        field_state: {
          location: 'East US',
          tags: {}
        },
        position: { x: 400, y: 200 },
        resource_group: 'ai-studio-rg'
      },
      
      // === STORAGE LAYER ===
      {
        type: 'storage_account',
        name: 'aistudiosa',
        field_state: {
          location: 'East US',
          accountTier: 'Standard',
          replicationType: 'LRS',
          tags: {}
        },
        position: { x: 600, y: 200 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'container_registry',
        name: 'aistudioacr',
        field_state: {
          location: 'East US',
          skuName: 'Standard',
          tags: {}
        },
        position: { x: 800, y: 200 },
        resource_group: 'ai-studio-rg'
      },
      
      // === AI & ANALYTICS LAYER ===
      {
        type: 'ai_studio',
        name: 'ai-studio-workspace',
        field_state: {
          location: 'East US',
          kind: 'Default',
          tags: {}
        },
        position: { x: 200, y: 350 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'openai',
        name: 'ai-studio-openai',
        field_state: {
          location: 'East US',
          skuName: 'S0',
          deploymentName: 'gpt-4',
          modelName: 'gpt-4',
          modelVersion: '0613',
          tags: {}
        },
        position: { x: 400, y: 350 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'application_insights',
        name: 'ai-studio-insights',
        field_state: {
          location: 'East US',
          applicationType: 'web',
          tags: {}
        },
        position: { x: 600, y: 350 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'log_analytics',
        name: 'ai-studio-logs',
        field_state: {
          location: 'East US',
          skuName: 'PerGB2018',
          tags: {}
        },
        position: { x: 800, y: 350 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'workbook',
        name: 'ai-studio-workbook',
        field_state: {
          location: 'East US',
          displayName: 'AI Studio Monitoring Dashboard',
          tags: {}
        },
        position: { x: 1000, y: 350 },
        resource_group: 'ai-studio-rg'
      },
      
      // === DATABASE LAYER ===
      {
        type: 'cosmos_db',
        name: 'ai-studio-cosmos',
        field_state: {
          location: 'East US',
          consistencyPolicy: 'Session',
          throughput: 400,
          tags: {}
        },
        position: { x: 200, y: 500 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'redis',
        name: 'ai-studio-redis',
        field_state: {
          location: 'East US',
          skuName: 'Standard',
          capacity: 1,
          tags: {}
        },
        position: { x: 400, y: 500 },
        resource_group: 'ai-studio-rg'
      },
      
      // === INTEGRATION LAYER ===
      {
        type: 'api_management',
        name: 'ai-studio-apim',
        field_state: {
          location: 'East US',
          skuName: 'Developer',
          capacity: 1,
          tags: {}
        },
        position: { x: 600, y: 500 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'event_hub',
        name: 'ai-studio-eventhub',
        field_state: {
          location: 'East US',
          skuName: 'Standard',
          partitionCount: 4,
          messageRetentionInDays: 7,
          tags: {}
        },
        position: { x: 800, y: 500 },
        resource_group: 'ai-studio-rg'
      },
      {
        type: 'functions',
        name: 'ai-studio-functions',
        field_state: {
          location: 'East US',
          storageAccountType: 'Standard_LRS',
          tags: {}
        },
        position: { x: 1000, y: 500 },
        resource_group: 'ai-studio-rg'
      },
      
      // === NETWORKING RESOURCE GROUP ===
      {
        type: 'resource_group',
        name: 'networking-rg',
        field_state: {
          location: 'East US',
          tags: { Environment: 'Infrastructure', Project: 'Networking', 'cost-center': 'infrastructure' }
        },
        position: { x: 200, y: 650 }
      },
      
      // === NETWORK INFRASTRUCTURE ===
      {
        type: 'virtual_network',
        name: 'ai-studio-vnet',
        field_state: {
          location: 'East US',
          addressSpace: ['10.0.0.0/16'],
          tags: { Environment: 'Infrastructure', Project: 'Networking' }
        },
        position: { x: 400, y: 650 },
        resource_group: 'networking-rg'
      }
    ]
  },
  {
    id: 'application_zone',
    name: 'Application Zone',
    description: 'Standard application hosting environment with organized infrastructure layout',
    resources: [
      // === APPLICATION RESOURCE GROUP ===
      {
        type: 'resource_group',
        name: 'app-rg',
        field_state: {
          location: 'East US',
          tags: { Environment: 'Production', Project: 'Application' }
        },
        position: { x: 400, y: 80 }
      },
      
      // === COMPUTE LAYER ===
      {
        type: 'app_service',
        name: 'main-app-service',
        field_state: {
          location: 'East US',
          skuName: 'B1',
          tags: { Environment: 'Production', Project: 'Application' }
        },
        position: { x: 200, y: 200 },
        resource_group: 'app-rg'
      },
      
      // === DATA LAYER ===
      {
        type: 'sql_database',
        name: 'app-database',
        field_state: {
          location: 'East US',
          skuName: 'S0',
          collation: 'SQL_Latin1_General_CP1_CI_AS',
          tags: { Environment: 'Production', Project: 'Application' }
        },
        position: { x: 400, y: 200 },
        resource_group: 'app-rg'
      },
      
      // === MONITORING LAYER ===
      {
        type: 'application_insights',
        name: 'app-insights',
        field_state: {
          location: 'East US',
          applicationType: 'web',
          tags: { Environment: 'Production', Project: 'Application' }
        },
        position: { x: 600, y: 200 },
        resource_group: 'app-rg'
      }
    ]
  },
  
  // Test Landing Zone with storage account and essential resources
  {
    id: 'test_landing_zone',
    name: 'Test Landing Zone',
    description: 'A basic testing environment with storage account and essential resources',
    resources: [
      // === TEST NETWORKING RESOURCE GROUP ===
      {
        type: 'resource_group',
        name: 'test-networking-rg',
        field_state: {
          location: 'East US',
          tags: { Environment: 'Test', Project: 'Testing', 'cost-center': 'testing' }
        },
        position: { x: 200, y: 50 }
      },
      
      // === TEST STORAGE RESOURCE GROUP ===
      {
        type: 'resource_group',
        name: 'test-storage-rg',
        field_state: {
          location: 'East US',
          tags: { Environment: 'Test', Project: 'Testing', 'cost-center': 'testing' }
        },
        position: { x: 600, y: 50 }
      },
      
      // === STORAGE LAYER ===
      {
        type: 'storage_account',
        name: 'teststorageacct',
        field_state: {
          location: 'East US',
          accountTier: 'Standard',
          replicationType: 'LRS',
          accessTier: 'Hot',
          httpsTrafficOnly: true,
          tags: { Environment: 'Test', Project: 'Testing' }
        },
        position: { x: 400, y: 200 },
        resource_group: 'test-storage-rg'
      },
      
      // === COMPUTE LAYER ===
      {
        type: 'virtual_machine',
        name: 'test-vm',
        field_state: {
          location: 'East US',
          vmSize: 'Standard_B2s',
          osType: 'Linux',
          imagePublisher: 'Canonical',
          imageOffer: 'UbuntuServer',
          imageSku: '18.04-LTS',
          adminUsername: 'azureuser',
          authenticationType: 'password',
          tags: { Environment: 'Test', Project: 'Testing' }
        },
        position: { x: 800, y: 200 },
        resource_group: 'test-networking-rg'
      }
    ]
  }
];

interface ResourceSidebarProps {
  onLandingZoneSelect?: (landingZone: LandingZone) => void;
}

export default function ResourceSidebar({ onLandingZoneSelect }: ResourceSidebarProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = Array.from(new Set(resources.map(r => r.category)));

  const handleLandingZoneSelect = (landingZoneId: string) => {
    const selectedLandingZone = landingZones.find(lz => lz.id === landingZoneId);
    if (selectedLandingZone && onLandingZoneSelect) {
      onLandingZoneSelect(selectedLandingZone);
    }
  };

  // Filter resources based on search term
  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered resources by category
  const filteredCategories = categories.filter(category =>
    filteredResources.some(resource => resource.category === category)
  );

  // Ensure Management category is always expanded by default (contains Resource Group)
  const getDefaultExpandedCategories = () => {
    const defaultExpanded = ['Management']; // Always expand Management category
    // Add other categories based on search or user preference
    return defaultExpanded.filter(category => filteredCategories.includes(category));
  };

  return (
    <div className="w-72 sm:w-80 bg-gradient-to-b from-white via-blue-50/20 to-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm shadow-lg flex flex-col h-full animate-slide-in-left">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-900/80 dark:to-blue-900/80 backdrop-blur-sm flex-shrink-0 animate-fade-in-down">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-left">Azure Resources</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 animate-fade-in-left">Drag components to build your infrastructure</p>
      </div>
      
      {/* Landing Zone Dropdown */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Landing Zones</label>
          <Select onValueChange={handleLandingZoneSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a landing zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="application_zone">Application Zone</SelectItem>
              <SelectItem value="ai_studio_landing_zone">AI Studio Landing Zone</SelectItem>
              <SelectItem value="test_landing_zone">Test Landing Zone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-8">
          <Accordion type="multiple" defaultValue={getDefaultExpandedCategories()} className="w-full space-y-1">
            {filteredCategories.map(category => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:no-underline">
                  <div className="flex items-center">
                    <span className="text-primary mr-2">{categoryIcons[category]}</span>
                    {category}
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      ({filteredResources.filter(r => r.category === category).length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2 pb-2">
                    {filteredResources
                      .filter(r => r.category === category)
                      .map(resource => (
                        <DraggableResourceCard 
                          key={resource.type} 
                          resource={resource} 
                        />
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
