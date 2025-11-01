import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authenticateTutor, authenticateStudent, checkUserExists, hashPassword } from '../auth'

describe('Authentication Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('returns hashed password', () => {
      const result = hashPassword('testpassword')
      expect(result).toBe('hashed_password_mock')
    })
  })

  describe('authenticateTutor', () => {
    const mockTutorData = {
      tutorid: 12345678,
      firstname: 'Test',
      lastname: 'Tutor',
      username: 'test@example.com',
      role: 'tutor',
      department: 'Computer Science',
    }

    it('successfully authenticates tutor with email', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTutorData, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateTutor('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user.name).toBe('Test Tutor')
      expect(result.user.role).toBe('tutor')
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('successfully authenticates tutor with tutor ID', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTutorData, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateTutor('12345678', 'password123')

      expect(result.success).toBe(true)
      expect(result.user.tutorId).toBe(12345678)
    })

    it('fails authentication with invalid credentials', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateTutor('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('rejects non-tutor users', async () => {
      const studentData = { ...mockTutorData, role: 'student' }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: studentData, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateTutor('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Access denied. Tutor login only.')
    })

    it('handles invalid identifier format', async () => {
      const result = await authenticateTutor('invalid-format', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid identifier format')
    })

    it('handles database errors', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error')),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateTutor('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })
  })

  describe('authenticateStudent', () => {
    const mockStudentData = {
      studentid: 87654321,
      firstname: 'Test',
      lastname: 'Student',
      username: 'teststudent',
      role: 'student',
    }

    it('successfully authenticates student', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockStudentData, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateStudent('87654321', 'password123')

      expect(result.success).toBe(true)
      expect(result.user.studentId).toBe(87654321)
      expect(result.user.name).toBe('Test Student')
      expect(result.user.role).toBe('student')
    })

    it('fails authentication with invalid student ID format', async () => {
      const result = await authenticateStudent('123', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid student ID format')
    })

    it('fails authentication with invalid credentials', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateStudent('87654321', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid student ID or password')
    })

    it('rejects non-student users', async () => {
      const tutorData = { ...mockStudentData, role: 'tutor' }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: tutorData, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await authenticateStudent('87654321', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Access denied. Student login only.')
    })
  })

  describe('checkUserExists', () => {
    it('returns true when user exists by username', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { username: 'testuser' }, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await checkUserExists('testuser', 'username')

      expect(result).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('returns false when user does not exist', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await checkUserExists('nonexistentuser', 'username')

      expect(result).toBe(false)
    })

    it('checks student existence by student ID', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { username: 'student' }, error: null }),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await checkUserExists('12345678', 'student')

      expect(result).toBe(true)
    })

    it('returns false for invalid student ID format', async () => {
      const result = await checkUserExists('invalid', 'student')

      expect(result).toBe(false)
    })

    it('handles database errors gracefully', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error')),
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      })

      const result = await checkUserExists('testuser', 'username')

      expect(result).toBe(false)
    })
  })
})