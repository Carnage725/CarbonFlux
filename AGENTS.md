# AGENTS.md - CarbonFlux Development Guidelines

## Build/Lint/Test Commands

**Frontend (React/TypeScript):**
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run lint` - Run ESLint
- No test framework configured yet

**Backend (FastAPI/Python):**
- No dedicated test/lint commands (uses FastAPI auto-reload)
- Run via: `uvicorn app.main:app --reload`

**Full Stack:**
- `docker-compose up --build` - Build and run all services
- `docker-compose up` - Run existing containers

## Code Style Guidelines

**TypeScript/React:**
- Strict TypeScript with no unused locals/parameters
- Functional components with hooks (no classes)
- Interface definitions for all props and data structures
- Import order: React, external libs, internal modules
- Async/await for all async operations
- Error handling with try/catch blocks

**Python/FastAPI:**
- Snake_case for variables/functions, PascalCase for classes
- Type hints on all function parameters and return values
- Async/await for database operations
- Pydantic models for API request/response validation
- Descriptive docstrings on all endpoints

**General:**
- No console.log in production code
- Meaningful variable/function names
- Single responsibility principle
- Early returns for error conditions
- Consistent indentation (2 spaces for JS/TS, 4 for Python)