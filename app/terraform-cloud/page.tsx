'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, ArrowLeft, Cloud, Settings, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TerraformCloudConfig {
  token: string;
  organization: string;
  workspace: string;
  isConnected: boolean;
}

export default function TerraformCloudPage() {
  const router = useRouter();
  const [config, setConfig] = useState<TerraformCloudConfig>({
    token: '',
    organization: '',
    workspace: '',
    isConnected: false,
  });

  // Load Terraform Cloud configuration
  const { data: cloudConfig, isLoading } = useQuery({
    queryKey: ['/api/terraform-cloud/config'],
    enabled: false, // Only load when needed
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest('/api/terraform-cloud/test', {
        method: 'POST',
        body: { token },
      });
    },
    onSuccess: (data) => {
      setConfig(prev => ({ ...prev, isConnected: true }));
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to Terraform Cloud!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to Terraform Cloud.',
        variant: 'destructive',
      });
    },
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: TerraformCloudConfig) => {
      return apiRequest('/api/terraform-cloud/config', {
        method: 'POST',
        body: config,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Configuration Saved',
        description: 'Terraform Cloud configuration has been saved successfully.',
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

  useEffect(() => {
    if (cloudConfig) {
      setConfig(cloudConfig);
    }
  }, [cloudConfig]);

  const handleTestConnection = () => {
    if (!config.token) {
      toast({
        title: 'Token Required',
        description: 'Please enter your Terraform Cloud API token.',
        variant: 'destructive',
      });
      return;
    }

    testConnectionMutation.mutate(config.token);
  };

  const handleSaveConfig = () => {
    if (!config.token || !config.organization) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both API token and organization name.',
        variant: 'destructive',
      });
      return;
    }

    saveConfigMutation.mutate(config);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Builder
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Terraform Cloud Integration</h1>
              <p className="text-muted-foreground">
                Connect your infrastructure builder to Terraform Cloud for automated deployments
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={config.isConnected ? "default" : "secondary"}>
              {config.isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Connection Setup</CardTitle>
                <CardDescription>
                  Configure your Terraform Cloud connection to enable automated infrastructure deployments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="token">API Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Enter your Terraform Cloud API token"
                    value={config.token}
                    onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can generate an API token from your Terraform Cloud user settings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    placeholder="Enter your organization name"
                    value={config.organization}
                    onChange={(e) => setConfig(prev => ({ ...prev, organization: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    The name of your Terraform Cloud organization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workspace">Workspace (Optional)</Label>
                  <Input
                    id="workspace"
                    placeholder="Enter workspace name"
                    value={config.workspace}
                    onChange={(e) => setConfig(prev => ({ ...prev, workspace: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Default workspace for deployments. Leave empty to create new workspaces.
                  </p>
                </div>

                <Separator />

                <div className="flex space-x-4">
                  <Button
                    onClick={handleTestConnection}
                    disabled={!config.token || testConnectionMutation.isPending}
                  >
                    {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    onClick={handleSaveConfig}
                    disabled={!config.token || !config.organization || saveConfigMutation.isPending}
                  >
                    {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2" />
                  What is Terraform Cloud?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Terraform Cloud is HashiCorp's managed service that provides a consistent and reliable 
                  environment for Terraform operations with features like remote state management, 
                  collaborative workflows, and policy enforcement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 mt-0.5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Remote State Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Centralized state storage with locking and encryption
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 mt-0.5 text-green-600" />
                  <div>
                    <h4 className="font-semibold">Policy Enforcement</h4>
                    <p className="text-sm text-muted-foreground">
                      Governance controls and compliance automation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 mt-0.5 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold">Automated Workflows</h4>
                    <p className="text-sm text-muted-foreground">
                      CI/CD integration and automated deployments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </div>
                    <span>Create a Terraform Cloud account</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      2
                    </div>
                    <span>Generate an API token</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      3
                    </div>
                    <span>Create or join an organization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      4
                    </div>
                    <span>Configure connection above</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}