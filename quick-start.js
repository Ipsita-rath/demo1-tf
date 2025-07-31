// Universal starter script that handles all the setup automatically
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.REPLIT_DOMAINS = process.env.REPLIT_DOMAINS || 'localhost:5000';
process.env.REPL_ID = process.env.REPL_ID || 'local-development';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'development-secret-key-change-in-production';

console.log('🚀 Terraform Automation System - Quick Start');
console.log('============================================');

async function checkAndInstallTsx() {
  try {
    await execAsync('tsx --version');
    console.log('✅ tsx is already installed');
    return true;
  } catch (error) {
    console.log('📦 Installing tsx...');
    try {
      await execAsync('npm install -g tsx');
      console.log('✅ tsx installed successfully');
      return true;
    } catch (installError) {
      console.log('❌ Failed to install tsx globally, trying npx...');
      return false;
    }
  }
}

async function startServer() {
  console.log('\n🌐 Starting servers...');
  console.log('   Frontend: http://localhost:5173');
  console.log('   Backend:  http://localhost:5000');
  console.log('\n💡 Press Ctrl+C to stop the servers');
  console.log('');

  const tsxAvailable = await checkAndInstallTsx();
  
  const command = tsxAvailable ? 'tsx' : 'npx';
  const args = tsxAvailable ? ['server/index.ts'] : ['tsx', 'server/index.ts'];
  
  const serverProcess = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname,
    shell: true
  });

  serverProcess.on('close', (code) => {
    console.log(`\n🔴 Server stopped with code ${code}`);
    process.exit(code);
  });

  serverProcess.on('error', (error) => {
    console.error('\n❌ Failed to start server:', error.message);
    console.log('\n💡 Try these solutions:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm install -g tsx');
    console.log('3. Run: npx tsx server/index.ts');
    process.exit(1);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    serverProcess.kill('SIGINT');
  });
}

// Check if dependencies are installed
if (!existsSync('node_modules')) {
  console.log('📦 Dependencies not found. Please run: npm install');
  process.exit(1);
}

startServer().catch(console.error);