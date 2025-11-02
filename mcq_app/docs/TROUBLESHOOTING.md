# Troubleshooting Guide

## Common Issues

### App Won't Start
**Error**: `EADDRINUSE: address already in use :::5173`
```bash
npx kill-port 5173
npm run dev
```

**Error**: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
**Error**: Connection failed
- Check `.env` file has correct Supabase URL and key
- Verify Supabase project is active
- Test connection in Supabase dashboard

**Error**: RLS policy blocks access
- Check Row Level Security policies
- Verify user has correct permissions
- Review table access rights in Supabase

### Build Issues
**Error**: Build fails
```bash
npm run build
# Check console for specific errors
```

**Error**: Deployment issues
- Verify environment variables are set
- Check build output in `dist/` folder
- Ensure all imports are correct

### Performance Issues
**Slow loading**
- Check network tab in dev tools
- Optimize database queries
- Review component re-renders

**Memory issues**
- Check for memory leaks in React DevTools
- Review useEffect cleanup
- Optimize large lists with virtualization

### Authentication Issues
**Login fails**
- Verify Supabase Auth is enabled
- Check user exists in database
- Review browser network requests

**Session expires**
- Check token expiration settings
- Implement refresh token logic
- Handle auth state changes

## Debug Tools
- React DevTools (browser extension)
- Supabase Dashboard (database logs)
- Browser Console (JavaScript errors)
- Network Tab (API requests)

## Getting Help
1. Check browser console for errors
2. Review Supabase logs
3. Test with minimal reproduction case
4. Search existing issues on GitHub