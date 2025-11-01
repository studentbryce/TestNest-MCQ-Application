import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Results from '../../Results'
import { formatDateTime } from '../../../utils/dateTime'

// Mock the formatDateTime utility
vi.mock('../../../utils/dateTime')

describe('Results Component', () => {
  const mockUser = {
    tutorId: 12345678,
    name: 'Test Tutor',
    role: 'tutor'
  }

  const mockResults = [
    {
      resultid: 1,
      studentid: 87654321,
      firstname: 'John',
      lastname: 'Doe',
      score: 85,
      totalquestions: 10,
      created_at: '2023-11-15T14:30:00.000Z'
    },
    {
      resultid: 2,
      studentid: 87654322,
      firstname: 'Jane',
      lastname: 'Smith',
      score: 92,
      totalquestions: 10,
      created_at: '2023-11-14T10:15:00.000Z'
    }
  ]

  beforeEach(() => {
    // Mock the formatDateTime function
    formatDateTime.mockImplementation((isoString) => ({
      date: '15/11/2023',
      time: '14:30'
    }))
  })

  it('renders results list correctly', () => {
    render(<Results user={mockUser} results={mockResults} />)
    
    expect(screen.getByText('Test Results')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
  })

  it('displays student IDs correctly', () => {
    render(<Results user={mockUser} results={mockResults} />)
    
    expect(screen.getByText('87654321')).toBeInTheDocument()
    expect(screen.getByText('87654322')).toBeInTheDocument()
  })

  it('shows formatted submission dates and times', () => {
    render(<Results user={mockUser} results={mockResults} />)
    
    // Since we mocked formatDateTime, it should show our mock values
    expect(screen.getAllByText('15/11/2023')).toHaveLength(2)
    expect(screen.getAllByText('14:30')).toHaveLength(2)
  })

  it('calculates and displays correct percentages', () => {
    const customResults = [
      {
        resultid: 1,
        studentid: 87654321,
        firstname: 'Test',
        lastname: 'Student',
        score: 7,
        totalquestions: 10,
        created_at: '2023-11-15T14:30:00.000Z'
      },
      {
        resultid: 2,
        studentid: 87654322,
        firstname: 'Another',
        lastname: 'Student',
        score: 15,
        totalquestions: 20,
        created_at: '2023-11-14T10:15:00.000Z'
      }
    ]

    render(<Results user={mockUser} results={customResults} />)
    
    expect(screen.getByText('70%')).toBeInTheDocument() // 7/10 = 70%
    expect(screen.getByText('75%')).toBeInTheDocument() // 15/20 = 75%
  })

  it('displays empty state when no results', () => {
    render(<Results user={mockUser} results={[]} />)
    
    expect(screen.getByText('Test Results')).toBeInTheDocument()
    // Component should still render the header even with no results
  })

  it('handles results with zero total questions', () => {
    const resultsWithZero = [
      {
        resultid: 1,
        studentid: 87654321,
        firstname: 'Test',
        lastname: 'Student',
        score: 0,
        totalquestions: 0,
        created_at: '2023-11-15T14:30:00.000Z'
      }
    ]

    render(<Results user={mockUser} results={resultsWithZero} />)
    
    expect(screen.getByText('Test Student')).toBeInTheDocument()
    // Should handle division by zero gracefully
  })

  it('sorts results by submission date (newest first)', () => {
    const unsortedResults = [
      {
        resultid: 1,
        studentid: 87654321,
        firstname: 'Older',
        lastname: 'Result',
        score: 85,
        totalquestions: 10,
        created_at: '2023-11-10T14:30:00.000Z'
      },
      {
        resultid: 2,
        studentid: 87654322,
        firstname: 'Newer',
        lastname: 'Result',
        score: 92,
        totalquestions: 10,
        created_at: '2023-11-15T10:15:00.000Z'
      }
    ]

    render(<Results user={mockUser} results={unsortedResults} />)
    
    const resultItems = screen.getAllByText(/Result/)
    // The newer result should appear first if sorted correctly
    expect(resultItems[0]).toHaveTextContent('Newer Result')
  })

  it('handles missing student names gracefully', () => {
    const resultsWithMissingNames = [
      {
        resultid: 1,
        studentid: 87654321,
        firstname: null,
        lastname: 'Doe',
        score: 85,
        totalquestions: 10,
        created_at: '2023-11-15T14:30:00.000Z'
      },
      {
        resultid: 2,
        studentid: 87654322,
        firstname: 'Jane',
        lastname: null,
        score: 92,
        totalquestions: 10,
        created_at: '2023-11-14T10:15:00.000Z'
      }
    ]

    render(<Results user={mockUser} results={resultsWithMissingNames} />)
    
    // Should handle null names without crashing
    expect(screen.getByText('87654321')).toBeInTheDocument()
    expect(screen.getByText('87654322')).toBeInTheDocument()
  })

  it('calls formatDateTime for each result', () => {
    render(<Results user={mockUser} results={mockResults} />)
    
    expect(formatDateTime).toHaveBeenCalledTimes(mockResults.length)
    expect(formatDateTime).toHaveBeenCalledWith('2023-11-15T14:30:00.000Z')
    expect(formatDateTime).toHaveBeenCalledWith('2023-11-14T10:15:00.000Z')
  })

  it('displays score information correctly', () => {
    render(<Results user={mockUser} results={mockResults} />)
    
    // Should show score out of total questions
    expect(screen.getByText(/85/)).toBeInTheDocument()
    expect(screen.getByText(/92/)).toBeInTheDocument()
  })

  it('handles undefined created_at timestamps', () => {
    const resultsWithUndefinedTime = [
      {
        resultid: 1,
        studentid: 87654321,
        firstname: 'Test',
        lastname: 'Student',
        score: 85,
        totalquestions: 10,
        created_at: undefined
      }
    ]

    render(<Results user={mockUser} results={resultsWithUndefinedTime} />)
    
    expect(formatDateTime).toHaveBeenCalledWith(undefined)
    expect(screen.getByText('Test Student')).toBeInTheDocument()
  })
})