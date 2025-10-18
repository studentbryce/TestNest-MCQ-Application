# TestNest MCQ Application

![TestNest Logo](src/images/TestNestLogo.png)

A comprehensive Multiple Choice Question (MCQ) platform built with React and Supabase, designed for educational institutions to manage students, tests, and results efficiently.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd mcq_app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎓 Student Portal
- **Registration & Login**: Secure student authentication
- **Interactive Tests**: Take MCQ tests with real-time progress tracking
- **Results Dashboard**: View test scores and detailed feedback
- **Progress Tracking**: Monitor performance across multiple tests

### 👨‍🏫 Tutor Portal
- **User Management**: View and manage student registrations
- **Question Management**: Create, edit, and organize test questions
- **Test Administration**: Assign and monitor student tests
- **Results Analytics**: Comprehensive result analysis and reporting

### 🔧 System Features
- **Role-based Authentication**: Separate interfaces for students and tutors
- **Real-time Data Sync**: Live updates using Supabase
- **Responsive Design**: Mobile-friendly interface
- **Professional UI/UX**: Modern design with consistent theming
- **Code Display**: Syntax highlighting for programming questions
- **Progress Indicators**: Visual feedback during test-taking

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast development build tool
- **CSS3**: Custom styling with CSS variables and modern features
- **JavaScript (ES6+)**: Modern JavaScript features

### Backend & Database
- **Supabase**: Backend-as-a-Service providing:
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Git**: Version control
- **npm**: Package management

## 🏗 Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│   Supabase API  │───▶│  PostgreSQL DB  │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
App.jsx
├── Home.jsx (Landing page)
├── Login.jsx (Tutor authentication)
├── Dashboard.jsx (Main tutor interface)
│   ├── UserList.jsx (Student management)
│   ├── QuestionList.jsx (Question management)
│   ├── TestList.jsx (Test administration)
│   └── Results.jsx (Analytics & reporting)
└── Student Portal
    ├── StudentLogin.jsx
    ├── StudentRegister.jsx
    ├── StudentDashboard.jsx
    ├── StudentTests.jsx
    └── StudentResults.jsx
```

## 🔧 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Supabase Account** (free tier available)
- **Git**

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd mcq_app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Database Setup
1. Create a new Supabase project
2. Run the SQL scripts from `docs/database/`
3. Configure Row Level Security (RLS) policies

### Step 5: Start Development Server
```bash
npm run dev
```

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🚀 Development

### Development Workflow
```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Style
- Use functional components with hooks
- Follow ESLint configuration
- Use CSS variables for theming
- Implement proper error handling
- Add comments for complex logic

### Testing Strategy
- Component testing with React Testing Library
- Integration testing for API interactions
- End-to-end testing for critical user flows
- Manual testing for UI/UX validation

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Vercel**: Automatic deployments from Git
- **Netlify**: Static site hosting with CI/CD
- **Firebase Hosting**: Google's hosting platform
- **GitHub Pages**: Free hosting for public repositories

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- React.js team for the excellent framework
- Supabase for the powerful backend platform
- The open-source community for inspiration and tools

---

**TestNest** - Empowering Education Through Technology 🎓
