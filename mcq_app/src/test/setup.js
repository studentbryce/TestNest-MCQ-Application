import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          or: vi.fn(),
          limit: vi.fn(),
        })),
        or: vi.fn(() => ({
          single: vi.fn(),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    })),
  },
}))

// Mock CryptoJS
vi.mock('crypto-js', () => ({
  default: {
    SHA256: vi.fn(() => ({
      toString: vi.fn(() => 'hashed_password_mock'),
    })),
  },
  SHA256: vi.fn(() => ({
    toString: vi.fn(() => 'hashed_password_mock'),
  })),
}))

// Cleanup after each test case
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Global test utilities
global.testUser = {
  tutor: {
    tutorid: 12345678,
    firstname: 'Test',
    lastname: 'Tutor',
    username: 'test@example.com',
    role: 'tutor',
    department: 'Computer Science',
  },
  student: {
    studentid: 87654321,
    firstname: 'Test',
    lastname: 'Student',
    username: 'teststudent',
    role: 'student',
  },
}

global.testQuestions = [
  {
    questionid: 1,
    question: 'What is React?',
    choice1: 'A library',
    choice2: 'A framework',
    choice3: 'A language',
    choice4: 'An IDE',
    correctanswer: 'A library',
  },
  {
    questionid: 2,
    question: 'What does JSX stand for?',
    choice1: 'JavaScript XML',
    choice2: 'Java Syntax Extension',
    choice3: 'JSON XML',
    choice4: 'JavaScript Extended',
    correctanswer: 'JavaScript XML',
  },
]