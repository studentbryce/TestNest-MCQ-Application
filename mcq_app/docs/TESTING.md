# Testing Guide

This comprehensive testing guide outlines testing strategies, tools, and best practices for the TestNest MCQ application to ensure reliable functionality and maintainable code.

## 🧪 Testing Philosophy

### Testing Pyramid
```
    /\      Unit Tests (70%)
   /  \     - Component logic
  /____\    - Utility functions
 /      \   - Data transformations
/________\  
|        |  Integration Tests (20%)
|        |  - Component interactions
|        |  - API integrations
|________|  - User workflows

|        |  End-to-End Tests (10%)
|        |  - Critical user paths
|        |  - Cross-browser compatibility
|________|  - Production scenarios
```

### Testing Principles
1. **Test Behavior, Not Implementation**: Focus on what the component does, not how
2. **User-Centric Testing**: Write tests from the user's perspective
3. **Fast and Reliable**: Tests should run quickly and consistently
4. **Maintainable**: Tests should be easy to understand and update

## 🛠️ Testing Setup

### Dependencies Installation
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "@vitejs/plugin-react": "^4.0.3",
    "jsdom": "^22.1.0",
    "vitest": "^0.34.0",
    "vitest-canvas-mock": "^0.3.2",
    "@vitest/ui": "^0.34.0"
  }
}
```

### Configuration Files

#### vitest.config.js
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js'
      ]
    }
  }
});
```

#### src/test/setup.js
```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase client for tests
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

// Mock CSS imports
vi.mock('*.css', () => ({}));
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## 📝 Unit Testing

### Component Testing Examples

#### Testing Question Card Component
```javascript
// src/components/__tests__/QuestionCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionCard from '../QuestionCard';

describe('QuestionCard', () => {
  const mockQuestion = {
    questionid: 1,
    question: 'What is React?',
    choice1: 'A library',
    choice2: 'A framework',
    choice3: 'A language',
    choice4: 'A database',
    correctanswer: 'A library'
  };

  const mockProps = {
    question: mockQuestion,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    isSelected: false,
    onSelect: vi.fn()
  };

  it('renders question and choices correctly', () => {
    render(<QuestionCard {...mockProps} />);
    
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('A library')).toBeInTheDocument();
    expect(screen.getByText('A framework')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<QuestionCard {...mockProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockQuestion);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<QuestionCard {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockQuestion.questionid);
  });

  it('applies selected styles when isSelected is true', () => {
    render(<QuestionCard {...mockProps} isSelected={true} />);
    
    const card = screen.getByTestId('question-card');
    expect(card).toHaveClass('selected');
  });

  it('handles missing choices gracefully', () => {
    const questionWithoutChoices = {
      ...mockQuestion,
      choice3: null,
      choice4: null
    };
    
    render(<QuestionCard {...mockProps} question={questionWithoutChoices} />);
    
    expect(screen.getByText('A library')).toBeInTheDocument();
    expect(screen.getByText('A framework')).toBeInTheDocument();
    expect(screen.queryByText('choice3')).not.toBeInTheDocument();
  });
});
```

#### Testing Login Component
```javascript
// src/components/__tests__/Login.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

describe('Login', () => {
  const mockOnLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form elements', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('calls onLogin with correct credentials', async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('disables login button during authentication', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Login onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    expect(loginButton).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });
});
```

### Utility Function Testing
```javascript
// src/utils/__tests__/validators.test.js
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateQuestion } from '../validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@example.co.uk')).toBe(true);
    });

    it('rejects invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('123456')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('Pass1')).toBe(false);
    });
  });

  describe('validateQuestion', () => {
    const validQuestion = {
      question: 'What is React?',
      choice1: 'A library',
      choice2: 'A framework',
      correctanswer: 'A library'
    };

    it('validates complete question object', () => {
      expect(validateQuestion(validQuestion)).toEqual({
        isValid: true,
        errors: []
      });
    });

    it('identifies missing required fields', () => {
      const incompleteQuestion = { question: 'What is React?' };
      
      const result = validateQuestion(incompleteQuestion);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 2 choices are required');
      expect(result.errors).toContain('Correct answer is required');
    });
  });
});
```

## 🔗 Integration Testing

### API Integration Tests
```javascript
// src/services/__tests__/questionService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchQuestions, createQuestion, updateQuestion } from '../questionService';
import { supabase } from '../supabaseClient';

// Mock the entire supabase module
vi.mock('../supabaseClient');

describe('Question Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchQuestions', () => {
    it('fetches active questions successfully', async () => {
      const mockQuestions = [
        { questionid: 1, question: 'Test question 1' },
        { questionid: 2, question: 'Test question 2' }
      ];
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockQuestions,
              error: null
            })
          })
        })
      });
      
      const result = await fetchQuestions();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuestions);
      expect(supabase.from).toHaveBeenCalledWith('questions');
    });

    it('handles API errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' };
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      });
      
      const result = await fetchQuestions();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('createQuestion', () => {
    const newQuestion = {
      question: 'New question',
      choice1: 'Option 1',
      choice2: 'Option 2',
      correctanswer: 'Option 1'
    };

    it('creates question successfully', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: [{ questionid: 1, ...newQuestion }],
          error: null
        })
      });
      
      const result = await createQuestion(newQuestion);
      
      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('questions');
    });

    it('validates question data before API call', async () => {
      const invalidQuestion = { question: '' };
      
      const result = await createQuestion(invalidQuestion);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });
});
```

### Component Integration Tests
```javascript
// src/components/__tests__/QuestionManager.integration.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionManager from '../QuestionManager';
import * as questionService from '../../services/questionService';

vi.mock('../../services/questionService');

describe('QuestionManager Integration', () => {
  const mockQuestions = [
    {
      questionid: 1,
      question: 'What is React?',
      choice1: 'Library',
      choice2: 'Framework',
      correctanswer: 'Library'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    questionService.fetchQuestions.mockResolvedValue({
      success: true,
      data: mockQuestions
    });
  });

  it('loads and displays questions on mount', async () => {
    render(<QuestionManager />);
    
    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });
    
    expect(questionService.fetchQuestions).toHaveBeenCalled();
  });

  it('creates new question through form submission', async () => {
    const user = userEvent.setup();
    
    questionService.createQuestion.mockResolvedValue({
      success: true,
      data: { questionid: 2 }
    });
    
    render(<QuestionManager />);
    
    // Fill out form
    await user.type(screen.getByLabelText(/question/i), 'New question?');
    await user.type(screen.getByLabelText(/choice 1/i), 'Option A');
    await user.type(screen.getByLabelText(/choice 2/i), 'Option B');
    await user.selectOptions(screen.getByLabelText(/correct answer/i), 'Option A');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /add question/i }));
    
    await waitFor(() => {
      expect(questionService.createQuestion).toHaveBeenCalledWith({
        question: 'New question?',
        choice1: 'Option A',
        choice2: 'Option B',
        correctanswer: 'Option A'
      });
    });
  });

  it('handles API errors gracefully', async () => {
    questionService.fetchQuestions.mockResolvedValue({
      success: false,
      error: 'Network error'
    });
    
    render(<QuestionManager />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading questions/i)).toBeInTheDocument();
    });
  });
});
```

## 🌐 End-to-End Testing

### Setup with Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

#### playwright.config.js
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples
```javascript
// e2e/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful teacher login', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to login
    await page.click('text=Teacher Login');
    
    // Fill login form
    await page.fill('[data-testid="username"]', 'teacher1');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Submit form
    await page.click('button:has-text("Login")');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Teacher Dashboard');
  });

  test('displays error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="username"]', 'invalid');
    await page.fill('[data-testid="password"]', 'wrong');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });

  test('handles network errors', async ({ page }) => {
    // Mock network failure
    await page.route('**/auth/**', route => route.abort());
    
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'teacher1');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Network error');
  });
});
```

```javascript
// e2e/question-management.spec.js
import { test, expect } from '@playwright/test';

test.describe('Question Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'teacher1');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates new question successfully', async ({ page }) => {
    // Navigate to question management
    await page.click('text=Manage Questions');
    await expect(page).toHaveURL('/questions');
    
    // Fill question form
    await page.fill('[data-testid="question-input"]', 'What is JavaScript?');
    await page.fill('[data-testid="choice1-input"]', 'Programming language');
    await page.fill('[data-testid="choice2-input"]', 'Markup language');
    await page.selectOption('[data-testid="correct-answer"]', 'Programming language');
    
    // Submit form
    await page.click('button:has-text("Add Question")');
    
    // Verify question appears in list
    await expect(page.locator('[data-testid="question-list"]'))
      .toContainText('What is JavaScript?');
  });

  test('edits existing question', async ({ page }) => {
    await page.goto('/questions');
    
    // Click edit on first question
    await page.click('[data-testid="question-card"]:first-child button:has-text("Edit")');
    
    // Modify question
    await page.fill('[data-testid="question-input"]', 'Updated question text');
    await page.click('button:has-text("Save Changes")');
    
    // Verify update
    await expect(page.locator('[data-testid="question-list"]'))
      .toContainText('Updated question text');
  });

  test('deletes question with confirmation', async ({ page }) => {
    await page.goto('/questions');
    
    const initialCount = await page.locator('[data-testid="question-card"]').count();
    
    // Delete first question
    await page.click('[data-testid="question-card"]:first-child button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');
    
    // Verify question removed
    const finalCount = await page.locator('[data-testid="question-card"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });
});
```

## 🎯 Visual Testing

### Setup Storybook for Visual Testing
```bash
npx storybook@latest init
```

#### Component Stories
```javascript
// src/components/QuestionCard.stories.jsx
export default {
  title: 'Components/QuestionCard',
  component: QuestionCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
    onSelect: { action: 'selected' },
  },
};

export const Default = {
  args: {
    question: {
      questionid: 1,
      question: 'What is React?',
      choice1: 'A JavaScript library',
      choice2: 'A programming language',
      choice3: 'A database',
      choice4: 'An operating system',
      correctanswer: 'A JavaScript library'
    },
    isSelected: false
  }
};

export const Selected = {
  args: {
    ...Default.args,
    isSelected: true
  }
};

export const LongQuestion = {
  args: {
    ...Default.args,
    question: {
      ...Default.args.question,
      question: 'This is a very long question that tests how the component handles text overflow and wrapping in different screen sizes and scenarios'
    }
  }
};

export const MinimalChoices = {
  args: {
    ...Default.args,
    question: {
      ...Default.args.question,
      choice3: null,
      choice4: null
    }
  }
};
```

### Screenshot Testing
```javascript
// e2e/visual.spec.js
import { test, expect } from '@playwright/test';

test.describe('Visual Tests', () => {
  test('question card layouts', async ({ page }) => {
    await page.goto('/questions');
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('questions-page.png');
    
    // Component screenshot
    await expect(page.locator('[data-testid="question-card"]:first-child'))
      .toHaveScreenshot('question-card.png');
  });

  test('responsive layouts', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('dashboard-tablet.png');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('dashboard-desktop.png');
  });
});
```

## 🚀 Performance Testing

### Load Testing Setup
```javascript
// loadtest/basic-load.js
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  }
};

export default function() {
  // Test homepage
  let response = http.get('http://localhost:5173');
  check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage has content': (r) => r.body.includes('TestNest'),
  });

  sleep(1);

  // Test login page
  response = http.get('http://localhost:5173/login');
  check(response, {
    'login page loads': (r) => r.status === 200,
  });

  sleep(1);
}
```

### Bundle Size Testing
```bash
# Add to package.json
"scripts": {
  "analyze": "npx vite-bundle-analyzer dist"
}

# Run after build
npm run build
npm run analyze
```

## 📊 Test Coverage and Reporting

### Coverage Configuration
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        'src/main.jsx',
        'src/supabaseClient.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run e2e tests
        run: npx playwright test
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 🔧 Testing Utilities and Helpers

### Custom Render Function
```javascript
// src/test/utils.jsx
import { render } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

### Test Data Factories
```javascript
// src/test/factories.js
import { faker } from '@faker-js/faker';

export const createMockQuestion = (overrides = {}) => ({
  questionid: faker.number.int({ min: 1, max: 1000 }),
  question: faker.lorem.sentence() + '?',
  choice1: faker.lorem.words(3),
  choice2: faker.lorem.words(3),
  choice3: faker.lorem.words(3),
  choice4: faker.lorem.words(3),
  correctanswer: null, // Will be set to choice1 by default
  isactive: true,
  createddate: faker.date.past().toISOString(),
  ...overrides
});

// Set correct answer to choice1 if not specified
export const createValidMockQuestion = (overrides = {}) => {
  const question = createMockQuestion(overrides);
  if (!question.correctanswer) {
    question.correctanswer = question.choice1;
  }
  return question;
};

export const createMockUser = (overrides = {}) => ({
  userid: faker.number.int({ min: 1, max: 1000 }),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(['student', 'teacher']),
  isactive: true,
  createddate: faker.date.past().toISOString(),
  ...overrides
});
```

### Mock Handlers
```javascript
// src/test/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Mock Supabase Auth
  rest.post('https://your-project.supabase.co/auth/v1/token', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-token',
        user: { id: '1', email: 'test@example.com' }
      })
    );
  }),

  // Mock Questions API
  rest.get('https://your-project.supabase.co/rest/v1/questions', (req, res, ctx) => {
    return res(
      ctx.json([
        createValidMockQuestion({ questionid: 1 }),
        createValidMockQuestion({ questionid: 2 })
      ])
    );
  }),

  // Mock Create Question
  rest.post('https://your-project.supabase.co/rest/v1/questions', (req, res, ctx) => {
    return res(
      ctx.json([createValidMockQuestion({ questionid: 999 })])
    );
  })
];
```

## 📋 Testing Checklist

### Pre-Commit Testing
- [ ] All unit tests pass
- [ ] No console errors or warnings
- [ ] Code coverage meets threshold (80%+)
- [ ] ESLint passes with no errors
- [ ] TypeScript compilation (if applicable)

### Pre-Release Testing
- [ ] All tests pass in CI/CD pipeline
- [ ] E2E tests pass on multiple browsers
- [ ] Performance benchmarks meet standards
- [ ] Visual regression tests pass
- [ ] Accessibility tests pass
- [ ] Security scans complete

### Manual Testing Checklist
- [ ] Login/logout functionality
- [ ] Question CRUD operations
- [ ] Form validation and error handling
- [ ] Responsive design on different devices
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

---

For deployment testing procedures, see [Deployment Guide](DEPLOYMENT.md).
For troubleshooting test failures, see [Troubleshooting Guide](TROUBLESHOOTING.md).