# API Documentation

This document provides comprehensive documentation of the TestNest MCQ application's API interactions, Supabase integration, and data flow patterns.

## 📡 API Overview

### Backend Architecture
- **Backend Service**: Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL with real-time capabilities
- **Authentication**: Supabase Auth (JWT-based)
- **API Style**: RESTful with real-time subscriptions
- **Client Library**: @supabase/supabase-js

### Base Configuration
```javascript
// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## 🔐 Authentication API

### User Registration
```javascript
// Register new student
const registerStudent = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      username: userData.username,
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      role: 'student'
    }])
    .select();

  return { data, error };
};
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Unique username |
| firstname | string | Yes | Student's first name |
| lastname | string | Yes | Student's last name |
| email | string | No | Student's email |

**Response:**
```javascript
// Success
{
  data: [{
    userid: 123,
    username: "student1",
    firstname: "John",
    lastname: "Doe",
    role: "student",
    datecreated: "2023-01-01T12:00:00Z"
  }],
  error: null
}

// Error
{
  data: null,
  error: {
    message: "duplicate key value violates unique constraint",
    code: "23505"
  }
}
```

### User Authentication
```javascript
// Tutor login
const authenticateTutor = async (tutorId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', tutorId)
    .eq('role', 'tutor')
    .single();

  return { data, error };
};

// Student login
const authenticateStudent = async (username) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('role', 'student')
    .single();

  return { data, error };
};
```

## 👥 User Management API

### Fetch Users
```javascript
// Get all students
const fetchStudents = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('datecreated', { ascending: false });

  return { data, error };
};

// Get user by ID
const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('userid', userId)
    .single();

  return { data, error };
};
```

### Update User Information
```javascript
const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('userid', userId)
    .select();

  return { data, error };
};
```

**Updatable Fields:**
- `firstname`
- `lastname`
- `email`
- `lastlogin`
- `isactive`

## ❓ Questions Management API

### Create Question
```javascript
const createQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from('questions')
    .insert([{
      question: questionData.question,
      choice1: questionData.choice1,
      choice2: questionData.choice2,
      choice3: questionData.choice3 || null,
      choice4: questionData.choice4 || null,
      answer: questionData.answer,
      category: questionData.category || 'general',
      difficulty: questionData.difficulty || 'medium'
    }])
    .select();

  return { data, error };
};
```

**Request Schema:**
```javascript
{
  question: "What is the capital of France?",
  choice1: "London",
  choice2: "Paris",
  choice3: "Berlin",
  choice4: "Madrid",
  answer: 2, // Integer 1-4
  category: "geography", // Optional
  difficulty: "easy" // Optional: easy, medium, hard
}
```

### Fetch Questions
```javascript
// Get all active questions
const fetchQuestions = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('isactive', true)
    .order('questionid', { ascending: true });

  return { data, error };
};

// Get questions by category
const fetchQuestionsByCategory = async (category) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', category)
    .eq('isactive', true);

  return { data, error };
};

// Get questions for a specific test
const fetchTestQuestions = async (testId) => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      testquestions!inner (
        testid,
        questionorder,
        points
      )
    `)
    .eq('testquestions.testid', testId)
    .order('testquestions.questionorder');

  return { data, error };
};
```

### Update Question
```javascript
const updateQuestion = async (questionId, updates) => {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('questionid', questionId)
    .select();

  return { data, error };
};
```

### Delete Question
```javascript
const deleteQuestion = async (questionId) => {
  const { data, error } = await supabase
    .from('questions')
    .update({ isactive: false }) // Soft delete
    .eq('questionid', questionId);

  return { data, error };
};
```

## 📝 Tests Management API

### Create Test
```javascript
const createTest = async (testData) => {
  const { data, error } = await supabase
    .from('tests')
    .insert([{
      title: testData.title,
      description: testData.description,
      duration: testData.duration,
      passinggrade: testData.passinggrade,
      createdby: testData.createdby
    }])
    .select();

  return { data, error };
};
```

### Fetch Tests
```javascript
// Get all active tests
const fetchTests = async () => {
  const { data, error } = await supabase
    .from('tests')
    .select(`
      *,
      testquestions (count)
    `)
    .eq('isactive', true)
    .order('datecreated', { ascending: false });

  return { data, error };
};

// Get test with questions
const fetchTestWithQuestions = async (testId) => {
  const { data: test, error: testError } = await supabase
    .from('tests')
    .select('*')
    .eq('testid', testId)
    .single();

  if (testError) return { data: null, error: testError };

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      *,
      testquestions!inner (
        questionorder,
        points
      )
    `)
    .eq('testquestions.testid', testId)
    .order('testquestions.questionorder');

  return { 
    data: { ...test, questions }, 
    error: questionsError 
  };
};
```

### Link Questions to Test
```javascript
const addQuestionToTest = async (testId, questionId, order = 1, points = 1.0) => {
  const { data, error } = await supabase
    .from('testquestions')
    .insert([{
      testid: testId,
      questionid: questionId,
      questionorder: order,
      points: points
    }]);

  return { data, error };
};
```

## 📊 Results Management API

### Submit Test Result
```javascript
const submitTestResult = async (resultData) => {
  const { data, error } = await supabase
    .from('results')
    .insert([{
      studentid: resultData.studentid,
      testid: resultData.testid,
      score: resultData.score,
      totalquestions: resultData.totalquestions,
      correctanswers: resultData.correctanswers,
      timetaken: resultData.timetaken,
      answers: resultData.answers, // JSONB format
      status: 'completed'
    }])
    .select();

  return { data, error };
};
```

**Answers JSONB Format:**
```javascript
{
  "1": {
    "questionId": 1,
    "selectedAnswer": 2,
    "correctAnswer": 3,
    "isCorrect": false,
    "timeSpent": 45
  },
  "2": {
    "questionId": 2,
    "selectedAnswer": 1,
    "correctAnswer": 1,
    "isCorrect": true,
    "timeSpent": 32
  }
}
```

### Fetch Results
```javascript
// Get student results
const fetchStudentResults = async (studentId) => {
  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      tests (
        title,
        description,
        totalquestions
      )
    `)
    .eq('studentid', studentId)
    .order('datecompleted', { ascending: false });

  return { data, error };
};

// Get test results for all students
const fetchTestResults = async (testId) => {
  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      users (
        firstname,
        lastname,
        username
      )
    `)
    .eq('testid', testId)
    .order('score', { ascending: false });

  return { data, error };
};

// Get specific result details
const fetchResultDetails = async (resultId) => {
  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      users (
        firstname,
        lastname,
        username
      ),
      tests (
        title,
        description
      )
    `)
    .eq('resultid', resultId)
    .single();

  return { data, error };
};
```

## 🔄 Real-time Subscriptions

### Subscribe to New Results
```javascript
const subscribeToResults = (callback) => {
  const subscription = supabase
    .channel('results-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'results'
      },
      callback
    )
    .subscribe();

  return subscription;
};

// Usage
const unsubscribe = subscribeToResults((payload) => {
  console.log('New result:', payload.new);
  // Update UI with new result
});

// Cleanup
unsubscribe();
```

### Subscribe to User Changes
```javascript
const subscribeToUsers = (callback) => {
  return supabase
    .channel('users-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users'
      },
      callback
    )
    .subscribe();
};
```

## 🔍 Advanced Queries

### Analytics Queries
```javascript
// Get test statistics
const getTestStatistics = async (testId) => {
  const { data, error } = await supabase
    .rpc('get_test_statistics', {
      test_id: testId
    });

  return { data, error };
};

// Custom RPC function for complex analytics
const getStudentPerformance = async (studentId, dateFrom, dateTo) => {
  const { data, error } = await supabase
    .rpc('get_student_performance', {
      student_id: studentId,
      date_from: dateFrom,
      date_to: dateTo
    });

  return { data, error };
};
```

### Aggregated Data
```javascript
// Get dashboard statistics
const getDashboardStats = async () => {
  // Total students
  const { count: totalStudents } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  // Total questions
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('isactive', true);

  // Total tests completed
  const { count: totalResults } = await supabase
    .from('results')
    .select('*', { count: 'exact', head: true });

  // Average score
  const { data: avgScore } = await supabase
    .from('results')
    .select('score')
    .then(response => {
      const scores = response.data?.map(r => r.score) || [];
      const average = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;
      return { data: average };
    });

  return {
    totalStudents,
    totalQuestions,
    totalResults,
    averageScore: avgScore.data
  };
};
```

## 🚨 Error Handling

### Common Error Patterns
```javascript
// Generic error handler
const handleSupabaseError = (error) => {
  if (!error) return null;

  switch (error.code) {
    case '23505': // Unique violation
      return 'This username already exists. Please choose a different one.';
    
    case '23503': // Foreign key violation
      return 'Referenced record does not exist.';
    
    case 'PGRST116': // No rows returned
      return 'Record not found.';
    
    case '42501': // Insufficient privileges
      return 'You do not have permission to perform this action.';
    
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

// Usage in components
const createQuestion = async (questionData) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData]);

    if (error) {
      const friendlyError = handleSupabaseError(error);
      throw new Error(friendlyError);
    }

    return data;
  } catch (error) {
    console.error('Failed to create question:', error);
    throw error;
  }
};
```

### Retry Logic
```javascript
// Retry function with exponential backoff
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
};

// Usage
const fetchQuestionsWithRetry = () => 
  retryOperation(() => fetchQuestions(), 3, 500);
```

## 📋 Rate Limiting & Performance

### Batch Operations
```javascript
// Batch insert questions
const createQuestionsBatch = async (questions) => {
  const { data, error } = await supabase
    .from('questions')
    .insert(questions)
    .select();

  return { data, error };
};

// Batch update results
const updateResultsBatch = async (updates) => {
  const promises = updates.map(update => 
    supabase
      .from('results')
      .update(update.data)
      .eq('resultid', update.id)
  );

  return await Promise.all(promises);
};
```

### Pagination
```javascript
// Paginated fetch with cursor
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

## 🛡 Security Considerations

### Row Level Security (RLS)
```javascript
// Queries automatically respect RLS policies
// Students can only see their own results
const fetchMyResults = async (studentId) => {
  // RLS ensures only student's own results are returned
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('studentid', studentId);

  return { data, error };
};
```

### Data Validation
```javascript
// Client-side validation before API calls
const validateQuestionData = (data) => {
  const errors = [];

  if (!data.question?.trim()) {
    errors.push('Question text is required');
  }

  if (!data.choice1?.trim() || !data.choice2?.trim()) {
    errors.push('At least two choices are required');
  }

  if (data.answer < 1 || data.answer > 4) {
    errors.push('Answer must be between 1 and 4');
  }

  return errors;
};
```

---

For more details on database schema and relationships, see [Database Schema Documentation](DATABASE_SCHEMA.md).
For implementation examples, see [Developer Guide](DEVELOPER_GUIDE.md).