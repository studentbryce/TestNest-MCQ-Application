# Installation Guide

This guide provides step-by-step instructions for setting up the TestNest MCQ application in different environments.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 16.0 or higher
- **npm**: Version 7.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Account Requirements
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **GitHub Account**: For repository access and deployment (optional)

## 🛠 Development Environment Setup

### Step 1: Install Node.js and npm

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow the installation wizard
4. Verify installation:
```bash
node --version
npm --version
```

#### macOS
Using Homebrew (recommended):
```bash
brew install node
```

Or download from [nodejs.org](https://nodejs.org/)

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install Git

#### Windows
Download from [git-scm.com](https://git-scm.com/)

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt-get install git
```

### Step 3: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd mcq_app

# Verify you're in the correct directory
ls -la
```

### Step 4: Install Project Dependencies

```bash
# Install all npm dependencies
npm install

# This will install:
# - React 18
# - Vite
# - Supabase client
# - ESLint
# - Other development dependencies
```

## 🔑 Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually:

```bash
touch .env
```

### Step 2: Configure Supabase

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login to your account
   - Click "New Project"
   - Fill in project details
   - Wait for project initialization (2-3 minutes)

2. **Get API Credentials**:
   - Go to Project Settings → API
   - Copy the Project URL
   - Copy the `anon/public` key

3. **Update .env File**:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Database Setup

1. **Access SQL Editor**:
   - In Supabase dashboard, go to SQL Editor
   - Create a new query

2. **Run Database Scripts**:
   ```sql
   -- Copy and paste the contents from database_schema.sql
   -- This creates all necessary tables, constraints, and sample data
   ```

3. **Verify Tables**:
   - Go to Table Editor
   - Confirm these tables exist:
     - `users`
     - `questions` 
     - `tests`
     - `testquestions`
     - `results`

## 🚀 Running the Application

### Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔍 Verification Steps

### 1. Check Dependencies
```bash
npm list --depth=0
```

### 2. Test Supabase Connection
```bash
# Start the app and check browser console
npm run dev
# Open http://localhost:5173
# Check browser developer console for errors
```

### 3. Verify Features
- [ ] Home page loads correctly
- [ ] Tutor login works
- [ ] Student registration works
- [ ] Database operations function
- [ ] Question management works
- [ ] Test taking interface works

## 🐛 Common Issues and Solutions

### Issue 1: Port Already in Use
```bash
# Error: Port 5173 is already in use
# Solution: Kill the process or use different port
npx kill-port 5173
# or
npm run dev -- --port 3000
```

### Issue 2: Module Not Found
```bash
# Error: Cannot resolve dependency
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Supabase Connection Error
```bash
# Error: Invalid API key or URL
# Solution: Verify .env file
cat .env
# Check for typos, extra spaces, or wrong credentials
```

### Issue 4: Database Access Error
```bash
# Error: Permission denied
# Solution: Check RLS policies in Supabase
# Go to Authentication → Policies
# Ensure policies allow public access for testing
```

## 🔧 IDE Setup

### Visual Studio Code (Recommended)

1. **Install Extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint
   - Auto Rename Tag
   - Bracket Pair Colorizer

2. **Configure Settings**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### Other IDEs
- **WebStorm**: Built-in React support
- **Atom**: Install react and linter packages
- **Sublime Text**: Install Babel and SublimeLinter packages

## 🌐 Network Configuration

### Development Network Access
To access the dev server from other devices:

```bash
# Start with host option
npm run dev -- --host

# Access from other devices using your IP:
# http://192.168.1.100:5173
```

### Firewall Configuration
Ensure port 5173 is open in your firewall settings.

## 🔄 Update Procedures

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Updating Node.js
```bash
# Check current version
node --version

# Update using npm (if installed via npm)
npm install -g n
n latest

# Or download new version from nodejs.org
```

## 📝 Next Steps

After successful installation:

1. **Read the [Developer Guide](DEVELOPER_GUIDE.md)** for coding standards
2. **Review the [API Documentation](API_DOCUMENTATION.md)** for integration details
3. **Check the [Architecture Guide](ARCHITECTURE.md)** to understand the system
4. **Set up your [Deployment Pipeline](DEPLOYMENT.md)** for production

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: Browser console and terminal output
2. **Review troubleshooting**: [Troubleshooting Guide](TROUBLESHOOTING.md)
3. **Search existing issues**: GitHub Issues section
4. **Create new issue**: Include error messages and environment details

---

**Installation Complete!** 🎉 Your TestNest MCQ application is now ready for development.