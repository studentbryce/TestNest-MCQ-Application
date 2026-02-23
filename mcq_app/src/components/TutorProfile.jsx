import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { hashPassword } from '../utils/auth'

function TutorProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tutorId: '',
    department: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [originalData, setOriginalData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch tutor data from database
  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true)
      try {
        console.log('TutorProfile - User object:', user)
        console.log('TutorProfile - Looking for tutor ID:', user.tutorId)
        
        const { data, error } = await supabase
          .from('users')
          .select('tutorid, firstname, lastname, username, department')
          .eq('tutorid', user.tutorId)
          .eq('role', 'tutor')
          .single()

        console.log('TutorProfile - Database response:', { data, error })

        if (error) {
          console.error('Error fetching tutor data:', error)
          return
        }

        const tutorData = {
          firstName: data.firstname || '',
          lastName: data.lastname || '',
          email: data.username || '',
          tutorId: data.tutorid || '',
          department: data.department || ''
        }

        setFormData(tutorData)
        setOriginalData(tutorData)
      } catch (error) {
        console.error('Error in fetchTutorData:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.tutorId) {
      fetchTutorData()
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({...originalData})
    setErrorMessage('')
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrorMessage('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage('')
    
    try {
      // Update tutor data in database
      const { error } = await supabase
        .from('users')
        .update({
          firstname: formData.firstName,
          lastname: formData.lastName,
          username: formData.email,
          department: formData.department
        })
        .eq('tutorid', user.tutorId)

      if (error) {
        console.error('Error updating profile:', error)
        setErrorMessage('❌ Failed to update profile. Please try again.')
      } else {
        setIsEditing(false)
        setOriginalData({...formData})
        setSuccessMessage('✅ Profile updated successfully!')
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrorMessage('❌ Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setErrorMessage('')
    
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage('❌ Please fill in all password fields.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('❌ New passwords do not match.')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('❌ New password must be at least 8 characters long.')
      return
    }

    setIsSaving(true)

    try {
      // First verify current password
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('tutorid', user.tutorId)
        .single()

      if (fetchError) {
        console.error('Error fetching user:', fetchError)
        setErrorMessage('❌ Failed to verify current password.')
        setIsSaving(false)
        return
      }

      const currentPasswordHash = await hashPassword(passwordData.currentPassword)
      
      if (currentPasswordHash !== userData.password) {
        setErrorMessage('❌ Current password is incorrect.')
        setIsSaving(false)
        return
      }

      // Hash new password and update
      const newPasswordHash = await hashPassword(passwordData.newPassword)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPasswordHash })
        .eq('tutorid', user.tutorId)

      if (updateError) {
        console.error('Error updating password:', updateError)
        setErrorMessage('❌ Failed to update password. Please try again.')
      } else {
        setSuccessMessage('✅ Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setErrorMessage('❌ Failed to change password. Please try again.')
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

  const handlePasswordDataChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="card">
      <div className="profile-header">
        <h2>👤 Tutor Profile</h2>
        {loading ? null : !isEditing && !isChangingPassword ? (
          <div className="edit-buttons">
            <button className="home-nav-btn secondary" onClick={handleEdit}>
              ✏️ Edit Profile
            </button>
            <button className="home-nav-btn secondary" onClick={() => setIsChangingPassword(true)}>
              🔒 Change Password
            </button>
          </div>
        ) : isEditing ? (
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
        ) : (
          <div className="edit-buttons">
            <button 
              className="home-nav-btn primary" 
              onClick={handlePasswordChange}
              disabled={isSaving}
            >
              {isSaving ? 'Changing...' : '💾 Update Password'}
            </button>
            <button 
              className="home-nav-btn secondary" 
              onClick={handleCancelPasswordChange}
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

      {errorMessage && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33'
        }}>
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p>Loading profile...</p>
      ) : isChangingPassword ? (
        <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
          <div className="profile-form" style={{ width: '100%' }}>
            <div className="form-section">
              <h3>🔒 Change Password</h3>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordDataChange}
                  placeholder="Enter current password"
                  style={{ width: '100%', maxWidth: '100%' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordDataChange}
                  placeholder="Enter new password (min 8 characters)"
                  style={{ width: '100%', maxWidth: '100%' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordDataChange}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', maxWidth: '100%' }}
                />
              </div>

              <div className="form-note" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'transparent', borderRadius: '8px' }}>
                <p><strong>Password Requirements:</strong></p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Minimum 8 characters</li>
                  <li>Both passwords must match</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">
                {formData.firstName[0]}{formData.lastName[0]}
              </span>
            </div>
            <h3>{formData.firstName} {formData.lastName}</h3>
            <p className="student-id-badge">🎓 Tutor ID: {formData.tutorId}</p>
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
            </div>

            <div className="form-section">
              <h3>🏫 Professional Information</h3>
              
              <div className="form-group">
                <label htmlFor="tutorId">Tutor ID</label>
                <div className="form-value readonly">{formData.tutorId}</div>
                <small className="form-note">Tutor ID cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="department">🏢 Department</label>
                {isEditing ? (
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Psychology">Psychology</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="form-value">{formData.department || 'Not specified'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorProfile
