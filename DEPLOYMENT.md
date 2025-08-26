# OpenManus Cloudflare Pages Deployment Guide

This guide will help you deploy the OpenManus web interface to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account (free tier is sufficient)
2. **GitHub Repository**: Your OpenManus project should be on GitHub
3. **Domain (Optional)**: You can use a custom domain or the default `.pages.dev` subdomain

## Deployment Steps

### Method 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Sign in to your account

2. **Navigate to Pages**
   - Click on "Pages" in the left sidebar
   - Click "Create a project"

3. **Connect to Git**
   - Choose "Connect to Git"
   - Select your GitHub account and authorize Cloudflare
   - Select the `FoundationAgents/OpenManus` repository

4. **Configure Build Settings**
   - **Project name**: `openmanus` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Framework preset**: `None`
   - **Build command**: Leave empty (not needed for static site)
   - **Build output directory**: `web`
   - **Root directory**: Leave empty (if web folder is in root)

5. **Environment Variables** (Optional)
   - Add any environment variables if needed
   - For now, you can leave this empty

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete

### Method 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Navigate to web directory**
   ```bash
   cd web
   ```

4. **Deploy to Pages**
   ```bash
   wrangler pages deploy . --project-name=openmanus
   ```

### Method 3: Deploy via GitHub Actions

1. **Create GitHub Actions Workflow**
   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to Cloudflare Pages
   
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Deploy to Cloudflare Pages
           uses: cloudflare/pages-action@v1
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             projectName: openmanus
             directory: web
             gitHubToken: ${{ secrets.GITHUB_TOKEN }}
   ```

2. **Add Secrets to GitHub**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

## Configuration Files

The web directory contains several configuration files:

- **`_headers`**: Security headers and caching rules
- **`_redirects`**: URL redirects and routing rules
- **`package.json`**: Project metadata and scripts

## Custom Domain Setup

1. **Add Custom Domain**
   - In Cloudflare Pages dashboard, go to your project
   - Click "Custom domains"
   - Add your domain

2. **DNS Configuration**
   - Cloudflare will automatically configure DNS records
   - If using external DNS, add a CNAME record pointing to your `.pages.dev` URL

## Post-Deployment

### Verify Deployment
- Check that your site loads correctly
- Test the chat functionality
- Verify all assets load properly

### Monitor Performance
- Use Cloudflare Analytics to monitor traffic
- Check PageSpeed Insights for performance metrics

### Update Content
- Push changes to your main branch
- Cloudflare Pages will automatically redeploy

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Cloudflare dashboard
   - Verify file paths and structure
   - Ensure all required files are in the `web` directory

2. **Assets Not Loading**
   - Check `_headers` file for correct caching rules
   - Verify file paths in HTML/CSS/JS
   - Check browser console for errors

3. **Routing Issues**
   - Verify `_redirects` file configuration
   - Check that client-side routing is working
   - Test direct URL access

### Support

- **Cloudflare Pages Documentation**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **GitHub Issues**: [github.com/FoundationAgents/OpenManus/issues](https://github.com/FoundationAgents/OpenManus/issues)
- **Discord Community**: [discord.gg/DYn29wFk9z](https://discord.gg/DYn29wFk9z)

## Next Steps

After successful deployment:

1. **Integrate with Backend**: Connect the web interface to your OpenManus backend API
2. **Add Authentication**: Implement user authentication if needed
3. **Customize UI**: Modify colors, layout, and branding
4. **Add Features**: Implement additional functionality like file uploads, tool selection, etc.

## Security Considerations

- The `_headers` file includes security headers
- Content Security Policy is configured
- HTTPS is enforced by Cloudflare
- Regular security updates are recommended

---

**Note**: This is a static web interface. For full OpenManus functionality, you'll need to deploy the Python backend separately (e.g., on Cloudflare Workers, Heroku, or similar platforms) and update the JavaScript to call your actual API endpoints.