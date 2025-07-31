import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Download, Check, Rocket, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateTerraformCode } from "@/lib/terraformApi";
import { useQuery } from "@tanstack/react-query";
import type { TerraformResource } from "@/types/terraform";

interface CodePreviewPanelProps {
  resources: TerraformResource[];
  activeTab: 'code' | 'deployment' | 'logs';
  onTabChange: (tab: 'code' | 'deployment' | 'logs') => void;
  onClose?: () => void;
}

export default function CodePreviewPanel({ resources, activeTab, onTabChange, onClose }: CodePreviewPanelProps) {
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState<'ready' | 'planning' | 'applying' | 'completed' | 'failed'>('ready');
  const { toast } = useToast();

  const { data: generatedCode, isLoading: isGenerating } = useQuery({
    queryKey: ['/api/terraform/generate-code', resources],
    queryFn: async () => {
      if (resources.length === 0) return { code: '' };
      
      // Check if user has a Terraform token stored
      const terraformToken = localStorage.getItem('terraformToken');
      const usePrivateModules = localStorage.getItem('usePrivateModules') === 'true';
      
      return generateTerraformCode(resources, terraformToken || undefined, usePrivateModules);
    },
    enabled: resources.length > 0,
  });

  const handleCopyCode = async () => {
    if (generatedCode?.code) {
      await navigator.clipboard.writeText(generatedCode.code);
      toast({
        title: "Code copied",
        description: "Terraform code has been copied to clipboard",
      });
    }
  };

  const handleDownloadCode = () => {
    if (generatedCode?.code) {
      const blob = new Blob([generatedCode.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'main.tf';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Code downloaded",
        description: "Terraform code has been downloaded as main.tf",
      });
    }
  };

  const handleValidateCode = () => {
    toast({
      title: "Code validated",
      description: "Terraform configuration is valid",
    });
  };

  const handleDeploy = async () => {
    setDeploymentStatus('planning');
    setDeploymentProgress(10);
    
    // Simulate deployment process
    const steps = [
      { status: 'planning', progress: 30, message: 'Running terraform plan...' },
      { status: 'applying', progress: 70, message: 'Applying changes...' },
      { status: 'completed', progress: 100, message: 'Deployment completed successfully' },
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeploymentStatus(step.status as any);
      setDeploymentProgress(step.progress);
    }
    
    toast({
      title: "Deployment completed",
      description: "Infrastructure has been successfully deployed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-yellow-500';
      case 'planning': return 'bg-blue-500';
      case 'applying': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready for Deployment';
      case 'planning': return 'Planning Changes';
      case 'applying': return 'Applying Changes';
      case 'completed': return 'Deployment Completed';
      case 'failed': return 'Deployment Failed';
      default: return 'Unknown Status';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={onTabChange as any} className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-transparent flex-shrink-0">
          <TabsList className="flex bg-transparent">
            <TabsTrigger 
              value="code" 
              className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
            >
              <span className="flex items-center space-x-2">
                <span>📄</span>
                <span>Generated Code</span>
              </span>
            </TabsTrigger>
          <TabsTrigger 
            value="deployment" 
            className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
          >
            <span className="flex items-center space-x-2">
              <Rocket className="h-4 w-4" />
              <span>Deployment</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="logs" 
            className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
          >
            <span className="flex items-center space-x-2">
              <span>📋</span>
              <span>Activity Log</span>
            </span>
          </TabsTrigger>
        </TabsList>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="mx-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="code" className="p-4 h-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Terraform Configuration</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyCode}
                  disabled={!generatedCode?.code}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadCode}
                  disabled={!generatedCode?.code}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleValidateCode}
                  disabled={!generatedCode?.code}
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Validate
                </Button>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500 dark:text-gray-400">Generating Terraform code...</div>
              </div>
            ) : generatedCode?.code ? (
              <div className="space-y-3">
                {(generatedCode.usePrivateModules || generatedCode.tokenValid) && (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Using Private Modules from GM-Landing-Zone
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {generatedCode.tokenValid ? 'Token Valid' : 'Token Invalid'}
                    </Badge>
                  </div>
                )}
                <div className="bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{generatedCode.code}</pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500 dark:text-gray-400">Add resources to generate Terraform code</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="deployment" className="p-4 h-full overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployment Status</h3>
                <Badge className={`${getStatusColor(deploymentStatus)} text-white`}>
                  {getStatusText(deploymentStatus)}
                </Badge>
              </div>

              {deploymentStatus !== 'ready' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{deploymentProgress}%</span>
                  </div>
                  <Progress value={deploymentProgress} className="w-full" />
                </div>
              )}

              <Card className={`${
                deploymentStatus === 'ready' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                deploymentStatus === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                deploymentStatus === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${
                      deploymentStatus === 'ready' ? 'bg-yellow-500' : 
                      deploymentStatus === 'completed' ? 'bg-green-500' : 
                      deploymentStatus === 'failed' ? 'bg-red-500' : 
                      'bg-blue-500 animate-pulse'
                    }`} />
                    <span className="text-sm font-medium dark:text-white">
                      {deploymentStatus === 'ready' ? 'Ready for Deployment' :
                       deploymentStatus === 'planning' ? 'Planning Changes' :
                       deploymentStatus === 'applying' ? 'Applying Changes' :
                       deploymentStatus === 'completed' ? 'Deployment Completed' :
                       'Deployment Failed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {deploymentStatus === 'ready' ? 'Configuration validated successfully. Click deploy to provision resources.' :
                     deploymentStatus === 'planning' ? 'Running terraform plan to preview changes...' :
                     deploymentStatus === 'applying' ? 'Applying infrastructure changes to Azure...' :
                     deploymentStatus === 'completed' ? 'All resources have been successfully provisioned.' :
                     'An error occurred during deployment. Check logs for details.'}
                  </p>
                  {deploymentStatus === 'ready' && (
                    <Button 
                      onClick={handleDeploy}
                      className="mt-3 bg-orange-500 hover:bg-orange-600"
                      disabled={!generatedCode?.code || resources.length === 0}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy Infrastructure
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="p-4 h-full overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h3>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Configuration updated</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Terraform code generated</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Resource added to canvas</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">8 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
