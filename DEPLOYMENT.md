# Deployment Guide

## Netlify Deployment

### Prerequisites

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Have your Supabase credentials ready

### Setup Environment Variables

1. Copy the Netlify environment template:

   ```bash
   cp scripts/set-netlify-env.sh.template scripts/set-netlify-env.sh
   ```

2. Edit `scripts/set-netlify-env.sh` with your actual values:
   - `NETLIFY_SITE_NAME`: Your site name from Netlify dashboard
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

3. Run the setup script:
   ```bash
   chmod +x scripts/set-netlify-env.sh
   ./scripts/set-netlify-env.sh
   ```

### Manual Environment Variable Setup

Alternatively, set environment variables through Netlify UI:

1. Go to your Netlify site dashboard
2. Navigate to Site Settings → Environment Variables
3. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Deploy

#### Automatic Deployment (Recommended)

1. Connect your GitHub repository to Netlify
2. Netlify will automatically build and deploy on every push to main branch
3. Build settings are configured in `netlify.toml`

#### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --site your-site-name
```

### Verify Deployment

1. Check environment variables:

   ```bash
   netlify env:list --site your-site-name
   ```

2. Test the deployed application:
   - Verify games load from Supabase
   - Test claim functionality
   - Check real-time updates

### Configuration Details

The `netlify.toml` file includes:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node.js Version**: 18
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **SPA Routing**: Redirects all routes to index.html for React Router
- **Caching**: Static assets cached for 1 year, HTML files not cached

### Troubleshooting

#### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Check variables are set in Netlify dashboard
- Verify site name matches your Netlify site

#### Build Failures

- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs in Netlify dashboard

#### Database Connection Issues

- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure RLS policies allow anonymous access for read operations
