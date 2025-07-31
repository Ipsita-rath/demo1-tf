import { useDrop } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Eye } from "lucide-react";
import ResourceCard from "./ResourceCard";
import type { TerraformResource } from "@/types/terraform";

interface CanvasProps {
  resources: TerraformResource[];
  onResourceDrop: (resourceType: string, position: { x: number; y: number }) => void;
  onResourceSelect: (resource: TerraformResource) => void;
  onResourceDelete: (resourceId: string) => void;
  onResourceMove: (resourceId: string, position: { x: number; y: number }) => void;
  selectedResource: TerraformResource | null;
}

export default function Canvas({ 
  resources, 
  onResourceDrop, 
  onResourceSelect, 
  onResourceDelete,
  onResourceMove,
  selectedResource 
}: CanvasProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ['resource', 'existing-resource'],
    drop: (item: { type: string; name?: string; id?: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        const canvasRect = document.getElementById('canvas')?.getBoundingClientRect();
        if (canvasRect) {
          const position = {
            x: clientOffset.x - canvasRect.left,
            y: clientOffset.y - canvasRect.top,
          };
          
          if (item.id) {
            onResourceMove(item.id, position);
          } else {
            onResourceDrop(item.type, position);
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex-1 relative bg-gray-50 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-25" 
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="relative h-full p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Infrastructure Canvas</h2>
              <p className="text-sm text-gray-500 mt-1">
                Drag Azure resources from the left sidebar to build your infrastructure
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Undo className="h-4 w-4" />
                <span>Undo</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Redo className="h-4 w-4" />
                <span>Redo</span>
              </Button>
            </div>
          </div>
        </div>

        <div
          id="canvas"
          ref={drop}
          className={`relative min-h-[800px] ${
            isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
        >
          <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-blue-500 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">☁️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Azure Subscription</h2>
                  <p className="text-blue-100 text-sm">East US • Production Environment</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {resources.filter(r => r.type === 'resource_group').length} Resource Groups
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {resources.filter(r => r.type !== 'resource_group').length} Resources
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 h-full overflow-y-auto">
              {resources.filter(r => r.type === 'resource_group').map((rg) => {
                const groupResources = resources.filter(r => r.type !== 'resource_group' && 
                  (r.config?.resourceGroup === rg.name || r.name?.includes(rg.name.replace('-rg', ''))));
                
                return (
                  <div
                    key={`group-${rg.id}`}
                    className="rounded-xl border-2 border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-lg overflow-hidden"
                    style={{
                      minHeight: rg.name === 'ai-studio-rg' ? '480px' : 
                                rg.name === 'networking-rg' ? '180px' : 
                                rg.name === 'app-rg' ? '240px' : '300px'
                    }}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">📁</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{rg.name.toUpperCase()}</h3>
                          <p className="text-xs text-gray-600">
                            {rg.name === 'ai-studio-rg' ? 'AI Development Environment' : 
                             rg.name === 'networking-rg' ? 'Network Infrastructure' : 
                             'Application Resources'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border">
                          {groupResources.length} services
                        </span>
                        <ResourceCard
                          resource={rg}
                          isSelected={selectedResource?.id === rg.id}
                          onSelect={() => onResourceSelect(rg)}
                          onDelete={() => onResourceDelete(rg.id)}
                          onMove={onResourceMove}
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-5 gap-3">
                        {groupResources.map((resource) => (
                          <ResourceCard
                            key={resource.id}
                            resource={resource}
                            isSelected={selectedResource?.id === resource.id}
                            onSelect={() => onResourceSelect(resource)}
                            onDelete={() => onResourceDelete(resource.id)}
                            onMove={onResourceMove}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {resources.filter(r => r.type !== 'resource_group' && 
            !resources.some(rg => rg.type === 'resource_group' && 
              (r.config?.resourceGroup === rg.name || r.name?.includes(rg.name.replace('-rg', ''))))).map((resource) => (
            <div
              key={resource.id}
              className="absolute z-20"
              style={{
                left: resource.position.x,
                top: resource.position.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <ResourceCard
                resource={resource}
                isSelected={selectedResource?.id === resource.id}
                onSelect={() => onResourceSelect(resource)}
                onDelete={() => onResourceDelete(resource.id)}
                onMove={onResourceMove}
              />
            </div>
          ))}
          
          {resources.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">🏗️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start Building Your Infrastructure
                </h3>
                <p className="text-gray-500 mb-4">
                  Choose from landing zones or drag individual Azure resources
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-sm font-medium text-blue-900">AI Studio Landing Zone</div>
                    <div className="text-xs text-blue-600">Complete AI development environment</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-medium text-green-900">Application Zone</div>
                    <div className="text-xs text-green-600">Standard web application stack</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}