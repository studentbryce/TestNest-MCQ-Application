import { useState } from 'react'
import { supabase } from '../supabaseClient'
import CryptoJS from 'crypto-js'

function StudentRegister({ onNavigate }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.studentId || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
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
      // Check if student ID or username already exists
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('studentid, username')
        .or(`studentid.eq.${studentId},username.eq.${formData.email}`)

      if (checkError) {
        setError('Error checking existing users')
        setIsLoading(false)
        return
      }

      if (existing && existing.length > 0) {
        setError('Student ID or email already registered')
        setIsLoading(false)
        return
      }

      // Hash the password using SHA256
      const hashedPassword = CryptoJS.SHA256(formData.password).toString()

      // Insert new user into database
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          studentid: studentId,
          firstname: formData.firstName,
          lastname: formData.lastName,
          username: formData.email,
          password: hashedPassword,
          role: 'student'
        }])

      if (insertError) {
        setError('Registration failed. Please try again.')
        setIsLoading(false)
        return
      }
      
      setSuccess(true)
      setTimeout(() => {
        onNavigate('student-login')
      }, 2000)
      
    } catch (err) {
      setError('Registration failed. Please try again.')
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

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>🎉 Registration Successful!</h2>
          <p className="login-subtitle">Welcome to TestNest! Redirecting to login...</p>
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✅</div>
            <p>Your account has been created successfully.</p>
          </div>
        </div>
      </div>
    )
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
        <span className="page-title-nav">Student Registration</span>
      </div>
      
      <div className="login-container">
        <div className="login-card" style={{maxWidth: '500px'}}>
          <h2>✍️ Student Registration</h2>
        <p className="login-subtitle">Create your TestNest student account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@student.edu"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : '🎓 Create Student Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? 
            <button 
              className="link-btn"
              onClick={() => onNavigate('student-login')}
              style={{marginLeft: '5px'}}
            >
              Login here
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

export default StudentRegister
