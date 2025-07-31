# Local Development Setup

## Prerequisites

Before running this project locally, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** database (optional - project can run with in-memory storage)

## Project Structure

```
terraform-automation-system/
├── client/              # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Installation Steps

### 1. Clone/Download the Project
Download the project folder and extract it to your desired location.

### 2. Install Dependencies
```bash
cd terraform-automation-system
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database (Optional - uses in-memory storage if not provided)
DATABASE_URL=postgresql://username:password@localhost:5432/terraform_db

# Session Secret (Required)
SESSION_SECRET=your-secret-key-here

# Replit Environment Variables (for authentication)
REPLIT_DOMAINS=localhost:5000
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc

# Terraform Cloud (Optional)
TERRAFORM_CLOUD_TOKEN=your-terraform-cloud-token
```

### 4. Database Setup (Optional)

If you want to use PostgreSQL instead of in-memory storage:

1. Install PostgreSQL locally
2. Create a database named `terraform_db`
3. Update the `DATABASE_URL` in your `.env` file
4. Run database migrations:
   ```bash
   npm run db:push
   ```

## Running the Application

### Development Mode

#### For Windows Users:
```cmd
# Option 1: Use the batch file
start-dev.bat

# Option 2: Set environment variable manually
set NODE_ENV=development
tsx server/index.ts
```

#### For Mac/Linux Users:
```bash
# Option 1: Use the shell script
./start-dev.sh

# Option 2: Use npm script (works on Unix systems)
npm run dev
```

#### Alternative for All Systems:
If you're having issues with environment variables, you can run without NODE_ENV:
```bash
tsx server/index.ts
```

This will start:
- Frontend development server on `http://localhost:5173`
- Backend server on `http://localhost:5000`
- The frontend will proxy API calls to the backend

### Production Build
```bash
npm run build
npm start
```

## Key Features

- **Drag & Drop Interface**: Visual Azure resource designer
- **Real-time Code Generation**: Terraform code generation as you design
- **Resource Configuration**: Dynamic forms for each Azure resource type
- **Landing Zones**: Pre-configured AI Studio and Application environments
- **Terraform Cloud Integration**: Deploy directly to Terraform Cloud

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes (requires PostgreSQL)

## Supported Azure Resources

The system supports 20+ Azure resource types including:
- Resource Groups
- Virtual Networks & Subnets
- Virtual Machines
- Storage Accounts
- Key Vaults
- SQL Databases
- AI Studio & OpenAI Services
- Container Registry
- App Services
- And many more...

## Authentication

The application uses Replit's OpenID Connect for authentication. For local development without Replit auth, you can modify the authentication flow or use the in-memory storage with mock users.

## Storage Options

1. **In-Memory Storage** (Default): No database required, data resets on restart
2. **PostgreSQL**: Persistent storage with full database features

## Troubleshooting

### Common Issues

1. **Windows NODE_ENV Error**
   ```
   'NODE_ENV' is not recognized as an internal or external command
   ```
   **Solution**: Use the provided batch file or set environment variable manually:
   ```cmd
   set NODE_ENV=development
   tsx server/index.ts
   ```

2. **Port 5000 already in use**
   - Change the port in `server/index.ts`
   - Update proxy configuration in `vite.config.ts`

3. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Verify database exists

4. **Authentication issues**
   - Check REPLIT_DOMAINS and REPL_ID
   - For local development, consider using in-memory storage

5. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

6. **Permission errors on Mac/Linux**
   - Make script executable: `chmod +x start-dev.sh`

## Development Notes

- The project uses TypeScript throughout
- Frontend built with React + Vite
- Backend uses Express.js
- Database ORM: Drizzle
- UI Components: Radix UI + Tailwind CSS
- State Management: TanStack Query

## Support

For questions or issues, refer to the project documentation in `replit.md` or create an issue in the project repository.