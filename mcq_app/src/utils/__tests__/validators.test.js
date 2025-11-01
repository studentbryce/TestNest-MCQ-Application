import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateStudentId,
  validateTutorId,
  validateQuestion,
  validateStudentRegistration,
  validateTutorRegistration,
} from '../validators'

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email+tag@example.co.uk')).toBe(true)
      expect(validateEmail('user123@domain.org')).toBe(true)
      expect(validateEmail('firstname.lastname@company.com')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@.com')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false)
      expect(validateEmail('user name@domain.com')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
      expect(validateEmail(123)).toBe(false)
      expect(validateEmail('   ')).toBe(false)
    })
  })

  describe('validateUsername', () => {
    it('validates correct username formats', () => {
      expect(validateUsername('testuser')).toBe(true)
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('test_user')).toBe(true)
      expect(validateUsername('USER_NAME_123')).toBe(true)
    })

    it('rejects invalid username formats', () => {
      expect(validateUsername('us')).toBe(false) // Too short
      expect(validateUsername('user-name')).toBe(false) // Contains hyphen
      expect(validateUsername('user name')).toBe(false) // Contains space
      expect(validateUsername('user@name')).toBe(false) // Contains special char
      expect(validateUsername('user.name')).toBe(false) // Contains dot
    })

    it('handles edge cases', () => {
      expect(validateUsername('')).toBe(false)
      expect(validateUsername(null)).toBe(false)
      expect(validateUsername(undefined)).toBe(false)
      expect(validateUsername(123)).toBe(false)
      expect(validateUsername('   ')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result1 = validatePassword('Password123')
      expect(result1.isValid).toBe(true)
      expect(result1.errors).toEqual([])

      const result2 = validatePassword('MySecurePass1')
      expect(result2.isValid).toBe(true)
      expect(result2.errors).toEqual([])
    })

    it('rejects weak passwords', () => {
      const result1 = validatePassword('12345')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('Password must be at least 6 characters long')

      const result2 = validatePassword('password')
      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('Password must contain at least one number')

      const result3 = validatePassword('123456')
      expect(result3.isValid).toBe(false)
      expect(result3.errors).toContain('Password must contain at least one letter')
    })

    it('handles edge cases', () => {
      const result1 = validatePassword('')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('Password is required')

      const result2 = validatePassword(null)
      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('Password is required')

      const longPassword = 'a'.repeat(101) + '1'
      const result3 = validatePassword(longPassword)
      expect(result3.isValid).toBe(false)
      expect(result3.errors).toContain('Password must be less than 100 characters')
    })
  })

  describe('validateStudentId', () => {
    it('validates correct student ID formats', () => {
      expect(validateStudentId('1234567')).toBe(true) // 7 digits
      expect(validateStudentId('12345678')).toBe(true) // 8 digits
      expect(validateStudentId(1234567)).toBe(true) // Number input
      expect(validateStudentId(12345678)).toBe(true) // Number input
    })

    it('rejects invalid student ID formats', () => {
      expect(validateStudentId('123456')).toBe(false) // Too short
      expect(validateStudentId('123456789')).toBe(false) // Too long
      expect(validateStudentId('abc1234')).toBe(false) // Contains letters
      expect(validateStudentId('12-34567')).toBe(false) // Contains special chars
    })

    it('handles edge cases', () => {
      expect(validateStudentId('')).toBe(false)
      expect(validateStudentId(null)).toBe(false)
      expect(validateStudentId(undefined)).toBe(false)
      expect(validateStudentId('   ')).toBe(false)
    })
  })

  describe('validateTutorId', () => {
    it('validates correct tutor ID formats', () => {
      expect(validateTutorId('1234567')).toBe(true) // 7 digits
      expect(validateTutorId('12345678')).toBe(true) // 8 digits
      expect(validateTutorId('123456789')).toBe(true) // 9 digits
      expect(validateTutorId(123456789)).toBe(true) // Number input
    })

    it('rejects invalid tutor ID formats', () => {
      expect(validateTutorId('123456')).toBe(false) // Too short
      expect(validateTutorId('1234567890')).toBe(false) // Too long
      expect(validateTutorId('abc123456')).toBe(false) // Contains letters
    })
  })

  describe('validateQuestion', () => {
    const validQuestion = {
      question: 'What is React?',
      choice1: 'A library',
      choice2: 'A framework',
      choice3: 'A language',
      choice4: 'An IDE',
      correctanswer: 'A library',
    }

    it('validates complete question object', () => {
      const result = validateQuestion(validQuestion)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('validates question with minimum required fields', () => {
      const minimalQuestion = {
        question: 'What is JavaScript?',
        choice1: 'A language',
        choice2: 'A framework',
        correctanswer: 'A language',
      }
      
      const result = validateQuestion(minimalQuestion)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('identifies missing required fields', () => {
      const incompleteQuestion = { question: 'What is React?' }
      
      const result = validateQuestion(incompleteQuestion)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Choice 1 is required')
      expect(result.errors).toContain('Choice 2 is required')
      expect(result.errors).toContain('Correct answer is required')
    })

    it('validates correct answer matches choices', () => {
      const invalidQuestion = {
        ...validQuestion,
        correctanswer: 'Invalid answer',
      }
      
      const result = validateQuestion(invalidQuestion)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Correct answer must match one of the provided choices')
    })

    it('handles edge cases', () => {
      expect(validateQuestion(null).isValid).toBe(false)
      expect(validateQuestion(undefined).isValid).toBe(false)
      expect(validateQuestion({}).isValid).toBe(false)
    })
  })

  describe('validateStudentRegistration', () => {
    const validStudentData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      studentId: '12345678',
      password: 'Password123',
      confirmPassword: 'Password123',
    }

    it('validates complete student registration data', () => {
      const result = validateStudentRegistration(validStudentData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('identifies missing required fields', () => {
      const incompleteData = {
        firstName: 'John',
        // Missing other fields
      }
      
      const result = validateStudentRegistration(incompleteData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('validates password confirmation', () => {
      const mismatchedPasswords = {
        ...validStudentData,
        confirmPassword: 'DifferentPassword123',
      }
      
      const result = validateStudentRegistration(mismatchedPasswords)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Passwords do not match')
    })
  })

  describe('validateTutorRegistration', () => {
    const validTutorData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      tutorId: '123456789',
      department: 'Computer Science',
      password: 'Password123',
      confirmPassword: 'Password123',
      accessCode: 'TUTOR2025',
    }

    it('validates complete tutor registration data', () => {
      const result = validateTutorRegistration(validTutorData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('identifies missing required fields', () => {
      const incompleteData = {
        firstName: 'Jane',
        email: 'jane@example.com',
        // Missing other fields
      }
      
      const result = validateTutorRegistration(incompleteData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('validates email format', () => {
      const invalidEmailData = {
        ...validTutorData,
        email: 'invalid-email',
      }
      
      const result = validateTutorRegistration(invalidEmailData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Valid email address is required')
    })
  })
})