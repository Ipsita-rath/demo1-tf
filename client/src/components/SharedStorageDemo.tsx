import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Key, Settings, FileText, Trash2, Eye, EyeOff } from 'lucide-react';
import { useConnectionString, useToken, useUserSession, useUserPreferences } from '@/hooks/useSharedStorage';
import { sharedStorageManager } from '@/utils/sharedStorage';

export default function SharedStorageDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [allData, setAllData] = useState<any>({});
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  
  // Database connections
  const { connectionString: azureConnection, updateConnectionString: updateAzureConnection } = useConnectionString('azure');
  const { connectionString: postgresConnection, updateConnectionString: updatePostgresConnection } = useConnectionString('postgres');
  
  // API tokens
  const { token: terraformToken, updateToken: updateTerraformToken } = useToken('terraform_cloud');
  const { token: azureToken, updateToken: updateAzureToken } = useToken('azure_api');
  
  // User session
  const { session, updateSession, clearSession } = useUserSession();
  
  // User preferences
  const { preferences, updatePreferences } = useUserPreferences();
  
  // Form states
  const [newAzureConnection, setNewAzureConnection] = useState('');
  const [newPostgresConnection, setNewPostgresConnection] = useState('');
  const [newTerraformToken, setNewTerraformToken] = useState('');
  const [newAzureToken, setNewAzureToken] = useState('');
  
  const loadAllData = async () => {
    const data = await sharedStorageManager.getAllData();
    setAllData(data);
  };
  
  useEffect(() => {
    if (showDemo) {
      loadAllData();
    }
  }, [showDemo]);
  
  const handleSaveAzureConnection = async () => {
    if (newAzureConnection.trim()) {
      await updateAzureConnection(newAzureConnection);
      setNewAzureConnection('');
      loadAllData();
    }
  };
  
  const handleSavePostgresConnection = async () => {
    if (newPostgresConnection.trim()) {
      await updatePostgresConnection(newPostgresConnection);
      setNewPostgresConnection('');
      loadAllData();
    }
  };
  
  const handleSaveTerraformToken = async () => {
    if (newTerraformToken.trim()) {
      await updateTerraformToken(newTerraformToken);
      setNewTerraformToken('');
      loadAllData();
    }
  };
  
  const handleSaveAzureToken = async () => {
    if (newAzureToken.trim()) {
      await updateAzureToken(newAzureToken);
      setNewAzureToken('');
      loadAllData();
    }
  };
  
  const handleUpdateSession = async () => {
    await updateSession({
      userId: 'user123',
      username: 'terraform-user',
      email: 'user@example.com',
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });
    loadAllData();
  };
  
  const handleUpdatePreferences = async () => {
    await updatePreferences({
      theme: 'dark',
      defaultRegion: 'East US',
      autoSave: true,
      notifications: true,
      updatedAt: new Date().toISOString(),
    });
    loadAllData();
  };
  
  const handleClearAllData = async () => {
    await sharedStorageManager.clearAllData();
    loadAllData();
  };
  
  const maskSensitiveData = (data: string) => {
    if (!showSensitiveData && data && data.length > 8) {
      return data.substring(0, 8) + '...';
    }
    return data;
  };
  
  if (!showDemo) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Shared Storage Demo
            </CardTitle>
            <CardDescription>
              Demonstrates browser shared storage for persistent data (visible in DevTools → Application → Storage)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowDemo(true)} className="w-full">
              Open Shared Storage Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shared Storage Management</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDemo(false)}>
            Close Demo
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="azure-connection">Azure Connection String</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="azure-connection"
                  data-allow-select="true"
                  value={newAzureConnection}
                  onChange={(e) => setNewAzureConnection(e.target.value)}
                  placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                />
                <Button onClick={handleSaveAzureConnection} size="sm">
                  Save
                </Button>
              </div>
              {azureConnection && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {maskSensitiveData(azureConnection)}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="postgres-connection">PostgreSQL Connection</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="postgres-connection"
                  data-allow-select="true"
                  value={newPostgresConnection}
                  onChange={(e) => setNewPostgresConnection(e.target.value)}
                  placeholder="postgresql://user:pass@host:5432/db"
                />
                <Button onClick={handleSavePostgresConnection} size="sm">
                  Save
                </Button>
              </div>
              {postgresConnection && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {maskSensitiveData(postgresConnection)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* API Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="terraform-token">Terraform Cloud Token</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="terraform-token"
                  data-allow-select="true"
                  value={newTerraformToken}
                  onChange={(e) => setNewTerraformToken(e.target.value)}
                  placeholder="terraform-cloud-token-here"
                  type="password"
                />
                <Button onClick={handleSaveTerraformToken} size="sm">
                  Save
                </Button>
              </div>
              {terraformToken && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {maskSensitiveData(terraformToken)}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="azure-token">Azure API Token</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="azure-token"
                  data-allow-select="true"
                  value={newAzureToken}
                  onChange={(e) => setNewAzureToken(e.target.value)}
                  placeholder="azure-api-token-here"
                  type="password"
                />
                <Button onClick={handleSaveAzureToken} size="sm">
                  Save
                </Button>
              </div>
              {azureToken && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {maskSensitiveData(azureToken)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* User Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              User Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleUpdateSession} variant="outline" className="w-full">
              Create Sample Session
            </Button>
            {session && (
              <div className="space-y-2">
                <Badge variant="secondary">Session Active</Badge>
                <div className="text-sm space-y-1">
                  <p><strong>User:</strong> {session.username}</p>
                  <p><strong>Email:</strong> {session.email}</p>
                  <p><strong>Login:</strong> {new Date(session.loginTime).toLocaleString()}</p>
                </div>
                <Button onClick={clearSession} variant="destructive" size="sm">
                  Clear Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              User Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleUpdatePreferences} variant="outline" className="w-full">
              Set Sample Preferences
            </Button>
            {preferences && Object.keys(preferences).length > 0 && (
              <div className="space-y-2">
                <Badge variant="secondary">Preferences Set</Badge>
                <div className="text-sm space-y-1">
                  {Object.entries(preferences).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {String(value)}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Raw Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Raw Shared Storage Data
            <Badge variant="outline">DevTools → Application → Storage</Badge>
          </CardTitle>
          <CardDescription>
            This data is stored in IndexedDB and localStorage, accessible through browser DevTools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={loadAllData} variant="outline" size="sm">
              Refresh Data
            </Button>
            <Button onClick={handleClearAllData} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
          <Textarea
            data-allow-select="true"
            value={JSON.stringify(allData, null, 2)}
            readOnly
            rows={15}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}