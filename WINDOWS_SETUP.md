# Windows Setup Guide

## Common Issues & Solutions

### Issue 1: ENOTSUP Error (Operation not supported on socket 0.0.0.0:5000)
This is a Windows-specific issue where binding to `0.0.0.0` isn't supported. The server has been updated to automatically use `localhost` on Windows.

### Issue 2: PowerShell Script Execution
In PowerShell, you need to use `.\` before batch files:
```powershell
.\windows-start.bat
```

### Issue 3: tsx Command Not Found
You need the `tsx` TypeScript executor installed.

## Quick Solutions

### Option 1: Use the Windows batch file (Recommended)
```cmd
# In Command Prompt:
windows-start.bat

# In PowerShell:
.\windows-start.bat
```

### Option 2: Use PowerShell script
```powershell
.\windows-start.ps1
```

### Option 3: Manual installation
```cmd
npm install -g tsx
npx tsx server/index.ts
```

## Step-by-Step Windows Setup

1. **Open Command Prompt as Administrator** (recommended for global installs)

2. **Navigate to your project folder**:
   ```cmd
   cd C:\Users\JagadishVR\Downloads\terraform-ui
   ```

3. **Install dependencies** (if not done already):
   ```cmd
   npm install
   ```

4. **Install tsx globally**:
   ```cmd
   npm install -g tsx
   ```

5. **Create your .env file**:
   ```env
   SESSION_SECRET=your-super-secret-key-here
   REPLIT_DOMAINS=localhost:5000
   REPL_ID=local-development
   ```

6. **Start the application**:
   ```cmd
   node dev-server.js
   ```

## Alternative: Use npx (No global installation)

If you don't want to install tsx globally:

1. **Set environment variables**:
   ```cmd
   set NODE_ENV=development
   set REPLIT_DOMAINS=localhost:5000
   set REPL_ID=local-development
   set SESSION_SECRET=your-secret-key
   ```

2. **Start the server**:
   ```cmd
   npx tsx server/index.ts
   ```

## What Should Happen

When successful, you'll see:
```
🚀 Starting Terraform Automation System...
📦 Environment: development
🌐 Frontend will be available at: http://localhost:5173
🔧 Backend will be available at: http://localhost:5000

[timestamp] [express] serving on port 5000
```

Then open your browser to `http://localhost:5173`

## Common Windows Issues

### 1. Permission Errors
- Run Command Prompt as Administrator
- Or use PowerShell as Administrator

### 2. npm not found
- Install Node.js from https://nodejs.org/
- Restart your command prompt after installation

### 3. Port already in use
- Change the port in `server/index.ts` (line with `const PORT = 5000`)
- Or stop the process using that port

### 4. tsx command not found
- Install globally: `npm install -g tsx`
- Or use npx: `npx tsx server/index.ts`

## Verification Steps

1. **Check Node.js version**:
   ```cmd
   node --version
   ```
   Should show v18 or higher

2. **Check npm version**:
   ```cmd
   npm --version
   ```

3. **Check if tsx is installed**:
   ```cmd
   tsx --version
   ```

If tsx shows a version, you're ready to go!