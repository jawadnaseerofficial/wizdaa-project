# Time-Off Microservice

A production-ready, enterprise-grade Time-Off Management Microservice built with Node.js, TypeScript, Express, and PostgreSQL. This service provides a comprehensive solution for managing employee time-off requests with role-based access control, authentication, and robust business logic.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Employee, Manager, Admin)
  - Secure password hashing with bcrypt
  - Token refresh mechanism

- **Time-Off Management**
  - Create time-off requests
  - List and filter requests (by status, date range, employee)
  - Approve/reject requests (managers only)
  - Cancel requests (employees only, pending only)
  - Real-time balance tracking
  - Overlap detection

- **Security**
  - Input validation with Joi
  - Rate limiting
  - SQL injection prevention (Prisma ORM)
  - Helmet security headers
  - CORS configuration

- **Testing**
  - Unit tests with Jest
  - Integration tests with Supertest
  - >80% code coverage

- **Production Ready**
  - Structured logging with Winston
  - Error handling middleware
  - Environment-based configuration
  - TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.6
- **Framework**: Express 4.21
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.22
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi 17.13
- **Testing**: Jest 29.7, Supertest 7.0
- **Logging**: Winston 3.16

## Architecture

```
time-off-microservice/
├── src/
│   ├── __tests__/          # Test files
│   │   ├── integration/    # Integration tests
│   │   ├── unit/           # Unit tests
│   │   └── setup.ts        # Test configuration
│   ├── config/             # Configuration files
│   │   ├── database.ts     # Prisma client
│   │   ├── logger.ts       # Winston logger
│   │   └── index.ts
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── timeOff.controller.ts
│   │   └── index.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication & authorization
│   │   ├── error.ts        # Error handling
│   │   ├── rateLimit.ts    # Rate limiting
│   │   ├── validation.ts   # Request validation
│   │   └── index.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── timeOff.routes.ts
│   │   └── index.ts
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── timeOff.service.ts
│   │   └── index.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── date.ts         # Date utilities
│   │   ├── errors.ts       # Custom errors
│   │   ├── jwt.ts          # JWT utilities
│   │   ├── password.ts     # Password utilities
│   │   ├── validation.ts   # Validation schemas
│   │   └── index.ts
│   └── index.ts            # Application entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd time-off-microservice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure the following variables:
   ```env
   NODE_ENV=development
   PORT=3000
   API_PREFIX=/api/v1
   DATABASE_URL="postgresql://postgres:password@localhost:5432/time_off_db?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   LOG_FILE=logs/app.log
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Seed the database with test data
   npm run db:seed
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000/api/v1`

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "token": "<token>"
}
```

### Time-Off Endpoints

#### Create Time-Off Request
```http
POST /time-off
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-01-19T00:00:00.000Z",
  "reason": "Family vacation"
}
```

#### List Time-Off Requests
```http
GET /time-off?status=PENDING&page=1&pageSize=10
Authorization: Bearer <token>
```

Query Parameters:
- `status`: Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `startDateFrom`: Filter by start date from
- `startDateTo`: Filter by start date to
- `userId`: Filter by user ID (managers/admins only)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)

#### Get Time-Off Request by ID
```http
GET /time-off/:id
Authorization: Bearer <token>
```

#### Approve Time-Off Request
```http
PUT /time-off/:id/approve
Authorization: Bearer <token>
```

*Requires Manager or Admin role*

#### Reject Time-Off Request
```http
PUT /time-off/:id/reject
Authorization: Bearer <token>
```

*Requires Manager or Admin role*

#### Cancel Time-Off Request
```http
PUT /time-off/:id/cancel
Authorization: Bearer <token>
```

*Employees can only cancel their own pending requests*

#### Get Time-Off Balance
```http
GET /time-off/balance/me
Authorization: Bearer <token>
```

### Health Check
```http
GET /health
```

## Business Rules

1. **Request Creation**
   - Employees can only request time-off for future dates
   - End date must be after start date
   - Cannot request more days than available balance
   - Cannot create overlapping requests

2. **Request Approval**
   - Only managers and admins can approve requests
   - Can only approve pending requests
   - Balance is updated upon approval

3. **Request Rejection**
   - Only managers and admins can reject requests
   - Can only reject pending requests

4. **Request Cancellation**
   - Employees can only cancel their own requests
   - Can only cancel pending requests
   - Balance is updated upon cancellation

5. **Balance Calculation**
   - Total days: 20 per year (configurable)
   - Used days: Sum of approved requests
   - Pending days: Sum of pending requests
   - Remaining days: Total - Used - Pending

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Unit Tests Only
```bash
npm test -- --testPathPattern=unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory.

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database (use with caution)
npx prisma migrate reset
```

## Security Considerations

1. **Authentication**
   - JWT tokens are used for authentication
   - Tokens expire after 24 hours (configurable)
   - Refresh tokens are supported

2. **Authorization**
   - Role-based access control (RBAC)
   - Employees can only access their own data
   - Managers can access all employee data
   - Admins have full access

3. **Input Validation**
   - All inputs are validated using Joi schemas
   - SQL injection prevention via Prisma ORM
   - XSS prevention via proper escaping

4. **Rate Limiting**
   - Auth endpoints: 5 requests per 15 minutes
   - General endpoints: 100 requests per 15 minutes

5. **Password Security**
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Minimum password requirements: 8 characters, 1 uppercase, 1 lowercase, 1 number

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ],
  "statusCode": 400
}
```

## Deployment

### Environment Variables

Ensure the following environment variables are set in production:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=24h
LOG_LEVEL=error
```

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t time-off-microservice .
docker run -p 3000:3000 --env-file .env time-off-microservice
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on the repository.

## Acknowledgments

- Built with [Express](https://expressjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Authentication with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- Testing with [Jest](https://jestjs.io/)