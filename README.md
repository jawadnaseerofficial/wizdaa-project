# Time-Off Microservice with HCM Balance Sync

A production-ready, enterprise-grade Time-Off Management Microservice built with **NestJS**, **TypeScript**, **SQLite**, and **Prisma ORM**. This service provides a comprehensive solution for managing employee time-off requests with role-based access control, authentication, HCM balance synchronization, and robust business logic.

## 🎯 Assessment Features

- ✅ **NestJS Framework**: Modern Node.js framework with TypeScript
- ✅ **SQLite Database**: Lightweight, file-based database with Prisma ORM
- ✅ **HCM Integration**: Mock endpoints for real-time and batch balance sync
- ✅ **Balance Integrity**: Defensive programming for external system integration
- ✅ **Comprehensive Testing**: Jest test suite with coverage reports
- ✅ **TRD Documentation**: Technical Requirements Document included

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with Passport
- Role-based access control (Employee, Manager, Admin)
- Secure password hashing with bcryptjs
- Class-validator DTOs for input validation

### 📅 Time-Off Management
- Create time-off requests with balance validation
- Approve/reject requests (Manager/Admin roles)
- Cancel requests (Employee role, pending only)
- Real-time balance tracking per employee/location/year
- Overlap detection and business rule enforcement

### 🔄 HCM Balance Sync
- **Real-time sync**: Query external HCM balances
- **Batch sync**: Bulk update balances from HCM systems
- **Defensive programming**: Graceful handling of HCM API failures
- **Audit trail**: HcmSyncEvent logging for all sync operations

### 🛡️ Security & Production Ready
- Helmet security headers
- CORS configuration
- Rate limiting middleware
- Global validation pipes
- Structured error handling
- Winston logging integration

### 🧪 Testing Suite
- Unit tests for services and controllers
- Integration tests for API endpoints
- E2E tests for complete workflows
- Mock HCM endpoints for testing edge cases
- >80% code coverage target

## 🏗️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 11.x (with TypeScript)
- **Database**: SQLite 5.x (with Prisma ORM)
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer
- **Testing**: Jest 29.x with Supertest
- **Documentation**: Compodoc (optional)

## 🏛️ Architecture

```
time-off-microservice/
├── src/
│   ├── app.controller.ts      # Root controller
│   ├── app.module.ts          # Root module
│   ├── app.service.ts         # Root service
│   ├── main.ts                # Application bootstrap
│   ├── auth/                  # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.decorator.ts
│   │   └── roles.guard.ts
│   ├── time-off/              # Time-off management module
│   │   ├── time-off.controller.ts
│   │   ├── time-off.module.ts
│   │   ├── time-off.service.ts
│   │   └── dto/
│   ├── hcm/                   # HCM integration module
│   │   ├── hcm.controller.ts
│   │   ├── hcm.module.ts
│   │   └── hcm.service.ts
│   ├── health/                # Health check module
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── prisma/                # Database module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── common/                # Shared components
│       ├── filters/
│       ├── interceptors/
│       └── pipes/
├── prisma/
│   ├── schema.prisma          # SQLite database schema
│   └── seed.ts                # Database seeding
├── test/                      # E2E tests
├── .env.example               # Environment template
├── docker-compose.yml         # Docker setup
├── Dockerfile                 # Container config
├── jest.config.js             # Test configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── TRD.md                     # Technical Requirements Document
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jawadnaseerofficial/wizdaa-project.git
   cd wizdaa-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following in `.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed with test data
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

The API will be available at `http://localhost:3000/api/v1`

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@wizdaa.com` | `Password123!` |
| Manager | `manager@wizdaa.com` | `Password123!` |
| Employee | `employee@wizdaa.com` | `Password123!` |

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### 🔐 Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "EMPLOYEE",
  "locationId": "location-uuid"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "employee@wizdaa.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "employee@wizdaa.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "EMPLOYEE"
    }
  }
}
```

### 📅 Time-Off Management

#### Create Request
```http
POST /time-off/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "locationId": "location-uuid",
  "year": 2026,
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "days": 3,
  "reason": "Vacation"
}
```

#### Get User Requests
```http
GET /time-off/requests
Authorization: Bearer <token>
```

#### Get Balance
```http
GET /time-off/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [{
    "id": "uuid",
    "userId": "uuid",
    "locationId": "uuid",
    "year": 2026,
    "totalDays": 20,
    "availableDays": 18,
    "usedDays": 2,
    "pendingDays": 0,
    "location": {
      "name": "Headquarters",
      "externalId": "hq"
    }
  }]
}
```

#### Approve Request (Manager/Admin)
```http
PUT /time-off/requests/:id/approve
Authorization: Bearer <token>
```

#### Reject Request (Manager/Admin)
```http
PUT /time-off/requests/:id/reject
Authorization: Bearer <token>
```

#### Cancel Request (Employee)
```http
PUT /time-off/requests/:id/cancel
Authorization: Bearer <token>
```

### 🔄 HCM Integration

#### Real-time Balance Query
```http
GET /hcm/realtime?employeeId=uuid&locationId=uuid&year=2026
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employeeId": "uuid",
    "locationId": "uuid",
    "year": 2026,
    "availableDays": 18,
    "pendingDays": 3,
    "usedDays": 2,
    "totalDays": 20
  }
}
```

#### Batch Balance Sync
```http
POST /hcm/batch-sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "syncs": [{
    "employeeId": "uuid",
    "locationId": "uuid",
    "year": 2026,
    "externalBalance": 25
  }]
}
```

### 🏥 Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Service is healthy",
    "timestamp": "2026-04-24T..."
  }
}
```

## 📊 Business Rules

### Balance Integrity
1. **Pre-request Validation**: Check available balance before allowing requests
2. **Pending State Management**: Reserve balance when request is pending
3. **Approval Workflow**: Deduct balance only on approval, restore on rejection
4. **Cancellation Handling**: Restore balance when employee cancels approved request
5. **HCM Sync Priority**: External balance updates take precedence

### HCM Defensive Programming
- **API Failures**: Continue operation with cached balances
- **Invalid Data**: Validate combinations and handle gracefully
- **Race Conditions**: Use database transactions for all balance updates
- **Audit Trail**: Log all balance changes and HCM sync events

## 🧪 Testing

### Run Complete Test Suite
```bash
npm test
```

### Run with Coverage
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run in Watch Mode
```bash
npm run test:watch
```

## 🛠️ Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Management
```bash
# Open Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:migrate reset

# Generate client after schema changes
npm run prisma:generate
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔒 Security Features

- **JWT Authentication**: Stateless authentication with configurable expiration
- **Role-Based Access**: EMPLOYEE, MANAGER, ADMIN roles with specific permissions
- **Input Validation**: Comprehensive DTO validation with class-validator
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Rate Limiting**: Global rate limiting middleware
- **Security Headers**: Helmet for production security
- **CORS**: Configured for cross-origin requests

## 📈 Performance & Scalability

- **Database Optimization**: SQLite with proper indexing
- **Connection Pooling**: Prisma connection management
- **Caching Strategy**: Ready for Redis integration
- **Horizontal Scaling**: Stateless design supports multiple instances
- **Monitoring**: Health checks and structured logging

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="file:./prod.db"
JWT_SECRET=<strong-random-secret>
```

### Docker Deployment
```bash
# Build production image
docker build -t wizdaa-timeoff .

# Run container
docker run -p 3000:3000 --env-file .env wizdaa-timeoff
```

### PM2 Deployment (Alternative)
```bash
npm install -g pm2
pm2 start dist/main.js --name wizdaa-timeoff
```

## 📚 Documentation

- **TRD (Technical Requirements Document)**: See `TRD.md`
- **API Documentation**: Inline code documentation
- **Database Schema**: `prisma/schema.prisma`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Authentication with [Passport](http://www.passportjs.org/)
- Testing with [Jest](https://jestjs.io/)
- Validation with [class-validator](https://github.com/typestack/class-validator)

---

**Assessment Project**: This microservice demonstrates production-level engineering practices and meets all Wizdaa assessment requirements including NestJS framework, SQLite database, HCM sync mocks, and comprehensive testing.