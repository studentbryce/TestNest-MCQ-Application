import TestNestLogo from '../images/TestNestLogo.png'
import { useState } from 'react'
import { demoQuestions } from '../data/demoQuestions'

function Home({ onNavigate }) {
  const [showDemo, setShowDemo] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [demoScore, setDemoScore] = useState(0)

  const startDemo = () => {
    setShowDemo(true)
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setDemoScore(0)
  }

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishDemo()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishDemo = () => {
    let score = 0
    demoQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        score++
      }
    })
    setDemoScore(score)
    setShowResults(true)
  }

  const resetDemo = () => {
    setShowDemo(false)
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setDemoScore(0)
  }
  if (showDemo && !showResults) {
    const question = demoQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / demoQuestions.length) * 100

    return (
      <div className="card">
        <div className="test-header">
          <h2>🎯 Demo Test: Python Basics</h2>
          <div className="test-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <span>Question {currentQuestion + 1} of {demoQuestions.length}</span>
          </div>
        </div>

        <div className="question-container">
          <h3 className="question-text">
            {currentQuestion + 1}. {question.question}
          </h3>

          <div className="answer-choices">
            {question.choices.map((choice, index) => (
              <label key={index} className="choice-label">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={selectedAnswers[question.id] === index}
                  onChange={() => handleAnswerSelect(question.id, index)}
                />
                <span className="choice-text">{choice}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="test-navigation">
          <button 
            className="home-nav-btn secondary"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === demoQuestions.length - 1 ? (
            <button 
              className="home-nav-btn primary"
              onClick={nextQuestion}
              disabled={selectedAnswers[question.id] === undefined}
            >
              🎯 Finish Demo
            </button>
          ) : (
            <button 
              className="home-nav-btn primary"
              onClick={nextQuestion}
              disabled={selectedAnswers[question.id] === undefined}
            >
              Next →
            </button>
          )}
        </div>

        <button className="back-button" onClick={resetDemo}>
          ← Exit Demo
        </button>
      </div>
    )
  }
  if (showResults) {
    const percentage = Math.round((demoScore / demoQuestions.length) * 100)
    
    return (
      <div className="card">
        <h2>🎉 Demo Test Completed!</h2>
        <div className="test-result-card">
          <div className="result-summary">
            <h3>📊 Your Results</h3>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-percentage">{percentage}%</span>
              </div>
              <div className="score-details">
                <p>✅ Correct: {demoScore}</p>
                <p>❌ Incorrect: {demoQuestions.length - demoScore}</p>
                <p>📝 Total Questions: {demoQuestions.length}</p>
              </div>
            </div>
          </div>
          <div className="result-actions">
            <button 
              className="home-nav-btn primary" 
              onClick={startDemo}
            >
              🔄 Try Demo Again
            </button>
          </div>
        </div>

        <div className="demo-cta">
          <h3>Ready to unlock your full potential?</h3>
          <p>This was just a taste! TestNest offers hundreds more questions, detailed explanations, progress tracking, and much more.</p>
          <div className="demo-action-buttons">
            <button 
              className="home-nav-btn primary large"
              onClick={() => onNavigate('student-register')}
            >
              🚀 Sign Up Now
            </button>
            <button 
              className="home-nav-btn secondary"
              onClick={resetDemo}
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="home-container">
      <div className="logo-section">
        <img src={TestNestLogo} alt="TestNest Logo" className="home-logo" />
        <h1 className="home-title">TestNest</h1>
        <p className="home-subtitle">Professional MCQ Testing Platform</p>
      </div>

      <div className="home-navigation">
        <div className="nav-section">
          <h2>🎓 For Tutors</h2>
          <div className="nav-buttons">
            <button 
              className="home-nav-btn primary"
              onClick={() => onNavigate('login')}
            >
              🎓 Tutor Login
            </button>
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('tutor-register')}
            >
              ✍️ Register as Tutor
            </button>
          </div>
        </div>

        <div className="nav-section">
          <h2>👨‍🎓 For Students</h2>
          <div className="nav-buttons">
            <button 
              className="home-nav-btn primary"
              onClick={() => onNavigate('student-login')}
            >
              📚 Student Login
            </button>
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('student-register')}
            >
              ✍️ Register as Student
            </button>
          </div>
        </div>

        <div className="nav-section">
          <h2>📚 Information</h2>
          <div className="nav-buttons">
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('about')}
            >
              ℹ️ About TestNest
            </button>
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('help')}
            >
              🆘 Help & Support
            </button>
          </div>
        </div>
      </div>

      <div className="demo-test-section">
        <h2>🎯 Try TestNest Now - Free Demo!</h2>
        <p>Experience our interactive testing platform with a sample Python quiz</p>
        <div className="demo-preview">
          <div className="demo-features">
            <div className="demo-feature">
              <span className="demo-icon">📝</span>
              <span>10 Python Questions</span>
            </div>
            <div className="demo-feature">
              <span className="demo-icon">⏱️</span>
              <span>No Time Limit</span>
            </div>
            <div className="demo-feature">
              <span className="demo-icon">📊</span>
              <span>Instant Results</span>
            </div>
          </div>
          <button 
            className="demo-start-btn"
            onClick={startDemo}
          >
            🚀 Start Free Demo Test
          </button>
          <p className="demo-note">No registration required • Takes about 5 minutes</p>
        </div>
      </div>

      <div className="home-features">
        <h2>✨ Why Choose TestNest?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Interactive MCQ Tests</h3>
            <p>Practice with expertly crafted multiple-choice questions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Instant Results</h3>
            <p>Get immediate feedback and detailed analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Expert Content</h3>
            <p>Questions created by qualified tutors and educators</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Learning</h3>
            <p>Study anywhere, anytime with our mobile-first design</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement with detailed performance analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>

      <div className="mobile-app-section">
        <h2>📲 Get the TestNest Mobile App</h2>
        <p>Take your learning on the go with our dedicated mobile application</p>
        <div className="app-download-buttons">
          <button 
            className="app-store-button ios-button"
            onClick={() => alert('iOS app coming soon! This link will be updated when the app is available on the App Store.')}
          >
            <div className="button-content">
              <div className="download-text">Download on the</div>
              <div className="store-name">App Store</div>
            </div>
            <div className="app-logo">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
          </button>
          
          <button 
            className="app-store-button google-play-button"
            onClick={() => alert('Android app coming soon! This link will be updated when the app is available on Google Play.')}
          >
            <div className="button-content">
              <div className="download-text">GET IT ON</div>
              <div className="store-name">Google Play</div>
            </div>
            <div className="app-logo">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
            </div>
          </button>
        </div>
        <p className="app-features">
          ✅ Offline study mode &nbsp;|&nbsp; ✅ Push notifications &nbsp;|&nbsp; ✅ Progress sync across devices
        </p>
      </div>
{/*
      <div className="home-stats">
        <h2>🏆 TestNest by the Numbers</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Questions Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Students Enrolled</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <div className="stat-label">Expert Tutors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">95%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>
*/}
      <div className="home-cta">
        <h2>🚀 Ready to Get Started?</h2>
        <p>Join thousands of students already improving their knowledge with TestNest</p>
        <div className="cta-buttons">
          <button 
            className="home-nav-btn primary large"
            onClick={() => onNavigate('student-register')}
          >
            🎓 Start Learning Today
          </button>
          <button 
            className="home-nav-btn secondary large"
            onClick={() => onNavigate('about')}
          >
            📖 Learn More
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
