const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

const RELEASE_DIR = path.join(__dirname, '..', 'release');
const PLAYWRIGHT_BROWSERS_DIR = path.join(__dirname, '..', '.playwright-browsers');
const CONFIG_DIR = path.join(__dirname, '..', 'config');

async function ensureDirectories() {
  console.log('📁 Creating necessary directories...');
  
  if (!fs.existsSync(RELEASE_DIR)) {
    fs.mkdirSync(RELEASE_DIR, { recursive: true });
  }
}

async function buildExecutables() {
  console.log('🔨 Building executables...\n');

  const allPlatforms = [
    { name: 'Windows', target: 'node18-win-x64', output: 'streamdeck-installer-win.exe', os: 'win32' },
    { name: 'macOS', target: 'node18-macos-x64', output: 'streamdeck-installer-macos', os: 'darwin' }
  ];

  const buildPlatform = process.env.BUILD_PLATFORM;
  
  let platforms;
  if (buildPlatform) {

    platforms = allPlatforms.filter(p => p.os === buildPlatform);
    if (platforms.length === 0) {
      console.warn(`⚠️  Unknown BUILD_PLATFORM: ${buildPlatform}. Building for all platforms.\n`);
      platforms = allPlatforms;
    }
  } else if (process.env.CI) {

    platforms = allPlatforms.filter(p => p.os === process.platform);
    console.log(`ℹ️  CI detected. Building only for current platform: ${process.platform}\n`);
  } else {

    platforms = allPlatforms;
    console.log(`ℹ️  Local build detected. Building for all platforms.\n`);
  }

  for (const platform of platforms) {
    console.log(`📦 Building for ${platform.name}...`);
    
    try {
      const pkgCommand = `npx @yao-pkg/pkg dist/index.js --target ${platform.target} --output ${path.join(RELEASE_DIR, platform.output)} --compress GZip`;
      
      await execAsync(pkgCommand);
      console.log(`✅ ${platform.name} executable created successfully!\n`);
    } catch (error) {
      console.error(`❌ Error creating executable for ${platform.name}:`, error.message);
      throw error;
    }
  }
}

async function copyAssets() {
  console.log('📋 Copying required files...\n');

  if (fs.existsSync(PLAYWRIGHT_BROWSERS_DIR)) {
    console.log('📦 Copying Playwright browsers...');
    const playwrightDest = path.join(RELEASE_DIR, '.playwright-browsers');
    
    if (!fs.existsSync(playwrightDest)) {
      await copyDirectory(PLAYWRIGHT_BROWSERS_DIR, playwrightDest);
      console.log('✅ Playwright browsers copied!\n');
    } else {
      console.log('⏭️  Browsers already exist in destination\n');
    }
  } else {
    console.warn('⚠️  Playwright browsers directory not found. Run "yarn install:browsers" first.\n');
  }

  console.log('📄 Copying configuration files...');
  const configFiles = ['login.example.json', 'plugins.example.json', 'settings.example.json'];
  const configDest = path.join(RELEASE_DIR, 'config');
  
  if (!fs.existsSync(configDest)) {
    fs.mkdirSync(configDest, { recursive: true });
  }

  for (const file of configFiles) {
    const src = path.join(CONFIG_DIR, file);
    const dest = path.join(configDest, file);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ ${file}`);
    }
  }
  console.log('✅ Configurations copied!\n');


  console.log('🚀 Creating launcher scripts...');
  
  const windowsLauncher = `@echo off
REM Stream Deck Installer Launcher for Windows
REM This script sets up the environment and launches the application

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Set Playwright browsers path to local directory
set PLAYWRIGHT_BROWSERS_PATH=%SCRIPT_DIR%.playwright-browsers

REM Launch the application
"%SCRIPT_DIR%streamdeck-installer-win.exe"

REM Exit with the same code as the application
exit /b %ERRORLEVEL%
`;

  const macosLauncher = `#!/bin/bash
# Stream Deck Installer Launcher for macOS/Linux
# This script sets up the environment and launches the application

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"

# Set Playwright browsers path to local directory
export PLAYWRIGHT_BROWSERS_PATH="\${SCRIPT_DIR}/.playwright-browsers"

# Launch the application
"\${SCRIPT_DIR}/streamdeck-installer-macos"

# Exit with the same code as the application
exit $?
`;

  fs.writeFileSync(path.join(RELEASE_DIR, 'start.bat'), windowsLauncher);
  fs.writeFileSync(path.join(RELEASE_DIR, 'start.sh'), macosLauncher);
  
  console.log('  ✓ start.bat');
  console.log('  ✓ start.sh');
  console.log('✅ Launchers created!\n');
}

async function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    try {
      if (entry.isSymbolicLink()) {

        const linkTarget = fs.readlinkSync(srcPath);
        fs.symlinkSync(linkTarget, destPath);
      } else if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (error) {

      console.warn(`  ⚠️  Skipped: ${entry.name} (${error.code})`);
    }
  }
}

async function main() {
  console.log('🚀 Starting build process...\n');
  
  try {
    await ensureDirectories();
    await buildExecutables();
    await copyAssets();
    
    console.log('✨ Build completed successfully!');
    console.log(`📦 Files generated in: ${RELEASE_DIR}\n`);
  } catch (error) {
    console.error('❌ Error during build:', error);
    process.exit(1);
  }
}

main();
