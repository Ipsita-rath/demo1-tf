'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { TerraformResource, TerraformConfiguration } from '@/types/terraform';
import { generateSuggestedName } from '@/utils/azureNamingStandards';
import Header from '@/components/Header';
import ResourceSidebar from '@/components/ResourceSidebar';
import Canvas from '@/components/Canvas';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import CodePreviewPanel from '@/components/CodePreviewPanel';
import GlobalInfoModal from '@/components/GlobalInfoModal';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function TerraformBuilder() {
  const queryClient = useQueryClient();
  const [resources, setResources] = useState<TerraformResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<TerraformResource | null>(null);
  const [showGlobalInfo, setShowGlobalInfo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [globalConfig, setGlobalConfig] = useState({
    subscriptionId: '',
    resourceGroupName: '',
    location: 'East US',
    environment: 'Production',
    project: '',
    costCenter: '',
    owner: '',
    tags: {} as Record<string, string>,
    adRoles: [] as string[]
  });

  // Load saved configuration
  const { data: savedConfig } = useQuery({
    queryKey: ['/api/terraform/config'],
    enabled: false, // Only load when needed
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: TerraformConfiguration) => {
      return apiRequest('/api/terraform/config', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Configuration Saved',
        description: 'Your Terraform configuration has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save configuration.',
        variant: 'destructive',
      });
    },
  });

  // Generate code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async (resources: TerraformResource[]) => {
      return apiRequest('/api/terraform/generate-code', {
        method: 'POST',
        body: JSON.stringify({ resources, globalConfig }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      setShowPreview(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Code Generation Failed',
        description: error.message || 'Failed to generate Terraform code.',
        variant: 'destructive',
      });
    },
  });

  const handleResourceDrop = (resourceType: string, position: { x: number; y: number }) => {
    // Generate default names based on Azure naming convention
    const getDefaultName = (type: string) => {
      const count = resources.filter(r => r.type === type).length + 1;
      const globalNamingConfig = {
        projectCode: globalConfig.project || 'inid',
        environment: globalConfig.environment?.toLowerCase() || 'dev',
        region: globalConfig.location?.toLowerCase().replace(/\s+/g, '') || 'eastus'
      };
      
      return generateSuggestedName(type, count, globalNamingConfig);
    };

    const newResource: TerraformResource = {
      id: `${resourceType}-${Date.now()}`,
      type: resourceType,
      name: getDefaultName(resourceType),
      config: {
        location: globalConfig.location || 'East US',
        resourceGroup: globalConfig.resourceGroupName || 'module.resource_group.rg_name',
        tags: globalConfig.tags || {},
        // Apply global AD roles to supported resources (create independent copies)
        ...(globalConfig.adRoles && globalConfig.adRoles.length > 0 && 
           ['key_vault', 'storage_account', 'virtual_machine', 'sql_database', 'ai_studio', 'container_registry', 'api_management', 'managed_identity', 'openai'].includes(resourceType) && {
          resourceSpecificRoles: [...globalConfig.adRoles]  // Only independent copy, no adRoles reference
        })
      },
      position,
    };

    setResources(prev => [...prev, newResource]);
    setSelectedResource(newResource);
  };

  const handleResourceSelect = (resource: TerraformResource) => {
    setSelectedResource(resource);
  };

  const handleResourceUpdate = (updatedResource: TerraformResource) => {
    setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
    setSelectedResource(updatedResource);
  };

  const handleResourceDelete = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
    if (selectedResource?.id === resourceId) {
      setSelectedResource(null);
    }
  };

  const handleResourceMove = (resourceId: string, position: { x: number; y: number }) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, position } : r
    ));
  };

  const handleResourcesUpdate = (updatedResources: TerraformResource[]) => {
    setResources(updatedResources);
    
    // Update selectedResource if it was modified
    if (selectedResource) {
      const updatedSelected = updatedResources.find(r => r.id === selectedResource.id);
      if (updatedSelected) {
        setSelectedResource(updatedSelected);
      }
    }
    
    // Trigger code regeneration to show real-time updates
    if (showPreview) {
      generateCodeMutation.mutate(updatedResources);
    }
  };

  const handleSaveConfiguration = () => {
    const config: TerraformConfiguration = {
      id: Date.now().toString(),
      name: `Configuration-${new Date().toISOString().split('T')[0]}`,
      resources,
      globalConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveConfigMutation.mutate(config);
  };

  const handlePreviewCode = () => {
    generateCodeMutation.mutate(resources);
  };

  const handleUndo = () => {
    // Implement undo functionality
    toast({
      title: 'Undo',
      description: 'Undo functionality will be implemented in future version.',
    });
  };

  const handleRedo = () => {
    // Implement redo functionality
    toast({
      title: 'Redo',
      description: 'Redo functionality will be implemented in future version.',
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        isConnected={true}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreviewCode={handlePreviewCode}
        onGlobalInfo={() => setShowGlobalInfo(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <ResourceSidebar />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Main Canvas */}
          <ResizablePanel defaultSize={selectedResource ? 60 : 80} minSize={40}>
            <Canvas
              resources={resources}
              onResourceDrop={handleResourceDrop}
              onResourceSelect={handleResourceSelect}
              onResourceDelete={handleResourceDelete}
              onResourceMove={handleResourceMove}
              selectedResource={selectedResource}
            />
          </ResizablePanel>
          
          {/* Right Configuration Panel */}
          {selectedResource && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <ConfigurationPanel
                  resource={selectedResource}
                  onUpdate={handleResourceUpdate}
                  onDelete={handleResourceDelete}
                  globalConfig={globalConfig}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Global Info Modal */}
      <GlobalInfoModal
        isOpen={showGlobalInfo}
        onClose={() => setShowGlobalInfo(false)}
        resources={resources}
        onResourcesUpdate={handleResourcesUpdate}
        onGlobalConfigUpdate={(newConfig: any) => {
          console.log('Terraform Builder - Updating global config:', newConfig);
          console.log('Previous global config:', globalConfig);
          setGlobalConfig(newConfig);
          console.log('Global config updated, should trigger preview refresh');
          
          // Force query invalidation to ensure preview updates
          queryClient.invalidateQueries({
            queryKey: ['/api/terraform/generate-code']
          });
        }}
      />

      {/* Code Preview Panel */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[90%] h-[90%] max-w-6xl">
            <CodePreviewPanel
              resources={resources}
              globalConfig={globalConfig}
              activeTab="code"
              onTabChange={() => {}}
              onClose={() => setShowPreview(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}