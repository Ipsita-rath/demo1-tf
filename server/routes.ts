import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateTerraformCode, generateTerraformCodeWithValidation } from "./services/codeGenerator";
import { TerraformCloudService } from "./services/terraformCloud";
import { validateTerraformCloudToken } from "./services/privateModules";
import { insertTerraformConfigurationSchema, insertDeploymentSchema } from "@shared/schema";
import { z } from "zod";

const terraformCloud = new TerraformCloudService();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Echo back for now - in production, handle different message types
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'response',
            data: { message: 'Message received' }
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Terraform Configuration endpoints
  app.get('/api/terraform/configurations', async (req, res) => {
    try {
      const configurations = await storage.getTerraformConfigurations();
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch configurations' });
    }
  });

  app.get('/api/terraform/configurations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configuration = await storage.getTerraformConfiguration(id);
      if (!configuration) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.json(configuration);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  });

  app.post('/api/terraform/configurations', async (req, res) => {
    try {
      const validated = insertTerraformConfigurationSchema.parse(req.body);
      const configuration = await storage.createTerraformConfiguration(validated);
      res.status(201).json(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid configuration data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create configuration' });
    }
  });

  app.put('/api/terraform/configurations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const configuration = await storage.updateTerraformConfiguration(id, updates);
      if (!configuration) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.json(configuration);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  app.delete('/api/terraform/configurations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTerraformConfiguration(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete configuration' });
    }
  });

  // Generate Terraform code with remote GitHub modules
  app.post('/api/terraform/generate-code', async (req, res) => {
    try {
      const { resources, terraformToken, useRemoteModules = true, globalConfig } = req.body;
      if (!resources || !Array.isArray(resources)) {
        return res.status(400).json({ error: 'Invalid resources data' });
      }
      
      console.log('Server - Generate code with globalConfig:', globalConfig);
      
      // Generate code with remote GitHub modules
      const result = await generateTerraformCodeWithValidation(resources, terraformToken, globalConfig);
      res.json({
        ...result,
        globalConfig,
        message: 'Terraform code generated using remote GitHub modules',
        moduleFormat: 'git::https://github.com/your-org/terraform-azurerm-landing-zone.git//<module-folder>?ref=main'
      });
    } catch (error) {
      console.error('Terraform code generation error:', error);
      res.status(500).json({ error: 'Failed to generate Terraform code' });
    }
  });

  // Alternative endpoint for the frontend
  app.post('/api/terraform/generate', async (req, res) => {
    try {
      const { resources, globalConfig, terraformToken } = req.body;
      
      if (!resources || !Array.isArray(resources)) {
        return res.status(400).json({ error: 'Resources array is required' });
      }

      // Generate Terraform code with remote GitHub modules
      const result = await generateTerraformCodeWithValidation(resources, terraformToken, globalConfig);
      
      res.json({
        code: result.code,
        useRemoteModules: result.useRemoteModules,
        tokenValid: result.tokenValid,
        globalConfig,
        message: 'Terraform code generated using remote GitHub modules'
      });
    } catch (error) {
      console.error('Code generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate Terraform code',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Terraform Cloud integration
  app.post('/api/terraform/validate-token', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }
      
      const isValid = await validateTerraformCloudToken(token);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate token' });
    }
  });

  app.get('/api/terraform/modules', async (req, res) => {
    try {
      const modules = await terraformCloud.getModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  });

  // Terraform Cloud connection status
  // Validate Terraform Cloud token
  app.post('/api/terraform/validate-token', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }
      
      const isValid = await validateTerraformCloudToken(token);
      res.json({ valid: isValid });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ error: 'Failed to validate token' });
    }
  });

  app.get('/api/terraform/status', async (req, res) => {
    try {
      // Mock connection status for now
      res.json({
        connected: false,
        organization: null,
        lastConnected: null
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get connection status' });
    }
  });

  // Terraform Cloud configuration
  app.post('/api/terraform/config', async (req, res) => {
    try {
      const { token, organization } = req.body;
      
      if (!token || !organization) {
        return res.status(400).json({ error: 'Token and organization are required' });
      }
      
      // Validate token first
      const isValid = await terraformCloud.validateToken(token);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid token' });
      }
      
      // Save configuration (in real implementation, you'd store this securely)
      // For now, just return success
      res.json({
        success: true,
        message: 'Configuration saved successfully',
        connected: true,
        organization,
        lastConnected: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  });

  // Deployment endpoints
  app.post('/api/terraform/deploy', async (req, res) => {
    try {
      const { configurationId } = req.body;
      if (!configurationId) {
        return res.status(400).json({ error: 'Configuration ID is required' });
      }
      
      const configuration = await storage.getTerraformConfiguration(configurationId);
      if (!configuration) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      const deployment = await storage.createDeployment({
        configurationId,
        status: 'planning',
        logs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Start deployment process (async)
      setImmediate(async () => {
        try {
          // Simulate deployment process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update deployment status
          await storage.updateDeployment(deployment.id, {
            status: 'applying',
            logs: [
              { timestamp: new Date().toISOString(), level: 'info', message: 'Starting Terraform plan...' },
              { timestamp: new Date().toISOString(), level: 'info', message: 'Plan completed successfully' },
              { timestamp: new Date().toISOString(), level: 'info', message: 'Starting Terraform apply...' },
            ]
          });
          
          // Broadcast update via WebSocket
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'deployment_update',
                data: { deploymentId: deployment.id, status: 'applying' }
              }));
            }
          });
          
          // Final success
          await new Promise(resolve => setTimeout(resolve, 3000));
          await storage.updateDeployment(deployment.id, {
            status: 'completed',
            logs: [
              { timestamp: new Date().toISOString(), level: 'info', message: 'Starting Terraform plan...' },
              { timestamp: new Date().toISOString(), level: 'info', message: 'Plan completed successfully' },
              { timestamp: new Date().toISOString(), level: 'info', message: 'Starting Terraform apply...' },
              { timestamp: new Date().toISOString(), level: 'success', message: 'Deployment completed successfully' },
            ]
          });
          
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'deployment_update',
                data: { deploymentId: deployment.id, status: 'completed' }
              }));
            }
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          await storage.updateDeployment(deployment.id, {
            status: 'failed',
            logs: [
              { timestamp: new Date().toISOString(), level: 'error', message: 'Deployment failed: ' + errorMessage },
            ]
          });
          
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'deployment_update',
                data: { deploymentId: deployment.id, status: 'failed' }
              }));
            }
          });
        }
      });
      
      res.status(201).json(deployment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start deployment' });
    }
  });

  app.get('/api/terraform/deployments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deployment = await storage.getDeployment(id);
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch deployment' });
    }
  });

  app.get('/api/terraform/deployments/configuration/:configId', async (req, res) => {
    try {
      const configId = parseInt(req.params.configId);
      const deployments = await storage.getDeploymentsByConfiguration(configId);
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch deployments' });
    }
  });

  return httpServer;
}
