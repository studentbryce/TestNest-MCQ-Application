import { useState } from 'react'
import StudentTests from './StudentTests'
import StudentResults from './StudentResults'
import StudentProfile from './StudentProfile'
import '../App.css'

function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tests')

  const renderTab = () => {
    switch (activeTab) {
      case 'tests':
        return <StudentTests student={user} />
      case 'results':
        return <StudentResults student={user} />
      case 'profile':
        return <StudentProfile student={user} />
      default:
        return null
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>👋 Welcome, {user.name}</h1>
          <p className="user-role">📚 Student Portal</p>
          <span className="student-id-badge">Student ID: {user.studentId}</span>
        </div>
        <button 
          className="logout-btn"
          onClick={onLogout}
        >
          🚪 Logout
        </button>
      </div>

      <nav className="dashboard-nav">
        <button
          onClick={() => setActiveTab('tests')}
          className={`nav-btn ${activeTab === 'tests' ? 'active' : ''}`}
        >
          📝 Take Tests
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`nav-btn ${activeTab === 'results' ? 'active' : ''}`}
        >
          📊 My Results
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          👤 My Profile
        </button>
      </nav>

      <div className="dashboard-content">
        {renderTab()}
      </div>
    </div>
  )
}

export default StudentDashboard
