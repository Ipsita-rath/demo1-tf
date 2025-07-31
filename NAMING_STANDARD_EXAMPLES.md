# Azure Enterprise Naming Standard Examples

This document shows examples of the enterprise naming standard implementation: `<resource-shortcode>-<project>-<environment>-<location>-<instance>`

## Standard Format Examples

### Resource Group
- **Pattern**: `rg-<project>-<environment>-<location>-<instance>`
- **Example**: `rg-inid-dev-eastus-01`
- **Usage**: For the INID project in development environment, East US region, instance 01

### Key Vault
- **Pattern**: `kv-<project>-<environment>-<location>-<instance>`
- **Example**: `kv-inid-prod-westeu-01`
- **Usage**: Key Vault for INID project in production, West Europe region

### Virtual Machine
- **Pattern**: `vm-<project>-<environment>-<location>-<instance>`
- **Example**: `vm-ipmo-test-centralus-02`
- **Usage**: Virtual Machine for IPMO project in testing environment

### Virtual Network
- **Pattern**: `vnet-<project>-<environment>-<location>-<instance>`
- **Example**: `vnet-crmapp-prod-eastus-01`
- **Usage**: Virtual Network for CRM application in production

### Subnet
- **Pattern**: `snet-<project>-<environment>-<location>-<instance>`
- **Example**: `snet-inid-dev-eastus-web`
- **Usage**: Subnet for web tier in INID development environment

## Special Cases (No Hyphens)

### Storage Account
- **Pattern**: `st<project><environment><location><instance>`
- **Example**: `stiniddeveastus01`
- **Note**: Storage accounts only allow lowercase letters and numbers

### Container Registry
- **Pattern**: `acr<project><environment><location><instance>`
- **Example**: `acrinitstagewesteu01`
- **Note**: Container registries only allow alphanumeric characters

## Environment Codes
- `dev` - Development
- `test` - Testing
- `stage` - Staging
- `prod` - Production
- `sandbox` - Sandbox
- `demo` - Demo

## Location Codes (Examples)
- `eastus` - East US
- `westeu` - West Europe
- `centralus` - Central US
- `eastus2` - East US 2
- `centralin` - Central India

## Validation Rules

1. **Project Name**: Must match global project setting
2. **Environment**: Must match global environment setting
3. **Location**: Must match global location setting
4. **Instance**: Typically "01", "02", etc.

## Error Prevention

The system will:
- ❌ Block resource creation if name doesn't follow standard
- 📝 Show clear error messages with examples
- 🔄 Provide "Apply Naming Standard" button to auto-generate compliant names
- ✅ Only allow creation when naming standard is followed

## Examples by Project

### INID Project (Development, East US)
- Resource Group: `rg-inid-dev-eastus-01`
- Key Vault: `kv-inid-dev-eastus-01`
- Storage Account: `stiniddeveastus01`
- Virtual Machine: `vm-inid-dev-eastus-01`
- Virtual Network: `vnet-inid-dev-eastus-01`

### IPMO Project (Production, West Europe)
- Resource Group: `rg-ipmo-prod-westeu-01`
- Key Vault: `kv-ipmo-prod-westeu-01`
- Storage Account: `stipmoprodwesteu01`
- App Service: `app-ipmo-prod-westeu-01`
- SQL Database: `sqldb-ipmo-prod-westeu-01`

This ensures consistency, traceability, and automation readiness across all environments and resource types.