import { useState } from 'react'

function Help({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('tutor')

  return (
    <div className="help-container">
      <div className="page-top-nav">
        <button 
          className="top-back-btn"
          onClick={() => onNavigate('home')}
        >
          <span className="back-arrow">←</span> Back to Home
        </button>
        <span className="page-title-nav">Help & Support</span>
      </div>

      <div className="help-header">
        <h1>Help & Support</h1>
        <p className="help-subtitle">Get the most out of TestNest</p>
      </div>

      <div className="help-tabs">
        <button 
          className={`help-tab ${activeTab === 'tutor' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutor')}
        >
          👨‍🏫 Tutor Guide
        </button>
        <button 
          className={`help-tab ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          🎓 Student Guide
        </button>
      </div>

      <div className="help-content">
        {activeTab === 'tutor' && (
          <>
            <section className="help-section">
              <h2>🏁 Getting Started as a Tutor</h2>
              <div className="help-item">
                <h3>🔑 Tutor Login</h3>
                <p>
                  Use your institutional email and password to access your tutor dashboard. 
                  If you don't have an account, contact your administrator for credentials.
                </p>
              </div>
              <div className="help-item">
                <h3>⚙️ Dashboard Overview</h3>
                <p>
                  After logging in, you'll see your tutor dashboard with navigation options:
                </p>
                <ul>
                  <li>👥 <strong>Users:</strong> Manage student accounts and view student information</li>
                  <li>📝 <strong>Tests:</strong> Create and manage your test assessments</li>
                  <li>❓ <strong>Questions:</strong> Build and organize your question bank</li>
                  <li>📊 <strong>Results:</strong> View detailed analytics and student performance</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>👥 Student Management</h2>
              <div className="help-item">
                <h3>📊 Tracking Student Progress</h3>
                <p>
                  Use the <strong>Results</strong> section to monitor student performance:
                </p>
                <ul>
                  <li>View individual student scores and test history</li>
                  <li>Analyze class-wide performance trends</li>
                  <li>Identify students who may need additional support</li>
                  <li>Track improvement over time</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>📝 Test Creation & Management</h2>
              <div className="help-item">
                <h3>🎨 Creating Tests</h3>
                <p>
                  Go to the <strong>Tests</strong> section to create new assessments:
                </p>
                <ul>
                  <li>Set test title, description, and parameters</li>
                  <li>Configure time limits and scoring options</li>
                  <li>Add questions from your question bank</li>
                  <li>Preview tests before publishing</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>❓ Question Bank Management</h3>
                <p>
                  Use the <strong>Questions</strong> section to build your question library:
                </p>
                <ul>
                  <li>Create multiple-choice questions with 4 answer options</li>
                  <li>Set correct answers and difficulty levels</li>
                  <li>Organize questions by topic or subject</li>
                  <li>Reuse questions across multiple tests</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>🔧 Test Configuration</h3>
                <p>
                  Best practices for test setup:
                </p>
                <ul>
                  <li>Use clear, concise question wording</li>
                  <li>Ensure answer choices are mutually exclusive</li>
                  <li>Test your questions before assigning to students</li>
                  <li>Consider appropriate time limits for your content</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>📈 Analytics & Assessment</h2>
              <div className="help-item">
                <h3>📋 Understanding Results</h3>
                <p>
                  The <strong>Results</strong> section provides comprehensive analytics:
                </p>
                <ul>
                  <li>Individual student scores and detailed breakdowns</li>
                  <li>Question-level analysis showing difficulty</li>
                  <li>Time spent on tests and individual questions</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>📤 Data Export</h3>
                <p>
                  Export functionality for record keeping:
                </p>
                <ul>
                  <li>Generate reports for administration</li>
                  <li>Track long-term progress trends</li>
                  <li>Maintain academic records</li>
                </ul>
              </div>
            </section>
          </>
        )}

        {activeTab === 'student' && (
          <>
            <section className="help-section">
              <h2>🏁 Getting Started as a Student</h2>
              <div className="help-item">
                <h3>✍️ Student Registration</h3>
                <p>
                  To create your TestNest account:
                </p>
                <ul>
                  <li>Click "Register as Student" on the home page</li>
                  <li>Enter your 7-8 digit Student ID (provided by your institution)</li>
                  <li>Create a secure password with letters and numbers</li>
                  <li>Fill in your personal information</li>
                  <li>Your password is securely encrypted for protection</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>🧑‍🎓 Student Login</h3>
                <p>
                  To access your student portal:
                </p>
                <ul>
                  <li>Click "Student Login" on the home page</li>
                  <li>Enter your Student ID and password</li>
                  <li>Access your personalized dashboard</li>
                  <li>If you forget your password, contact your tutor</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>📚 Taking Tests</h2>
              <div className="help-item">
                <h3>🎯 Available Tests</h3>
                <p>
                  In your <strong>Tests</strong> section:
                </p>
                <ul>
                  <li>View all tests assigned by your tutors</li>
                  <li>See test descriptions and question counts</li>
                  <li>Check if you've already completed a test</li>
                  <li>Start new tests when ready</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>✅ Test Taking Tips</h3>
                <p>
                  For the best test experience:
                </p>
                <ul>
                  <li>Ensure stable internet connection before starting</li>
                  <li>Read questions carefully before selecting answers</li>
                  <li>Use navigation buttons to move between questions</li>
                  <li>Review your answers before submitting</li>
                  <li>Submit your test when completely finished</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>⏱️ During the Test</h3>
                <p>
                  While taking a test:
                </p>
                <ul>
                  <li>Progress bar shows your completion status</li>
                  <li>Select one answer per question using radio buttons</li>
                  <li>Navigate with "Previous" and "Next" buttons</li>
                  <li>You must answer each question to proceed</li>
                  <li>Click "Finish Test" on the last question</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>📊 Viewing Your Results</h2>
              <div className="help-item">
                <h3>🏆 Your Performance</h3>
                <p>
                  In the <strong>Results</strong> section:
                </p>
                <ul>
                  <li>View scores for all completed tests</li>
                  <li>See percentage scores and detailed breakdowns</li>
                  <li>Track your improvement over time</li>
                  <li>Review which questions you got right or wrong</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>📈 Understanding Your Stats</h3>
                <p>
                  Your dashboard shows:
                </p>
                <ul>
                  <li><strong>Tests Completed:</strong> Total number of tests taken</li>
                  <li><strong>Average Score:</strong> Your overall performance</li>
                  <li><strong>Best Score:</strong> Your highest achievement</li>
                  <li><strong>Total Questions:</strong> Questions answered across all tests</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>🪪 Managing Your Profile</h2>
              <div className="help-item">
                <h3>⚙️ Profile Settings</h3>
                <p>
                  In your <strong>Profile</strong> section:
                </p>
                <ul>
                  <li>Update your personal information</li>
                  <li>Change your password for security</li>
                  <li>View your Student ID (cannot be changed)</li>
                  <li>Check your registration date</li>
                </ul>
              </div>
              <div className="help-item">
                <h3>🔒 Account Security</h3>
                <p>
                  Keep your account secure:
                </p>
                <ul>
                  <li>Use a strong password with letters and numbers</li>
                  <li>Don't share your login credentials</li>
                  <li>Log out when using shared computers</li>
                  <li>Contact your tutor if you suspect unauthorized access</li>
                </ul>
              </div>
            </section>

            <section className="help-section">
              <h2>🎯 Demo Test</h2>
              <div className="help-item">
                <h3>🚀 Try Before You Register</h3>
                <p>
                  On the home page, you can:
                </p>
                <ul>
                  <li>Take a free demo test with 10 Python questions</li>
                  <li>Experience the TestNest interface</li>
                  <li>No registration required for the demo</li>
                  <li>Get instant results to see how the system works</li>
                </ul>
              </div>
            </section>
          </>
        )}

        <section className="help-section">
          <h2>🔧 Troubleshooting</h2>
          <div className="help-item">
            <h3>⚠️ Common Issues</h3>
            <ul>
              <li>🔑 <strong>Login Problems:</strong> Check your Student ID/email and password</li>
              <li>🧹 <strong>Page Issues:</strong> Clear your browser cache and refresh</li>
              <li>🌐 <strong>Connection:</strong> Ensure stable internet connection</li>
              <li>📱 <strong>Mobile:</strong> Use desktop/laptop for best experience</li>
              <li>📞 <strong>Persistent Issues:</strong> Contact your tutor or support</li>
            </ul>
          </div>
        </section>

        <section className="help-section">
          <h2>📞 Contact Support</h2>
          <div className="help-item">
            <p>
              Need additional help? Contact our support team:
            </p>
            <ul>
              <li>📧 <strong>Email:</strong> support@testnest.edu</li>
              <li>☎️ <strong>Phone:</strong> 1-800-TEST-NEST</li>
              <li>🕐 <strong>Hours:</strong> Monday-Friday, 8AM-6PM EST</li>
              <li>💬 <strong>Live Chat:</strong> Available during business hours</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="help-footer">
        <button 
          className="link-btn"
          onClick={() => onNavigate('home')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default Help
