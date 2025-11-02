# Architecture Guide

## System Overview
TestNest is a React-based MCQ application using Supabase as the backend.

## Architecture
```
React Frontend → Supabase API → PostgreSQL Database
```

## Frontend Structure
```
src/
├── components/         # React components
├── contexts/          # React contexts (theme, auth)
├── data/             # Static data files
├── images/           # Image assets
└── main.jsx          # Application entry point
```

## Key Technologies
- **Frontend**: React 18 + Vite
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL
- **Styling**: CSS3 with custom properties
- **Testing**: Vitest + React Testing Library

## Data Flow
1. User interacts with React components
2. Components call Supabase client functions
3. Supabase handles API requests to PostgreSQL
4. Results returned and displayed in UI

## Security
- Row Level Security (RLS) in database
- Authentication via Supabase Auth
- Input validation on client and server

## Performance
- Code splitting with React.lazy()
- Optimized database queries
- CSS custom properties for theming