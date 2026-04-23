# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-04-24

### Added
- Initial release of Time-Off Microservice
- User authentication with JWT
- Role-based access control (Employee, Manager, Admin)
- Time-off request management
  - Create requests
  - List requests with filtering
  - Approve/reject requests (managers/admins)
  - Cancel requests (employees)
- Time-off balance tracking
- Input validation with Joi
- Rate limiting
- Comprehensive error handling
- Structured logging with Winston
- Unit and integration tests
- Docker support
- API documentation

### Security
- Password hashing with bcrypt
- SQL injection prevention via Prisma ORM
- Helmet security headers
- CORS configuration
- Request validation

### Testing
- Unit tests for services and utilities
- Integration tests for API endpoints
- >80% code coverage

## [Unreleased]

### Planned
- Email notifications for request status changes
- Calendar integration
- Multi-language support
- Advanced reporting and analytics
- Webhook support for integrations