# Architecture Guide

This document provides a comprehensive overview of the TestNest MCQ application's architecture, design patterns, and technical decisions.

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER                               │
├─────────────────────────────────────────────────────────────┤
│  React Application (Frontend)                               │
│  ├── Components (UI Layer)                                  │
│  ├── State Management (React Hooks)                        │
│  ├── Routing (React Router)                                │
│  └── Styling (CSS3 + CSS Variables)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE TIER                              │
├─────────────────────────────────────────────────────────────┤
│  Supabase Backend-as-a-Service                             │
│  ├── RESTful API (PostgREST)                              │
│  ├── Real-time Subscriptions (WebSockets)                 │
│  ├── Authentication (GoTrue)                               │
│  └── File Storage (Optional)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ SQL
┌─────────────────────────────────────────────────────────────┐
│                    DATA TIER                                │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  ├── Tables (Users, Questions, Tests, Results)            │
│  ├── Indexes (Performance Optimization)                    │
│  ├── Constraints (Data Integrity)                         │
│  └── RLS Policies (Security)                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. Separation of Concerns
- **Presentation Layer**: React components handle UI rendering
- **Business Logic**: Custom hooks manage application logic
- **Data Layer**: Supabase handles data persistence and API
- **Styling**: Modular CSS with theme system

### 2. Component-Based Architecture
```
Application
├── Layout Components
│   ├── Navigation
│   ├── Header
│   └── Footer
├── Feature Components
│   ├── Authentication
│   ├── Question Management
│   ├── Test Taking
│   └── Results Display
└── Common Components
    ├── Form Elements
    ├── Buttons
    └── Modals
```

### 3. Data Flow Pattern
```
User Action → Component → Custom Hook → API Call → Database
                                   ↓
Component State ← Response Processing ← API Response
```

## 🧩 Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Navigation.jsx
│   │   └── Layout.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── StudentLogin.jsx
│   │   └── StudentRegister.jsx
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── UserList.jsx
│   ├── questions/
│   │   ├── QuestionList.jsx
│   │   ├── QuestionForm.jsx
│   │   └── QuestionCard.jsx
│   ├── tests/
│   │   ├── TestList.jsx
│   │   ├── StudentTests.jsx
│   │   └── TestInterface.jsx
│   ├── results/
│   │   ├── Results.jsx
│   │   ├── StudentResults.jsx
│   │   └── ResultCard.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useQuestions.js
│   ├── useTests.js
│   └── useResults.js
├── contexts/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── utils/
│   ├── supabaseClient.js
│   ├── helpers.js
│   └── constants.js
└── styles/
    ├── App.css
    ├── index.css
    └── themes/
```

### State Management Strategy

#### Local State (useState)
```javascript
// Component-level state for form inputs
const [formData, setFormData] = useState({
  question: '',
  choices: ['', '', '', ''],
  answer: 1
});
```

#### Shared State (useContext)
```javascript
// Application-level state for authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Server State (Custom Hooks + Supabase)
```javascript
// Data fetching and caching
const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*');
      
      if (error) throw error;
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { questions, loading, error, refetch: fetchQuestions };
};
```

## 🔄 Data Flow Patterns

### 1. Unidirectional Data Flow
```javascript
// Parent Component
const QuestionManagement = () => {
  const { questions, createQuestion, deleteQuestion } = useQuestions();

  return (
    <div>
      <QuestionForm onSubmit={createQuestion} />
      <QuestionList 
        questions={questions} 
        onDelete={deleteQuestion} 
      />
    </div>
  );
};

// Child Component
const QuestionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState(initialState);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialState);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### 2. Event-Driven Updates
```javascript
// Real-time subscription pattern
useEffect(() => {
  const subscription = supabase
    .channel('results')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'results'
    }, (payload) => {
      setResults(current => [...current, payload.new]);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## 🎨 UI/UX Architecture

### Theme System
```css
/* CSS Variables for consistent theming */
:root {
  /* Colors */
  --tn-primary: #513521;
  --tn-secondary: #EAD7C2;
  --tn-accent: #A7D2CB;
  --tn-background: #FFF9E5;
  --tn-text: #2F2F2F;

  /* Fonts */
  --tn-font-title: 'Quicksand', sans-serif;
  --tn-font-body: 'Inter', sans-serif;
  --tn-font-logo: 'Fredoka', sans-serif;
  --tn-font-monospace: 'Consolas', 'Monaco', 'Courier New', monospace;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Borders */
  --border-radius: 6px;
  --border-radius-lg: 12px;
}
```

### Responsive Design Strategy
```css
/* Mobile-first approach */
.container {
  width: 100%;
  max-width: 1200px;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
  }
}
```

### Component Design Pattern
```javascript
// Compound component pattern for forms
const Form = ({ children, onSubmit }) => (
  <form onSubmit={onSubmit} className="form">
    {children}
  </form>
);

const FormGroup = ({ label, children, error }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
    {error && <span className="error">{error}</span>}
  </div>
);

Form.Group = FormGroup;

// Usage
<Form onSubmit={handleSubmit}>
  <Form.Group label="Question" error={errors.question}>
    <textarea {...questionProps} />
  </Form.Group>
  <Form.Group label="Choice 1" error={errors.choice1}>
    <input {...choice1Props} />
  </Form.Group>
</Form>
```

## 🗄 Backend Architecture

### Supabase Service Layer
```javascript
// Service abstraction layer
class QuestionService {
  static async getAll() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('isactive', true);
    
    if (error) throw new Error(error.message);
    return data;
  }

  static async create(questionData) {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select();
    
    if (error) throw new Error(error.message);
    return data[0];
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('questionid', id)
      .select();
    
    if (error) throw new Error(error.message);
    return data[0];
  }

  static async delete(id) {
    const { error } = await supabase
      .from('questions')
      .update({ isactive: false })
      .eq('questionid', id);
    
    if (error) throw new Error(error.message);
  }
}
```

### Database Design Patterns

#### 1. Soft Delete Pattern
```sql
-- Instead of hard deletes, use status flags
UPDATE questions 
SET isactive = false 
WHERE questionid = $1;
```

#### 2. Audit Trail Pattern
```sql
-- Track changes with timestamps
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50),
  record_id INTEGER,
  action VARCHAR(20),
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. JSONB for Flexible Data
```sql
-- Store test answers as JSONB for flexibility
answers JSONB DEFAULT '{}'::jsonb

-- Example data:
{
  "1": {"selected": 2, "correct": 3, "time": 45},
  "2": {"selected": 1, "correct": 1, "time": 30}
}
```

## 🔒 Security Architecture

### Authentication Flow
```
1. User enters credentials
2. Frontend validates format
3. Query users table with credentials
4. Check user role and status
5. Store user data in context
6. Redirect to appropriate dashboard
```

### Authorization Patterns
```javascript
// Role-based access control
const useRoleGuard = (requiredRole) => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user || user.role !== requiredRole) {
      navigate('/unauthorized');
    }
  }, [user, requiredRole]);
  
  return user?.role === requiredRole;
};

// Usage in components
const TutorOnlyComponent = () => {
  const hasAccess = useRoleGuard('tutor');
  
  if (!hasAccess) return null;
  
  return <div>Tutor-only content</div>;
};
```

### Row Level Security (RLS)
```sql
-- Students can only see their own results
CREATE POLICY student_results ON results
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND studentid = auth.uid()
  );

-- Tutors can see all results
CREATE POLICY tutor_results ON results
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE userid = auth.uid() 
      AND role = 'tutor'
    )
  );
```

## 📊 Performance Architecture

### Client-Side Optimization

#### 1. Code Splitting
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const StudentTests = lazy(() => import('./components/StudentTests'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

#### 2. Memoization
```javascript
// Memoize expensive calculations
const QuestionStats = ({ questions }) => {
  const stats = useMemo(() => {
    return questions.reduce((acc, q) => ({
      easy: acc.easy + (q.difficulty === 'easy' ? 1 : 0),
      medium: acc.medium + (q.difficulty === 'medium' ? 1 : 0),
      hard: acc.hard + (q.difficulty === 'hard' ? 1 : 0)
    }), { easy: 0, medium: 0, hard: 0 });
  }, [questions]);

  return <div>{/* Render stats */}</div>;
};

// Memoize components
const QuestionCard = memo(({ question, onEdit, onDelete }) => {
  return <div>{/* Question card content */}</div>;
});
```

#### 3. Virtual Scrolling (Future Enhancement)
```javascript
// For large lists of questions/results
import { VariableSizeList } from 'react-window';

const VirtualizedQuestionList = ({ questions }) => (
  <VariableSizeList
    height={600}
    itemCount={questions.length}
    itemSize={() => 100}
    itemData={questions}
  >
    {QuestionItem}
  </VariableSizeList>
);
```

### Database Optimization

#### 1. Query Optimization
```sql
-- Use indexes for common queries
CREATE INDEX idx_questions_category_active 
ON questions(category, isactive);

CREATE INDEX idx_results_student_date 
ON results(studentid, datecompleted);
```

#### 2. Connection Pooling
```javascript
// Supabase handles connection pooling automatically
// Configure in Supabase dashboard:
// - Max connections
// - Pool timeout
// - Statement timeout
```

## 🔄 Error Handling Architecture

### Error Boundary Pattern
```javascript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Log to external service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### API Error Handling
```javascript
// Centralized error handling
const apiErrorHandler = {
  handle: (error) => {
    const errorMap = {
      '23505': 'Duplicate entry found',
      '23503': 'Referenced item not found',
      'PGRST116': 'No data found',
      '42501': 'Insufficient permissions'
    };

    return errorMap[error.code] || error.message || 'An error occurred';
  }
};

// Usage in hooks
const useQuestions = () => {
  const [error, setError] = useState(null);

  const createQuestion = async (data) => {
    try {
      // API call
    } catch (err) {
      const friendlyError = apiErrorHandler.handle(err);
      setError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  return { error, createQuestion };
};
```

## 🚀 Deployment Architecture

### Build Process
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### Environment Configuration
```javascript
// Environment-specific configurations
const config = {
  development: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_DEV,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_DEV,
    logLevel: 'debug'
  },
  production: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL_PROD,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PROD,
    logLevel: 'error'
  }
};

export default config[import.meta.env.MODE] || config.development;
```

## 📈 Scalability Considerations

### Frontend Scalability
1. **Component Libraries**: Reusable component system
2. **Micro-frontends**: Future modularization potential
3. **CDN Deployment**: Static asset optimization
4. **Progressive Web App**: Offline capabilities

### Backend Scalability
1. **Database Scaling**: Supabase auto-scaling
2. **Caching**: Redis for frequent queries
3. **Load Balancing**: Supabase handles automatically
4. **Read Replicas**: For read-heavy workloads

### Monitoring & Observability
```javascript
// Performance monitoring
const performanceMonitor = {
  trackPageLoad: (pageName) => {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`${pageName} loaded in ${loadTime}ms`);
    };
  },

  trackApiCall: async (operation, apiCall) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      console.log(`${operation} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${operation} failed after ${duration}ms:`, error);
      throw error;
    }
  }
};
```

---

For implementation details and coding standards, see [Developer Guide](DEVELOPER_GUIDE.md).
For database specifics, see [Database Schema Documentation](DATABASE_SCHEMA.md).