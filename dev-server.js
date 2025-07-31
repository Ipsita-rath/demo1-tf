#!/usr/bin/env node
// Cross-platform development server starter
// Works on Windows, Mac, and Linux

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set NODE_ENV
process.env.NODE_ENV = 'development';

// Set default environment variables if not present
if (!process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS = 'localhost:5000';
}
if (!process.env.REPL_ID) {
  process.env.REPL_ID = 'local-development';
}
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'your-super-secret-key-for-local-development-only';
}

console.log('🚀 Starting Terraform Automation System...');
console.log('📦 Environment: development');
console.log('🌐 Frontend will be available at: http://localhost:5173');
console.log('🔧 Backend will be available at: http://localhost:5000');
console.log('');

// Start the server
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

serverProcess.on('close', (code) => {
  console.log(`\n🔴 Server stopped with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Make sure you have installed dependencies:');
  console.log('   npm install');
  console.log('\n💡 If you get permission errors, try:');
  console.log('   npx tsx server/index.ts');
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});