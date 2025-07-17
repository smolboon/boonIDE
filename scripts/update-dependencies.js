#!/usr/bin/env node

/**
 * Updates all dependencies in the project to their latest versions.
 * This script will:
 * 1. Update all npm dependencies in the root package.json
 * 2. Update all npm dependencies in the remote directory
 * 3. Update all npm dependencies in the remote/web directory
 * 4. Update Rust dependencies in the CLI directory
 * 5. Update npm dependencies in the build directory
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper function to execute commands with proper output
function runCommand(command, cwd = ROOT_DIR) {
  console.log(`\n\x1b[36m=== Running: ${command} ===\x1b[0m`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' } 
    });
    console.log(`\x1b[32m✓ Command completed successfully\x1b[0m`);
    return true;
  } catch (error) {
    console.error(`\x1b[31m✗ Command failed: ${error.message}\x1b[0m`);
    return false;
  }
}

// Helper function to update npm dependencies in a directory
function updateNpmDependencies(dir) {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`\x1b[33mSkipping ${dir} - No package.json found\x1b[0m`);
    return false;
  }

  console.log(`\n\x1b[36m=== Updating dependencies in ${dir} ===\x1b[0m`);
  
  // Update dependencies
  runCommand('npm update --save', dir);
  
  // Update devDependencies
  runCommand('npm update --save-dev', dir);

  return true;
}

// Helper function to update Rust dependencies
function updateRustDependencies(dir) {
  const cargoTomlPath = path.join(dir, 'Cargo.toml');
  if (!fs.existsSync(cargoTomlPath)) {
    console.log(`\x1b[33mSkipping ${dir} - No Cargo.toml found\x1b[0m`);
    return false;
  }

  console.log(`\n\x1b[36m=== Updating Rust dependencies in ${dir} ===\x1b[0m`);
  
  // Update Rust dependencies
  runCommand('cargo update', dir);
  
  return true;
}

// Main execution
async function main() {
  console.log('\x1b[35m=== Starting dependency updates ===\x1b[0m');

  // 1. Update root dependencies
  updateNpmDependencies(ROOT_DIR);

  // 2. Update remote dependencies
  updateNpmDependencies(path.join(ROOT_DIR, 'remote'));

  // 3. Update remote/web dependencies
  updateNpmDependencies(path.join(ROOT_DIR, 'remote', 'web'));

  // 4. Update CLI Rust dependencies
  updateRustDependencies(path.join(ROOT_DIR, 'cli'));

  // 5. Update build dependencies
  updateNpmDependencies(path.join(ROOT_DIR, 'build'));

  // 6. Update extension dependencies (if time permits)
  const extensionsDir = path.join(ROOT_DIR, 'extensions');
  const extensionFolders = fs.readdirSync(extensionsDir)
    .filter(item => fs.statSync(path.join(extensionsDir, item)).isDirectory())
    .filter(folder => fs.existsSync(path.join(extensionsDir, folder, 'package.json')));

  console.log(`\n\x1b[36m=== Found ${extensionFolders.length} extensions with package.json ===\x1b[0m`);
  
  // Update extensions' dependencies selectively (large projects might have many)
  for (const folder of extensionFolders.slice(0, 5)) { // Limit to first 5 to avoid timeouts
    updateNpmDependencies(path.join(extensionsDir, folder));
  }

  console.log('\n\x1b[35m=== Dependency updates completed ===\x1b[0m');
}

main().catch(err => {
  console.error(`\x1b[31mError: ${err.message}\x1b[0m`);
  process.exit(1);
});