# Contributing to Time-Off Microservice

Thank you for your interest in contributing to the Time-Off Microservice! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate in all interactions. We are committed to providing a welcoming and inclusive environment.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or logs if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear description of the enhancement
- Motivation for the enhancement
- Examples of how the enhancement would be used
- Possible implementation approaches

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write tests for your changes
5. Ensure all tests pass (`npm test`)
6. Ensure code follows the project's style guidelines (`npm run lint` && `npm run format`)
7. Commit your changes with a clear message
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Development Guidelines

#### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

#### Testing

- Write unit tests for new functions and classes
- Write integration tests for new API endpoints
- Ensure test coverage remains above 80%
- Run tests before committing (`npm test`)

#### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(auth): add refresh token support

Implement token refresh mechanism to improve user experience
and security. Users can now refresh their tokens without
re-authenticating.

Closes #123
```

#### Branch Naming

Use descriptive branch names:
- `feature/feature-name`
- `fix/bug-description`
- `docs/documentation-update`
- `refactor/refactor-description`

## Project Structure

```
src/
├── __tests__/          # Tests
├── config/             # Configuration
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── routes/             # API routes
├── services/           # Business logic
├── types/              # TypeScript types
├── utils/              # Utility functions
└── index.ts            # Entry point
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Set up the database: `npm run prisma:migrate`
5. Run the development server: `npm run dev`

## Questions?

Feel free to open an issue for any questions or clarifications.