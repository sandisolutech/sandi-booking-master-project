# Authentication System Setup

This document describes the account management and authentication system implemented for the BookSpace application.

## Overview

The authentication system provides:
- User account management (CRUD operations)
- Role-based access control (Administrator, Manager, Staff)
- Password hashing with bcrypt
- Login/logout functionality
- Password change capability

## Database Setup

1. **Run the migration to create the user accounts table:**
   \`\`\`bash
   node scripts/run-user-accounts-migration.js
   \`\`\`

2. **Install required dependencies:**
   \`\`\`bash
   npm install bcryptjs
   npm install @vercel/postgres  # if not already installed
   \`\`\`

## Default Accounts

The migration creates three default accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@bookspace.com | admin123 | Administrator |
| manager@bookspace.com | manager123 | Manager |
| staff@bookspace.com | staff123 | Staff |

## Features

### Account Management (Settings > Account Tab)

- **User List**: View all user accounts with their roles and status
- **Add User**: Create new user accounts with email, password, and role
- **Edit User**: Update user information (name, email, role)
- **Delete User**: Remove user accounts (with confirmation)
- **Toggle Status**: Enable/disable user accounts
- **Change Password**: Update current user's password

### Authentication

- **Login Page**: `/login` - Authenticate users with email/password
- **API Endpoint**: `/api/auth/login` - Handle authentication requests
- **Session Management**: Basic session storage (can be enhanced with JWT)

## File Structure

\`\`\`
app/
├── admin/settings/
│   ├── auth-actions.ts     # Database operations for user management
│   └── page.tsx           # Settings page with Account tab
├── api/auth/login/
│   └── route.ts           # Login API endpoint
└── login/
    └── page.tsx           # Login page component

scripts/
├── create-user-accounts-table.sql    # Database migration
└── run-user-accounts-migration.js    # Migration runner
\`\`\`

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **Input Validation**: Email format validation and required field checks
- **SQL Injection Protection**: Parameterized queries using Vercel Postgres
- **Status Management**: Inactive users cannot log in

## Usage

1. **Access the settings**: Navigate to Admin > Settings > Account tab
2. **Manage users**: Add, edit, delete, or toggle user status
3. **Change password**: Use the password change form for the current user
4. **Login**: Use the `/login` page with valid credentials

## Future Enhancements

- JWT token-based authentication
- Password reset functionality
- Two-factor authentication
- Audit logging for user actions
- Session timeout management
- More granular permissions system

## API Reference

### POST /api/auth/login

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "Administrator",
    "status": "Active",
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

**Response (Error):**
\`\`\`json
{
  "message": "Invalid email or password"
}
\`\`\`
