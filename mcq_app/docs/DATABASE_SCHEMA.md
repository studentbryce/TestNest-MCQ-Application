# Database Schema Documentation

This document provides comprehensive documentation of the TestNest MCQ application's database schema, relationships, and data models.

## 📊 Database Overview

### Database Management System
- **Type**: PostgreSQL (via Supabase)
- **Version**: PostgreSQL 13+
- **Features Used**:
  - JSONB data types
  - UUID primary keys
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Foreign key constraints

### Schema Design Principles
- **Normalized Structure**: Reduces data redundancy
- **Referential Integrity**: Enforced through foreign keys
- **Scalability**: Designed to handle growing user base
- **Security**: RLS policies protect user data
- **Flexibility**: Accommodates future feature additions

## 🏗 Table Structure

### 1. Users Table

Stores information for both students and tutors.

```sql
CREATE TABLE users (
  userid SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'tutor')),
  datecreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastlogin TIMESTAMP,
  isactive BOOLEAN DEFAULT true
);
```

#### Field Descriptions
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `userid` | SERIAL | Primary key, auto-incrementing | NOT NULL, PRIMARY KEY |
| `username` | VARCHAR(50) | Unique identifier for login | UNIQUE, NOT NULL |
| `firstname` | VARCHAR(100) | User's first name | NOT NULL |
| `lastname` | VARCHAR(100) | User's last name | NOT NULL |
| `email` | VARCHAR(100) | User's email address | Optional |
| `role` | VARCHAR(20) | User role (student/tutor) | CHECK constraint |
| `datecreated` | TIMESTAMP | Account creation date | DEFAULT CURRENT_TIMESTAMP |
| `lastlogin` | TIMESTAMP | Last login timestamp | Optional |
| `isactive` | BOOLEAN | Account status | DEFAULT true |

#### Indexes
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

### 2. Questions Table

Stores individual MCQ questions with choices and correct answers.

```sql
CREATE TABLE questions (
  questionid SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  choice1 TEXT NOT NULL,
  choice2 TEXT NOT NULL,
  choice3 TEXT,
  choice4 TEXT,
  answer INTEGER NOT NULL CHECK (answer BETWEEN 1 AND 4),
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category VARCHAR(50) DEFAULT 'general',
  datecreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdby INTEGER REFERENCES users(userid),
  isactive BOOLEAN DEFAULT true
);
```

#### Field Descriptions
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `questionid` | SERIAL | Primary key | NOT NULL, PRIMARY KEY |
| `question` | TEXT | The question content | NOT NULL |
| `choice1` | TEXT | First choice (required) | NOT NULL |
| `choice2` | TEXT | Second choice (required) | NOT NULL |
| `choice3` | TEXT | Third choice (optional) | Optional |
| `choice4` | TEXT | Fourth choice (optional) | Optional |
| `answer` | INTEGER | Correct answer (1-4) | CHECK constraint |
| `difficulty` | VARCHAR(20) | Question difficulty level | CHECK constraint |
| `category` | VARCHAR(50) | Question category/subject | Optional |
| `datecreated` | TIMESTAMP | Creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| `createdby` | INTEGER | Foreign key to users table | REFERENCES users |
| `isactive` | BOOLEAN | Question status | DEFAULT true |

#### Indexes
```sql
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_createdby ON questions(createdby);
```

### 3. Tests Table

Defines test configurations and metadata.

```sql
CREATE TABLE tests (
  testid SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 30 CHECK (duration > 0),
  totalquestions INTEGER DEFAULT 0,
  passinggrade DECIMAL(5,2) DEFAULT 60.00 CHECK (passinggrade >= 0 AND passinggrade <= 100),
  isactive BOOLEAN DEFAULT true,
  datecreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdby INTEGER REFERENCES users(userid)
);
```

#### Field Descriptions
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `testid` | SERIAL | Primary key | NOT NULL, PRIMARY KEY |
| `title` | VARCHAR(200) | Test title | NOT NULL |
| `description` | TEXT | Test description | Optional |
| `duration` | INTEGER | Time limit in minutes | CHECK > 0 |
| `totalquestions` | INTEGER | Number of questions | DEFAULT 0 |
| `passinggrade` | DECIMAL(5,2) | Minimum passing percentage | CHECK 0-100 |
| `isactive` | BOOLEAN | Test availability status | DEFAULT true |
| `datecreated` | TIMESTAMP | Creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| `createdby` | INTEGER | Foreign key to users table | REFERENCES users |

### 4. TestQuestions Table

Junction table linking tests to questions.

```sql
CREATE TABLE testquestions (
  testquestionid SERIAL PRIMARY KEY,
  testid INTEGER NOT NULL REFERENCES tests(testid) ON DELETE CASCADE,
  questionid INTEGER NOT NULL REFERENCES questions(questionid) ON DELETE CASCADE,
  questionorder INTEGER DEFAULT 1,
  points DECIMAL(5,2) DEFAULT 1.00,
  UNIQUE(testid, questionid)
);
```

#### Field Descriptions
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `testquestionid` | SERIAL | Primary key | NOT NULL, PRIMARY KEY |
| `testid` | INTEGER | Foreign key to tests | REFERENCES tests |
| `questionid` | INTEGER | Foreign key to questions | REFERENCES questions |
| `questionorder` | INTEGER | Order within test | DEFAULT 1 |
| `points` | DECIMAL(5,2) | Points for this question | DEFAULT 1.00 |

#### Constraints
```sql
UNIQUE(testid, questionid) -- Prevents duplicate questions in same test
```

### 5. Results Table

Stores student test results and answers.

```sql
CREATE TABLE results (
  resultid SERIAL PRIMARY KEY,
  studentid INTEGER NOT NULL REFERENCES users(userid),
  testid INTEGER NOT NULL REFERENCES tests(testid),
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  totalquestions INTEGER NOT NULL,
  correctanswers INTEGER NOT NULL,
  timetaken INTEGER, -- in minutes
  answers JSONB, -- stores all answers as JSON
  datecompleted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'submitted'))
);
```

#### Field Descriptions
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `resultid` | SERIAL | Primary key | NOT NULL, PRIMARY KEY |
| `studentid` | INTEGER | Foreign key to users | REFERENCES users |
| `testid` | INTEGER | Foreign key to tests | REFERENCES tests |
| `score` | DECIMAL(5,2) | Percentage score | CHECK 0-100 |
| `totalquestions` | INTEGER | Total questions in test | NOT NULL |
| `correctanswers` | INTEGER | Number of correct answers | NOT NULL |
| `timetaken` | INTEGER | Time spent in minutes | Optional |
| `answers` | JSONB | Student answers as JSON | Optional |
| `datecompleted` | TIMESTAMP | Completion timestamp | DEFAULT CURRENT_TIMESTAMP |
| `status` | VARCHAR(20) | Result status | CHECK constraint |

#### JSONB Structure for Answers
```json
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

## 🔗 Relationships

### Entity Relationship Diagram
```
users (1) ──────── (M) questions [createdby]
users (1) ──────── (M) tests [createdby]
users (1) ──────── (M) results [studentid]
tests (1) ──────── (M) testquestions [testid]
questions (1) ──── (M) testquestions [questionid]
tests (1) ──────── (M) results [testid]
```

### Foreign Key Relationships

1. **questions.createdby → users.userid**
   - Questions are created by tutors
   - CASCADE on update, SET NULL on delete

2. **tests.createdby → users.userid**
   - Tests are created by tutors
   - CASCADE on update, SET NULL on delete

3. **testquestions.testid → tests.testid**
   - Test questions belong to tests
   - CASCADE on delete

4. **testquestions.questionid → questions.questionid**
   - Test questions reference questions
   - CASCADE on delete

5. **results.studentid → users.userid**
   - Results belong to students
   - CASCADE on update, RESTRICT on delete

6. **results.testid → tests.testid**
   - Results are for specific tests
   - CASCADE on update, RESTRICT on delete

## 🛡 Security & Constraints

### Row Level Security (RLS) Policies

#### Users Table
```sql
-- Students can only read their own data
CREATE POLICY student_own_data ON users
FOR SELECT USING (userid = auth.uid() OR role = 'student');

-- Tutors can read all student data
CREATE POLICY tutor_read_students ON users
FOR SELECT USING (role = 'tutor');
```

#### Questions Table
```sql
-- Anyone can read active questions
CREATE POLICY read_active_questions ON questions
FOR SELECT USING (isactive = true);

-- Only tutors can modify questions
CREATE POLICY tutor_manage_questions ON questions
FOR ALL USING (auth.role() = 'tutor');
```

#### Results Table
```sql
-- Students can only see their own results
CREATE POLICY student_own_results ON results
FOR SELECT USING (studentid = auth.uid());

-- Tutors can see all results
CREATE POLICY tutor_see_all_results ON results
FOR SELECT USING (auth.role() = 'tutor');
```

### Data Validation Constraints

#### Check Constraints
```sql
-- Score must be between 0 and 100
CHECK (score >= 0 AND score <= 100)

-- Answer must be 1, 2, 3, or 4
CHECK (answer BETWEEN 1 AND 4)

-- Role must be valid
CHECK (role IN ('student', 'tutor'))

-- Duration must be positive
CHECK (duration > 0)
```

#### Unique Constraints
```sql
-- Username must be unique
UNIQUE(username)

-- One question per test (no duplicates)
UNIQUE(testid, questionid)
```

## 📈 Performance Optimization

### Indexing Strategy

#### Primary Indexes (Automatic)
- All PRIMARY KEY columns have automatic indexes
- All UNIQUE constraints have automatic indexes

#### Custom Indexes
```sql
-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Question searches
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(isactive);

-- Test administration
CREATE INDEX idx_tests_active ON tests(isactive);
CREATE INDEX idx_tests_created ON tests(datecreated);

-- Result analytics
CREATE INDEX idx_results_student_test ON results(studentid, testid);
CREATE INDEX idx_results_date ON results(datecompleted);
CREATE INDEX idx_results_score ON results(score);

-- JSONB queries on answers
CREATE INDEX idx_results_answers ON results USING gin(answers);
```

### Query Optimization Tips

#### Efficient Queries
```sql
-- Get student results with test details
SELECT r.*, t.title, t.description
FROM results r
JOIN tests t ON r.testid = t.testid
WHERE r.studentid = $1
ORDER BY r.datecompleted DESC;

-- Get questions for a test
SELECT q.*, tq.questionorder, tq.points
FROM questions q
JOIN testquestions tq ON q.questionid = tq.questionid
WHERE tq.testid = $1
ORDER BY tq.questionorder;
```

## 🔄 Data Migration & Versioning

### Migration Scripts Location
```
/docs/database/migrations/
├── 001_initial_schema.sql
├── 002_add_indexes.sql
├── 003_add_rls_policies.sql
└── 004_sample_data.sql
```

### Version Control
- Each migration has a sequential number
- Migrations are idempotent (can run multiple times)
- Track applied migrations in `schema_migrations` table

### Backup Strategy
```sql
-- Daily backup command
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d).sql

-- Restore command
psql -h hostname -U username -d database_name < backup_file.sql
```

## 🧪 Sample Data

### Test Users
```sql
INSERT INTO users (username, firstname, lastname, role) VALUES
('admin', 'System', 'Administrator', 'tutor'),
('teacher1', 'John', 'Doe', 'tutor'),
('student1', 'Jane', 'Smith', 'student');
```

### Sample Questions
```sql
INSERT INTO questions (question, choice1, choice2, choice3, choice4, answer) VALUES
('What is 2 + 2?', '3', '4', '5', '6', 2),
('Capital of France?', 'London', 'Paris', 'Berlin', 'Madrid', 2);
```

## 📊 Analytics Queries

### Common Analytics
```sql
-- Average score by test
SELECT t.title, AVG(r.score) as avg_score
FROM tests t
JOIN results r ON t.testid = r.testid
GROUP BY t.testid, t.title;

-- Question difficulty analysis
SELECT difficulty, COUNT(*), AVG(score)
FROM questions q
JOIN testquestions tq ON q.questionid = tq.questionid
JOIN results r ON tq.testid = r.testid
GROUP BY difficulty;

-- Student performance over time
SELECT DATE_TRUNC('month', datecompleted) as month,
       AVG(score) as avg_score
FROM results
WHERE studentid = $1
GROUP BY month
ORDER BY month;
```

---

For implementation details, see [API Documentation](API_DOCUMENTATION.md) and [Developer Guide](DEVELOPER_GUIDE.md).