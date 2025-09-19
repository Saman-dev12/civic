# Environment Variables Setup

This document describes all the environment variables needed to run the Civic Complaints Management System.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration.

## Required Environment Variables

### Database Configuration
- **DATABASE_URL**: PostgreSQL connection string
  - Format: `postgresql://username:password@hostname:port/database_name`
  - Example: `postgresql://postgres:password@localhost:5432/civic`

### NextAuth Configuration
- **NEXTAUTH_URL**: The canonical URL of your application
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`
- **NEXTAUTH_SECRET**: Secret key for NextAuth JWT encryption
  - Generate with: `openssl rand -base64 32`
  - Must be at least 32 characters long

### API Keys
- **NEXT_PUBLIC_OPENCAGE_API_KEY**: OpenCage Geocoding API key
  - Used for converting addresses to coordinates
  - Get free API key from: https://opencagedata.com/
  - Free tier: 2,500 requests/day

### Application URLs
- **NEXT_PUBLIC_ADMIN_URL**: URL for the admin dashboard
  - Default: `http://localhost:3001`
- **NEXT_PUBLIC_CLIENT_URL**: URL for the citizen portal
  - Default: `http://localhost:3000`

### File Upload Configuration
- **NEXT_PUBLIC_MAX_FILE_SIZE**: Maximum file size in bytes
  - Default: `5242880` (5MB)
- **NEXT_PUBLIC_ALLOWED_FILE_TYPES**: Comma-separated list of allowed MIME types
  - Default: `image/jpeg,image/png,image/gif,image/webp`

## Optional Environment Variables

### Email Configuration (for notifications)
- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port
- **SMTP_USER**: SMTP username
- **SMTP_PASS**: SMTP password
- **SMTP_FROM**: Default "from" email address

### Caching (Redis)
- **REDIS_URL**: Redis connection string
  - Default: `redis://localhost:6379`

### System Configuration
- **NODE_ENV**: Application environment
  - Values: `development`, `production`, `test`
- **JWT_SECRET**: Additional JWT secret (if needed)
- **ADMIN_EMAIL**: Default admin email for seeding
- **ADMIN_PASSWORD**: Default admin password for seeding
- **ADMIN_NAME**: Default admin name for seeding

## Development Setup

### 1. Database Setup
```bash
# Install PostgreSQL and create database
createdb civic

# Run migrations
cd packages/db
npx prisma migrate dev
npx prisma generate
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Servers
```bash
# Start all applications
npm run dev

# Or start individually
npm run dev:admin    # Admin dashboard on :3001
npm run dev:client   # Client portal on :3000
```

## Production Deployment

### Environment Variables for Production
1. Update `NEXTAUTH_URL` to your production domain
2. Use strong, unique secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
3. Use production database credentials
4. Set `NODE_ENV=production`
5. Configure SMTP for email notifications
6. Set up Redis for caching (recommended)

### Security Considerations
- Never commit `.env` files to version control
- Use environment-specific secrets
- Rotate secrets regularly
- Use secure database connections in production
- Enable SSL/TLS for all external connections

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **NextAuth Configuration Error**
   - Verify NEXTAUTH_URL matches your application URL
   - Ensure NEXTAUTH_SECRET is at least 32 characters
   - Check that the secret doesn't contain special characters that need escaping

3. **Geocoding Not Working**
   - Verify NEXT_PUBLIC_OPENCAGE_API_KEY is set
   - Check API key limits on OpenCage dashboard
   - Ensure the API key has geocoding permissions

4. **File Upload Issues**
   - Check NEXT_PUBLIC_MAX_FILE_SIZE setting
   - Verify NEXT_PUBLIC_ALLOWED_FILE_TYPES includes the file types you're trying to upload
   - Ensure upload directory has proper permissions

### Logging
Enable debug logging by setting:
```bash
DEBUG=nextauth:*
```

## Environment File Security

- `.env` files should never be committed to version control
- Use different `.env` files for different environments
- Consider using a secrets management service for production
- Regularly audit and rotate secrets
- Use the principle of least privilege for database users