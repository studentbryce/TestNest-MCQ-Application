import { useState } from 'react'
import { supabase } from '../supabaseClient'
import CryptoJS from 'crypto-js'

function TutorRegister({ onNavigate }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tutorId: '',
    password: '',
    confirmPassword: '',
    department: '',
    accessCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // You can change this access code to control tutor registration
  const TUTOR_ACCESS_CODE = 'TUTOR2025'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.tutorId || !formData.password || !formData.confirmPassword || 
        !formData.department || !formData.accessCode) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    // Check access code
    if (formData.accessCode !== TUTOR_ACCESS_CODE) {
      setError('Invalid tutor access code')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long for tutors')
      setIsLoading(false)
      return
    }

    // Validate Tutor ID format (7-9 digit number)
    const tutorIdPattern = /^\d{7,9}$/
    if (!tutorIdPattern.test(formData.tutorId)) {
      setError('Tutor ID must be a 7-9 digit number (e.g., 1234567)')
      setIsLoading(false)
      return
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      // Check if tutor ID or email already exists
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('studentid, username, tutorid')
        .or(`tutorid.eq.${formData.tutorId},username.eq.${formData.email}`)

      if (checkError) {
        setError('Error checking existing users')
        setIsLoading(false)
        return
      }

      if (existing && existing.length > 0) {
        setError('Tutor ID or email already registered')
        setIsLoading(false)
        return
      }

      // Hash the password using SHA256
      const hashedPassword = CryptoJS.SHA256(formData.password).toString()

      // Insert new tutor into database
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          tutorid: formData.tutorId,
          firstname: formData.firstName,
          lastname: formData.lastName,
          username: formData.email,
          password: hashedPassword,
          department: formData.department,
          role: 'tutor'
        }])

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('Registration failed. Please try again.')
        setIsLoading(false)
        return
      }
      
      setSuccess(true)
      setTimeout(() => {
        onNavigate('login')
      }, 2000)
      
    } catch (err) {
      console.error('Registration error:', err)
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
            <p>Your tutor account has been created successfully.</p>
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
        <span className="page-title-nav">Tutor Registration</span>
      </div>
        <div className="login-container">
        <div className="login-card" style={{maxWidth: '600px'}}>
          <h2>🎓 Tutor Registration</h2>
        <p className="login-subtitle">Create your TestNest tutor account</p>

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
                placeholder="Enter your first name"
                required
                disabled={isLoading}
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
                placeholder="Enter your last name"
                required
                disabled={isLoading}
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
              placeholder="Enter your institutional email"
              required
              disabled={isLoading}
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label htmlFor="tutorId">Tutor ID</label>
              <input
                type="text"
                id="tutorId"
                name="tutorId"
                value={formData.tutorId}
                onChange={handleChange}
                placeholder="1234567"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="accessCode">Tutor Access Code</label>
            <input
              type="password"
              id="accessCode"
              name="accessCode"
              value={formData.accessCode}
              onChange={handleChange}
              placeholder="Enter tutor access code"
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
              placeholder="At least 8 characters"
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : '🎓 Create Tutor Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have a tutor account? 
            <button 
              className="link-btn"
              onClick={() => onNavigate('login')}
              disabled={isLoading}
              style={{marginLeft: '5px'}}
            >
              Login here
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

export default TutorRegister
