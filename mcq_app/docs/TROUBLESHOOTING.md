# Troubleshooting Guide

This comprehensive troubleshooting guide helps developers and maintainers diagnose and resolve common issues in the TestNest MCQ application.

## 🚨 Common Issues and Solutions

### 1. Application Won't Start

#### Issue: Development server fails to start
```bash
Error: EADDRINUSE: address already in use :::5173
```

**Solution:**
```bash
# Option 1: Kill process using the port
npx kill-port 5173

# Option 2: Use different port
npm run dev -- --port 3000

# Option 3: Find and kill the process manually (Windows)
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Option 3: Find and kill the process manually (Mac/Linux)
lsof -i :5173
kill -9 <process_id>
```

#### Issue: Module not found errors
```bash
Error: Cannot resolve module '@supabase/supabase-js'
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# If issue persists, check Node.js version
node --version  # Should be 16+
npm --version   # Should be 7+

# Update npm if needed
npm install -g npm@latest
```

### 2. Database Connection Issues

#### Issue: Cannot connect to Supabase
```javascript
Error: Invalid API key or project URL
```

**Diagnostic Steps:**
```bash
# 1. Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 2. Verify .env file exists and has correct format
cat .env
```

**Solution:**
```bash
# 1. Verify Supabase credentials
# - Go to Supabase Dashboard → Settings → API
# - Copy Project URL and anon key
# - Update .env file

# 2. Check .env file format (no spaces around =)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Restart development server
npm run dev
```

#### Issue: Database queries fail
```javascript
Error: 23505: duplicate key value violates unique constraint
```

**Solution:**
```javascript
// Add error handling for database operations
const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData]);
      
    if (error) {
      if (error.code === '23505') {
        throw new Error('A user with this username already exists');
      }
      throw new Error(error.message);
    }
    
    return data;
  } catch (err) {
    console.error('Database error:', err);
    throw err;
  }
};
```

### 3. Authentication Problems

#### Issue: Login not working
```javascript
Error: User not found or invalid credentials
```

**Diagnostic Steps:**
```javascript
// Add debugging to login function
const authenticateUser = async (credentials) => {
  console.log('Attempting login with:', { username: credentials.username });
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', credentials.username)
    .eq('role', credentials.role);
    
  console.log('Query result:', { data, error });
  
  if (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message };
  }
  
  if (!data || data.length === 0) {
    console.log('No user found with username:', credentials.username);
    return { success: false, error: 'User not found' };
  }
  
  return { success: true, user: data[0] };
};
```

**Common Solutions:**
```javascript
// 1. Check username format (case sensitivity)
const normalizeUsername = (username) => {
  return username.toLowerCase().trim();
};

// 2. Verify user exists in database
const checkUserExists = async (username) => {
  const { data } = await supabase
    .from('users')
    .select('username, role')
    .eq('username', username);
    
  console.log('User check:', data);
  return data;
};

// 3. Add proper error messages
const getAuthErrorMessage = (error) => {
  const errorMap = {
    'User not found': 'Invalid username or password',
    'Invalid credentials': 'Please check your login details',
    'Network error': 'Connection problem. Please try again.'
  };
  
  return errorMap[error] || 'Login failed. Please try again.';
};
```

### 4. UI/Display Issues

#### Issue: Styles not loading correctly
```css
/* Components appear unstyled or with default browser styles */
```

**Solution:**
```javascript
// 1. Check CSS import in components
import '../App.css';  // Verify path is correct

// 2. Check CSS class names match
<div className="question-card">  // Not class="question-card"

// 3. Verify CSS variables are defined
:root {
  --primary-color: #513521;
  /* ... other variables */
}

// 4. Check for CSS conflicts
.question-card {
  /* Use !important sparingly for debugging */
  background-color: var(--primary-color) !important;
}
```

#### Issue: Responsive design not working
```css
/* Mobile layout looks broken */
```

**Solution:**
```css
/* 1. Add viewport meta tag to index.html */
<meta name="viewport" content="width=device-width, initial-scale=1.0">

/* 2. Check media queries */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
    /* Mobile-specific styles */
  }
}

/* 3. Use flexible units */
.card {
  width: 100%;           /* Instead of fixed width */
  max-width: 600px;      /* Set maximum */
  padding: 1rem;         /* Use rem units */
}
```

### 5. Performance Issues

#### Issue: Application loads slowly
```javascript
// Large bundle sizes, slow API calls
```

**Diagnostic Tools:**
```javascript
// 1. Measure component render times
const QuestionList = ({ questions }) => {
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    console.log(`QuestionList rendered in ${endTime - startTime}ms`);
  });
  
  return <div>{/* Component content */}</div>;
};

// 2. Check bundle size
npm run build
# Check dist/ folder sizes

// 3. Analyze network requests
// Open browser DevTools → Network tab
// Check for slow API calls
```

**Solutions:**
```javascript
// 1. Implement lazy loading
const QuestionManager = lazy(() => import('./QuestionManager'));

// 2. Use memoization
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);
  
  return <div>{/* Render processed data */}</div>;
});

// 3. Optimize database queries
const fetchQuestionsOptimized = async () => {
  // Select only needed columns
  const { data, error } = await supabase
    .from('questions')
    .select('questionid, question, choice1, choice2')  // Not *
    .eq('isactive', true)
    .limit(50);  // Add pagination
    
  return { data, error };
};
```

### 6. Build and Deployment Issues

#### Issue: Build fails in production
```bash
Error: Rollup failed to resolve import
```

**Solution:**
```javascript
// 1. Check import paths
// ✅ Correct - relative imports
import { supabase } from '../supabaseClient';
import QuestionCard from './QuestionCard';

// ❌ Incorrect - absolute imports without configuration
import { supabase } from 'src/supabaseClient';

// 2. Verify all dependencies are installed
npm list --depth=0

// 3. Check for missing environment variables
// Add to vite.config.js for debugging
export default defineConfig({
  define: {
    __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL),
    __SUPABASE_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
  }
});
```

#### Issue: Environment variables not working in production
```javascript
// Variables undefined in deployed application
```

**Solution:**
```javascript
// 1. Check platform-specific configuration

// Vercel
// Add via dashboard: Settings → Environment Variables

// Netlify
// Add via netlify.toml or dashboard

// 2. Verify variable names have VITE_ prefix
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

// 3. Add fallback values for development
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'default-dev-key'
};
```

## 🔧 Debug Mode and Logging

### Enable Debug Mode
```javascript
// Add to main.jsx
if (import.meta.env.DEV) {
  window.debugMode = true;
  
  // Global error handler
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
  });
}
```

### Logging Utility
```javascript
// utils/logger.js
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
  }
  
  error(message, data) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, data);
    }
  }
  
  warn(message, data) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }
  
  info(message, data) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }
  
  debug(message, data) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
}

export const logger = new Logger();

// Usage
logger.debug('User login attempt', { username });
logger.error('API call failed', { error, endpoint });
```

### Database Query Debugging
```javascript
// Add to supabaseClient.js for debugging
const originalFrom = supabase.from;
supabase.from = function(table) {
  const query = originalFrom.call(this, table);
  
  if (import.meta.env.DEV) {
    console.log(`[DB] Querying table: ${table}`);
  }
  
  return query;
};
```

## 🧪 Testing and Validation

### Component Testing Debug
```javascript
// Add to test files for debugging
import { screen, render } from '@testing-library/react';

// Debug rendered DOM
render(<QuestionCard question={mockQuestion} />);
screen.debug();  // Prints current DOM to console

// Find elements by different methods
screen.getByText('Question text');  // Exact match
screen.getByText(/question/i);      // Case insensitive regex
screen.getByRole('button', { name: /edit/i });  // By role and name
```

### API Testing
```javascript
// Test API endpoints manually
const testAPI = async () => {
  try {
    // Test connection
    const { data: healthCheck } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    console.log('Database connection:', healthCheck ? '✅' : '❌');
    
    // Test specific query
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .limit(5);
      
    console.log('Users query:', { data: users, error });
  } catch (err) {
    console.error('API test failed:', err);
  }
};

// Call in browser console
window.testAPI = testAPI;
```

## 📊 Monitoring and Health Checks

### Performance Monitoring
```javascript
// Add to main.jsx
if (import.meta.env.PROD) {
  // Measure First Contentful Paint
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        console.log('FCP:', entry.startTime);
      }
    });
  }).observe({ entryTypes: ['paint'] });
  
  // Measure Largest Contentful Paint
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('LCP:', entry.startTime);
    });
  }).observe({ entryTypes: ['largest-contentful-paint'] });
}
```

### Health Check Component
```javascript
// components/HealthCheck.jsx
const HealthCheck = () => {
  const [status, setStatus] = useState({
    database: 'checking',
    api: 'checking'
  });
  
  useEffect(() => {
    checkHealth();
  }, []);
  
  const checkHealth = async () => {
    // Database check
    try {
      await supabase.from('users').select('count').limit(1);
      setStatus(prev => ({ ...prev, database: 'healthy' }));
    } catch (err) {
      setStatus(prev => ({ ...prev, database: 'unhealthy' }));
    }
    
    // API check
    try {
      const response = await fetch('/health');
      setStatus(prev => ({ 
        ...prev, 
        api: response.ok ? 'healthy' : 'unhealthy' 
      }));
    } catch (err) {
      setStatus(prev => ({ ...prev, api: 'unhealthy' }));
    }
  };
  
  if (import.meta.env.PROD) return null;  // Hide in production
  
  return (
    <div className="health-check">
      <h4>System Health</h4>
      <div>Database: {status.database}</div>
      <div>API: {status.api}</div>
    </div>
  );
};
```

## 🔄 Recovery Procedures

### Data Recovery
```sql
-- Restore accidentally deleted questions (soft delete)
UPDATE questions 
SET isactive = true 
WHERE questionid IN (1, 2, 3);

-- Recover user accounts
UPDATE users 
SET isactive = true 
WHERE userid = 123;

-- Backup before major operations
CREATE TABLE questions_backup AS 
SELECT * FROM questions;
```

### Cache Clearing
```bash
# Clear browser cache (development)
# Chrome: Ctrl+Shift+R (hard reload)
# Firefox: Ctrl+F5

# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite

# Clear build cache
rm -rf dist/
```

### Reset Development Environment
```bash
# Complete reset
rm -rf node_modules package-lock.json dist/
npm install
npm run dev

# Reset git (if needed)
git reset --hard HEAD
git clean -fd

# Reset database (development only)
# Re-run database schema scripts in Supabase
```

## 📞 Getting Help

### Information to Gather Before Reporting Issues

1. **Environment Information**
   ```bash
   node --version
   npm --version
   git --version
   cat package.json | grep version
   ```

2. **Error Details**
   - Full error message
   - Browser console logs
   - Network tab information
   - Steps to reproduce

3. **System Information**
   - Operating system
   - Browser and version
   - Screen resolution (for UI issues)

### Escalation Process
1. **Check Documentation**: Review relevant docs
2. **Search Issues**: Look for similar problems
3. **Create Issue**: Include all diagnostic information
4. **Contact Team**: Use appropriate channels

### Emergency Contacts
- **Critical Production Issues**: [Contact details]
- **Database Issues**: [DBA contact]
- **Infrastructure Issues**: [DevOps contact]

## 📋 Prevention Checklist

### Before Deploying
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Performance tested
- [ ] Security reviewed

### Regular Maintenance
- [ ] Dependencies updated monthly
- [ ] Security patches applied
- [ ] Performance monitoring reviewed
- [ ] Error logs analyzed
- [ ] Backup procedures tested
- [ ] Documentation updated

---

For specific deployment issues, see [Deployment Guide](DEPLOYMENT.md).
For development setup problems, see [Installation Guide](INSTALLATION.md).