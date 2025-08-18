# ARKABA Admin Dashboard Setup

## Overview
The ARKABA dashboard has been updated with admin-only access control. Only users with `isAdmin: true` can access the dashboard and its features.

## Features Added

### 1. Admin Access Control
- New `isAdmin` field in member model
- Dashboard routes are protected and require admin authentication
- Only admin users can access `/dashboard/*` routes

### 2. Enhanced Member Management
- `isAdmin` field visible in member cards
- Checkbox to grant/revoke admin access when creating/editing members
- Clear visual indicators for admin vs regular members

### 3. Authentication Protection
- `ProtectedAdminRoute` component wraps all dashboard pages
- Automatic redirect to login for unauthenticated users
- Automatic redirect to home for non-admin users

## Setup Instructions

### 1. Create Initial Admin User
Run the provided script to create your first admin user:

```bash
node createAdminUser.js
```

This will create a user with:
- Email: `admin@arkaba.org`
- Password: `admin123`
- Admin privileges: `true`

### 2. Environment Variables
Ensure these environment variables are set in your `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
```

### 3. Login and Access
1. Navigate to `/members-login`
2. Login with admin credentials
3. Access dashboard at `/dashboard`

## Usage

### Granting Admin Access
1. Go to Dashboard > Member Management
2. Create a new member or edit existing member
3. Check the "Grant Admin Access" checkbox
4. Save changes

### Revoking Admin Access
1. Edit the member in Member Management
2. Uncheck the "Grant Admin Access" checkbox
3. Save changes

### Security Notes
- Admin users have full access to all dashboard features
- Regular members cannot access dashboard routes
- The `isAdmin` field is protected and only editable by existing admins
- Session-based authentication ensures secure access

## Technical Implementation

### Components
- `ProtectedAdminRoute.jsx` - Route protection wrapper
- Updated `dashboard/layout.jsx` - Protected dashboard layout
- Updated `dashboard/members/page.jsx` - Admin field management

### API Endpoints
- All existing member API endpoints support the `isAdmin` field
- No additional API changes required

### Authentication Flow
1. User attempts to access dashboard
2. `ProtectedAdminRoute` checks session and admin status
3. If not authenticated → redirect to login
4. If not admin → redirect to home
5. If admin → render dashboard content

## Troubleshooting

### Common Issues

1. **"Loading..." screen doesn't disappear**
   - Check if NextAuth is properly configured
   - Verify session provider is wrapping the app

2. **Redirect loops**
   - Ensure `NEXTAUTH_URL` is set correctly
   - Check MongoDB connection

3. **Admin checkbox not working**
   - Verify member model includes `isAdmin` field
   - Check browser console for errors

### Testing Admin Access
1. Create a regular member (no admin access)
2. Try to access `/dashboard` - should redirect to home
3. Login as admin user
4. Access `/dashboard` - should work normally
5. Edit regular member to grant admin access
6. Login as that member - should now access dashboard

## Support
For issues or questions about the admin system, check:
1. Browser console for JavaScript errors
2. Server logs for API errors
3. MongoDB connection status
4. NextAuth configuration
