# Deployment Guide

This guide provides comprehensive instructions for deploying the TestNest MCQ application to various hosting platforms and environments.

## 🚀 Deployment Overview

### Deployment Architecture
```
Development → Staging → Production
     ↓           ↓         ↓
   localhost    Vercel    Vercel/Netlify
                Preview   Production
```

### Prerequisites
- Node.js 16+ installed locally
- Git repository set up
- Supabase project configured
- Domain name (optional, for production)
- SSL certificate (handled automatically by most platforms)

## 🏗 Build Process

### Production Build
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Build Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Set to true for debugging in production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries for better caching
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  define: {
    // Define global variables for production
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
```

### Environment Variables
```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

## 🌐 Platform Deployments

### 1. Vercel Deployment (Recommended)

#### Quick Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your username/org
# - Link to existing project? No (for first deploy)
# - Project name: testnest-mcq
# - Directory: ./
# - Override settings? No
```

#### Advanced Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

#### Environment Variables in Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add the following variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```

#### Custom Domain Setup
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### 2. Netlify Deployment

#### Deploy from Git
1. Connect GitHub repository to Netlify
2. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

#### netlify.toml Configuration
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-production-key"

[context.deploy-preview.environment]
  VITE_SUPABASE_URL = "https://your-staging-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-staging-key"
```

#### Form Handling (Future Enhancement)
```html
<!-- For contact forms or feedback -->
<form netlify>
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

### 3. Firebase Hosting

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Configuration options:
# - Use existing project or create new one
# - Public directory: dist
# - Configure as SPA: Yes
# - Set up automatic builds: No (manual for now)
```

#### Firebase Configuration
```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Deploy to Firebase
```bash
# Build and deploy
npm run build
firebase deploy

# Deploy to specific project
firebase deploy --project testnest-production
```

### 4. GitHub Pages

#### Setup GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### Configure GitHub Pages
1. Go to Repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages / root

## 🗄 Database Deployment

### Supabase Production Setup

#### 1. Create Production Project
```sql
-- Create production database
-- Run the complete schema from docs/database/
-- This includes tables, indexes, RLS policies
```

#### 2. Environment Separation
```javascript
// Create separate projects for each environment
const environments = {
  development: {
    url: 'https://dev-project.supabase.co',
    key: 'dev-anon-key'
  },
  staging: {
    url: 'https://staging-project.supabase.co',
    key: 'staging-anon-key'
  },
  production: {
    url: 'https://prod-project.supabase.co',
    key: 'prod-anon-key'
  }
};
```

#### 3. Data Migration
```bash
# Export from development
supabase db dump --db-url "postgresql://..." > dev_dump.sql

# Import to production
supabase db reset --db-url "postgresql://..."
psql -h db.xxx.supabase.co -U postgres -d postgres < dev_dump.sql
```

### Database Configuration
```sql
-- Production optimizations
-- Enable connection pooling
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Create indexes for production workload
CREATE INDEX CONCURRENTLY idx_results_student_date_score 
ON results(studentid, datecompleted DESC, score);

CREATE INDEX CONCURRENTLY idx_questions_category_difficulty 
ON questions(category, difficulty) WHERE isactive = true;
```

## 🔒 Security Configuration

### Environment Secrets Management

#### Vercel Secrets
```bash
# Add secrets via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Or via dashboard
# Project → Settings → Environment Variables
```

#### Netlify Secrets
```bash
# Add via Netlify CLI
netlify env:set VITE_SUPABASE_URL "https://project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
```

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' *.supabase.co;
">
```

### HTTPS Configuration
```javascript
// Redirect HTTP to HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## 📊 Monitoring and Analytics

### Performance Monitoring
```javascript
// Add to main.jsx
if (import.meta.env.PROD) {
  // Web Vitals monitoring
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}
```

### Error Tracking
```javascript
// Sentry integration
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
  });
}
```

### Google Analytics (Optional)
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚦 Deployment Pipeline

### Continuous Integration
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/
```

### Automated Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🏃‍♂️ Performance Optimization

### Build Optimization
```javascript
// vite.config.js production optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            if (id.includes('supabase')) {
              return 'supabase';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Caching Strategy
```javascript
// Service Worker for caching (optional)
// sw.js
const CACHE_NAME = 'testnest-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### CDN Configuration
```javascript
// Use CDN for assets in production
const config = {
  development: {
    assetUrl: '/assets/'
  },
  production: {
    assetUrl: 'https://cdn.yourdomain.com/assets/'
  }
};
```

## 🔍 Health Checks and Monitoring

### Health Check Endpoint
```javascript
// Add to src/utils/health.js
export const healthCheck = {
  async database() {
    try {
      const { error } = await supabase.from('users').select('count').limit(1);
      return { status: 'healthy', service: 'database', error: null };
    } catch (error) {
      return { status: 'unhealthy', service: 'database', error: error.message };
    }
  },
  
  async api() {
    try {
      // Test basic API connectivity
      const response = await fetch('/api/health');
      return { 
        status: response.ok ? 'healthy' : 'unhealthy', 
        service: 'api',
        statusCode: response.status 
      };
    } catch (error) {
      return { status: 'unhealthy', service: 'api', error: error.message };
    }
  }
};
```

### Uptime Monitoring
```yaml
# Use services like:
# - UptimeRobot
# - Pingdom
# - StatusPage

# Monitor these endpoints:
# - https://yourdomain.com/
# - https://yourdomain.com/login
# - https://yourdomain.com/dashboard
```

## 🔧 Troubleshooting Deployment

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Check for environment variable issues
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Runtime Errors
```javascript
// Add error boundaries in production
class DeploymentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Deployment error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="deployment-error">
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Database Connection Issues
```javascript
// Add connection retry logic
const retrySupabaseOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
};
```

## 📋 Pre-Launch Checklist

### Final Deployment Steps
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Sample data populated (if needed)
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team access configured

### Testing Checklist
- [ ] All features working in production
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Accessibility requirements met
- [ ] SEO basics implemented

---

For ongoing maintenance, see [Troubleshooting Guide](TROUBLESHOOTING.md).
For development workflows, see [Developer Guide](DEVELOPER_GUIDE.md).