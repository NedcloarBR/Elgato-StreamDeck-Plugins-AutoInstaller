# Elgato Stream Deck Plugins Auto-Installer

Automated tool to install Stream Deck plugins from Elgato Marketplace using Playwright.

## 📋 Features

- ✅ Automatic authentication to Elgato Marketplace
- ✅ Batch installation of multiple plugins
- ✅ Protocol handler support (`streamdeck://`)
- ✅ Structured and colored logging
- ✅ Robust error handling
- ✅ Detailed results reporting
- ✅ Modular and maintainable architecture
- ✅ Standalone executables for Windows and macOS

---

## � Download & Run (Recommended)

### For End Users

1. **Download the latest release** from the [Releases page](https://github.com/NedcloarBR/Elgato-StreamDeck-Plugins-AutoInstaller/releases)
   - Windows: `streamdeck-installer-windows.zip`
   - macOS: `streamdeck-installer-macos.zip`

2. **Extract the ZIP file** to a folder of your choice

3. **Configure your credentials and plugins**:
   - Open the `config` folder
   - Edit `login.json` with your Elgato Marketplace credentials:
     ```json
     {
       "email": "your-email@example.com",
       "password": "your-password"
     }
     ```
   - Edit `plugins.json` with the plugin URLs you want to install:
     ```json
     [
       "https://marketplace.elgato.com/product/obs-studio-...",
       "https://marketplace.elgato.com/product/twitch-..."
     ]
     ```
   - (Optional) Edit `settings.json` to customize behavior

4. **Run the installer**:
   - **Windows**: Double-click `start.bat`
   - **macOS**: Double-click `start.sh` or run `./start.sh` in Terminal

That's it! The installer will automatically login and install all configured plugins.

### Verify Download Integrity (Optional)

Each release includes `SHA256SUMS-windows.txt` and `SHA256SUMS-macos.txt` files.

**Windows (PowerShell):**
```powershell
Get-FileHash streamdeck-installer-windows.zip -Algorithm SHA256
# Compare with SHA256SUMS-windows.txt
```

**macOS (Terminal):**
```bash
shasum -a 256 streamdeck-installer-macos.zip
# Compare with SHA256SUMS-macos.txt
```

---

## 🛠️ Development Setup

### For Developers

If you want to modify or contribute to the project:

## 🛠️ Development Setup

### For Developers

If you want to modify or contribute to the project:

1. Clone the repository and open it:

```powershell
cd C:\path\to\Elgato-StreamDeck-Plugins-AutoInstaller
```

2. Install dependencies:

```powershell
yarn install
```

3. Create your configuration files from the provided examples (one-time):

```powershell
copy config\login.example.json config\login.json
copy config\plugins.example.json config\plugins.json
copy config\settings.example.json config\settings.json
```

4. Edit the files you just created:
- `config/login.json` — add your Elgato Marketplace `email` and `password`.
- `config/plugins.json` — add an array of Elgato Marketplace plugin URLs you want to process.
- `config/settings.json` — optional. You can control runtime options such as `headless`, `timeout` and `viewport`.

5. Run the scraper:

```powershell
yarn start
```

For development with live reload:

```powershell
yarn dev
```

### Build Executables

To build standalone executables:

```powershell
# Build executables only
yarn build:exe

# Build executables and create release ZIPs
yarn release:pkg
```

The executables will be in the `release/` folder.

---

```powershell
cd C:\path\to\Elgato-StreamDeck-Plugins-AutoInstaller
```

2. Install dependencies:

```powershell
yarn install
```

3. Create your configuration files from the provided examples (one-time):

```powershell
copy config\login.example.json config\login.json
copy config\plugins.example.json config\plugins.json
copy config\settings.example.json config\settings.json
```

4. Edit the files you just created:
- `config/login.json` — add your Elgato Marketplace `email` and `password`.
- `config/plugins.json` — add an array of Elgato Marketplace plugin URLs you want to process.
- `config/settings.json` — optional. You can control runtime options such as `headless`, `timeout` and `viewport`.

5. Run the scraper:

```powershell
yarn start
```

For development with live reload:

```powershell
yarn dev
```

---

## 📝 Configuration

This project now reads configuration from the `config/` folder. There are three files you can edit manually:

- `config/login.json` (required)
  - Shape:
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password"
  }
  ```
  - You can also supply credentials via the `EMAIL` and `PASSWORD` environment variables as a fallback.

- `config/plugins.json` (required)
  - Shape: a JSON array of plugin page URLs:
  ```json
  [
    "https://marketplace.elgato.com/product/obs-studio-...",
    "https://marketplace.elgato.com/product/twitch-..."
  ]
  ```

- `config/settings.json` (optional)
  - Controls runtime options. Any value omitted falls back to sensible defaults.
  - Example:
  ```json
  {
    "headless": false,
    "timeout": {
      "navigation": 30000,
      "selector": 10000,
      "cookie": 10000
    },
    "viewport": { "width": 1200, "height": 800 }
  }
  ```
  - Note: If `settings.json` is absent, the code will use the `HEADLESS` environment variable (treated as false only when set to the string `"false"`).

Files with `.example.json` are included in the repository to guide you: `config/login.example.json`, `config/plugins.example.json`, `config/settings.example.json`.

Security note: do not commit `config/login.json` with real credentials. Add it to your `.gitignore`.

---

## ⚙️ Behavior & validation

- On startup the tool will load all three configuration files (with fallbacks) and validate them.
- If any required values are missing (no email/password or zero plugin URLs), the program will display all validation errors and stop. This helps you fix all issues in one go.

---

## 🎯 Usage

- Production mode (reads `config/` files):

```powershell
yarn start
```

- Development mode (watch):

```powershell
yarn dev
```

---

## 🐛 Troubleshooting

- If the tool exits immediately with configuration errors, open the `config/` files and ensure `email`, `password` and at least one plugin URL are present.
- If Playwright fails to launch, verify your node and Playwright installation and whether `HEADLESS` or `settings.json` requests headless mode.
- If plugin installation fails, make sure the Stream Deck native app is installed on your machine.

---
