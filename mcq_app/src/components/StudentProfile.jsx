import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function StudentProfile({ student }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    phone: '',
    dateOfBirth: '',
    major: '',
    year: ''
  })
  const [originalData, setOriginalData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        console.log('StudentProfile - Student object:', student)
        console.log('StudentProfile - Looking for student ID:', student.studentId)
        
        const { data, error } = await supabase
          .from('users')
          .select('studentid, firstname, lastname, username')
          .eq('studentid', student.studentId)
          .single()

        console.log('StudentProfile - Database response:', { data, error })

        if (error) {
          console.error('Error fetching user data:', error)
          return
        }

        const userData = {
          firstName: data.firstname || '',
          lastName: data.lastname || '',
          email: data.username || '',
          studentId: data.studentid.toString(),
          phone: '+1 (555) 123-4567', // Mock data - not in database schema
          dateOfBirth: '2000-05-15', // Mock data - not in database schema
          major: 'Computer Science', // Mock data - not in database schema
          year: 'Junior' // Mock data - not in database schema
        }

        setFormData(userData)
        setOriginalData(userData)
      } catch (error) {
        console.error('Error in fetchUserData:', error)
      } finally {
        setLoading(false)
      }
    }

    if (student && student.studentId) {
      fetchUserData()
    }
  }, [student])

  const handleEdit = () => {
    setIsEditing(true)
    setSuccessMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original
    setFormData({...originalData})
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Update user data in database (only fields that exist in Users table)
      const { error } = await supabase
        .from('users')
        .update({
          firstname: formData.firstName,
          lastname: formData.lastName,
          username: formData.email
        })
        .eq('studentid', student.studentId)

      if (error) {
        console.error('Error updating profile:', error)
        setSuccessMessage('❌ Failed to update profile. Please try again.')
      } else {
        setIsEditing(false)
        setOriginalData({...formData})
        setSuccessMessage('✅ Profile updated successfully!')
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setSuccessMessage('❌ Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="card">
      <div className="profile-header">
        <h2>👤 My Profile</h2>
        {loading ? null : !isEditing ? (
          <button className="home-nav-btn secondary" onClick={handleEdit}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="edit-buttons">
            <button 
              className="home-nav-btn primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button 
              className="home-nav-btn secondary" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              ❌ Cancel
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">
                {formData.firstName[0]}{formData.lastName[0]}
              </span>
            </div>
            <h3>{formData.firstName} {formData.lastName}</h3>
            <p className="student-id-badge">🎓 Student ID: {formData.studentId}</p>
          </div>

        <div className="profile-form">
          <div className="form-section">
            <h3>📋 Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="form-value">{formData.firstName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="form-value">{formData.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">📧 Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <div className="form-value">{formData.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">📱 Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              ) : (
                <div className="form-value">{formData.phone}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">🎂 Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              ) : (
                <div className="form-value">
                  {new Date(formData.dateOfBirth).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>🎓 Academic Information</h3>
            
            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <div className="form-value readonly">{formData.studentId}</div>
              <small className="form-note">Student ID cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="major">📚 Major</label>
              {isEditing ? (
                <select
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="form-value">{formData.major}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="year">📅 Academic Year</label>
              {isEditing ? (
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              ) : (
                <div className="form-value">{formData.year}</div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}

export default StudentProfile
