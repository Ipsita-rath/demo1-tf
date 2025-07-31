# Terraform Automation System

## Overview

This is a comprehensive full-stack Azure infrastructure automation platform that enables users to design cloud architectures through an intuitive drag-and-drop interface and automatically generate production-ready Terraform code. The system integrates with Terraform Cloud for deployment, uses private GitHub modules for standardized infrastructure provisioning, and enforces enterprise-grade Azure naming conventions.

## Recent Updates (January 2025)

### Major Features Implemented
✓ **Role Management System**: Complete implementation with global AD roles and service-specific exclusions
✓ **Terraform Code Preview**: Fixed API integration issues - now fully functional with real-time generation
✓ **Resource Alignment System**: Structured 4-column grid layout with logical Azure architecture layers
✓ **Enhanced Resource Support**: 20+ Azure services with comprehensive configuration options
✓ **Landing Zones**: AI Studio and Application pre-configured templates
✓ **Resource Sidebar**: Accordion organization with real-time search functionality
✓ **Database Integration**: PostgreSQL with persistent storage and audit logging
✓ **Security System**: AES-256-GCM encryption for sensitive data
✓ **Authentic Azure Icons**: Complete redesign with official Microsoft Azure Architecture Icons (March 2025)
✓ **Test Landing Zone Enhancement**: Auto-opens Global Information modal for immediate configuration
✓ **VNet Resource Group Separation**: Virtual Network resources automatically assigned to separate rg-vnet-* resource groups
✓ **Lowercase Resource Group Names**: All resource group names displayed in proper lowercase format
✓ **Test Landing Zone Restructure**: Virtual Network moved to Application Resources card, Virtual Machine removed from Application Resources
✓ **Tags Order Standardization**: Global Information popup Tags section follows specified order - AppName, Environment, ProvisionedBy, ProvisionedDate
✓ **Custom Role Creation**: Comprehensive role definition system with pre-built templates and full configuration panels
✓ **Landing Zone Role Integration**: All landing zones now include custom role definitions and corresponding role assignments

### Current Status
- **Code Generation**: ✅ Working (200 status responses in logs)
- **Resource Management**: ✅ Active user sessions with resource configurations
- **API Integration**: ✅ All endpoints functioning properly
- **TypeScript**: ✅ All critical errors resolved
- **Azure Icons**: ✅ Authentic Microsoft designs with official color scheme and gradients
- **Resource Sidebar**: ✅ Clean interface with Resource Group removed due to functionality issues
- **Test Landing Zone**: ✅ Auto-opens Global Information modal for configuration
- **VNet Resource Groups**: ✅ Separate resource groups with rg-vnet-[project]-[location]-[environment]-01 format
- **Resource Group Display**: ✅ Lowercase names displayed correctly in Azure Infrastructure

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for development and hot reloading
- **Backend**: Express.js with TypeScript and WebSocket support
- **Database**: PostgreSQL with Drizzle ORM (fallback to in-memory storage for development)
- **UI Framework**: Tailwind CSS with shadcn/ui and Radix UI components
- **Drag & Drop**: React DnD for interactive canvas workspace
- **State Management**: TanStack Query v5 for server state and caching
- **Real-time Communication**: WebSocket server for deployment status updates
- **Authentication**: Express sessions with PostgreSQL store
- **Security**: AES-256-GCM encryption for sensitive data storage

### Deployment Strategy
The application supports multiple deployment environments:
- **Development**: Local setup with hot reloading
- **Production**: Compiled build with optimized assets
- **Cross-platform**: Works on Windows, macOS, and Linux

## Key Components

### Frontend Architecture
- **Canvas Component**: Interactive drag-and-drop workspace with 4-column grid layout and logical resource grouping
- **Resource Sidebar**: Accordion-organized categories with real-time search across 20+ Azure services
- **Configuration Panel**: Dynamic forms with Azure naming validation and global role management
- **Code Preview Panel**: Real-time Terraform code generation with syntax highlighting and validation
- **Global Information Modal**: Centralized subscription, resource group, tagging, and AD role management
- **Landing Zone Templates**: Pre-configured AI Studio and Application infrastructure scenarios
- **User Profile System**: Comprehensive profile management with Terraform Cloud integration status

### Backend Architecture
- **Express Server**: RESTful API with comprehensive resource management endpoints
- **WebSocket Server**: Real-time deployment status updates and live configuration sync
- **Code Generation Service**: Advanced Terraform code generation with GitHub private module integration
- **Terraform Cloud Integration**: Full API client with workspace management and deployment orchestration
- **Private Module System**: GitHub repository integration (`mukeshbharathigeakminds/terraform-azurerm-landing-zone`)
- **Database Services**: PostgreSQL integration with Drizzle ORM and connection pooling
- **Security Services**: Encrypted storage, session management, and audit logging

### Security Infrastructure
- **Security Manager**: Prevents developer tools access and unauthorized inspection
- **Cryptographic Encryption**: AES-256-GCM for sensitive data storage
- **Session Management**: Secure user sessions with automatic cleanup
- **Audit Logging**: Comprehensive security event tracking

## Data Flow

### Resource Design Flow
1. User drags Azure resources from sidebar to canvas
2. Resources auto-organize into resource groups
3. Configuration panel opens for resource-specific settings
4. Real-time validation ensures Azure naming compliance
5. Global settings apply subscription and tagging information

### Code Generation Flow
1. Canvas resources converted to Terraform resource definitions
2. Azure naming standards automatically enforced
3. Private modules sourced from GitHub repositories
4. Generated code validated for syntax and dependencies
5. Preview panel displays complete Terraform configuration

### Deployment Flow
1. Terraform Cloud workspace created/selected
2. Generated code uploaded to workspace
3. Plan execution initiated with real-time status updates
4. Apply operation executed with progress tracking
5. Deployment logs streamed to user interface

## External Dependencies

### Required Services
- **PostgreSQL Database**: User data, configurations, and audit logs
- **Terraform Cloud**: Infrastructure deployment platform
- **GitHub**: Private Terraform module repositories

### Optional Integrations
- **Azure API**: Resource validation and metadata
- **Replit Environment**: Development and hosting platform

### NPM Dependencies
- **Core**: React 18, Express.js, TypeScript, Vite, Node.js 18+
- **UI**: shadcn/ui, Radix UI components, Tailwind CSS, Lucide React icons
- **Database**: Drizzle ORM, PostgreSQL drivers, connect-pg-simple for sessions
- **State & API**: TanStack Query v5, react-hook-form, zod validation
- **Drag & Drop**: react-dnd, react-dnd-html5-backend
- **Development**: tsx, ESBuild, Vite dev server
- **Security**: Encryption libraries, session management, audit logging

## Deployment Strategy

### Environment Configuration
- **Development**: Uses in-memory storage if database unavailable
- **Production**: Requires PostgreSQL and proper environment variables
- **Security**: All sensitive data encrypted at rest

### Database Schema
- **Users**: Authentication, profile management, and user preferences
- **Terraform Configurations**: Saved infrastructure designs with versioning
- **Deployments**: Complete deployment history with status tracking and logs
- **User Sessions**: Secure session management with automatic cleanup
- **Secure Storage**: AES-256-GCM encrypted API tokens and connection strings
- **App Settings**: Application configuration and global settings
- **Audit Logs**: Comprehensive security event tracking and compliance logging

### Azure Resource Standards
The system enforces enterprise naming conventions:
- Format: `<resource-shortcode>-<project>-<environment>-<location>-<instance>`
- Example: `kv-inid-dev-eastus-01` for Key Vault
- Special cases for storage accounts: `st<project><environment><instance>`
- Real-time validation ensures global uniqueness requirements

### Supported Azure Resources (20+ Services)
Organized into logical categories:
- **Security & Identity**: Key Vault, Managed Identity, Role Assignments, Custom Role Definitions
- **Networking**: Virtual Networks, Subnets, Network Security Groups, Route Tables, Private Endpoints
- **Compute**: Virtual Machines, App Services, Azure Functions
- **Storage**: Storage Accounts, Cosmos DB, Redis Cache
- **Database**: SQL Database, PostgreSQL
- **AI & Analytics**: AI Studio, OpenAI Services, Application Insights, Log Analytics
- **Integration**: API Management, Event Hub, Container Registry
- **Management**: Resource Groups with automatic organization

### Custom Role Creation System
Advanced role definition capabilities:
- **Pre-built Templates**: AI Studio, Application, Storage, and Network automation roles
- **Comprehensive Configuration**: Actions, NotActions, DataActions, NotDataActions support
- **Scope Management**: Subscription, Resource Group, and Management Group scope options
- **Template Integration**: One-click role templates for common scenarios
- **Landing Zone Integration**: Custom roles automatically included in all landing zone templates

### Landing Zones
Pre-configured infrastructure templates:
- **AI Studio Landing Zone**: Complete ML/AI infrastructure with OpenAI, storage, networking, and monitoring
- **Application Landing Zone**: Full-stack web application environment with database, compute, and security
- **Custom Templates**: User-defined resource combinations for rapid deployment

### Role Management System
Advanced Azure AD role management:
- **Global AD Roles**: Centrally managed roles applied to all resources
- **Service-Specific Exclusions**: Individual resources can exclude specific roles without affecting global configuration
- **Reset Capability**: Restore all global roles to any resource with one click
- **Persistent Storage**: Role configurations saved in database for consistency