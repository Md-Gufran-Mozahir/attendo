# Authentication Middleware

This directory contains middleware for authentication and authorization in the Attendo application.

## Primary Authentication File

The primary authentication middleware is in `authMiddleware.js`. This file contains:

- `protect`: Verifies JWT tokens and sets the user in the request object
- Role-based middleware:
  - `admin`: Restricts access to admin users
  - `teacher`: Restricts access to teacher users
  - `student`: Restricts access to student users
  - `teacherOrAdmin`: Restricts access to teachers or admins
  - `studentOrTeacher`: Restricts access to students or teachers

## Legacy Support

For backward compatibility, the `authMiddleware.js` file also exports aliases:
- `auth` (same as `protect`)
- `adminOnly` (same as `admin`)
- `teacherOnly` (same as `teacher`)
- `studentOnly` (same as `student`)
- `teacherOrAdminOnly` (same as `teacherOrAdmin`)
- `studentOrTeacherOnly` (same as `studentOrTeacher`)

## Deprecation Notice

The `auth.js` file is deprecated and will be removed in a future update. All API files should be updated to use imports from `authMiddleware.js`. 