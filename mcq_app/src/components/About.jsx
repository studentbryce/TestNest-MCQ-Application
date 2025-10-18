function About({ onNavigate }) {
  return (
    <div className="about-container">
      <div className="page-top-nav">
        <button 
          className="top-back-btn"
          onClick={() => onNavigate('home')}
        >
          <span className="back-arrow">←</span> Back to Home
        </button>
        <span className="page-title-nav">About TestNest</span>
      </div>

      <div className="about-header">
        <h1>About TestNest</h1>
        <p className="about-subtitle">Revolutionizing Educational Assessment</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>🎯 Our Mission</h2>
          <p>
            TestNest is designed to empower educators with a comprehensive, user-friendly 
            platform for creating, managing, and analyzing multiple choice assessments. 
            We believe that effective testing should be accessible, efficient, and insightful.
          </p>
        </section>

        <section className="about-section">
          <h2>🌟 Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>🎨 Intuitive Test Creation</h3>
              <p>Build comprehensive tests with our advanced question builder and manage extensive question banks.</p>
            </div>
            <div className="feature-item">
              <h3>👨‍🎓 Student Management</h3>
              <p>Efficiently manage student records with secure SHA256 password encryption and progress tracking.</p>
            </div>
            <div className="feature-item">
              <h3>📈 Advanced Analytics</h3>
              <p>Gain deep insights with detailed performance reports, class statistics, and individual student analytics.</p>
            </div>
            <div className="feature-item">
              <h3>🔒 Enterprise Security</h3>
              <p>SHA256 password hashing, secure database integration, and role-based access control.</p>
            </div>
            <div className="feature-item">
              <h3>📱 Mobile Experience</h3>
              <p>Responsive design with dedicated mobile app downloads for iOS and Android platforms.</p>
            </div>
            <div className="feature-item">
              <h3>🎯 Interactive Demo</h3>
              <p>Try before you register with our comprehensive Python programming demo test experience.</p>
            </div>
            <div className="feature-item">
              <h3>📚 Role-Specific Help</h3>
              <p>Comprehensive help system with separate guidance for tutors and students.</p>
            </div>
            <div className="feature-item">
              <h3>🎨 Professional UI</h3>
              <p>Beautiful, consistent design with Google Fonts integration and modern styling.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>💻 Technology Stack</h2>
          <p>
            TestNest is built using cutting-edge web technologies to deliver a modern, 
            fast, and reliable experience:
          </p>
          <div className="features-list">
            <div className="feature-item">
              <h3>⚛️ React + Vite</h3>
              <p>Modern React framework with Vite for lightning-fast development and performance.</p>
            </div>
            <div className="feature-item">
              <h3>🗄️ Supabase Database</h3>
              <p>Real-time database with secure authentication and data management.</p>
            </div>
            <div className="feature-item">
              <h3>🔐 Crypto-JS Security</h3>
              <p>SHA256 password hashing for enterprise-level security standards.</p>
            </div>
            <div className="feature-item">
              <h3>🎨 Google Fonts</h3>
              <p>Professional typography with Quicksand, Fredoka, and Inter font families.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🎯 What's New</h2>
          <p>
            Our latest updates bring enhanced functionality and improved user experience:
          </p>
          <div className="features-list">
            <div className="feature-item">
              <h3>📲 Mobile App Store Integration</h3>
              <p>Professional app store buttons for iOS App Store and Google Play downloads.</p>
            </div>
            <div className="feature-item">
              <h3>🐍 Python Demo Test</h3>
              <p>Interactive 10-question Python programming quiz for hands-on experience.</p>
            </div>
            <div className="feature-item">
              <h3>📱 Enhanced Mobile Design</h3>
              <p>Fully responsive interface optimized for tablets and mobile devices.</p>
            </div>
            <div className="feature-item">
              <h3>📖 Role-Based Help System</h3>
              <p>Separate help documentation for tutors and students with comprehensive guides.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🚀 Get Started</h2>
          <p>
            Ready to transform your testing experience? Choose your path to get started 
            with TestNest's powerful assessment platform.
          </p>
          <div className="about-actions">
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('login')}
            >
              🎓 Tutor Login
            </button>
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('student-login')}
            >
              👨‍🎓 Student Login
            </button>
            <button 
              className="home-nav-btn secondary"
              onClick={() => onNavigate('help')}
            >
              🆘 Get Help
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#2F2F2F', fontStyle: 'italic' }}>
            🎯 New to TestNest? Try our <strong>interactive demo test</strong> on the home page - no registration required!
          </p>
        </section>
      </div>

      <div className="about-footer">
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

export default About
