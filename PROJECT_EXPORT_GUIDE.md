# Project Export Guide

This guide will help you recreate this entire project on a different machine with all its history and configurations.

## What to Export

### 1. Essential Files and Directories
Copy the entire project directory including:

```
├── .env.example
├── .firebaserc
├── .gitignore
├── FIREBASE_DEPLOYMENT.md
├── NETLIFY_DEPLOYMENT.md
├── README.md
├── bun.lockb
├── components.json
├── contracts/
├── eslint.config.js
├── firebase.json
├── index.html
├── netlify.toml
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
├── scripts/
├── src/
├── tailwind.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 2. Git History and Version Control
To preserve and restore different versions:

#### Full Git History Export
```bash
# Clone with complete history
git clone <your-repo-url>
cd tinhatcatters

# Create a backup bundle (includes all branches and history)
git bundle create tinhatcatters-backup.bundle --all

# To restore from bundle on new machine:
git clone tinhatcatters-backup.bundle tinhatcatters
```

#### Manual Git Setup
```bash
# Initialize git and preserve history
git init
git remote add origin <your-repo-url>
git fetch --all
git checkout main  # or your default branch
```

#### Version Restoration Methods
```bash
# View commit history
git log --oneline --graph

# Restore to specific commit
git checkout <commit-hash>

# Create branch from specific version
git checkout -b restore-point-<date> <commit-hash>

# Reset to previous version (careful - this overwrites current state)
git reset --hard <commit-hash>

# Revert specific changes while keeping history
git revert <commit-hash>
```

### 3. Environment Variables
Create a `.env` file based on `.env.example` with your actual values:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
NODE_ENV=development
```

## Setup on New Machine

### Prerequisites
1. **Node.js** (version 18 or higher)
2. **npm** or **bun** package manager
3. **Git** (optional, for version control)

### Installation Steps

1. **Copy Project Files**
   ```bash
   # If using Git
   git clone <your-repo-url>
   cd tinhatcatters
   
   # Or if copying manually
   # Copy the entire project directory to your new machine
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using bun (if you prefer)
   bun install
   ```

3. **Set Up Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual Firebase credentials
   nano .env  # or use your preferred editor
   ```

4. **Firebase Setup** (if using Firebase)
   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase (if not already done)
   firebase init
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:8080/`

### Build for Production
```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## Deployment Options

### Netlify Deployment
Refer to `NETLIFY_DEPLOYMENT.md` for detailed Netlify deployment instructions.

### Firebase Deployment
Refer to `FIREBASE_DEPLOYMENT.md` for detailed Firebase deployment instructions.

## Project Structure Overview

- **src/components/**: React components including Desktop, WindowManager, Taskbar
- **src/pages/**: Main application pages (Game, Analytics, Leaderboard, etc.)
- **src/hooks/**: Custom React hooks for state management
- **src/game/**: Game engine and logic
- **src/contexts/**: React contexts for global state
- **public/**: Static assets and icons
- **contracts/**: Smart contracts (if applicable)

## Key Features Implemented

1. **Desktop Environment**: Windows-like desktop with icons and taskbar
2. **Window Management**: Draggable, resizable windows
3. **Game Integration**: Phaser.js game engine integration
4. **Wallet Integration**: Web3 wallet connectivity
5. **Firebase Integration**: Authentication and data storage
6. **Responsive Design**: Mobile and desktop compatibility

## Development Notes

- The project uses **Vite** as the build tool
- **React** with **TypeScript** for the frontend
- **Tailwind CSS** for styling
- **Phaser.js** for game development
- **Firebase** for backend services
- **Ethers.js** for Web3 integration

## Version Management and Backup Strategies

### 1. Automated Backup Solutions

#### Create Timestamped Backups
```bash
# Create a backup script
echo '#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
tar -czf "tinhatcatters_backup_$DATE.tar.gz" --exclude=node_modules --exclude=.git/objects tinhatcatters/
echo "Backup created: tinhatcatters_backup_$DATE.tar.gz"' > backup.sh
chmod +x backup.sh

# Run backup
./backup.sh
```

#### Git-based Versioning
```bash
# Tag important versions
git tag -a v1.0.0 -m "Initial stable version"
git tag -a v1.1.0 -m "Added window management"
git tag -a v1.2.0 -m "Added deployment configs"

# Push tags to remote
git push origin --tags

# List all versions
git tag -l

# Checkout specific version
git checkout v1.0.0
```

### 2. File-based Restoration Points

#### Manual Snapshots
```bash
# Create snapshot directories
mkdir -p snapshots/$(date +"%Y%m%d_%H%M%S")
cp -r src/ snapshots/$(date +"%Y%m%d_%H%M%S")/
cp package.json snapshots/$(date +"%Y%m%d_%H%M%S")/
cp vite.config.ts snapshots/$(date +"%Y%m%d_%H%M%S")/
```

#### Restore from Snapshot
```bash
# List available snapshots
ls -la snapshots/

# Restore from specific snapshot
cp -r snapshots/20231201_143000/src/ ./
cp snapshots/20231201_143000/package.json ./
```

### 3. Component-level Version Control

#### Track Individual Component Changes
```bash
# Create component-specific branches
git checkout -b feature/window-manager
git checkout -b feature/desktop-icons
git checkout -b feature/game-integration

# Merge specific features
git checkout main
git merge feature/window-manager
```

#### Rollback Specific Components
```bash
# Restore specific files from previous commits
git checkout HEAD~1 -- src/components/WindowManager.tsx
git checkout HEAD~2 -- src/components/Desktop.tsx

# Or restore from specific commit
git checkout <commit-hash> -- src/components/
```

### 4. Database and Configuration Restoration

#### Firebase Configuration Backup
```bash
# Export Firebase rules and indexes
firebase firestore:indexes > firestore.indexes.json
echo 'rules_version = "2";' > firestore.rules

# Backup environment configurations
cp .env .env.backup.$(date +"%Y%m%d")
cp firebase.json firebase.json.backup
```

#### Restore Configurations
```bash
# Restore Firebase settings
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Restore environment
cp .env.backup.20231201 .env
```

### 5. Dependency Version Management

#### Lock Dependency Versions
```bash
# Create dependency snapshot
npm list --depth=0 > dependencies-snapshot.txt
cp package-lock.json package-lock.backup.json

# Restore exact dependencies
rm -rf node_modules package-lock.json
cp package-lock.backup.json package-lock.json
npm ci
```

### 6. Quick Restoration Commands

#### Emergency Rollback Script
```bash
# Create rollback.sh
echo '#!/bin/bash
echo "Rolling back to last known good state..."
git stash
git checkout main
git reset --hard HEAD~1
npm ci
echo "Rollback complete. Run npm run dev to start."' > rollback.sh
chmod +x rollback.sh
```

#### Safe Restoration Script
```bash
# Create safe-restore.sh
echo '#!/bin/bash
echo "Creating safety backup..."
git stash push -m "Pre-restore backup $(date)"
echo "Restoring to commit: $1"
git checkout $1
echo "Restoration complete. Use git stash pop to restore your changes."' > safe-restore.sh
chmod +x safe-restore.sh

# Usage: ./safe-restore.sh <commit-hash>
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   sudo chown -R $(whoami) node_modules
   rm -rf node_modules/.vite
   npm install
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 8080
   lsof -ti:8080 | xargs kill -9
   ```

3. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## Version Restoration Best Practices

### 1. Before Making Major Changes
```bash
# Always create a checkpoint
git add .
git commit -m "Checkpoint before major changes"
git tag checkpoint-$(date +"%Y%m%d-%H%M")

# Or create a branch
git checkout -b backup-before-changes
git checkout main
```

### 2. Testing Restoration
```bash
# Test restore in separate directory
cp -r tinhatcatters tinhatcatters-test
cd tinhatcatters-test
# Test your restoration commands here
```

### 3. Documentation of Changes
Keep a `CHANGELOG.md` file:
```markdown
# Changelog

## [1.2.0] - 2023-12-01
### Added
- Window management system
- Desktop icons functionality
### Changed
- Improved taskbar behavior
### Removed
- Old custom window system

## [1.1.0] - 2023-11-30
### Added
- Netlify deployment configuration
- Firebase integration
```

### 4. Recovery Scenarios

#### Scenario 1: Broken Build
```bash
# Quick fix - restore last working package.json
git checkout HEAD~1 -- package.json package-lock.json
npm ci
```

#### Scenario 2: Component Issues
```bash
# Restore specific component to working state
git log --oneline -- src/components/WindowManager.tsx
git checkout <working-commit> -- src/components/WindowManager.tsx
```

#### Scenario 3: Configuration Problems
```bash
# Restore all config files
git checkout HEAD~1 -- vite.config.ts tsconfig.json tailwind.config.ts
```

#### Scenario 4: Complete Project Corruption
```bash
# Nuclear option - fresh clone
cd ..
git clone <your-repo-url> tinhatcatters-fresh
cp tinhatcatters/.env tinhatcatters-fresh/
cd tinhatcatters-fresh
npm install
```

## Export Checklist

### Pre-Export
- [ ] Commit all current changes
- [ ] Create version tag
- [ ] Test current build
- [ ] Document current state

### Export Items
- [ ] Copy entire project directory
- [ ] Include `.env.example` file
- [ ] Include all configuration files
- [ ] Export Git history (bundle or clone)
- [ ] Document Firebase project settings
- [ ] Include deployment configurations
- [ ] Create backup scripts
- [ ] Document restoration procedures

### Post-Export
- [ ] Test setup on new machine
- [ ] Verify all features work correctly
- [ ] Test restoration commands
- [ ] Validate backup integrity
- [ ] Document any machine-specific requirements

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Phaser.js Documentation](https://phaser.io/)

This export guide ensures you can recreate the entire development environment and project history on any new machine.