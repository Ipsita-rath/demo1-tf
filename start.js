const { spawn } = require('child_process');
const path = require('path');

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

// Use npx to run tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname,
  shell: true
});

serverProcess.on('close', (code) => {
  console.log(`\nServer stopped with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Try these solutions:');
  console.log('1. npm install tsx');
  console.log('2. npm install -g tsx');
  console.log('3. Check if package.json exists');
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});