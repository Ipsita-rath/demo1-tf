import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Play } from "lucide-react";
import { useDrag } from "react-dnd";
import type { TerraformResource } from "@/types/terraform";
import { getAzureIcon } from "./AzureIcons";


interface ResourceCardProps {
  resource: TerraformResource;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMove?: (resourceId: string, position: { x: number; y: number }) => void;
}

export default function ResourceCard({ resource, isSelected, onSelect, onDelete, onMove }: ResourceCardProps) {
  const getResourceIcon = (type: string) => {
    return getAzureIcon(type, 20, "shrink-0");
  };

  const getResourceColor = (type: string) => {
    const colors: Record<string, string> = {
      'resource_group': 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20',
      'key_vault': 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20',
      'storage_account': 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20',
      'virtual_network': 'border-cyan-300 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-900/20',
      'subnet': 'border-teal-300 bg-teal-50 dark:border-teal-600 dark:bg-teal-900/20',
      'network_security_group': 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20',
      'virtual_machine': 'border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20',
      'app_service': 'border-indigo-300 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20',
      'sql_database': 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20',
      'role_assignment': 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20',
      'role_definition': 'border-violet-300 bg-violet-50 dark:border-violet-600 dark:bg-violet-900/20',
    };
    return colors[type] || 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/20';
  };



  const [{ isDragging }, drag] = useDrag({
    type: 'existing-resource',
    item: { id: resource.id, type: resource.type },
    collect: (monitor) => {
      try {
        return {
          isDragging: monitor.isDragging(),
        };
      } catch (error) {
        console.error('Error in drag collect:', error);
        return { isDragging: false };
      }
    },
  });

  // Determine if this is a draggable resource on the canvas or a grid item
  const isGridItem = !resource.position || (resource.position.x === 0 && resource.position.y === 0);

  return (
    <Card 
      ref={drag}
      data-allow-drag="true"
      className={`${isGridItem ? 'relative' : 'absolute'} cursor-move transition-all duration-300 ease-out resource-card-hover group ${
        isSelected ? 'ring-2 ring-primary shadow-xl animate-pulse-glow' : 'hover:shadow-lg'
      } ${getResourceColor(resource.type)} ${
        isDragging ? 'dragging opacity-70 scale-105 rotate-3 shadow-2xl z-50' : 'opacity-100 scale-100'
      } ${isGridItem ? 'w-full h-full animate-fade-in-up' : 'animate-bounce-in'} backdrop-blur-sm border-2`}
      style={isGridItem ? { 
        minHeight: resource.type === 'resource_group' ? '80px' : '70px',
        maxWidth: '100%'
      } : { 
        left: resource.position.x, 
        top: resource.position.y,
        width: resource.type === 'resource_group' ? '384px' : '256px',
        minHeight: resource.type === 'resource_group' ? '256px' : '128px'
      }}
      onClick={onSelect}
    >
      <CardContent className={`${isGridItem ? 'p-2' : 'p-4'} h-full flex flex-col`}>
        {isGridItem ? (
          // Grid item layout - compact
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getResourceIcon(resource.type)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-xs truncate">
                  {(resource.name || '').length > 10 ? `${(resource.name || '').substring(0, 10)}...` : (resource.name || 'Unnamed')}
                </span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 text-gray-600 dark:text-gray-400 hover:bg-red-200 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-400 dark:border-gray-600 pt-1 mt-auto">
              <div className="text-xs text-gray-700 dark:text-gray-400 capitalize truncate font-medium">
                {resource.type.replace(/_/g, ' ').replace('ai studio', 'AI Studio')}
              </div>
            </div>
          </div>
        ) : (
          // Full canvas layout
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="resource-card-content">
                <div className="resource-icon-container">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="resource-text-container">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {resource.name || 'Unnamed Resource'}
                  </span>
                </div>
                <div className="resource-actions-container">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect();
                    }}
                    className="btn-enhanced ripple"
                  >
                    <Settings className="h-4 w-4 rotate-on-hover" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 capitalize truncate">
              {resource.type.replace('_', ' ')} • {resource.config.location || 'East US'}
            </div>
            
            <div className="flex justify-center mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Only show extra content for full canvas layout, not grid items */}
        {!isGridItem && resource.type === 'resource_group' && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Contains:</div>
            {/* This would show child resources in a real implementation */}
            <div className="flex items-center space-x-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
              <span className="text-sm">🔑</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Key Vault</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
              <span className="text-sm">💾</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Storage Account</span>
            </div>
          </div>
        )}

        {!isGridItem && resource.type === 'virtual_network' && (
          <div className="mt-4">
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded p-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🔗</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Subnet</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {resource.config.addressSpace?.[0] || '10.0.0.0/16'}
              </div>
            </div>
          </div>
        )}

        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-primary text-white">Selected</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
