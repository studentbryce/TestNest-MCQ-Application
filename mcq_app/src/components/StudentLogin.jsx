import { useState } from 'react'
import { supabase } from '../supabaseClient'
import CryptoJS from 'crypto-js'

function StudentLogin({ onLogin, onNavigate }) {
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple validation
    if (!formData.studentId || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    // Validate Student ID format (7-8 digits)
    const studentId = parseInt(formData.studentId)
    if (isNaN(studentId) || studentId < 1000000 || studentId > 99999999) {
      setError('Student ID must be 7-8 digits')
      setIsLoading(false)
      return
    }

    try {
      // Hash the password using SHA256
      const hashedPassword = CryptoJS.SHA256(formData.password).toString()

      // Query the Users table to check credentials
      const { data, error } = await supabase
        .from('users')
        .select('studentid, firstname, lastname, username, role')
        .eq('studentid', studentId)
        .eq('password', hashedPassword)
        .single()

      if (error || !data) {
        setError('Invalid Student ID or password')
        setIsLoading(false)
        return
      }

      // Check if the user has student role (or no role for backwards compatibility)
      if (data.role && data.role !== 'student') {
        setError('Access denied. This login is for students only.')
        setIsLoading(false)
        return
      }

      // Login successful
      onLogin({
        studentId: data.studentid,
        name: `${data.firstname} ${data.lastname}`,
        userName: data.username,
        role: 'student'
      })
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      <div className="page-top-nav">
        <button 
          className="top-back-btn"
          onClick={() => onNavigate('home')}
        >
          <span className="back-arrow">←</span> Back to Home
        </button>
        <span className="page-title-nav">Student Login</span>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <h2>👨‍🎓 Student Login</h2>
        <p className="login-subtitle">Access your test dashboard and results</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Enter your student ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : '📚 Login as Student'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? 
            <button 
              className="link-btn"
              onClick={() => onNavigate('student-register')}
              style={{marginLeft: '5px'}}
            >
              Register here
            </button>
          </p>
          <button 
            className="link-btn"
            onClick={() => onNavigate('home')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}

export default StudentLogin
