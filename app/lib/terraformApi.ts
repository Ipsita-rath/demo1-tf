import { apiRequest } from "./queryClient";
import type { TerraformResource } from "@/types/terraform";

export async function generateTerraformCode(resources: TerraformResource[], terraformToken?: string, usePrivateModules?: boolean, globalConfig?: any) {
  const response = await fetch('/api/terraform/generate-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resources,
      terraformToken,
      useRemoteModules: usePrivateModules,
      globalConfig,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate code: ${response.statusText}`);
  }
  
  return response.json();
}

export async function validateTerraformToken(token: string) {
  const response = await apiRequest('/api/terraform/validate-token', {
    method: 'POST',
    body: { token },
  });
  return response;
}

export async function getTerraformModules() {
  const response = await apiRequest('/api/terraform/modules');
  return response;
}

export async function deployInfrastructure(configurationId: number) {
  const response = await apiRequest('POST', '/api/terraform/deploy', {
    configurationId,
  });
  return response.json();
}

export async function getDeploymentStatus(deploymentId: number) {
  const response = await apiRequest('GET', `/api/terraform/deployments/${deploymentId}`);
  return response.json();
}

export async function saveTerraformConfiguration(config: {
  name: string;
  description?: string;
  resources: TerraformResource[];
  generatedCode?: string;
}) {
  const response = await apiRequest('POST', '/api/terraform/configurations', {
    ...config,
    resources: config.resources,
  });
  return response.json();
}

export async function getTerraformConfigurations() {
  const response = await apiRequest('GET', '/api/terraform/configurations');
  return response.json();
}

export async function getTerraformConfiguration(id: number) {
  const response = await apiRequest('GET', `/api/terraform/configurations/${id}`);
  return response.json();
}

export async function updateTerraformConfiguration(id: number, config: Partial<{
  name: string;
  description?: string;
  resources: TerraformResource[];
  generatedCode?: string;
}>) {
  const response = await apiRequest('PUT', `/api/terraform/configurations/${id}`, config);
  return response.json();
}

export async function deleteTerraformConfiguration(id: number) {
  const response = await apiRequest('DELETE', `/api/terraform/configurations/${id}`);
  return response.ok;
}
