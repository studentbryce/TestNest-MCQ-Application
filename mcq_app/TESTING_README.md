# TestNest MCQ Application - Unit Testing Suite

## Overview

This comprehensive unit testing suite covers the main functions and components of the TestNest MCQ application. The tests are built using Vitest, React Testing Library, and include utilities for mocking Supabase operations.

## Test Structure

```
src/
├── test/
│   ├── setup.js                 # Test configuration and global mocks
│   └── integration.test.jsx     # Integration tests
├── utils/__tests__/
│   ├── validators.test.js       # Validation utility tests (25 tests)
│   ├── auth.test.js            # Authentication utility tests
│   └── dateTime.test.js        # Date/time utility tests
└── components/__tests__/
    ├── App.test.jsx            # Main app component tests
    ├── StudentLogin.test.jsx   # Student login component tests
    ├── StudentRegister.test.jsx # Student registration tests
    └── Results.test.jsx        # Results display component tests
```

## Test Coverage Areas

### 1. Utility Functions (`src/utils/`)
- **Validators**: Email, username, password, student ID, tutor ID validation
- **Authentication**: User login, password hashing, user existence checks
- **Date/Time**: ISO timestamp formatting, time difference calculations

### 2. React Components (`src/components/`)
- **App**: Navigation, user state management, page rendering
- **StudentLogin**: Form validation, authentication flow, error handling
- **StudentRegister**: Registration validation, database operations, success flow
- **Results**: Data display, date formatting, percentage calculations

### 3. Integration Tests
- Component communication
- Database error handling
- Authentication flows
- Performance validation

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (recommended for development)
```bash
npm run test:watch
```

### Run Once (CI/CD)
```bash
npm run test:run
```

### Coverage Report
```bash
npm run test:coverage
```

### Interactive UI
```bash
npm run test:ui
```

## Test Features

### 🔧 Mocking
- **Supabase Client**: Fully mocked for isolated testing
- **CryptoJS**: Password hashing simulation
- **Date/Time**: Consistent timestamp handling

### 📊 Validation Testing
- Input validation edge cases
- Error message accuracy
- Form submission handling
- Data format compliance

### 🔐 Authentication Testing
- Login success/failure scenarios
- Role-based access control
- Password security validation
- User existence verification

### 🎯 Component Testing
- User interaction simulation
- Form handling and validation
- State management verification
- Error boundary testing

### 📱 Integration Testing
- Cross-component communication
- Database interaction flows
- Navigation state management
- Performance monitoring

## Test Configuration

### Vitest Config (`vitest.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### Setup File (`src/test/setup.js`)
- Global test utilities
- Mock implementations
- Test data fixtures
- Cleanup functions

## Test Data

### Mock Users
```javascript
global.testUser = {
  tutor: {
    tutorid: 12345678,
    firstname: 'Test',
    lastname: 'Tutor',
    username: 'test@example.com',
    role: 'tutor',
    department: 'Computer Science'
  },
  student: {
    studentid: 87654321,
    firstname: 'Test',
    lastname: 'Student',
    username: 'teststudent',
    role: 'student'
  }
}
```

### Mock Questions
```javascript
global.testQuestions = [
  {
    questionid: 1,
    question: 'What is React?',
    choice1: 'A library',
    choice2: 'A framework',
    choice3: 'A language',
    choice4: 'An IDE',
    correctanswer: 'A library'
  }
]
```

## Key Testing Patterns

### 1. Component Rendering
```javascript
it('renders component correctly', () => {
  render(<Component />)
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

### 2. User Interactions
```javascript
it('handles user input', async () => {
  const user = userEvent.setup()
  render(<Component />)
  await user.type(screen.getByLabelText(/input/i), 'test value')
  expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
})
```

### 3. Async Operations
```javascript
it('handles async operations', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### 4. Error Scenarios
```javascript
it('handles errors gracefully', async () => {
  // Mock error response
  supabase.from.mockReturnValue({
    select: vi.fn().mockRejectedValue(new Error('Database error'))
  })
  
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Best Practices

### ✅ Do
- Test user-facing behavior, not implementation details
- Use semantic queries (`getByRole`, `getByLabelText`)
- Mock external dependencies (Supabase, crypto)
- Test error scenarios and edge cases
- Verify accessibility features

### ❌ Don't
- Test internal component state directly
- Mock React internals
- Write tests that depend on specific DOM structure
- Ignore async operations
- Skip error boundary testing

## Continuous Integration

Tests are designed to run in CI/CD environments:

```bash
# Install dependencies
npm ci

# Run all tests
npm run test:run

# Generate coverage report
npm run test:coverage
```

## Test Results Interpretation

### Coverage Targets
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Key Metrics
- All validation functions: 100% coverage
- Authentication flows: 95%+ coverage
- Component rendering: 90%+ coverage
- Error handling: 85%+ coverage

## Debugging Test Issues

### Common Issues
1. **Mock not working**: Check mock implementation in `setup.js`
2. **Async test failing**: Use `waitFor()` or `findBy` queries
3. **Component not found**: Verify component exports and imports
4. **Database mock errors**: Check Supabase mock configuration

### Debug Commands
```bash
# Run specific test file
npx vitest validators.test.js

# Run with verbose output
npx vitest --reporter=verbose

# Debug mode
npx vitest --inspect-brk
```

This comprehensive testing suite ensures the reliability, security, and performance of the TestNest MCQ Application's core functionality.