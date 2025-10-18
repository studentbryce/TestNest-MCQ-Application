import { useState } from 'react'
import { supabase } from '../supabaseClient'
import CryptoJS from 'crypto-js'

function Login({ onLogin, onNavigate }) {
  const [formData, setFormData] = useState({
    identifier: '', // Can be email for tutors or TutorID
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple validation
    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      // Hash the password using SHA256
      const hashedPassword = CryptoJS.SHA256(formData.password).toString()

      // Check if identifier is email or TutorID format
      const isEmail = formData.identifier.includes('@')
      const isTutorId = /^\d{7,9}$/.test(formData.identifier)

      let query = supabase
        .from('users')
        .select('tutorid, firstname, lastname, username, role, department')
        .eq('password', hashedPassword)

      if (isEmail) {
        query = query.eq('username', formData.identifier)
      } else if (isTutorId) {
        query = query.eq('tutorid', formData.identifier)
      } else {
        setError('Please enter a valid email address or 7-9 digit Tutor ID')
        setIsLoading(false)
        return
      }

      const { data, error } = await query.single()

      if (error || !data) {
        setError('Invalid credentials. Please check your email/Tutor ID and password.')
        setIsLoading(false)
        return
      }

      // Ensure only tutors can login through this form
      if (data.role !== 'tutor') {
        setError('This login is for tutors only. Students should use the student login.')
        setIsLoading(false)
        return
      }

      // Successful login
      onLogin({
        tutorId: data.tutorid,
        email: data.username,
        name: `${data.firstname} ${data.lastname}`,
        firstName: data.firstname,
        lastName: data.lastname,
        department: data.department,
        role: data.role || 'tutor'
      })
      
    } catch (err) {
      console.error('Login error:', err)
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
        <span className="page-title-nav">Tutor Login</span>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <h2>🎓 Tutor Login</h2>
        <p className="login-subtitle">Access your TestNest dashboard</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Email Address or Tutor ID</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or 7-9 digit Tutor ID"
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : '🎓 Login as Tutor'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have a tutor account?
            <button 
              className="link-btn"
              onClick={() => onNavigate('tutorRegister')}
              disabled={isLoading}
              style={{marginLeft: '5px'}}
            >
              Register here
            </button>
          </p>
          <button 
            className="link-btn"
            onClick={() => onNavigate('home')}
            disabled={isLoading}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}


export default Login
