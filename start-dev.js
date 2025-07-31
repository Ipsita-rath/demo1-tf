#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Terraform Automation System...');

// Start Next.js development server
console.log('📱 Starting Next.js frontend...');
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, PORT: '3000' }
});

// Start Express backend server
console.log('🖥️  Starting Express backend...');
const expressProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down servers...');
  nextProcess.kill();
  expressProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down servers...');
  nextProcess.kill();
  expressProcess.kill();
  process.exit(0);
});

// Handle process errors
nextProcess.on('error', (err) => {
  console.error('❌ Next.js error:', err);
});

expressProcess.on('error', (err) => {
  console.error('❌ Express error:', err);
});

// Handle process exits
nextProcess.on('exit', (code) => {
  console.log(`📱 Next.js process exited with code ${code}`);
});

expressProcess.on('exit', (code) => {
  console.log(`🖥️  Express process exited with code ${code}`);
});

console.log('✅ Both servers are starting...');
console.log('🌐 Frontend: http://localhost:3000');
console.log('🔧 Backend: http://localhost:5000');
console.log('📝 Press Ctrl+C to stop both servers');