# Node.js Express + MongoDB Authentication System

A complete authentication system built with Node.js, Express, and MongoDB, featuring JWT-based authentication, role-based authorization, and secure session management.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control (User, Moderator, Admin)
- Secure password hashing with bcrypt
- MongoDB integration with Mongoose
- Cookie-based session management
- CORS support
- Environment variable configuration

## Prerequisites

- Node.js (v12 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd js-express-login--mongodb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8080
   AUTH_SECRET=your-secret-key
   COOKIE_SECRET=your-cookie-secret
   ```

4. Start MongoDB server

5. Run the application:
   ```bash
   node server.js
   ```

The server will start on port 8080 (or the port specified in your .env file).

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user

### Test Routes
- `GET /api/test/all` - Public access
- `GET /api/test/user` - User access
- `GET /api/test/mod` - Moderator access
- `GET /api/test/admin` - Admin access

## Request Examples

### Sign Up

json
POST /api/auth/signup
{
"username": "user1",
"email": "user1@example.com",
"password": "password123",
"roles": ["user"]
}

### Sign In

json
POST /api/auth/signin
{
"username": "user1",
"password": "password123"
}


## Project Structure

- `server.js` - Entry point, Express configuration
- `app/config/` - Configuration files
- `app/controllers/` - Request handlers
- `app/middlewares/` - Custom middleware (auth, validation)
- `app/models/` - Mongoose models
- `app/routes/` - API routes

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- HTTP-only cookies
- CORS protection
- Input validation
- Role-based access control

## Dependencies

- bcryptjs
- cookie-session
- cors
- dotenv
- express
- jsonwebtoken
- mongoose

## Author

janpc01