import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Cloud, Check, X, AlertCircle, ExternalLink, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateTerraformToken } from "@/lib/terraformApi";

export default function TerraformCloudPage() {
  const [token, setToken] = useState("");
  const [organization, setOrganization] = useState("");
  const [usePrivateModules, setUsePrivateModules] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const { toast } = useToast();

  // Load stored configuration on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('terraformToken');
    const storedOrganization = localStorage.getItem('terraformOrganization');
    const storedUsePrivateModules = localStorage.getItem('usePrivateModules') === 'true';
    
    if (storedToken) setToken(storedToken);
    if (storedOrganization) setOrganization(storedOrganization);
    if (storedUsePrivateModules !== null) setUsePrivateModules(storedUsePrivateModules);
  }, []);

  const { data: connectionStatus, refetch } = useQuery({
    queryKey: ['/api/terraform/status'],
    retry: false,
  });

  const validateTokenMutation = useMutation({
    mutationFn: async (tokenData: { token: string }) => {
      return await validateTerraformToken(tokenData.token);
    },
    onSuccess: (data) => {
      setTokenValidated(data.valid);
      if (data.valid) {
        // Store token in localStorage for code generation
        localStorage.setItem('terraformToken', token);
        toast({
          title: "Token Validated",
          description: "Your Terraform Cloud token is valid and connected successfully.",
        });
      } else {
        toast({
          title: "Validation Failed",
          description: "The provided Terraform Cloud token is invalid.",
          variant: "destructive",
        });
      }
      refetch();
    },
    onError: (error) => {
      setTokenValidated(false);
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate Terraform Cloud token.",
        variant: "destructive",
      });
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: { token: string; organization: string }) => {
      return await apiRequest(`/api/terraform/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Terraform Cloud configuration has been saved successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save Terraform Cloud configuration.",
        variant: "destructive",
      });
    },
  });

  const handleValidateToken = () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Terraform Cloud token.",
        variant: "destructive",
      });
      return;
    }
    validateTokenMutation.mutate({ token });
  };

  const handleSaveConfig = () => {
    if (!token.trim() || !organization.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both token and organization name.",
        variant: "destructive",
      });
      return;
    }
    
    // Save configuration to localStorage
    localStorage.setItem('terraformToken', token);
    localStorage.setItem('terraformOrganization', organization);
    localStorage.setItem('usePrivateModules', usePrivateModules.toString());
    
    saveConfigMutation.mutate({ token, organization });
  };

  const ConnectionStatusBadge = ({ status }: { status: any }) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    if (status.connected) {
      return (
        <Badge variant="default" className="bg-green-500">
          <Check className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <X className="h-3 w-3 mr-1" />
          Disconnected
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builder
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Cloud className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Terraform Cloud</h1>
          </div>
          <p className="text-gray-600">
            Connect your Terraform Cloud account to deploy and manage your infrastructure
          </p>
        </div>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Connection Status</span>
                <ConnectionStatusBadge status={connectionStatus} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectionStatus?.connected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Organization:</span>
                    <Badge variant="outline">{connectionStatus.organization}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Connected:</span>
                    <span className="text-sm">{new Date(connectionStatus.lastConnected).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to connect your Terraform Cloud account to deploy infrastructure.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Token Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="token">Terraform Cloud Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your Terraform Cloud API token"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can generate a token from your{" "}
                  <a
                    href="https://app.terraform.io/app/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Terraform Cloud settings
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
              
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Enter your organization name"
                  className="mt-1"
                />
              </div>

              {/* Private Modules Configuration */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="private-modules" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Use Private Modules
                  </Label>
                  <Switch
                    id="private-modules"
                    checked={usePrivateModules}
                    onCheckedChange={setUsePrivateModules}
                  />
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Enable to use private modules from the GM-Landing-Zone organization
                </p>
                {usePrivateModules && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Private modules require a valid Terraform Cloud token with access to the GM-Landing-Zone organization.
                      {tokenValidated && (
                        <span className="text-green-600 font-medium ml-2">
                          ✓ Token validated for private module access
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleValidateToken}
                  disabled={validateTokenMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  {validateTokenMutation.isPending ? "Validating..." : "Validate Token"}
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={saveConfigMutation.isPending}
                  className="flex-1"
                >
                  {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Sign up for a{" "}
                  <a
                    href="https://app.terraform.io/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Terraform Cloud account
                  </a>
                </li>
                <li>Create an organization or use an existing one</li>
                <li>
                  Generate an API token from{" "}
                  <a
                    href="https://app.terraform.io/app/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    User Settings → Tokens
                  </a>
                </li>
                <li>Enter your token and organization name above</li>
                <li>Click "Validate Token" to test the connection</li>
                <li>Save your configuration to enable deployments</li>
              </ol>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What you can do with Terraform Cloud</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Deploy infrastructure directly from the visual builder
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Track deployment status and logs in real-time
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Manage Terraform state remotely and securely
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Collaborate with team members on infrastructure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Version control your infrastructure changes
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}