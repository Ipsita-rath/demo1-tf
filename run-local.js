// Direct Node.js runner that bypasses tsx dependency issues
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.REPLIT_DOMAINS = 'localhost:5000';
process.env.REPL_ID = 'local-development';
process.env.SESSION_SECRET = 'development-secret-key-change-in-production';

console.log('🚀 Starting Terraform Automation System...');
console.log('📦 Environment: development');
console.log('🌐 Frontend will be available at: http://localhost:5173');
console.log('🔧 Backend will be available at: http://localhost:5000');
console.log('');

// Use npx to run tsx without requiring global installation
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
  shell: process.platform === 'win32' // Use shell on Windows
});

serverProcess.on('close', (code) => {
  console.log(`\nServer stopped with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Fallback solutions:');
  console.log('1. Install tsx globally: npm install -g tsx');
  console.log('2. Install tsx locally: npm install tsx');
  console.log('3. Check if node_modules exists: run "npm install"');
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});