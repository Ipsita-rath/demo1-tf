import { apiRequest } from "./queryClient";
import type { TerraformResource } from "@/types/terraform";

export async function generateTerraformCode(resources: TerraformResource[], terraformToken?: string, usePrivateModules?: boolean) {
  const response = await apiRequest('POST', '/api/terraform/generate-code', {
    resources,
    terraformToken,
    usePrivateModules,
  });
  return response.json();
}

export async function validateTerraformToken(token: string) {
  const response = await apiRequest('POST', '/api/terraform/validate-token', {
    token,
  });
  return response.json();
}

export async function getTerraformModules() {
  const response = await apiRequest('GET', '/api/terraform/modules');
  return response.json();
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
