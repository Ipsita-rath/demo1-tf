// Simple development server starter that doesn't require tsx
// This runs the server directly using Node.js

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.REPLIT_DOMAINS = process.env.REPLIT_DOMAINS || 'localhost:5000';
process.env.REPL_ID = process.env.REPL_ID || 'local-development';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'development-secret-key-change-in-production';

console.log('🚀 Starting Terraform Automation System...');
console.log('📦 Environment: development');
console.log('🌐 Frontend will be available at: http://localhost:5173');
console.log('🔧 Backend will be available at: http://localhost:5000');
console.log('');

// Try tsx first, if not available, suggest installation
console.log('💡 Attempting to start with tsx...');

const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
  shell: true
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`\n❌ tsx failed with code ${code}`);
    console.log('💡 Installing tsx globally...');
    
    // Try to install tsx globally
    const installProcess = spawn('npm', ['install', '-g', 'tsx'], {
      stdio: 'inherit',
      shell: true
    });
    
    installProcess.on('close', (installCode) => {
      if (installCode === 0) {
        console.log('✅ tsx installed successfully! Try running again:');
        console.log('   node simple-start.js');
      } else {
        console.log('❌ Failed to install tsx. Please install it manually:');
        console.log('   npm install -g tsx');
        console.log('   or try: npx tsx server/index.ts');
      }
    });
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Solutions:');
  console.log('1. Install tsx globally: npm install -g tsx');
  console.log('2. Or run directly: npx tsx server/index.ts');
  console.log('3. Make sure you ran: npm install');
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});