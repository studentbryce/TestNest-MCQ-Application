import UserList from './UserList'
import TestList from './TestList'
import QuestionList from './QuestionList'
import Results from './Results'
import TutorProfile from './TutorProfile'

function Dashboard({ user, onLogout, activeTab, setActiveTab }) {
  const renderTab = () => {
    switch (activeTab) {
      case 'users':
        return <UserList />
      case 'tests':
        return <TestList />
      case 'questions':
        return <QuestionList />
      case 'results':
        return <Results />
      case 'profile':
        return <TutorProfile user={user} />
      default:
        return null
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>👋 Welcome back, {user.name}</h1>
          <p className="user-role">🎓 Tutor Dashboard</p>
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
          onClick={() => setActiveTab('users')}
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          👥 Students
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`nav-btn ${activeTab === 'tests' ? 'active' : ''}`}
        >
          📝 Tests
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`nav-btn ${activeTab === 'questions' ? 'active' : ''}`}
        >
          ❓ Questions
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`nav-btn ${activeTab === 'results' ? 'active' : ''}`}
        >
          📊 Results
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          👤 Profile
        </button>
      </nav>

      <div className="dashboard-content">
        {renderTab()}
      </div>
    </div>
  )
}

export default Dashboard
