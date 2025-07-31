# Terraform Automation System

## Overview

This is a full-stack web application for automating Azure resource creation using Terraform through a drag-and-drop UI interface. The system allows users to visually design Azure infrastructure by dragging components onto a canvas, configure them through dynamic forms, and generate Terraform code that can be deployed through Terraform Cloud integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 18, 2025
- **Enhanced Azure Naming Validation**: Improved validation messages to clearly distinguish between global and resource group uniqueness requirements
  - Updated validation logic to provide specific explanations for each resource type
  - Key Vault and Storage Account names: "Must be globally unique across all Azure (like domain names)"
  - Virtual Machines, Subnets, etc.: "Must be unique within its resource group"
  - Added real-time validation feedback in both ConfigurationPanel and GlobalInfoModal
  - Apply/Save buttons automatically disabled when names are invalid
  - "Generate Valid Name" buttons provide instant name correction
  - Comprehensive error messages explain exactly what's wrong with each invalid name

- **Security System Notification Removal**: Disabled security warning notifications while maintaining protection functionality
  - Removed red notification banners that appeared when developer tools access was blocked
  - Removed right-click disabled notifications  
  - Security protection remains active but operates silently without user-facing notifications
  - All keyboard shortcuts (F12, Ctrl+Shift+I, etc.) still blocked but without showing warnings

- **Resource Group Display Order**: Customized resource group ordering in Canvas component
  - TEST-STORAGE-RG now appears at the top of the resource group list
  - TEST-NETWORKING-RG appears second in the list
  - Other resource groups follow in alphabetical order
  - Improved visual hierarchy and user experience for resource organization

- **Comprehensive Database Integration**: Implemented secure PostgreSQL database connection with full persistent storage
  - Created enhanced database schema with users, sessions, secure storage, app settings, and audit logs tables
  - Added proper database relations with foreign keys and timestamp management
  - Implemented DatabaseStorage class replacing in-memory storage with encrypted data persistence
  - Added comprehensive session management with automatic cleanup and security logging
  - Created secure storage system for connection strings, API tokens, and sensitive configuration data
  - All user data, Terraform configurations, and deployment history now persists across application restarts
  - Added audit logging for security monitoring and compliance tracking

- **Enhanced Security Infrastructure**: Implemented comprehensive security measures preventing developer tools access
  - Added SecurityManager class with keyboard shortcut blocking (F12, Ctrl+Shift+I, Ctrl+U, etc.)
  - Implemented right-click context menu prevention and text selection restrictions
  - Added developer tools detection with multiple methods (console monitoring, window resize detection)
  - Created secure warning system for unauthorized access attempts
  - Added data-allow-drag attributes to maintain drag-and-drop functionality with security restrictions
  - Implemented cryptographic encryption for all sensitive data storage using AES-256-GCM
  - Added secure password hashing with PBKDF2 and salt generation
  - Created session token management with automatic expiration and cleanup

- **Browser Shared Storage Implementation**: Built comprehensive client-side storage system accessible through DevTools
  - Created SharedStorageManager using IndexedDB and localStorage for persistent data storage
  - Implemented storage hooks for connection strings, API tokens, user sessions, and Terraform configurations
  - Added SharedStorageDemo component showcasing all storage capabilities with visual interface
  - All data persists across application restarts and is accessible in browser DevTools → Application → Storage
  - Integrated security system with data-allow-drag attributes for maintaining drag-and-drop functionality
  - Created comprehensive data management utilities with proper error handling and validation

- **User Interface Improvements**: Streamlined header interface by removing unnecessary actions
  - Removed "Save Configuration" button from header as requested by user
  - Updated HeaderProps interface and component implementation to remove onSave functionality
  - Maintained all other header functionality including theme toggle, undo/redo, preview code, and global info
  - Simplified header layout while preserving core application features

### January 17, 2025
- **Icon System Reversion**: Reverted from Azure SVG icons back to original emoji-based icons throughout the application
  - Removed Azure icon imports from ResourceCard, ResourceSidebar, Canvas, and AzureBuilder components
  - Restored original emoji icons for all 25+ Azure service types (🔐, 💾, 🌐, 💻, etc.)
  - Maintained consistent icon mapping across all components with proper emoji representations
  - Updated Azure Subscription icon to use cloud emoji (☁️) instead of SVG icon
  - Preserved all functionality while returning to original visual design approach

- **Header Layout Enhancement**: Updated header design to properly display "Azure Infrastructure Builder" as secondary text below "Terraform Automation System"
  - Modified header layout to use vertical stacking with proper spacing
  - "Azure Infrastructure Builder" now appears as a descriptive subtitle beneath the main title
  - Improved visual hierarchy with consistent font sizing and color coding
  - Enhanced header structure matches the intended branding and user interface design

- **Tenant ID Field Removal**: Removed user-configurable tenant_id fields from all resource configurations
  - Eliminated tenant_id input field from Key Vault configuration panel
  - Removed tenant_id parameter from code generation logic
  - Removed tenant_id from private module variable generation
  - Terraform templates now use `data.azurerm_client_config.current.tenant_id` automatically
  - Simplified resource configuration by removing manual tenant ID entry requirement

- **Global Configuration Synchronization Fix**: Fixed issue where global resource group name changes weren't reflecting in individual resource configurations
  - Added useEffect to ConfigurationPanel to update local state when resource props change
  - Enhanced GlobalInfoModal to properly update both resource.config.resourceGroup and resource.name for resource group resources
  - Fixed handleResourcesUpdate to update selectedResource state when resources are updated from Global Information modal
  - Fixed synchronization between Global Information modal and individual resource configuration panels
  - Changes made in global settings now immediately reflect in all dependent resource configurations

### January 16, 2025
- **Enhanced Global Information Modal**: Improved section organization and user experience
  - Restored section-wise splitting with individual containers for better visual organization
  - Each section now has its own bordered container with proper spacing
  - Removed numbered badges for cleaner, less cluttered interface
  - Removed "Ready to Apply" summary section for cleaner interface
  - Maintained all core functionality while improving visual hierarchy
  - Enhanced save functionality with proper validation and comprehensive resource updates
  - Improved checkbox labels and user-friendly language throughout
  - Clear visual separation between Azure Account, Resource Organization, Location, and Labels sections

- **Multiple Resource Instances Support**: Implemented Azure-compliant multiple resource instance creation
  - Added intelligent unique name generation for resources with numerical suffixes (e.g., storageaccount1, storageaccount2, vm1, vm2)
  - Implemented Azure naming convention validation with resource-specific rules for storage accounts, key vaults, virtual machines, etc.
  - Added real-time name validation in configuration panel with proper error messages
  - Created comprehensive naming rule enforcement based on Azure requirements (character limits, allowed characters, patterns)
  - Resources now support multiple instances of same type with different names, exactly like Azure portal
  - Enhanced resource creation to automatically find highest existing number and increment for new instances
  - Added visual feedback for invalid names with red borders and descriptive error messages

- **Fixed Resource Overlapping Issues**: Completely restructured Canvas component to eliminate overlapping resources
  - Removed all absolute positioning that was causing visual chaos and resource overlap
  - Implemented proper container hierarchy with relative positioning and responsive CSS grid
  - Applied scrollable canvas container with `min-h-screen w-full overflow-y-auto p-4 space-y-6`
  - Each Resource Group now uses proper containment with `p-6 m-4 rounded-xl shadow-lg border-2`
  - Resources arranged in responsive grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
  - Added individual resource card containers with borders and background for better visual separation
  - Maintained clean Azure Subscription → Resource Groups → Services hierarchy
  - Fixed empty state positioning within subscription container
  - Ensured all resources stay contained within their parent Resource Group boxes

### January 16, 2025
- **Resource Alignment System**: Implemented structured resource organization within Azure subscription panel
  - Created layered resource organization with proper categorization (Network Foundation, Security & Identity, Storage & Database, Compute Services, AI & Analytics, Integration Services)
  - Added 4-column grid layout for consistent resource alignment and spacing
  - Implemented color-coded layer indicators with descriptive headers
  - Fixed random resource positioning to use logical grouping based on resource types
  - Enhanced visual hierarchy with proper section spacing and organized layout structure
  - Resources now display in logical Azure architecture layers instead of scattered positioning

### January 15, 2025
- **Resizable Layout System**: Implemented dynamic screen layout adjustment with resizable dividers
  - Added horizontal resizable dividers between sidebar and canvas areas
  - Users can click and drag to adjust panel widths with smooth visual feedback
  - Added minimum and maximum size constraints for optimal user experience
  - Canvas automatically reflows content based on new width dimensions
  - Professional divider styling with hover effects and visual indicators
  - Integrated with existing accordion, search, and profile systems

- **Comprehensive Configuration Panel Enhancement**: Implemented detailed configuration forms for all 25+ Azure resource types
  - Added proper field validation with required field indicators (red asterisks)
  - Implemented dropdown selectors for all Azure-specific options (SKUs, regions, sizes, etc.)
  - Added toggle switches for boolean configuration options
  - Included text areas for complex configurations like JSON data and multi-line settings
  - Added radio button groups for exclusive choices (OS types, authentication methods)
  - Implemented dynamic field arrays for security rules, routes, and model deployments
  - Added comprehensive field descriptions and format specifications
  - Enhanced form controls with proper placeholder text and validation hints

- **Resource-Specific Configuration Fields**:
  - Key Vault: SKU, tenant ID, soft delete, purge protection settings
  - Storage Account: replication types, access tiers, HTTPS-only, blob public access
  - Virtual Network: address space, DNS servers, DDoS protection
  - Virtual Machine: sizes, OS types, authentication methods, availability zones
  - SQL Database: server configuration, administrator credentials, SKU options, TDE
  - AI Studio: workspace dependencies, network access controls
  - OpenAI: model deployments, capacity settings, custom domains
  - Cosmos DB: API types, consistency levels, throughput, geo-replication
  - Redis Cache: SKU families, capacity tiers, TLS versions, persistence
  - Functions: runtime stacks, storage account links, application insights
  - API Management: publisher information, virtual network types, custom properties
  - Container Registry: admin users, geo-replication, network rules, trust policies
  - And comprehensive configurations for all other Azure resource types

- **Hierarchical Canvas Architecture**: Implemented proper Subscription → Resource Group → Services hierarchy
  - Created Azure Subscription container as the top-level visual container
  - Resource Groups displayed as nested containers within the subscription
  - Services organized within their respective Resource Group sections
  - Clear visual hierarchy with proper containment relationships
  - Subscription header shows resource counts and environment information
  - Each Resource Group shows service counts and organized service sections
  - Professional gradient design with proper spacing and visual organization

- **Expanded AI Studio Landing Zone**: Added all 15 requested Azure services with production-ready configurations
  - Core AI Resource Group with 13 services: Key Vault, Managed Identity, Storage Account, Container Registry, AI Studio, OpenAI, Application Insights, Log Analytics, Azure Workbooks, Cosmos DB, Redis Cache, API Management, Event Hub, Azure Functions
  - Separate Networking Resource Group with Virtual Network (10.0.0.0/16)
  - Auto-prefilled configurations for all services with proper tags and production settings
  - Added Azure Workbooks resource type with Terraform template support

- **Infrastructure Architecture Improvements**:
  - Separated Virtual Network resources from AI-specific services for clean architecture
  - Organized resources into logical layers: Security & Identity, Storage, AI & Analytics, Database & Integration, Network Infrastructure
  - Added proper resource hierarchy and dependencies management
  - Enhanced Application Zone with organized layout for web application stack

- **Resource Sidebar Enhancement**: Implemented accordion organization and search functionality
  - Added collapsible accordions for all Azure resource categories (Security & Identity, Storage, Networking, Compute, Database, AI & Analytics, Integration, Management)
  - Implemented real-time search functionality across resource names, descriptions, and categories
  - Added resource count indicators for each category
  - Enhanced user experience with organized, searchable resource discovery
  - Improved navigation with expandable/collapsible category sections

- **User Profile System**: Created comprehensive user profile management with working avatar icons
  - Added dropdown profile menu with user avatar, name, email, role, and company information
  - Implemented profile editing functionality with save/cancel capabilities
  - Added cloud connection status indicators for Terraform Cloud
  - Integrated profile system with header navigation
  - Created professional user interface with proper avatar fallbacks and initials

- **Terraform Cloud Integration**: Built complete connection and configuration system
  - Created dedicated Terraform Cloud connection page with token validation
  - Added connection status tracking and organization management
  - Implemented comprehensive setup instructions and feature descriptions
  - Added real-time connection status in user profile
  - Created navigation between main builder and cloud configuration

- **Technical Enhancements**:
  - Added movable drag-and-drop functionality for resources on the canvas
  - Implemented Azure AD roles support: Role Assignment and Role Definition
  - Added automatic Resource Group creation when Key Vault is dropped
  - Enhanced resource movement with drag-and-drop positioning
  - Added comprehensive icon mapping for all resource types
  - Updated Terraform code generation templates for Azure AD roles and Azure Workbooks
  - Created custom UI components for accordions, avatars, dropdown menus, and alerts

### December 15, 2024
- Extended resource support with 13 additional Azure services:
  - AI Studio for machine learning workspaces
  - API Management for API gateway services
  - Application Insights for performance monitoring
  - Container Registry for Docker image storage
  - Cosmos DB for NoSQL database services
  - Event Hub for event streaming
  - Functions for serverless computing
  - Log Analytics for log data analysis
  - Managed Identity for Azure identity services
  - OpenAI for AI model integration
  - Private Endpoint for secure networking
  - Redis Cache for in-memory caching
  - Route Table for network routing configuration
- Added comprehensive Terraform code generation templates for all new resources
- Updated resource sidebar with new categories: AI & Analytics, Integration
- Enhanced configuration options for specialized resource settings

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS styling
- **State Management**: React hooks with local state management
- **Drag & Drop**: react-dnd library for interactive canvas functionality
- **HTTP Client**: TanStack Query for API calls and caching
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time updates
- **Build Tool**: Vite for development and bundling
- **Process Management**: tsx for development server

### Database Strategy
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Neon serverless PostgreSQL (based on connection string)
- **Fallback**: In-memory storage implementation for development

## Key Components

### Frontend Components
- **Canvas**: Main interactive area for drag-and-drop resource placement
- **ResourceSidebar**: Categorized list of draggable Azure resources
- **ConfigurationPanel**: Dynamic forms for resource configuration
- **CodePreviewPanel**: Real-time Terraform code generation and preview
- **Header**: Navigation and connection status
- **ResourceCard**: Individual resource representations on canvas

### Backend Services
- **TerraformCloudService**: Integration with Terraform Cloud API
- **CodeGenerator**: Transforms UI resources to Terraform code
- **Storage**: Abstracted storage layer with memory and database implementations
- **WebSocket**: Real-time communication for deployment status

### Resource Types Supported
- Resource Groups
- Key Vault
- Storage Account
- Virtual Network
- Subnet
- Network Security Group
- Virtual Machine
- App Service
- SQL Database
- AI Studio
- API Management
- Application Insights
- Container Registry
- Cosmos DB
- Event Hub
- Functions
- Log Analytics
- Managed Identity
- OpenAI
- Private Endpoint
- Redis Cache
- Route Table
- Role Assignment (Azure AD)
- Role Definition (Azure AD)

## Data Flow

1. **Resource Creation**: User drags resource from sidebar to canvas
2. **Configuration**: User configures resource through dynamic forms
3. **Code Generation**: System generates Terraform code in real-time
4. **Validation**: Backend validates configuration and dependencies
5. **Deployment**: Integration with Terraform Cloud for infrastructure provisioning
6. **Status Updates**: WebSocket communication for real-time deployment status

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@radix-ui/***: UI component library
- **@tanstack/react-query**: API state management
- **drizzle-orm**: Database ORM
- **react-dnd**: Drag and drop functionality
- **ws**: WebSocket support

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution
- **tailwindcss**: CSS framework
- **esbuild**: JavaScript bundler

### External Services
- **Terraform Cloud**: Module source and deployment orchestration
- **Neon Database**: PostgreSQL hosting
- **Azure**: Target cloud platform for resource deployment

## Deployment Strategy

### Development
- Vite development server with hot module replacement
- In-memory storage for rapid prototyping
- WebSocket development support
- Replit-specific development features

### Production Build
- Vite builds frontend to `dist/public`
- esbuild bundles backend to `dist/index.js`
- Single Node.js process serves both static files and API
- Environment-based configuration for database and external services

### Configuration Management
- Environment variables for sensitive data (DATABASE_URL, TERRAFORM_CLOUD_TOKEN)
- Shared TypeScript configuration across frontend and backend
- Path aliases for clean imports (@/, @shared/)

### Database Schema
- Users table for authentication
- TerraformConfigurations table for saved designs
- Deployments table for tracking deployment status
- JSON fields for storing complex resource configurations

The application follows a monorepo structure with shared types and utilities, making it easy to maintain consistency between frontend and backend while supporting both development and production deployment scenarios.