import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentRegister from '../../StudentRegister'
import { supabase } from '../../../supabaseClient'

vi.mock('../../../supabaseClient')

describe('StudentRegister Component', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form elements', () => {
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows validation error for empty fields', async () => {
    const user = userEvent.setup()
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    const registerButton = screen.getByRole('button', { name: /register/i })
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    const user = userEvent.setup()
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with mismatched passwords
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
    
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with short password
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/^password$/i), '123')
    await user.type(screen.getByLabelText(/confirm password/i), '123')
    
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('validates student ID format', async () => {
    const user = userEvent.setup()
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with invalid student ID
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '123') // Too short
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/student id must be 7-8 digits/i)).toBeInTheDocument()
    })
  })

  it('checks for existing student ID and username', async () => {
    const user = userEvent.setup()
    
    // Mock database response indicating user exists
    const mockQuery = {
      or: vi.fn().mockResolvedValue({ 
        data: [{ studentid: 12345678, username: 'johndoe' }], 
        error: null 
      })
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/student id or username already registered/i)).toBeInTheDocument()
    })
  })

  it('successfully registers new student', async () => {
    const user = userEvent.setup()
    
    // Mock database responses
    const mockCheckQuery = {
      or: vi.fn().mockResolvedValue({ data: null, error: null })
    }
    
    const mockInsertQuery = {
      insert: vi.fn().mockResolvedValue({ error: null })
    }
    
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(mockCheckQuery)
    }).mockReturnValueOnce(mockInsertQuery)

    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
    })
    
    // Should navigate to login after success
    await waitFor(() => {
      expect(mockOnNavigate).toHaveBeenCalledWith('student-login')
    }, { timeout: 3000 })
  })

  it('handles database insertion errors', async () => {
    const user = userEvent.setup()
    
    // Mock successful check but failed insertion
    const mockCheckQuery = {
      or: vi.fn().mockResolvedValue({ data: null, error: null })
    }
    
    const mockInsertQuery = {
      insert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } })
    }
    
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(mockCheckQuery)
    }).mockReturnValueOnce(mockInsertQuery)

    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/registration failed.*try again/i)).toBeInTheDocument()
    })
  })

  it('disables register button during submission', async () => {
    const user = userEvent.setup()
    
    // Mock slow responses
    const mockCheckQuery = {
      or: vi.fn().mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: null, error: null }), 100)
      ))
    }
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockCheckQuery)
    })

    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/username/i), 'johndoe')
    await user.type(screen.getByLabelText(/student id/i), '12345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    const registerButton = screen.getByRole('button', { name: /register/i })
    await user.click(registerButton)
    
    // Button should be disabled during loading
    expect(registerButton).toBeDisabled()
  })

  it('navigates back to home when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    const backButton = screen.getByText(/back to home/i)
    await user.click(backButton)
    
    expect(mockOnNavigate).toHaveBeenCalledWith('home')
  })

  it('updates form data correctly', async () => {
    const user = userEvent.setup()
    render(<StudentRegister onNavigate={mockOnNavigate} />)
    
    const firstNameInput = screen.getByLabelText(/first name/i)
    const usernameInput = screen.getByLabelText(/username/i)
    
    await user.type(firstNameInput, 'John')
    await user.type(usernameInput, 'johndoe')
    
    expect(firstNameInput).toHaveValue('John')
    expect(usernameInput).toHaveValue('johndoe')
  })
})