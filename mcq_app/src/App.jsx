import { useState } from 'react'
import Home from './components/Home'
import Login from './components/Login'
import StudentLogin from './components/StudentLogin'
import StudentRegister from './components/StudentRegister'
import TutorRegister from './components/TutorRegister'
import About from './components/About'
import Help from './components/Help'
import Dashboard from './components/Dashboard'
import StudentDashboard from './components/StudentDashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    if (userData.role === 'student') {
      setCurrentPage('student-dashboard')
    } else {
      setCurrentPage('dashboard')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('home')
    setActiveTab('users')
  }

  const renderPage = () => {
    if (user && currentPage === 'dashboard') {
      return (
        <Dashboard 
          user={user}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )
    }

    if (user && currentPage === 'student-dashboard') {
      return (
        <StudentDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'login':
        return <Login onLogin={handleLogin} onNavigate={handleNavigate} />
      case 'student-login':
        return <StudentLogin onLogin={handleLogin} onNavigate={handleNavigate} />
      case 'student-register':
        return <StudentRegister onNavigate={handleNavigate} />
      case 'tutor-register':
        return <TutorRegister onNavigate={handleNavigate} />
      case 'about':
        return <About onNavigate={handleNavigate} />
      case 'help':
        return <Help onNavigate={handleNavigate} />
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }

  return (
    <>      
      <div className="container">
        {renderPage()}
      </div>
    </>
  )
}

export default App
