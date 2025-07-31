// Demo script to test private modules functionality
const { generatePrivateModuleCall, PRIVATE_MODULE_CONFIGS, generatePrivateModuleSource } = require('./server/services/privateModules.js');

console.log('=== Private Modules Demo ===\n');

// Show available private module configurations
console.log('Available Private Module Configurations:');
console.log('========================================');
Object.keys(PRIVATE_MODULE_CONFIGS).forEach(key => {
  const config = PRIVATE_MODULE_CONFIGS[key];
  const source = generatePrivateModuleSource(config);
  console.log(`${key}: ${source}`);
});

console.log('\n=== Generated Private Module Examples ===\n');

// Test Resource Group
console.log('1. Resource Group Private Module:');
console.log('-------------------------------');
const rgConfig = {
  name: 'test-rg',
  location: 'East US',
  tags: { environment: 'test', project: 'demo' }
};

try {
  const rgModule = generatePrivateModuleCall('resource_group', 'test-rg', rgConfig);
  console.log(rgModule);
} catch (error) {
  console.error('Error:', error.message);
}

// Test Key Vault
console.log('\n2. Key Vault Private Module:');
console.log('----------------------------');
const kvConfig = {
  name: 'test-kv',
  location: 'East US',
  resourceGroup: 'test-rg',
  sku: 'standard',
  tenantId: 'tenant-id-123',
  softDeleteRetentionDays: 90,
  purgeProtectionEnabled: true,
  tags: { environment: 'test' }
};

try {
  const kvModule = generatePrivateModuleCall('key_vault', 'test-kv', kvConfig);
  console.log(kvModule);
} catch (error) {
  console.error('Error:', error.message);
}

// Test Storage Account
console.log('\n3. Storage Account Private Module:');
console.log('----------------------------------');
const saConfig = {
  name: 'testsa',
  location: 'East US',
  resourceGroup: 'test-rg',
  accountTier: 'Standard',
  accountReplicationType: 'LRS',
  accountKind: 'StorageV2',
  accessTier: 'Hot',
  tags: { environment: 'test' }
};

try {
  const saModule = generatePrivateModuleCall('storage_account', 'test-sa', saConfig);
  console.log(saModule);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n=== End Demo ===');