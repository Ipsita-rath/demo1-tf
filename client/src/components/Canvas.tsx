import React from "react";
import { useDrop } from "react-dnd";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, Clock, Shield, Database, Network, Brain, Cpu, Settings, ChevronDown, X, HardDrive } from "lucide-react";
import ResourceCard from "./ResourceCard";
import SharedStorageDemo from "./SharedStorageDemo";
import { getRoleAssignmentCount } from "../utils/roleAssignmentStorage";
import type { TerraformResource } from "@/types/terraform";


interface CanvasProps {
  resources: TerraformResource[];
  onResourceDrop: (resourceType: string, position: { x: number; y: number }) => void;
  onResourceSelect: (resource: TerraformResource) => void;
  onResourceDelete: (resourceId: string) => void;
  onResourceMove: (resourceId: string, position: { x: number; y: number }) => void;
  selectedResource: TerraformResource | null;
  onResourceGroupClick?: (resourceGroupName: string) => void;
  onRoleAssignmentClick?: (resourceGroupName: string) => void;
  globalSettings?: {
    subscriptionName?: string;
    projectName?: string;
    environment?: string;
    region?: string;
  };
   roleCount: number;
}

export default function Canvas({ 
  resources, 
  onResourceDrop, 
  onResourceSelect, 
  onResourceDelete,
  onResourceMove,
  selectedResource,
  onResourceGroupClick,
  onRoleAssignmentClick,
   roleCount,
  globalSettings
}: CanvasProps) {
  // State to track which resource groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  

  // Ensure all resource groups are expanded by default when resources change
  useEffect(() => {
    const allResourceGroups = new Set<string>();
    (resources || []).forEach(r => {
      if (r.config?.resourceGroup) {
        allResourceGroups.add(r.config.resourceGroup);
      }
    });
    setExpandedGroups(allResourceGroups);
  }, [resources]);

  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  
  // Helper function to generate subscription name with proper naming standards
  const getSubscriptionDisplayName = () => {
    // Use globalSettings from props if available, otherwise use defaults
    const projectName = globalSettings?.projectName || 'project';
    const environment = globalSettings?.environment || 'nonprod';
    const region = globalSettings?.region || 'centralus';
    const subscriptionNumber = '01';   // Default number
    
    // Use same generation logic as GlobalInfoModal.generateSubscriptionName()
    const generatedName = `sub-${projectName.toLowerCase()}-${region}-${environment.toLowerCase()}-${subscriptionNumber}`;
    
    console.log('🖥️ Canvas subscription display:', generatedName, 'from globalSettings:', globalSettings);
    return generatedName;
  };

  // Helper function to get resource category icon
  const getResourceCategoryIcon = (type: string) => {
    if (type.includes('security') || type.includes('vault') || type.includes('identity')) return Shield;
    if (type.includes('database') || type.includes('sql') || type.includes('cosmos')) return Database;
    if (type.includes('network') || type.includes('subnet') || type.includes('vnet')) return Network;
    if (type.includes('ai') || type.includes('openai') || type.includes('cognitive')) return Brain;
    if (type.includes('vm') || type.includes('compute') || type.includes('app')) return Cpu;
    return Settings;
  };

  // Helper function to get resource details
  const getResourceDetails = (resource: TerraformResource) => {
    const details = [];
    
    if (resource.config?.location) {
      details.push({ label: 'Location', value: resource.config.location, icon: MapPin });
    }
    if (resource.config?.sku) {
      details.push({ label: 'SKU', value: resource.config.sku, icon: Settings });
    }
    if (resource.config?.tier) {
      details.push({ label: 'Tier', value: resource.config.tier, icon: Settings });
    }
    if (resource.config?.size) {
      details.push({ label: 'Size', value: resource.config.size, icon: Cpu });
    }
    
    return details;
  };

  interface DragItem {
    type: string;
    name?: string;
    id?: string;
  }

  const [{ isOver }, drop] = useDrop<DragItem, { dropped: boolean; item: DragItem; position: { x: number; y: number } } | undefined, { isOver: boolean }>({
    accept: ['resource', 'existing-resource'],
    hover: (item, monitor) => {
      console.log('🎯 Hovering over canvas with item:', item);
    },
    drop: (item, monitor) => {
      try {
        console.log('🎯 Canvas drop triggered with item:', item);
        const clientOffset = monitor.getClientOffset();
        console.log('📍 Client offset:', clientOffset);
        
        if (clientOffset) {
          const canvasRect = document.getElementById('canvas')?.getBoundingClientRect();
          console.log('📐 Canvas rect:', canvasRect);
          
          if (canvasRect) {
            const position = {
              x: clientOffset.x - canvasRect.left,
              y: clientOffset.y - canvasRect.top,
            };
            console.log('📍 Calculated position:', position);
            
            if (item.id) {
              console.log('🔄 Moving existing resource:', item.id);
              onResourceMove(item.id, position);
            } else {
              console.log('🆕 Creating new resource:', item.type, 'at position:', position);
              onResourceDrop(item.type, position);
            }
            
            // Return the drop result
            return { dropped: true, item, position };
          } else {
            console.error('❌ Canvas rect not found');
          }
        } else {
          console.error('❌ Client offset not found');
        }
      } catch (error) {
        console.error('❌ Error in canvas drop handler:', error);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex-1 relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-blue-900/10 dark:to-slate-800 h-full flex flex-col overflow-hidden transition-all duration-500">
      <div 
        className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${isOver ? 'opacity-40' : 'animate-pulse-slow'}`}
        style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {isOver && (
        <div className="absolute inset-0 drop-zone-active flex items-center justify-center z-10 animate-bounce-in pointer-events-none">
          <div className="bg-white/90 dark:bg-gray-800/90 px-6 py-4 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700 animate-scale-in">
            <div className="text-blue-600 dark:text-blue-400 font-medium text-center animate-drag-hover">
              Drop resource here to add to canvas
            </div>
          </div>
        </div>
      )}
      
      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 animate-fade-in-down">
          <div className="align-between gap-4">
            <div className="animate-fade-in-left">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Azure Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Drag Azure resources from the sidebar to build your cloud architecture
              </p>
            </div>
            <div className="flex-aligned-row animate-fade-in-right">
              <div className={`w-3 h-3 rounded-full ${isOver ? 'bg-green-500 icon-pulse' : 'bg-gray-300'} transition-all duration-300`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isOver ? '✨ Drop Zone Active' : '🎯 Ready'}
              </span>
            </div>
          </div>
        </div>

        <div
          id="canvas"
          ref={drop}
          className={`flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 transition-all duration-500 ease-out ${
            isOver ? 'drop-zone-active scale-[1.01] shadow-inner' : ''
          }`}
          style={{
            backgroundImage: isOver ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)' : 'none',
            minHeight: '400px'
          }}
        >
          {/* Azure Subscription Container */}
          {/* Merged Subscription Container - Blue header with white body */}
          <div className="m-4 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
            {/* Blue Subscription Header - Now part of the white container */}
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-t-lg text-white shadow-lg cursor-pointer hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 transition-all duration-200 transform hover:scale-[1.01]"
              onClick={() => onResourceGroupClick && onResourceGroupClick('subscription')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">☁️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {getSubscriptionDisplayName()}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {globalSettings?.region || "Central US"} • {globalSettings?.environment || "nonprod"} Environment
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-blue-200 text-xs">
                      Click to configure subscription settings
                    </p>
                    <button 
                      className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-lg transition-colors ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResourceGroupClick && onResourceGroupClick('owner');
                      }}
                    >
                      Role Assignment
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {(resources || []).filter(r => r.type === 'resource_group').length} Resource Groups
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {(resources || []).filter(r => r.type !== 'resource_group').length} Resources
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                   {roleCount} Role{roleCount === 1 ? '' : 's'} Assigned
                </span>

              </div>
            </div>

          </div>

          <div className="border-4 border-blue-500 dark:border-blue-400 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 shadow-xl">

            {/* Resource Groups Container */}
            <div className="space-y-6">
              {(resources || []).filter(r => r.type === 'resource_group').length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center max-w-md">
                    <div className="text-gray-400 text-6xl mb-4 animate-bounce">🏗️</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Start Building Your Infrastructure
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                      Drag Azure resources from the sidebar to create your cloud architecture. 
                      Resources will automatically organize into resource groups.
                    </p>
                    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6">
                      💡 <strong>Tip:</strong> Start with a Resource Group, then add services like Storage Account, Key Vault, or Virtual Network
                    </div>
                    <div className="flex justify-center space-x-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">🤖</div>
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Studio Landing Zone</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Complete AI development environment</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">📱</div>
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">Application Zone</div>
                        <div className="text-xs text-green-600 dark:text-green-400">Standard web application stack</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Get all unique resource groups from resources */}
              {(() => {
                // Collect all unique resource group names from resources
                const allResourceGroups = new Set<string>();
                (resources || []).forEach(r => {
                  if (r.config?.resourceGroup) {
                    allResourceGroups.add(r.config.resourceGroup);
                  }
                });
                
                // Convert to array and sort
                return Array.from(allResourceGroups).sort((a, b) => {
                  // Put VNet resource groups first (rg-vnet-*)
                  if (a.startsWith('rg-vnet-') && !b.startsWith('rg-vnet-')) return -1;
                  if (!a.startsWith('rg-vnet-') && b.startsWith('rg-vnet-')) return 1;
                  return a.localeCompare(b);
                });
              })().map((rgName) => {
                const groupResources = (resources || []).filter(r => r.type !== 'resource_group' && 
                  r.config?.resourceGroup === rgName);
                
                return (
                  <div
                    key={`group-${rgName}`}
                    className="p-6 m-4 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    {/* Resource Group Header */}
                    <div 
                      className="flex items-center justify-between mb-6 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => onResourceGroupClick && onResourceGroupClick(rgName)}
                    >

                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${rgName.startsWith('rg-vnet-') ? 'bg-blue-500 dark:bg-blue-600' : 'bg-orange-500 dark:bg-orange-600'} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {rgName.startsWith('rg-vnet-') ? '🌐' : '📁'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{rgName}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {rgName.startsWith('rg-vnet-') ? 'Virtual Network Resources' : 
                             rgName.includes('ai-studio') ? 'AI Development Environment' : 
                             rgName.includes('networking') ? 'Network Infrastructure' : 
                             'Application Resources'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                         
                     <span className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-full border dark:border-gray-600 font-medium">
  {(() => {
    const count = getRoleAssignmentCount(rgName); 
    return count > 0 ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-black">
        {count} Roles Assigned
      </span>
    ) : null;
  })()}
</span>


                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-full border dark:border-gray-600 font-medium">
                          {(groupResources || []).length} services
                        </span>
                       <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        onClick={(e) => {
                        e.stopPropagation();
                        onResourceGroupClick && onResourceGroupClick('RG-owner');
                      }}
                      >
                         Role Assignment
                      </Button>
                     

                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {rgName.startsWith('rg-vnet-') ? 'Virtual Network Group' : 'Resource Group'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroupExpansion(rgName);
                            }}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedGroups.has(rgName) ? 'rotate-180' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Resource Group Content - Only show if expanded */}
                    {expandedGroups.has(rgName) && (
                      <div className="w-full">
                        {(groupResources || []).length > 0 ? (
                          <div className="w-full">
                            {/* Responsive Grid Layout - Fixed Containment */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                              {(groupResources || []).map((resource) => {
                                return (
                                  <div key={resource.id} className="relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[140px] flex flex-col overflow-hidden">
                                    {/* Resource Card Container - Fixed Size */}
                                    <div className="flex-1 mb-2">
                                      <div className="w-full h-full max-w-none">
                                        <ResourceCard
                                          resource={{
                                            ...resource,
                                            position: { x: 0, y: 0 } // Force grid positioning
                                          }}
                                          isSelected={selectedResource?.id === resource.id}
                                          onSelect={() => onResourceSelect(resource)}
                                          onDelete={() => onResourceDelete(resource.id)}
                                          onMove={onResourceMove}
                                        />
                                      </div>
                                    </div>
                                    
                                    {/* Resource Info Footer - Hide since it's shown in ResourceCard */}
                                    <div className="mt-auto text-center space-y-1" style={{ display: 'none' }}>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                                        {resource.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {resource.config?.location || 'East US'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                              <div className="text-gray-400 text-4xl mb-2">📦</div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No resources in this group yet
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Drag resources from the sidebar to add them here
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


        </div>
      </div>
      
      {/* Shared Storage Demo Section */}
      <div className="w-full mt-8 border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Browser Shared Storage</h3>
          <Badge variant="outline">DevTools Integration</Badge>
        </div>
        <SharedStorageDemo />
      </div>
    </div>
  );
}