# Time-Off Microservice Setup Credentials and Instructions

## Prerequisites
- Node.js 18 or higher ✅ (installed)
- PostgreSQL 15 or higher ❌ (NOT INSTALLED - see installation below)
- npm or yarn ✅ (comes with Node.js)

## 🚨 CRITICAL: Database Not Available
PostgreSQL is not installed on your system. You must install it before running the application.

### Quick PostgreSQL Installation for Windows:
1. Download PostgreSQL 15+ from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Use default settings:
   - Port: 5432
   - Username: postgres
   - Password: password (or update DATABASE_URL in .env)
4. Create database: `time_off_db`

### Alternative: Install Docker
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. After installation, run: `docker compose up -d postgres`

## ✅ CURRENT STATUS: Application is PARTIALLY RUNNING
- ✅ Dependencies installed
- ✅ Environment configured
- ✅ Prisma client generated
- ✅ Server started on http://localhost:3000
- ✅ Health check working: http://localhost:3000/api/v1/health
- ❌ Database not connected - API endpoints requiring DB will fail

### What Works Now:
- Server is running on port 3000
- Health check endpoint responds
- Basic routing is functional

### What Doesn't Work:
- User registration/login
- Time-off requests
- Any database operations

### Next Steps After Installing PostgreSQL:
```bash
# Run migrations
npm run prisma:migrate

# Optional: Seed test data
npm run db:seed

# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123","firstName":"Admin","lastName":"User"}'
```

## Environment Variables (.env file)
The following environment variables are required. They are already set in your `.env` file with default values, but you may need to customize them:

## Environment Variables (.env file)
The following environment variables are required. They are already set in your `.env` file with default values, but you may need to customize them:

### Server Configuration
- `NODE_ENV=development` - Environment mode
- `PORT=3000` - Port the server runs on
- `API_PREFIX=/api/v1` - API base path

### Database Configuration
- `DATABASE_URL="postgresql://postgres:password@localhost:5432/time_off_db?schema=public"`
  - **Username**: postgres
  - **Password**: password
  - **Host**: localhost (or postgres if using Docker)
  - **Port**: 5432
  - **Database**: time_off_db

### JWT Configuration
- `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`
  - **IMPORTANT**: Change this to a strong, random secret key in production!
  - Generate a secure key: You can use `openssl rand -base64 32` or any password generator
- `JWT_EXPIRES_IN=24h` - Access token expiration
- `JWT_REFRESH_EXPIRES_IN=7d` - Refresh token expiration

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS=900000` - 15 minutes window
- `RATE_LIMIT_MAX_REQUESTS=100` - Max requests per window

### Logging
- `LOG_LEVEL=info` - Log level (error, warn, info, debug)
- `LOG_FILE=logs/app.log` - Log file path

## Database Setup Options

### Option 1: Using Docker (Recommended)
If you have Docker installed:
```bash
# Start only the database
docker compose up -d postgres

# Or start both app and database
docker compose up -d
```

### Option 2: Local PostgreSQL Installation
If you have PostgreSQL installed locally:
1. Create a database named `time_off_db`
2. Ensure PostgreSQL is running on port 5432
3. Use the default credentials or update DATABASE_URL accordingly

## Setup Steps

1. **Dependencies are being installed** (npm install - running in background)

2. **Database Setup**:
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # Optional: Seed with test data
   npm run db:seed
   ```

3. **Start the Application**:
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- **POST** `/api/v1/auth/register` - Register new user
- **POST** `/api/v1/auth/login` - Login user

### Time-Off Requests (requires authentication)
- **GET** `/api/v1/time-off/requests` - List requests
- **POST** `/api/v1/time-off/requests` - Create request
- **PUT** `/api/v1/time-off/requests/:id/approve` - Approve request (Manager/Admin)
- **PUT** `/api/v1/time-off/requests/:id/reject` - Reject request (Manager/Admin)
- **PUT** `/api/v1/time-off/requests/:id/cancel` - Cancel request (Employee)

### User Roles
- **EMPLOYEE**: Can create and cancel their own requests
- **MANAGER**: Can approve/reject requests for their team
- **ADMIN**: Full access to all features

## Test Users (after seeding)
- **Admin**: admin@example.com / AdminPass123
- **Manager**: manager@example.com / ManagerPass123
- **Employee**: employee@example.com / EmployeePass123

## Important Notes
- The JWT_SECRET must be changed for production security
- Database credentials should be secured
- Rate limiting is enabled to prevent abuse
- All passwords are hashed with bcrypt
- The application uses structured logging with Winston

## Troubleshooting
- If database connection fails, check PostgreSQL is running and credentials are correct
- If port 3000 is in use, change PORT in .env
- Check logs in `logs/app.log` for errors
- Run `npm run test` to verify everything is working

## Next Steps
1. Ensure database is running (Docker or local PostgreSQL)
2. Run the Prisma commands above
3. Start the server with `npm run dev`
4. Test the API endpoints using tools like Postman or curl