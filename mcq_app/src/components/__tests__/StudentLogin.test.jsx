import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentLogin from '../../StudentLogin'
import { supabase } from '../../../supabaseClient'

vi.mock('../../../supabaseClient')

describe('StudentLogin Component', () => {
  const mockOnLogin = vi.fn()
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form elements', () => {
    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByText(/back to home/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    const loginButton = screen.getByRole('button', { name: /login/i })
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
    })
  })

  it('validates student ID format', async () => {
    const user = userEvent.setup()
    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    await user.type(screen.getByLabelText(/student id/i), '123') // Too short
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/student id must be 7-8 digits/i)).toBeInTheDocument()
    })
  })

  it('calls onLogin with correct user data on successful authentication', async () => {
    const user = userEvent.setup()
    const mockStudentData = {
      studentid: 12345678,
      firstname: 'Test',
      lastname: 'Student',
      username: 'teststudent',
      role: 'student'
    }

    // Mock successful database response
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockStudentData, error: null })
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        studentId: 12345678,
        name: 'Test Student',
        userName: 'teststudent',
        role: 'student'
      })
    })
  })

  it('shows error message for invalid credentials', async () => {
    const user = userEvent.setup()
    
    // Mock failed database response
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' })
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid student id or password/i)).toBeInTheDocument()
    })
  })

  it('prevents non-student users from logging in', async () => {
    const user = userEvent.setup()
    const mockTutorData = {
      studentid: 12345678,
      firstname: 'Test',
      lastname: 'Tutor',
      username: 'testtutor',
      role: 'tutor'
    }

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockTutorData, error: null })
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/access denied.*student.*only/i)).toBeInTheDocument()
    })
  })

  it('disables login button during authentication', async () => {
    const user = userEvent.setup()
    
    // Mock a slow response
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: global.testUser.student, error: null }), 100)
      ))
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    const loginButton = screen.getByRole('button', { name: /login/i })
    await user.click(loginButton)
    
    // Button should be disabled during loading
    expect(loginButton).toBeDisabled()
  })

  it('navigates back to home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    const backButton = screen.getByText(/back to home/i)
    await user.click(backButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('home')
  })

  it('navigates to student registration', async () => {
    const user = userEvent.setup()
    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    const registerLink = screen.getByText(/create.*account/i)
    await user.click(registerLink)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('student-register')
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error('Network error'))
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    render(<StudentLogin onLogin={mockOnLogin} onNavigate={mockOnNavigate} />)
    
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/login failed.*try again/i)).toBeInTheDocument()
    })
  })
})