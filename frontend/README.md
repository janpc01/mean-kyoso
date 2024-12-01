# Angular 17 JWT Authentication

A complete authentication system built with Angular 17 that implements JWT (JSON Web Token) authentication with role-based authorization.

## Features

- User registration and login
- JWT authentication
- Role-based access control (Admin, Moderator, User)
- Protected routes
- HTTP interceptor for handling auth tokens
- Session storage management
- Responsive UI with Bootstrap
- test

## Prerequisites

- Node.js (v16 or higher)
- Angular CLI (v17.3.0 or higher)
- A compatible backend server running on `http://localhost:8080` (see below for instructions)

## Environment Setup

1. Backend Server:
   - Clone the backend repository:
   ```bash
   git clone https://github.com/janpc01/mean-authentication-authorization
   cd mean-authentication-authorization
   npm install
   node server.js
   ```
   - Server will run on `http://localhost:8080`

2. Frontend Application:
   - Clone this repository
   - Install dependencies:
   ```bash
   npm install
   ```

## Development Server

Run the development server:
```bash
ng serve --port 8081
```
Navigate to `http://localhost:8081/`. The application will automatically reload if you change any of the source files.

## Project Structure

- `src/app/_services/` - Authentication and user services
- `src/app/components/` - Feature components (login, register, profile, etc.)
- `src/_helpers/` - HTTP interceptor for handling auth tokens
- `src/app/board-*` - Role-specific components

## API Endpoints

The application connects to the following backend endpoints:

- POST `/api/auth/signin` - User login
- POST `/api/auth/signup` - User registration
- POST `/api/auth/signout` - User logout
- GET `/api/test/all` - Public content
- GET `/api/test/user` - Protected user content
- GET `/api/test/mod` - Protected moderator content
- GET `/api/test/admin` - Protected admin content

## Building for Production

Build the project for production:
```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

Execute unit tests:
```bash
ng test
```


## Key Components

### Authentication Service
The auth service handles all authentication-related operations:

typescript:src/app/services/auth.service.ts
startLine: 18
endLine: 35

### Storage Service
Manages user session data:

typescript:src/app/services/storage.service.ts
startLine: 12
endLine: 35

## Available Routes

- `/home` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/profile` - User profile
- `/user` - User board (authenticated users only)
- `/mod` - Moderator board (moderators only)
- `/admin` - Admin board (administrators only)

## Security Features

- HTTP-only cookies for token storage
- Cross-Origin Resource Sharing (CORS) support
- Protected routes with role-based guards
- Session management
- Secure password handling

