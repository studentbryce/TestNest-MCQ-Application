# Developer Guide

This comprehensive guide provides coding standards, best practices, and development workflows for the TestNest MCQ application.

## 🎯 Development Philosophy

### Core Principles
1. **Code Clarity**: Write self-documenting code with meaningful names
2. **Consistency**: Follow established patterns throughout the codebase
3. **Maintainability**: Design for future modifications and extensions
4. **Performance**: Optimize for user experience and scalability
5. **Security**: Implement secure coding practices by default

### Team Standards
- **Collaborative Development**: Use pull requests for all changes
- **Code Reviews**: Every change requires peer review
- **Documentation**: Update docs with code changes
- **Testing**: Write tests for new features and bug fixes

## 🏗 Project Structure

### Directory Organization
```
mcq_app/
├── public/                    # Static assets
│   ├── vite.svg
│   └── favicon.ico
├── src/                       # Source code
│   ├── components/           # React components
│   │   ├── layout/          # Layout components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── questions/       # Question management
│   │   ├── tests/           # Test components
│   │   ├── results/         # Results components
│   │   └── common/          # Reusable components
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── utils/               # Utility functions
│   ├── data/                # Static data and constants
│   ├── images/              # Image assets
│   ├── App.jsx              # Main application component
│   ├── App.css              # Global styles
│   ├── main.jsx             # Application entry point
│   └── supabaseClient.js    # Database client
├── docs/                     # Documentation
├── package.json              # Dependencies and scripts
├── vite.config.js           # Build configuration
└── eslint.config.js         # Linting configuration
```

### File Naming Conventions

#### Components
```javascript
// PascalCase for component files
UserList.jsx
StudentDashboard.jsx
QuestionForm.jsx

// camelCase for utility files
supabaseClient.js
helperFunctions.js
authUtils.js
```

#### CSS Classes
```css
/* kebab-case for CSS classes */
.question-form
.student-dashboard
.result-card

/* BEM methodology for complex components */
.question-card
.question-card__header
.question-card__content
.question-card--highlighted
```

## ⚛️ React Development Standards

### Component Structure
```javascript
// 1. Imports (React, third-party, local)
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

// 2. Component definition
export default function ComponentName({ prop1, prop2 }) {
  // 3. State declarations
  const [state, setState] = useState(initialValue);
  
  // 4. Effect hooks
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Event handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle logic
  };
  
  // 6. Helper functions
  const formatData = (data) => {
    // Formatting logic
  };
  
  // 7. Early returns/guards
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 8. Main render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
}
```

### Functional Components Best Practices

#### 1. Use Functional Components with Hooks
```javascript
// ✅ Good - Functional component with hooks
const QuestionList = ({ testId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchQuestions();
  }, [testId]);
  
  const fetchQuestions = async () => {
    // Fetch logic
  };
  
  return <div>{/* Component JSX */}</div>;
};

// ❌ Avoid - Class components (unless necessary)
class QuestionList extends Component {
  // Class component code
}
```

#### 2. Custom Hooks for Reusable Logic
```javascript
// Custom hook for data fetching
const useQuestions = (filters = {}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('questions').select('*');
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQuestions();
  }, [JSON.stringify(filters)]);
  
  const refetch = () => fetchQuestions();
  
  return { questions, loading, error, refetch };
};

// Usage in components
const QuestionManager = () => {
  const { questions, loading, error, refetch } = useQuestions({
    category: 'programming'
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {questions.map(q => (
        <QuestionCard key={q.questionid} question={q} />
      ))}
    </div>
  );
};
```

#### 3. Props Destructuring and Default Values
```javascript
// ✅ Good - Destructure props with defaults
const QuestionCard = ({ 
  question, 
  showActions = true, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="question-card">
      <h3>{question.question}</h3>
      {showActions && (
        <div className="actions">
          <button onClick={() => onEdit(question)}>Edit</button>
          <button onClick={() => onDelete(question.questionid)}>Delete</button>
        </div>
      )}
    </div>
  );
};

// ❌ Avoid - Accessing props directly
const QuestionCard = (props) => {
  return (
    <div className="question-card">
      <h3>{props.question.question}</h3>
      {props.showActions && (
        <div className="actions">
          <button onClick={() => props.onEdit(props.question)}>Edit</button>
          <button onClick={() => props.onDelete(props.question.questionid)}>Delete</button>
        </div>
      )}
    </div>
  );
};
```

### State Management Patterns

#### 1. Local State for Component-Specific Data
```javascript
const QuestionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    question: '',
    choice1: '',
    choice2: '',
    choice3: '',
    choice4: '',
    answer: 1
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      question: '',
      choice1: '',
      choice2: '',
      choice3: '',
      choice4: '',
      answer: 1
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

#### 2. Context for Global State
```javascript
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);
  
  const login = async (credentials) => {
    try {
      // Authentication logic
      const userData = await authenticateUser(credentials);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const logout = () => {
    setUser(null);
    // Clear any stored session data
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTutor: user?.role === 'tutor'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## 🎨 CSS and Styling Standards

### CSS Architecture
```css
/* 1. CSS Variables (Theme System) */
:root {
  --tn-primary: #513521;
  --tn-secondary: #EAD7C2;
  --tn-accent: #A7D2CB;
  --tn-background: #FFF9E5;
  --tn-text: #2F2F2F;
  
  --tn-font-title: 'Quicksand', sans-serif;
  --tn-font-body: 'Inter', sans-serif;
  --tn-font-logo: 'Fredoka', sans-serif;
  --tn-font-monospace: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 2. Base Styles */
body {
  font-family: var(--tn-font-body);
  color: var(--tn-text);
  background-color: var(--tn-background);
}

/* 3. Component Styles */
.question-card {
  background-color: rgba(234, 215, 194, 0.3);
  border: 2px solid var(--tn-accent);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(167, 210, 203, 0.3);
}
```

### CSS Naming Conventions
```css
/* Use kebab-case for class names */
.question-form {}
.student-dashboard {}
.result-summary {}

/* Use BEM for complex components */
.question-card {}
.question-card__header {}
.question-card__content {}
.question-card__actions {}
.question-card--highlighted {}
.question-card--disabled {}

/* Use descriptive state classes */
.is-active {}
.is-loading {}
.has-error {}
```

### Responsive Design Patterns
```css
/* Mobile-first approach */
.container {
  padding: 1rem;
  width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
  }
}

/* Use CSS Grid for complex layouts */
.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

## 📊 Database Integration

### Supabase Query Patterns
```javascript
// 1. Simple queries
const fetchQuestions = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('isactive', true)
    .order('questionid');
    
  if (error) throw error;
  return data;
};

// 2. Complex queries with joins
const fetchTestWithQuestions = async (testId) => {
  const { data, error } = await supabase
    .from('tests')
    .select(`
      *,
      testquestions (
        questionorder,
        points,
        questions (*)
      )
    `)
    .eq('testid', testId)
    .single();
    
  if (error) throw error;
  return data;
};

// 3. Filtered queries
const searchQuestions = async (searchTerm, filters = {}) => {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('isactive', true);
    
  if (searchTerm) {
    query = query.ilike('question', `%${searchTerm}%`);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  
  const { data, error } = await query.order('questionid');
  
  if (error) throw error;
  return data;
};
```

### Error Handling Patterns
```javascript
// Centralized error handling
const handleSupabaseError = (error) => {
  const errorMap = {
    '23505': 'This item already exists. Please use a different value.',
    '23503': 'Cannot delete this item as it is being used elsewhere.',
    'PGRST116': 'No records found matching your criteria.',
    '42501': 'You do not have permission to perform this action.'
  };
  
  return errorMap[error.code] || error.message || 'An unexpected error occurred.';
};

// Usage in components
const useQuestionOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const createQuestion = async (questionData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('questions')
        .insert([questionData])
        .select();
        
      if (error) throw error;
      
      return { success: true, data: data[0] };
    } catch (err) {
      const friendlyError = handleSupabaseError(err);
      setError(friendlyError);
      return { success: false, error: friendlyError };
    } finally {
      setLoading(false);
    }
  };
  
  return { createQuestion, loading, error };
};
```

## 🧪 Testing Guidelines

### Unit Testing with React Testing Library
```javascript
// QuestionCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import QuestionCard from './QuestionCard';

const mockQuestion = {
  questionid: 1,
  question: 'What is 2 + 2?',
  choice1: '3',
  choice2: '4',
  choice3: '5',
  choice4: '6',
  answer: 2
};

describe('QuestionCard', () => {
  it('renders question content correctly', () => {
    render(<QuestionCard question={mockQuestion} />);
    
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    render(
      <QuestionCard 
        question={mockQuestion} 
        onEdit={mockOnEdit}
        showActions={true}
      />
    );
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockQuestion);
  });
  
  it('highlights correct answer', () => {
    render(<QuestionCard question={mockQuestion} />);
    
    const correctChoice = screen.getByText('4').closest('.choice-row');
    expect(correctChoice).toHaveClass('correct-answer');
  });
});
```

### Integration Testing
```javascript
// QuestionForm.integration.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import QuestionForm from './QuestionForm';

// Mock Supabase
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ questionid: 1 }], error: null }))
      }))
    }))
  }
}));

describe('QuestionForm Integration', () => {
  it('submits form with correct data', async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<QuestionForm onSubmit={mockOnSubmit} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/question/i), 'Test question');
    await user.type(screen.getByLabelText(/choice 1/i), 'Choice A');
    await user.type(screen.getByLabelText(/choice 2/i), 'Choice B');
    await user.selectOptions(screen.getByLabelText(/correct answer/i), '1');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /add question/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        question: 'Test question',
        choice1: 'Choice A',
        choice2: 'Choice B',
        choice3: '',
        choice4: '',
        answer: 1
      });
    });
  });
});
```

### Test Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true
  }
});

// src/test-setup.js
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
```

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy load components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const StudentTests = lazy(() => import('./components/StudentTests'));
const Results = lazy(() => import('./components/Results'));

// Usage
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/tests" element={<StudentTests />} />
    <Route path="/results" element={<Results />} />
  </Routes>
</Suspense>
```

### Memoization
```javascript
// Memoize expensive calculations
const QuestionStatistics = ({ questions }) => {
  const stats = useMemo(() => {
    return questions.reduce((acc, question) => {
      const difficulty = question.difficulty || 'medium';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});
  }, [questions]);
  
  return <div>{/* Render stats */}</div>;
};

// Memoize components to prevent unnecessary re-renders
const QuestionCard = memo(({ question, onEdit, onDelete }) => {
  return (
    <div className="question-card">
      {/* Card content */}
    </div>
  );
});

// Callback memoization
const QuestionList = ({ questions }) => {
  const handleEdit = useCallback((question) => {
    // Edit logic
  }, []);
  
  const handleDelete = useCallback((questionId) => {
    // Delete logic
  }, []);
  
  return (
    <div>
      {questions.map(question => (
        <QuestionCard
          key={question.questionid}
          question={question}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

### Database Query Optimization
```javascript
// Use select to fetch only needed columns
const fetchQuestionTitles = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('questionid, question')
    .eq('isactive', true);
    
  return { data, error };
};

// Use pagination for large datasets
const fetchQuestionsPage = async (page = 0, limit = 20) => {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('questions')
    .select('*', { count: 'exact' })
    .eq('isactive', true)
    .range(from, to)
    .order('questionid');
    
  return { 
    data, 
    error, 
    pagination: {
      page,
      limit,
      total: count,
      hasMore: to < count - 1
    }
  };
};
```

## 🔒 Security Best Practices

### Input Validation
```javascript
// Client-side validation
const validateQuestionData = (data) => {
  const errors = {};
  
  if (!data.question?.trim()) {
    errors.question = 'Question is required';
  }
  
  if (!data.choice1?.trim()) {
    errors.choice1 = 'Choice 1 is required';
  }
  
  if (!data.choice2?.trim()) {
    errors.choice2 = 'Choice 2 is required';
  }
  
  if (!data.answer || data.answer < 1 || data.answer > 4) {
    errors.answer = 'Please select a valid answer';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Usage in forms
const QuestionForm = ({ onSubmit }) => {
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateQuestionData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
    </form>
  );
};
```

### XSS Prevention
```javascript
// Use textContent for dynamic content, not innerHTML
const SafeQuestionDisplay = ({ question }) => {
  return (
    <div 
      className="question-text"
      // Safe - React automatically escapes content
    >
      {question.text}
    </div>
  );
};

// If HTML content is needed, sanitize it
import DOMPurify from 'dompurify';

const HTMLQuestionDisplay = ({ htmlContent }) => {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      className="question-html"
    />
  );
};
```

## 📝 Documentation Standards

### Component Documentation
```javascript
/**
 * QuestionCard component displays a single question with its choices
 * and indicates the correct answer.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - Question data object
 * @param {number} props.question.questionid - Unique question ID
 * @param {string} props.question.question - Question text
 * @param {string} props.question.choice1 - First choice
 * @param {string} props.question.choice2 - Second choice
 * @param {string} [props.question.choice3] - Optional third choice
 * @param {string} [props.question.choice4] - Optional fourth choice
 * @param {number} props.question.answer - Correct answer (1-4)
 * @param {boolean} [props.showActions=false] - Show edit/delete buttons
 * @param {Function} [props.onEdit] - Callback for edit action
 * @param {Function} [props.onDelete] - Callback for delete action
 * 
 * @example
 * <QuestionCard
 *   question={questionData}
 *   showActions={true}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
const QuestionCard = ({ 
  question, 
  showActions = false, 
  onEdit, 
  onDelete 
}) => {
  // Component implementation
};
```

### README Updates
```markdown
## Adding New Features

### 1. Create Feature Branch
```bash
git checkout -b feature/new-feature-name
```

### 2. Follow Component Structure
- Create component file in appropriate directory
- Add corresponding CSS styles
- Write unit tests
- Update documentation

### 3. Testing
```bash
npm test
npm run lint
```

### 4. Submit Pull Request
- Describe changes clearly
- Include screenshots for UI changes
- Reference related issues
```

## 🔄 Git Workflow

### Branch Naming
```bash
# Feature branches
feature/question-management
feature/student-dashboard
feature/real-time-updates

# Bug fixes
fix/login-validation
fix/question-display-bug

# Documentation updates
docs/api-documentation
docs/setup-guide
```

### Commit Messages
```bash
# Good commit messages
feat: add question filtering by difficulty
fix: resolve login validation error
docs: update installation guide
refactor: extract question validation logic
test: add unit tests for QuestionCard component

# Follow conventional commits format
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots
(Include for UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

---

For specific implementation examples, see the existing codebase in `/src/components/`.
For architecture details, see [Architecture Guide](ARCHITECTURE.md).
For deployment instructions, see [Deployment Guide](DEPLOYMENT.md).