# Developer Guide

## Quick Setup
1. Clone repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run `npm run dev`

## Project Structure
```
src/
├── components/       # React components
├── contexts/        # React contexts
├── data/           # Static data
├── images/         # Assets
├── App.jsx         # Main component
└── main.jsx        # Entry point
```

## Coding Standards

### Components
- Use functional components with hooks
- Follow PascalCase naming
- Keep components focused and small
- Use PropTypes or TypeScript for props

### File Organization
- One component per file
- Co-locate related files
- Use descriptive file names
- Export default from component files

### Styling
- Use CSS modules or styled components
- Follow BEM naming convention
- Use CSS custom properties for themes
- Mobile-first responsive design

## Development Workflow

### Git Workflow
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

### Code Quality
- Run `npm test` before committing
- Use ESLint and Prettier
- Write meaningful commit messages
- Keep commits small and focused

## Common Patterns

### API Calls
```javascript
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};
```

### State Management
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

## Debugging
- Use React DevTools
- Check browser console for errors
- Use `console.log` strategically
- Test in multiple browsers