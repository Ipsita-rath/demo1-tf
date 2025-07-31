export const TERRAFORM_PROVIDER_TEMPLATE = `# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.47.0"
    }
  }

  required_version = ">= 1.3.0"
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "azuread" {
  # Configuration options
}

# Get current client configuration
data "azurerm_client_config" "current" {}
data "azurerm_subscription" "current" {}`;

export const RESOURCE_GROUP_TEMPLATE = `# Create Resource Group using private module
module "azurerm_resource_group" {
  source   = "git::https://github.com/mukeshbharathigeakminds/terraform-azurerm-resource-group.git"
  name     = "{{name}}"
  location = "{{location}}"{{tags}}
}`;

export const KEY_VAULT_TEMPLATE = `# Create Key Vault
resource "azurerm_key_vault" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "{{sku_name}}"

  enabled_for_disk_encryption = true
  soft_delete_retention_days  = 7

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get",
      "List",
      "Create",
      "Delete",
      "Update",
      "Recover",
      "Purge"
    ]

    secret_permissions = [
      "Get",
      "List",
      "Set",
      "Delete",
      "Recover",
      "Purge"
    ]
  }

  {{tags}}
}

# Key Vault Administrator Role Assignment
resource "azurerm_role_assignment" "{{name}}_keyvault_admin" {
  scope                = azurerm_key_vault.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/00482a5a-887f-4fb3-b363-3b7fe8e74483"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Key Vault Secrets Officer Role Assignment
resource "azurerm_role_assignment" "{{name}}_keyvault_secrets" {
  scope                = azurerm_key_vault.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/b86a8fe4-44ce-4948-aee5-eccb2c155cd7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Key Vault Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_keyvault_contributor" {
  scope                = azurerm_key_vault.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Key Vault Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_keyvault_reader" {
  scope                = azurerm_key_vault.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const STORAGE_ACCOUNT_TEMPLATE = `# Create Storage Account
resource "azurerm_storage_account" "{{name}}" {
  name                     = "{{name}}"
  resource_group_name      = {{resource_group}}
  location                 = {{location}}
  account_tier             = "{{account_tier}}"
  account_replication_type = "{{account_replication_type}}"

  {{tags}}
}

# Storage Blob Data Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_storage_owner" {
  scope                = azurerm_storage_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/b7e6dc6d-f1e8-4753-8033-0f276bb0955b"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Storage Blob Data Contributor Role Assignment  
resource "azurerm_role_assignment" "{{name}}_storage_contributor" {
  scope                = azurerm_storage_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Storage Account Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_storage_account_contributor" {
  scope                = azurerm_storage_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/17d1049b-9a84-46fb-8f53-869881c3d3ab"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Storage Account Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_storage_reader" {
  scope                = azurerm_storage_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const VIRTUAL_NETWORK_TEMPLATE = `# Create Virtual Network
resource "azurerm_virtual_network" "{{name}}" {
  name                = "{{name}}"
  address_space       = {{address_space}}
  location            = {{location}}
  resource_group_name = {{resource_group}}

  {{tags}}
}`;

export const SUBNET_TEMPLATE = `# Create Subnet
resource "azurerm_subnet" "{{name}}" {
  name                 = "{{name}}"
  resource_group_name  = {{resource_group}}
  virtual_network_name = {{virtual_network_name}}
  address_prefixes     = {{address_prefixes}}
}`;

export const NETWORK_SECURITY_GROUP_TEMPLATE = `# Create Network Security Group
resource "azurerm_network_security_group" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  {{security_rules}}

  {{tags}}
}`;

export const VIRTUAL_MACHINE_TEMPLATE = `# Create Network Interface
resource "azurerm_network_interface" "{{name}}" {
  name                = "{{name}}-nic"
  location            = {{location}}
  resource_group_name = {{resource_group}}

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
  }

  {{tags}}
}

# Create Virtual Machine
resource "azurerm_linux_virtual_machine" "{{name}}" {
  name                = "{{name}}"
  resource_group_name = {{resource_group}}
  location            = {{location}}
  size                = "{{size}}"
  admin_username      = "{{admin_username}}"

  disable_password_authentication = {{disable_password_authentication}}

  network_interface_ids = {{network_interface_ids}}

  {{admin_ssh_key}}

  {{os_disk}}

  {{source_image_reference}}

  {{tags}}
}

# Virtual Machine Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_vm_contributor" {
  scope                = azurerm_linux_virtual_machine.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/9980e02c-c2be-4d73-94e8-173b1dc7cf3c"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Virtual Machine Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_vm_owner" {
  scope                = azurerm_linux_virtual_machine.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Network Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_network_contributor" {
  scope                = azurerm_network_interface.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/4d97b98b-1d4f-4787-a291-c67834d212e7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Virtual Machine Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_vm_reader" {
  scope                = azurerm_linux_virtual_machine.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const APP_SERVICE_TEMPLATE = `# Create App Service Plan
resource "azurerm_app_service_plan" "{{name}}" {
  name                = "{{name}}-plan"
  location            = {{location}}
  resource_group_name = {{resource_group}}

  sku {
    tier = "Standard"
    size = "S1"
  }

  {{tags}}
}

# Create App Service
resource "azurerm_app_service" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  app_service_plan_id = {{app_service_plan_id}}

  {{tags}}
}`;

export const SQL_DATABASE_TEMPLATE = `# Create SQL Server
resource "azurerm_mssql_server" "{{name}}" {
  name                         = "{{name}}-server"
  resource_group_name          = {{resource_group}}
  location                     = {{location}}
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "Password123!"

  {{tags}}
}

# Create SQL Database
resource "azurerm_mssql_database" "{{name}}" {
  name           = "{{name}}"
  server_id      = azurerm_mssql_server.{{name}}.id
  collation      = "{{collation}}"
  sku_name       = "{{sku_name}}"

  {{tags}}
}

# SQL DB Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_sql_contributor" {
  scope                = azurerm_mssql_database.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/9b7fa17d-e63e-47b0-bb0a-15c516ac86ec"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# SQL Server Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_sql_server_contributor" {
  scope                = azurerm_mssql_server.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/6d8ee4ec-f05a-4a1d-8b00-a9b17e38b437"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# SQL Database Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_sql_owner" {
  scope                = azurerm_mssql_database.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# SQL Database Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_sql_reader" {
  scope                = azurerm_mssql_database.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const AI_STUDIO_TEMPLATE = `# Create AI Studio
resource "azurerm_machine_learning_workspace" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  application_insights_id = {{application_insights_id}}
  key_vault_id            = {{key_vault_id}}
  storage_account_id      = {{storage_account_id}}

  identity {
    type = "SystemAssigned"
  }

  {{tags}}
}

# AI Developer Role Assignment
resource "azurerm_role_assignment" "{{name}}_ai_developer" {
  scope                = azurerm_machine_learning_workspace.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/64702f94-c441-49e6-a78b-ef80e0188fee"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# AI Studio Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_ai_contributor" {
  scope                = azurerm_machine_learning_workspace.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# AI Studio Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_ai_owner" {
  scope                = azurerm_machine_learning_workspace.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# AI Studio Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_ai_reader" {
  scope                = azurerm_machine_learning_workspace.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const API_MANAGEMENT_TEMPLATE = `# Create API Management
resource "azurerm_api_management" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  publisher_name      = "{{publisher_name}}"
  publisher_email     = "{{publisher_email}}"
  sku_name            = "{{sku_name}}"

  {{tags}}
}

# API Management Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_apim_contributor" {
  scope                = azurerm_api_management.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/312a565d-c81f-4fd8-895a-4e21e48d571c"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# API Management Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_apim_owner" {
  scope                = azurerm_api_management.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# API Management Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_apim_reader" {
  scope                = azurerm_api_management.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const APPLICATION_INSIGHTS_TEMPLATE = `# Create Application Insights
resource "azurerm_application_insights" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  application_type    = "{{application_type}}"
  workspace_id        = {{workspace_id}}

  {{tags}}
}`;

export const CONTAINER_REGISTRY_TEMPLATE = `# Create Container Registry
resource "azurerm_container_registry" "{{name}}" {
  name                = "{{name}}"
  resource_group_name = {{resource_group}}
  location            = {{location}}
  sku                 = "{{sku}}"
  admin_enabled       = {{admin_enabled}}

  {{tags}}
}

# Container Registry Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_acr_contributor" {
  scope                = azurerm_container_registry.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Container Registry Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_acr_owner" {
  scope                = azurerm_container_registry.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Container Registry Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_acr_reader" {
  scope                = azurerm_container_registry.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const COSMOS_DB_TEMPLATE = `# Create Cosmos DB Account
resource "azurerm_cosmosdb_account" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  offer_type          = "Standard"
  kind                = "{{kind}}"

  consistency_policy {
    consistency_level = "{{consistency_level}}"
  }

  geo_location {
    location          = {{location}}
    failover_priority = 0
  }

  {{tags}}
}`;

export const EVENT_HUB_TEMPLATE = `# Create Event Hub Namespace
resource "azurerm_eventhub_namespace" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  sku                 = "{{sku}}"
  capacity            = {{capacity}}

  {{tags}}
}

# Create Event Hub
resource "azurerm_eventhub" "{{name}}" {
  name                = "{{name}}"
  namespace_name      = azurerm_eventhub_namespace.{{name}}.name
  resource_group_name = {{resource_group}}
  partition_count     = {{partition_count}}
  message_retention   = {{message_retention}}
}`;

export const FUNCTIONS_TEMPLATE = `# Create Function App
resource "azurerm_linux_function_app" "{{name}}" {
  name                = "{{name}}"
  resource_group_name = {{resource_group}}
  location            = {{location}}
  storage_account_name       = {{storage_account_name}}
  storage_account_access_key = {{storage_account_access_key}}
  service_plan_id           = {{service_plan_id}}

  site_config {
    application_stack {
      {{application_stack}}
    }
  }

  {{tags}}
}`;

export const LOG_ANALYTICS_TEMPLATE = `# Create Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  sku                 = "{{sku}}"
  retention_in_days   = {{retention_in_days}}

  {{tags}}
}`;

export const MANAGED_IDENTITY_TEMPLATE = `# Create Managed Identity
resource "azurerm_user_assigned_identity" "{{name}}" {
  name                = "{{name}}"
  resource_group_name = {{resource_group}}
  location            = {{location}}

  {{tags}}
}

# Managed Identity Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_identity_contributor" {
  scope                = azurerm_user_assigned_identity.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/e40ec5ca-96e0-45a2-b4ff-59039f2c2b59"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Managed Identity Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_identity_owner" {
  scope                = azurerm_user_assigned_identity.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# Managed Identity Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_identity_reader" {
  scope                = azurerm_user_assigned_identity.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const OPENAI_TEMPLATE = `# Create OpenAI Service
resource "azurerm_cognitive_account" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  kind                = "OpenAI"
  sku_name            = "{{sku_name}}"

  {{tags}}
}

# OpenAI Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_openai_contributor" {
  scope                = azurerm_cognitive_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/25fbc0a9-bd7c-42a3-aa1a-3b75d497ee68"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# OpenAI Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_openai_owner" {
  scope                = azurerm_cognitive_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# OpenAI Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_openai_reader" {
  scope                = azurerm_cognitive_account.{{name}}.id
  role_definition_id   = "/subscriptions/\${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}`;

export const PRIVATE_ENDPOINT_TEMPLATE = `# Create Private Endpoint
resource "azurerm_private_endpoint" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  subnet_id           = {{subnet_id}}

  private_service_connection {
    name                           = "{{name}}-privateserviceconnection"
    private_connection_resource_id = {{private_connection_resource_id}}
    is_manual_connection           = false
    subresource_names              = [{{subresource_names}}]
  }

  {{tags}}
}`;

export const REDIS_TEMPLATE = `# Create Redis Cache
resource "azurerm_redis_cache" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}
  capacity            = {{capacity}}
  family              = "{{family}}"
  sku_name            = "{{sku_name}}"
  enable_non_ssl_port = {{enable_non_ssl_port}}
  minimum_tls_version = "{{minimum_tls_version}}"

  {{redis_configuration}}

  {{tags}}
}`;

export const ROUTE_TABLE_TEMPLATE = `# Create Route Table
resource "azurerm_route_table" "{{name}}" {
  name                = "{{name}}"
  location            = {{location}}
  resource_group_name = {{resource_group}}

  {{routes}}

  {{tags}}
}`;

export const ROLE_ASSIGNMENT_TEMPLATE = `# Create Role Assignment
resource "azurerm_role_assignment" "{{name}}" {
  scope                = {{scope}}
  role_definition_id   = "{{role_definition_id}}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
  {{#if tags}}
  tags = {{tags}}
  {{/if}}
}`;

export const ROLE_DEFINITION_TEMPLATE = `# Create Custom Role Definition
resource "azurerm_role_definition" "{{name}}" {
  name        = "{{role_name}}"
  scope       = {{scope}}
  description = "{{description}}"

  permissions {
    actions          = {{actions}}
    not_actions      = {{not_actions}}
    data_actions     = {{data_actions}}
    not_data_actions = {{not_data_actions}}
  }

  assignable_scopes = [{{scope}}]
}`;

export const WORKBOOK_TEMPLATE = `# Create Azure Workbook
resource "azurerm_application_insights_workbook" "{{name}}" {
  name                = "{{name}}"
  location            = "{{location}}"
  resource_group_name = "{{resourceGroupName}}"
  
  display_name        = "{{displayName}}"
  data_json           = jsonencode({
    version = "Notebook/1.0"
    items = [
      {
        type = 1
        content = {
          json = "# {{displayName}}\\n\\nWelcome to your Azure Workbook for monitoring and analytics."
        }
      }
    ]
  })

  {{#if tags}}
  tags = {{tags}}
  {{/if}}
}`;

export const AD_GROUP_TEMPLATE = `# Create Azure AD Group
resource "azuread_group" "{{name}}" {
  display_name     = "{{displayName}}"
  description      = "{{description}}"
  security_enabled = {{securityEnabled}}
  mail_enabled     = {{mailEnabled}}
  mail_nickname    = "{{mailNickname}}"
  {{#if groupTypes}}
  types            = {{groupTypes}}
  {{/if}}
  
  {{#if owners}}
  owners = {{owners}}
  {{/if}}
  
  {{#if members}}
  members = {{members}}
  {{/if}}
}`;

export const AD_GROUP_MEMBER_TEMPLATE = `# Create Azure AD Group Member
resource "azuread_group_member" "{{name}}" {
  group_object_id  = {{groupId}}
  member_object_id = {{memberId}}
}`;

export const ROLE_ASSIGNMENT_WITH_GROUP_TEMPLATE = `# Create Role Assignment with AD Group
resource "azurerm_role_assignment" "{{name}}" {
  scope                = {{scope}}
  role_definition_name = "{{roleName}}"
  principal_id         = azuread_group.{{groupName}}.object_id
  principal_type       = "Group"
  {{#if tags}}
  tags = {{tags}}
  {{/if}}
}`;

// Azure Built-in Role Definitions
export const AZURE_BUILTIN_ROLES = {
  owner: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
  contributor: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
  reader: '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7',
  'key_vault_administrator': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/00482a5a-887f-4fb3-b363-3b7fe8e74483',
  'key_vault_secrets_officer': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/b86a8fe4-44ce-4948-aee5-eccb2c155cd7',
  'storage_blob_data_owner': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/b7e6dc6d-f1e8-4753-8033-0f276bb0955b',
  'storage_blob_data_contributor': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe',
  'virtual_machine_contributor': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/9980e02c-c2be-4d73-94e8-173b1dc7cf3c',
  'network_contributor': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/4d97b98b-1d4f-4787-a291-c67834d212e7',
  'sql_db_contributor': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/9b7fa17d-e63e-47b0-bb0a-15c516ac86ec',
  'ai_developer': '/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/64702f94-c441-49e6-a78b-ef80e0188fee'
};

// Role Assignment Templates for different resources
export const KEY_VAULT_ROLE_ASSIGNMENTS = `
# Key Vault Administrator Role Assignment
resource "azurerm_role_assignment" "{{name}}_keyvault_admin" {
  scope                = azurerm_key_vault.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.key_vault_administrator}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}

# Key Vault Secrets Officer Role Assignment
resource "azurerm_role_assignment" "{{name}}_keyvault_secrets" {
  scope                = azurerm_key_vault.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.key_vault_secrets_officer}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}`;

export const STORAGE_ACCOUNT_ROLE_ASSIGNMENTS = `
# Storage Blob Data Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_storage_owner" {
  scope                = azurerm_storage_account.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.storage_blob_data_owner}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}

# Storage Blob Data Contributor Role Assignment  
resource "azurerm_role_assignment" "{{name}}_storage_contributor" {
  scope                = azurerm_storage_account.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.storage_blob_data_contributor}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}`;

export const VIRTUAL_MACHINE_ROLE_ASSIGNMENTS = `
# Virtual Machine Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_vm_contributor" {
  scope                = azurerm_linux_virtual_machine.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.virtual_machine_contributor}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}

# Network Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_network_contributor" {
  scope                = azurerm_network_interface.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.network_contributor}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}`;

export const SQL_DATABASE_ROLE_ASSIGNMENTS = `
# SQL DB Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_sql_contributor" {
  scope                = azurerm_mssql_database.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.sql_db_contributor}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}`;

export const AI_STUDIO_ROLE_ASSIGNMENTS = `
# AI Developer Role Assignment
resource "azurerm_role_assignment" "{{name}}_ai_developer" {
  scope                = azurerm_machine_learning_workspace.{{name}}.id
  role_definition_id   = "${AZURE_BUILTIN_ROLES.ai_developer}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}`;

export const GENERIC_RESOURCE_ROLE_ASSIGNMENTS = `
# Owner Role Assignment
resource "azurerm_role_assignment" "{{name}}_owner" {
  scope                = {{resource_id}}
  role_definition_id   = "${AZURE_BUILTIN_ROLES.owner}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}

# Contributor Role Assignment
resource "azurerm_role_assignment" "{{name}}_contributor" {
  scope                = {{resource_id}}
  role_definition_id   = "${AZURE_BUILTIN_ROLES.contributor}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}

# Reader Role Assignment
resource "azurerm_role_assignment" "{{name}}_reader" {
  scope                = {{resource_id}}
  role_definition_id   = "${AZURE_BUILTIN_ROLES.reader}"
  principal_id         = "{{principal_id}}"
  principal_type       = "{{principal_type}}"
}`;

// Custom Role Creation Templates
export const TERRAFORM_AUTOMATION_CUSTOM_ROLE = `
# Custom Role for Terraform Automation
resource "azurerm_role_definition" "terraform_automation_role" {
  name        = "Terraform Automation Role"
  scope       = data.azurerm_subscription.current.id
  description = "Custom role for automated Terraform infrastructure provisioning"

  permissions {
    actions = [
      # Resource Group Management
      "Microsoft.Resources/subscriptions/resourceGroups/read",
      "Microsoft.Resources/subscriptions/resourceGroups/write",
      "Microsoft.Resources/subscriptions/resourceGroups/delete",
      
      # Key Vault Management
      "Microsoft.KeyVault/vaults/*",
      "Microsoft.KeyVault/locations/deletedVaults/read",
      "Microsoft.KeyVault/locations/deletedVaults/purge/action",
      
      # Storage Account Management
      "Microsoft.Storage/storageAccounts/*",
      "Microsoft.Storage/locations/deleteVirtualNetworkRoute/action",
      
      # Networking Management
      "Microsoft.Network/virtualNetworks/*",
      "Microsoft.Network/networkSecurityGroups/*",
      "Microsoft.Network/routeTables/*",
      "Microsoft.Network/privateEndpoints/*",
      
      # Compute Management
      "Microsoft.Compute/virtualMachines/*",
      "Microsoft.Compute/disks/*",
      "Microsoft.Compute/images/*",
      
      # Database Management
      "Microsoft.Sql/servers/*",
      "Microsoft.Sql/locations/instanceFailoverGroups/read",
      "Microsoft.DocumentDB/databaseAccounts/*",
      
      # AI Services Management
      "Microsoft.CognitiveServices/accounts/*",
      "Microsoft.MachineLearningServices/workspaces/*",
      
      # Monitoring and Analytics
      "Microsoft.Insights/components/*",
      "Microsoft.OperationalInsights/workspaces/*",
      
      # API Management
      "Microsoft.ApiManagement/service/*",
      
      # Container Services
      "Microsoft.ContainerRegistry/registries/*",
      
      # Event Services
      "Microsoft.EventHub/namespaces/*",
      
      # Role Management (limited)
      "Microsoft.Authorization/roleAssignments/read",
      "Microsoft.Authorization/roleAssignments/write",
      "Microsoft.Authorization/roleDefinitions/read"
    ]
    
    not_actions = [
      # Prevent elevation of access
      "Microsoft.Authorization/elevateAccess/Action",
      
      # Prevent deletion of critical role assignments
      "Microsoft.Authorization/roleAssignments/delete",
      
      # Prevent modification of subscription-level policies
      "Microsoft.Authorization/policyDefinitions/write",
      "Microsoft.Authorization/policyDefinitions/delete",
      
      # Prevent billing modifications
      "Microsoft.Billing/*",
      
      # Prevent support ticket creation
      "Microsoft.Support/*"
    ]
    
    data_actions = [
      # Key Vault Data Operations
      "Microsoft.KeyVault/vaults/keys/*",
      "Microsoft.KeyVault/vaults/secrets/*",
      "Microsoft.KeyVault/vaults/certificates/*",
      
      # Storage Data Operations
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/*",
      "Microsoft.Storage/storageAccounts/fileServices/fileshares/files/*",
      "Microsoft.Storage/storageAccounts/queueServices/queues/messages/*",
      "Microsoft.Storage/storageAccounts/tableServices/tables/entities/*"
    ]
    
    not_data_actions = [
      # Prevent permanent deletion of critical data
      "Microsoft.KeyVault/vaults/keys/purge/action",
      "Microsoft.KeyVault/vaults/secrets/purge/action",
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/deleteBlobVersion/action"
    ]
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

# Assign the custom role to current user
resource "azurerm_role_assignment" "terraform_automation_assignment" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.terraform_automation_role.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
  principal_type     = "User"
}`;

export const KEY_VAULT_CUSTOM_ROLE = `
# Custom Key Vault Management Role
resource "azurerm_role_definition" "keyvault_automation_role" {
  name        = "Key Vault Automation Role"
  scope       = azurerm_resource_group.{{resource_group_name}}.id
  description = "Custom role for automated Key Vault management and operations"

  permissions {
    actions = [
      "Microsoft.KeyVault/vaults/read",
      "Microsoft.KeyVault/vaults/write",
      "Microsoft.KeyVault/vaults/delete",
      "Microsoft.KeyVault/vaults/deploy/action",
      "Microsoft.KeyVault/vaults/accessPolicies/write",
      "Microsoft.KeyVault/locations/deletedVaults/read",
      "Microsoft.KeyVault/locations/deletedVaults/purge/action"
    ]
    
    not_actions = []
    
    data_actions = [
      "Microsoft.KeyVault/vaults/keys/read",
      "Microsoft.KeyVault/vaults/keys/write",
      "Microsoft.KeyVault/vaults/keys/delete",
      "Microsoft.KeyVault/vaults/keys/backup/action",
      "Microsoft.KeyVault/vaults/keys/restore/action",
      "Microsoft.KeyVault/vaults/secrets/read",
      "Microsoft.KeyVault/vaults/secrets/write",
      "Microsoft.KeyVault/vaults/secrets/delete",
      "Microsoft.KeyVault/vaults/certificates/read",
      "Microsoft.KeyVault/vaults/certificates/write",
      "Microsoft.KeyVault/vaults/certificates/delete"
    ]
    
    not_data_actions = [
      "Microsoft.KeyVault/vaults/keys/purge/action",
      "Microsoft.KeyVault/vaults/secrets/purge/action",
      "Microsoft.KeyVault/vaults/certificates/purge/action"
    ]
  }

  assignable_scopes = [
    azurerm_resource_group.{{resource_group_name}}.id
  ]
}

# Assign the custom Key Vault role
resource "azurerm_role_assignment" "keyvault_automation_assignment" {
  scope              = azurerm_key_vault.{{name}}.id
  role_definition_id = azurerm_role_definition.keyvault_automation_role.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
  principal_type     = "User"
}`;

export const STORAGE_CUSTOM_ROLE = `
# Custom Storage Account Management Role
resource "azurerm_role_definition" "storage_automation_role" {
  name        = "Storage Automation Role"
  scope       = azurerm_resource_group.{{resource_group_name}}.id
  description = "Custom role for automated storage account management and data operations"

  permissions {
    actions = [
      "Microsoft.Storage/storageAccounts/read",
      "Microsoft.Storage/storageAccounts/write",
      "Microsoft.Storage/storageAccounts/delete",
      "Microsoft.Storage/storageAccounts/listkeys/action",
      "Microsoft.Storage/storageAccounts/regeneratekey/action",
      "Microsoft.Storage/storageAccounts/blobServices/containers/read",
      "Microsoft.Storage/storageAccounts/blobServices/containers/write",
      "Microsoft.Storage/storageAccounts/blobServices/containers/delete"
    ]
    
    not_actions = []
    
    data_actions = [
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read",
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write",
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/delete",
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/add/action",
      "Microsoft.Storage/storageAccounts/fileServices/fileshares/files/read",
      "Microsoft.Storage/storageAccounts/fileServices/fileshares/files/write",
      "Microsoft.Storage/storageAccounts/fileServices/fileshares/files/delete",
      "Microsoft.Storage/storageAccounts/queueServices/queues/messages/read",
      "Microsoft.Storage/storageAccounts/queueServices/queues/messages/write",
      "Microsoft.Storage/storageAccounts/queueServices/queues/messages/delete",
      "Microsoft.Storage/storageAccounts/tableServices/tables/entities/read",
      "Microsoft.Storage/storageAccounts/tableServices/tables/entities/write",
      "Microsoft.Storage/storageAccounts/tableServices/tables/entities/delete"
    ]
    
    not_data_actions = [
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/deleteBlobVersion/action"
    ]
  }

  assignable_scopes = [
    azurerm_resource_group.{{resource_group_name}}.id
  ]
}

# Assign the custom Storage role
resource "azurerm_role_assignment" "storage_automation_assignment" {
  scope              = azurerm_storage_account.{{name}}.id
  role_definition_id = azurerm_role_definition.storage_automation_role.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
  principal_type     = "User"
}`;

export const NETWORK_CUSTOM_ROLE = `
# Custom Network Management Role
resource "azurerm_role_definition" "network_automation_role" {
  name        = "Network Automation Role"
  scope       = azurerm_resource_group.{{resource_group_name}}.id
  description = "Custom role for automated network infrastructure management"

  permissions {
    actions = [
      "Microsoft.Network/virtualNetworks/read",
      "Microsoft.Network/virtualNetworks/write",
      "Microsoft.Network/virtualNetworks/delete",
      "Microsoft.Network/virtualNetworks/subnets/read",
      "Microsoft.Network/virtualNetworks/subnets/write",
      "Microsoft.Network/virtualNetworks/subnets/delete",
      "Microsoft.Network/networkSecurityGroups/read",
      "Microsoft.Network/networkSecurityGroups/write",
      "Microsoft.Network/networkSecurityGroups/delete",
      "Microsoft.Network/networkSecurityGroups/securityRules/read",
      "Microsoft.Network/networkSecurityGroups/securityRules/write",
      "Microsoft.Network/networkSecurityGroups/securityRules/delete",
      "Microsoft.Network/routeTables/read",
      "Microsoft.Network/routeTables/write",
      "Microsoft.Network/routeTables/delete",
      "Microsoft.Network/routeTables/routes/read",
      "Microsoft.Network/routeTables/routes/write",
      "Microsoft.Network/routeTables/routes/delete",
      "Microsoft.Network/privateEndpoints/read",
      "Microsoft.Network/privateEndpoints/write",
      "Microsoft.Network/privateEndpoints/delete"
    ]
    
    not_actions = [
      "Microsoft.Network/expressRouteCircuits/*",
      "Microsoft.Network/vpnGateways/*"
    ]
    
    data_actions = []
    
    not_data_actions = []
  }

  assignable_scopes = [
    azurerm_resource_group.{{resource_group_name}}.id
  ]
}

# Assign the custom Network role
resource "azurerm_role_assignment" "network_automation_assignment" {
  scope              = azurerm_virtual_network.{{name}}.id
  role_definition_id = azurerm_role_definition.network_automation_role.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
  principal_type     = "User"
}`;

export const AI_SERVICES_CUSTOM_ROLE = `
# Custom AI Services Management Role
resource "azurerm_role_definition" "ai_automation_role" {
  name        = "AI Services Automation Role"
  scope       = azurerm_resource_group.{{resource_group_name}}.id
  description = "Custom role for automated AI and cognitive services management"

  permissions {
    actions = [
      "Microsoft.CognitiveServices/accounts/read",
      "Microsoft.CognitiveServices/accounts/write",
      "Microsoft.CognitiveServices/accounts/delete",
      "Microsoft.CognitiveServices/accounts/listKeys/action",
      "Microsoft.CognitiveServices/accounts/regenerateKey/action",
      "Microsoft.MachineLearningServices/workspaces/read",
      "Microsoft.MachineLearningServices/workspaces/write",
      "Microsoft.MachineLearningServices/workspaces/delete",
      "Microsoft.MachineLearningServices/workspaces/listKeys/action",
      "Microsoft.MachineLearningServices/workspaces/experiments/read",
      "Microsoft.MachineLearningServices/workspaces/experiments/write",
      "Microsoft.MachineLearningServices/workspaces/models/read",
      "Microsoft.MachineLearningServices/workspaces/models/write"
    ]
    
    not_actions = []
    
    data_actions = [
      "Microsoft.CognitiveServices/accounts/OpenAI/models/read",
      "Microsoft.CognitiveServices/accounts/OpenAI/completions/action",
      "Microsoft.CognitiveServices/accounts/OpenAI/chat/completions/action",
      "Microsoft.CognitiveServices/accounts/OpenAI/embeddings/action"
    ]
    
    not_data_actions = []
  }

  assignable_scopes = [
    azurerm_resource_group.{{resource_group_name}}.id
  ]
}

# Assign the custom AI Services role
resource "azurerm_role_assignment" "ai_automation_assignment" {
  scope              = azurerm_cognitive_account.{{name}}.id
  role_definition_id = azurerm_role_definition.ai_automation_role.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
  principal_type     = "User"
}`;

export const CUSTOM_ROLE_WITH_SERVICE_PRINCIPAL = `
# Create Service Principal for Automation
resource "azuread_application" "automation_app" {
  display_name = "{{app_name}}"
  description  = "Service Principal for Terraform automation"
}

resource "azuread_service_principal" "automation_sp" {
  client_id = azuread_application.automation_app.client_id
}

resource "azuread_service_principal_password" "automation_sp_password" {
  service_principal_id = azuread_service_principal.automation_sp.object_id
  end_date             = "2025-12-31T23:59:59Z"
}

# Custom Role for Service Principal
resource "azurerm_role_definition" "service_principal_automation_role" {
  name        = "Service Principal Automation Role"
  scope       = azurerm_resource_group.{{resource_group_name}}.id
  description = "Custom role for service principal automation tasks"

  permissions {
    actions = [
      "Microsoft.Resources/subscriptions/resourceGroups/read",
      "Microsoft.KeyVault/vaults/read",
      "Microsoft.KeyVault/vaults/secrets/read",
      "Microsoft.Storage/storageAccounts/read",
      "Microsoft.Storage/storageAccounts/listkeys/action",
      "Microsoft.Compute/virtualMachines/read",
      "Microsoft.Network/virtualNetworks/read"
    ]
    
    not_actions = []
    
    data_actions = [
      "Microsoft.KeyVault/vaults/secrets/getSecret/action",
      "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read"
    ]
    
    not_data_actions = []
  }

  assignable_scopes = [
    azurerm_resource_group.{{resource_group_name}}.id
  ]
}

# Assign role to Service Principal
resource "azurerm_role_assignment" "service_principal_assignment" {
  scope              = azurerm_resource_group.{{resource_group_name}}.id
  role_definition_id = azurerm_role_definition.service_principal_automation_role.role_definition_resource_id
  principal_id       = azuread_service_principal.automation_sp.object_id
  principal_type     = "ServicePrincipal"
}

# Output Service Principal credentials
output "service_principal_client_id" {
  value     = azuread_application.automation_app.client_id
  sensitive = false
}

output "service_principal_client_secret" {
  value     = azuread_service_principal_password.automation_sp_password.value
  sensitive = true
}`;
