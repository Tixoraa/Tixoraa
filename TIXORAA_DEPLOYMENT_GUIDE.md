# Tixoraa Deployment Guide

This guide provides comprehensive instructions for deploying the Tixoraa application to production environments.

## Prerequisites

Before you begin deployment, ensure you have:

1. All required API keys and environment variables
2. Node.js v16+ installed
3. A PostgreSQL database instance
4. Access to the Tixoraa repository

## Setting Up Environment Variables

Create or update your `.env` file with the following variables:

```
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGHOST=your_pg_host
PGPORT=your_pg_port
PGDATABASE=your_pg_database

# API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email

# Application Settings
PORT=5000
NODE_ENV=production
```

## Running the Deployment Script

For a complete deployment process, run:

```bash
node deploy-final.js
```

This script:
1. Builds the server using ES modules
2. Builds the frontend using Vite
3. Creates necessary distribution directories
4. Copies frontend build to the public directory
5. Starts the production server

## Alternative Deployment Options

### Simplified Deployment

For a simplified deployment without complete build steps:

```bash
node deploy-simplified.js
```

### Manual Deployment Steps

If you prefer to deploy manually:

1. **Build the frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Prepare distribution directory**:
   ```bash
   mkdir -p dist/public
   cp -r client/dist/* dist/public/
   ```

3. **Start the server**:
   ```bash
   node run-with-keepalive.js
   ```

## Server Options

Tixoraa provides multiple server options for production:

1. **Full Server**: `dist/index.js` - The fully built server with all features.
2. **Simple Express Server**: `simple-express-server.js` - A lightweight server for static content.
3. **Keep-Alive Server**: `run-with-keepalive.js` - A wrapper that keeps the server running and auto-restarts on crashes.

## Testing Deployment

After deployment, verify the following:

1. **Server Status**: Visit `/api/health` to check server health
2. **Frontend Loading**: Ensure the main application loads correctly
3. **API Connectivity**: Run `node test-api-integrations.js` to check all API integrations

## Troubleshooting

Common deployment issues and solutions:

### Database Connection Issues

- Verify DATABASE_URL format is correct
- Check that database server is accessible from your deployment environment
- Ensure database user has proper permissions

### Missing Frontend Files

- If you see a fallback index page, the frontend build may not be properly copied
- Run `node copy-frontend-build.js` to manually copy frontend assets

### Server Crashes

- Check logs for specific error messages
- Ensure all environment variables are correctly set
- Verify API keys are valid and active
- Run with keep-alive wrapper: `node run-with-keepalive.js`

### API Integration Failures

- Use `node test-api-integrations.js` to identify specific API issues
- Verify API keys are correctly set in environment variables
- Check for rate limit or quota issues with external APIs

## Maintenance

### Keeping the Server Running

To ensure maximum uptime, use the keep-alive wrapper:

```bash
node run-with-keepalive.js
```

This script monitors the server and automatically restarts it if it crashes.

### Health Monitoring

The server exposes a health endpoint at `/api/health` that can be used for monitoring. Set up a monitoring service to ping this endpoint regularly.

### API Key Status

Check the status of configured API keys at `/api/check-keys` (only shows if keys are present, not their validity).

## Production Best Practices

1. **Use Environment Variables**: Never hardcode sensitive information
2. **Enable HTTPS**: In production, always use HTTPS
3. **Implement Rate Limiting**: Add rate limiting for API endpoints
4. **Set Up Monitoring**: Use monitoring tools to track application health
5. **Regular Backups**: Ensure database backups are performed regularly
6. **Logging**: Configure proper logging for troubleshooting

## Contact

For further assistance, contact the Tixoraa development team.