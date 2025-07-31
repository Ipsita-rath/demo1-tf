import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cloud, 
  Server, 
  Database, 
  Shield, 
  Network, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import type { TerraformResource } from "@/types/terraform";
import { getAzureIcon } from "./AzureIcons";


interface AzureBuilderProps {
  resources: TerraformResource[];
  onResourceUpdate: (resource: TerraformResource) => void;
  onResourcesUpdate: (resources: TerraformResource[]) => void;
}

interface BuildStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  resources: string[];
}

interface AzureTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  resources: string[];
  estimatedCost: string;
  deploymentTime: string;
}

export default function AzureBuilder({ resources, onResourceUpdate, onResourcesUpdate }: AzureBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AzureTemplate | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'completed' | 'failed'>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  // Azure templates for common infrastructure patterns
  const azureTemplates: AzureTemplate[] = [
    {
      id: 'web-app-basic',
      name: 'Web Application (Basic)',
      description: 'Basic web application with App Service, SQL Database, and Storage Account',
      icon: '🌐',
      category: 'Web Applications',
      resources: ['app_service', 'sql_database', 'storage_account', 'key_vault'],
      estimatedCost: '$50-100/month',
      deploymentTime: '5-10 minutes'
    },
    {
      id: 'microservices',
      name: 'Microservices Platform',
      description: 'Container-based microservices with AKS, Container Registry, and API Management',
      icon: '🐳',
      category: 'Containers',
      resources: ['container_registry', 'api_management', 'key_vault', 'log_analytics'],
      estimatedCost: '$200-500/month',
      deploymentTime: '15-20 minutes'
    },
    {
      id: 'ai-ml-platform',
      name: 'AI/ML Platform',
      description: 'Complete AI/ML stack with AI Studio, OpenAI, Cosmos DB, and Analytics',
      icon: '🤖',
      category: 'AI & Analytics',
      resources: ['ai_studio', 'openai', 'cosmos_db', 'application_insights', 'key_vault'],
      estimatedCost: '$300-800/month',
      deploymentTime: '10-15 minutes'
    },
    {
      id: 'data-platform',
      name: 'Data Platform',
      description: 'Modern data platform with SQL Database, Storage, Analytics, and Event Hub',
      icon: '📊',
      category: 'Data & Analytics',
      resources: ['sql_database', 'storage_account', 'event_hub', 'log_analytics', 'cosmos_db'],
      estimatedCost: '$150-400/month',
      deploymentTime: '8-12 minutes'
    },
    {
      id: 'serverless',
      name: 'Serverless Stack',
      description: 'Serverless architecture with Functions, API Management, and Cosmos DB',
      icon: '⚡',
      category: 'Serverless',
      resources: ['functions', 'api_management', 'cosmos_db', 'storage_account', 'key_vault'],
      estimatedCost: '$30-80/month',
      deploymentTime: '5-8 minutes'
    },
    {
      id: 'enterprise-security',
      name: 'Enterprise Security',
      description: 'Security-focused infrastructure with Key Vault, Managed Identity, and monitoring',
      icon: '🔐',
      category: 'Security',
      resources: ['key_vault', 'managed_identity', 'log_analytics', 'application_insights'],
      estimatedCost: '$100-200/month',
      deploymentTime: '6-10 minutes'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web Applications': return <Server className="h-5 w-5" />;
      case 'Containers': return <Cloud className="h-5 w-5" />;
      case 'AI & Analytics': return <Zap className="h-5 w-5" />;
      case 'Data & Analytics': return <Database className="h-5 w-5" />;
      case 'Serverless': return <Zap className="h-5 w-5" />;
      case 'Security': return <Shield className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    return getAzureIcon(resourceType, 16, "shrink-0");
  };

  const generateBuildSteps = (template: AzureTemplate): BuildStep[] => {
    const steps: BuildStep[] = [
      {
        id: 'prepare',
        title: 'Prepare Infrastructure',
        description: 'Setting up resource group and base configuration',
        status: 'pending',
        resources: ['resource_group']
      },
      {
        id: 'network',
        title: 'Network Setup',
        description: 'Configuring virtual networks and security groups',
        status: 'pending',
        resources: ['virtual_network', 'network_security_group']
      },
      {
        id: 'storage',
        title: 'Storage Resources',
        description: 'Provisioning storage accounts and databases',
        status: 'pending',
        resources: template.resources.filter(r => ['storage_account', 'sql_database', 'cosmos_db'].includes(r))
      },
      {
        id: 'compute',
        title: 'Compute Resources',
        description: 'Deploying compute and application services',
        status: 'pending',
        resources: template.resources.filter(r => ['app_service', 'functions', 'ai_studio'].includes(r))
      },
      {
        id: 'security',
        title: 'Security & Monitoring',
        description: 'Setting up security and monitoring services',
        status: 'pending',
        resources: template.resources.filter(r => ['key_vault', 'managed_identity', 'application_insights', 'log_analytics'].includes(r))
      },
      {
        id: 'finalize',
        title: 'Finalize Deployment',
        description: 'Completing configuration and validation',
        status: 'pending',
        resources: ['configuration_validation']
      }
    ];

    return steps.filter(step => step.resources.length > 0 || step.id === 'prepare' || step.id === 'finalize');
  };

  const startBuild = async (template: AzureTemplate) => {
    setIsBuilding(true);
    setBuildStatus('building');
    setBuildProgress(0);
    setBuildLogs([]);
    
    const steps = generateBuildSteps(template);
    setBuildSteps(steps);
    
    // Simulate build process
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update step status to running
      setBuildSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'running' } : step
      ));
      
      setBuildLogs(prev => [...prev, `Starting step: ${steps[i].title}`]);
      
      // Simulate step duration
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      // Update step status to completed
      setBuildSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'completed', duration: Math.round(2000 + Math.random() * 2000) } : step
      ));
      
      setBuildLogs(prev => [...prev, `Completed step: ${steps[i].title}`]);
      setBuildProgress(((i + 1) / steps.length) * 100);
    }
    
    setIsBuilding(false);
    setBuildStatus('completed');
    setBuildLogs(prev => [...prev, 'Build completed successfully!']);
  };

  const stopBuild = () => {
    setIsBuilding(false);
    setBuildStatus('failed');
    setBuildLogs(prev => [...prev, 'Build stopped by user']);
  };

  const resetBuild = () => {
    setIsBuilding(false);
    setBuildStatus('idle');
    setBuildProgress(0);
    setCurrentStep(0);
    setBuildSteps([]);
    setBuildLogs([]);
    setSelectedTemplate(null);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Azure Builder</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Build Azure infrastructure using pre-configured templates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {resources.length} Resources
            </Badge>
            <Badge variant={buildStatus === 'completed' ? 'default' : 'secondary'}>
              {buildStatus === 'idle' ? 'Ready' : buildStatus === 'building' ? 'Building' : buildStatus}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="templates" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="build">Build Process</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {azureTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex items-center space-x-1 mt-1">
                            {getCategoryIcon(template.category)}
                            <span className="text-sm text-gray-500">{template.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {template.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.resources.slice(0, 4).map((resource) => (
                          <Badge key={resource} variant="secondary" className="text-xs">
                            {getResourceIcon(resource)} {resource.replace('_', ' ')}
                          </Badge>
                        ))}
                        {template.resources.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.resources.length - 4} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>💰 {template.estimatedCost}</span>
                        <span>⏱️ {template.deploymentTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-xl">{selectedTemplate.icon}</span>
                    <span>{selectedTemplate.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ready to deploy {selectedTemplate.resources.length} resources
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={resetBuild}
                        disabled={isBuilding}
                      >
                        Reset
                      </Button>
                      <Button 
                        onClick={() => startBuild(selectedTemplate)}
                        disabled={isBuilding}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Build
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="build" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {buildProgress > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Build Progress</span>
                      <div className="flex items-center space-x-2">
                        {isBuilding && (
                          <Button variant="outline" size="sm" onClick={stopBuild}>
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={resetBuild}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-sm font-medium">{Math.round(buildProgress)}%</span>
                      </div>
                      <Progress value={buildProgress} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {buildSteps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Build Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {buildSteps.map((step, index) => (
                        <div key={step.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {step.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {step.status === 'running' && (
                              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                            )}
                            {step.status === 'failed' && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            {step.status === 'pending' && (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{step.title}</h4>
                              {step.duration && (
                                <span className="text-sm text-gray-500">
                                  {step.duration}ms
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            {step.resources.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {step.resources.map((resource) => (
                                  <Badge key={resource} variant="outline" className="text-xs">
                                    {getResourceIcon(resource)} {resource.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {buildLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Build Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-1">
                        {buildLogs.map((log, index) => (
                          <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5" />
                    <span>Azure Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection Status</span>
                    <Badge variant="default" className="bg-green-500">
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Resources</span>
                      <span className="font-medium">{resources.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Deployments</span>
                      <span className="font-medium">{buildStatus === 'building' ? 1 : 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Build Time</span>
                      <span className="font-medium">
                        {buildStatus === 'completed' ? '< 1 min' : buildStatus === 'building' ? 'Running...' : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}