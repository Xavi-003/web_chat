# Vortex

Vortex is a secure, end-to-end encrypted, serverless Peer-to-Peer (P2P) messaging application built with modern web technologies and packaged natively for desktop operating systems.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: Zustand
- **Local Storage**: IndexedDB (via Dexie)
- **P2P Networking**: WebRTC
- **Desktop Wrapper**: Tauri (Rust)
- **Testing**: Vitest, React Testing Library

## Key Features
- **Serverless**: Connect directly to peers using WebRTC. No central database stores your messages.
- **End-to-End Encryption**: All messages, files, and metadata are encrypted locally before transmission using AES-GCM via the Web Crypto API.
- **Local First**: Your profile, settings, and chat history never leave your device (stored in IndexedDB).
- **Cross-Platform**: Run natively on Windows, macOS, and Linux as a lightweight desktop app, or run it directly in the browser.

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Rust](https://www.rust-lang.org/tools/install) (Required for building the Tauri Desktop app)

### Installation

1. Clone the repository and install Node dependencies:
   ```bash
   npm install
   ```
2. Run the Vite development server (Web only):
   ```bash
   npm run dev
   ```
3. Run the Tauri development server (Native Desktop window):
   ```bash
   npm run tauri dev
   ```

## Scripts
- `npm run dev` - Start web development server
- `npm run build` - Build web assets for production
- `npm run lint` - Run ESLint checks
- `npm run test` - Run Vitest test suites
- `npm run tauri [command]` - Execute Tauri CLI commands

## CI/CD Pipeline (Automated Deployments)

This project is configured with a fully automated Release & Deploy pipeline using **GitHub Actions**.

The workflow is triggered by pushing a Git tag starting with `v` (e.g., `v1.0.0`).

### What the pipeline does:
1. **Checks & Tests**: It runs `npm run lint` and `npm run test` to ensure code quality. The pipeline will fail and halt if any tests or linting rules are broken.
2. **Web Deployment**: It builds the React application and deploys the static files directly to **GitHub Pages**.
3. **Desktop Releases**: It spins up macOS, Ubuntu, and Windows runners, installs necessary native dependencies, compiles the Rust-based Tauri wrappers, and creates a **GitHub Release** populated with installable binaries (`.dmg`, `.app`, `.exe`, `.deb`, etc.).

### How to trigger a release:
```bash
# 1. Commit your changes
git commit -am "chore: release version 1.0.0"

# 2. Tag the commit with the new version
git tag v1.0.0

# 3. Push the commit AND the tag to GitHub
git push origin main --tags
```
Once pushed, navigate to the **Actions** tab on your GitHub repository to monitor the build progress. When complete, the fresh web build will be live on GitHub Pages, and new Desktop installers will be available on the **Releases** page.
