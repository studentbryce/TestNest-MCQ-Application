# API Documentation

## Overview
TestNest uses Supabase as the backend, providing RESTful APIs for all operations.

## Base Setup
```javascript
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseKey);
```

## Core Operations

### Questions
```javascript
// Get all questions
const { data, error } = await supabase
  .from('questions')
  .select('*')
  .eq('isactive', true);

// Create question
const { data, error } = await supabase
  .from('questions')
  .insert([questionData]);

// Update question
const { data, error } = await supabase
  .from('questions')
  .update(updates)
  .eq('questionid', id);

// Delete question
const { data, error } = await supabase
  .from('questions')
  .update({ isactive: false })
  .eq('questionid', id);
```

### Tests
```javascript
// Get all tests
const { data, error } = await supabase
  .from('tests')
  .select('*')
  .eq('isactive', true);

// Create test
const { data, error } = await supabase
  .from('tests')
  .insert([testData]);
```

### Users
```javascript
// Get user by username
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single();

// Create user
const { data, error } = await supabase
  .from('users')
  .insert([userData]);
```

## Database Tables
- `questions`: Question data and choices
- `tests`: Test metadata  
- `users`: User accounts and roles
- `testquestions`: Links questions to tests
- `results`: Student test results

## Error Handling
All API calls return `{ data, error }`. Always check for errors:

```javascript
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('Error:', error.message);
  return;
}
// Use data
```