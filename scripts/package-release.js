const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

const RELEASE_DIR = path.join(__dirname, '..', 'release');

async function createZipArchives() {
  console.log('📦 Creating ZIP archives...\n');

  const platforms = [
    { 
      name: 'Windows', 
      files: ['streamdeck-installer-win.exe', 'start.bat'],
      folders: ['.playwright-browsers', 'config'],
      outputName: 'streamdeck-installer-windows.zip' 
    },
    { 
      name: 'macOS', 
      files: ['streamdeck-installer-macos', 'start.sh'],
      folders: ['.playwright-browsers', 'config'],
      outputName: 'streamdeck-installer-macos.zip' 
    }
  ];

  for (const platform of platforms) {
    console.log(`🗜️  Compressing ${platform.name}...`);
    
    try {
      if (process.platform === 'win32') {
        // Create a temporary PowerShell script file
        const psScriptPath = path.join(RELEASE_DIR, 'temp-zip.ps1');
        
        // Build the script to change directory first
        const psScript = `
Set-Location "${RELEASE_DIR}"

$files = @(
    ${platform.files.map(f => `"${f}"`).join(',\n    ')},
    ${platform.folders.map(f => `"${f}"`).join(',\n    ')}
)

Compress-Archive -Path $files -DestinationPath "${platform.outputName}" -Force
`;
        
        fs.writeFileSync(psScriptPath, psScript);
        await execAsync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`);
        fs.unlinkSync(psScriptPath);
      } else {
        const filesStr = [...platform.files, ...platform.folders].join(' ');
        const zipCommand = `cd ${RELEASE_DIR} && zip -r ${platform.outputName} ${filesStr}`;
        await execAsync(zipCommand);
      }
      
      console.log(`✅ ${platform.outputName} created!\n`);
    } catch (error) {
      console.error(`❌ Error creating ZIP for ${platform.name}: ${error.message}\n`);
    }
  }
}

async function main() {
  console.log('📦 Packaging release...\n');
  
  try {
    if (!fs.existsSync(RELEASE_DIR)) {
      console.error('❌ Release directory not found. Run "npm run build:exe" first.');
      process.exit(1);
    }

    await createZipArchives();
    
    console.log('✨ Packaging completed!\n');
  } catch (error) {
    console.error('❌ Error during packaging:', error);
    process.exit(1);
  }
}

main();
