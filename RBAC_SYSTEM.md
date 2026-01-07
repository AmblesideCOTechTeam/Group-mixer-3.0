# Role-Based Access Control (RBAC) System

## Overview
The Grade Randomizer app now includes a comprehensive role-based access control system that restricts features based on user roles. All authentication is required, and permissions are validated on every action.

## Default Admin Account
- **Username**: `GreenDragon771`
- **Password**: `asdf`
- This account has full administrative access to all features

## User Roles

### Admin (Full Access)
Administrators have complete control over the application and can access all features:

**Accessible Settings:**
- General (modify number of groups, group names, confetti, animation duration, reset all)
- Appearance (dark mode, layout density, backgrounds)
- Colors (theme customization)
- Sounds (audio controls)
- Add Student (add individual students)
- Import (bulk import students)
- History (view and restore shuffle history)
- Analytics (view pair frequencies)
- Force Pairing (create force pairings and assignments)
- Customization (custom colors)
- Admin Panel (user management)
- Audit Logs (view all system actions)
- Help

**Admin-Only Actions:**
- Promote/demote users between roles
- View complete audit logs of all actions
- Lock/unlock settings (future feature)
- Enable read-only mode (future feature)
- Access to full user management system

---

### Moderator (Restricted Access)
Moderators can manage students and groups but cannot modify system settings or access sensitive features:

**Accessible Settings:**
- Appearance (dark mode, layout density, backgrounds)
- Colors (theme customization)
- Sounds (audio controls)
- Add Student (add individual students)
- Import (bulk import students)
- History (view history, read-only)
- Analytics (view pair frequencies)
- Customization (custom colors)
- Help

**Cannot Access:**
- Force Pairing (cannot create forced pairings)
- General settings (cannot modify number of groups, etc.)
- Admin Panel (cannot manage users)
- Audit Logs (cannot view system actions)
- Reset All Settings

---

### Normal User (Limited Access)
Normal users can only view and customize their personal preferences:

**Accessible Settings:**
- Appearance (dark mode, layout density, backgrounds)
- Colors (theme customization)
- Sounds (audio controls)
- History (view only, cannot modify)
- Help

**Cannot Access:**
- Add Student
- Import students
- Force Pairing
- Modify history
- Analytics
- User management
- Audit logs
- General settings
- Customization

---

## How Authentication Works

### Login Flow
1. User navigates to the app
2. If not authenticated, LoginPage displays
3. User enters credentials (username + password)
4. Credentials are verified against the `users` table in Supabase
5. On successful login:
   - Session token is created (valid for 7 days)
   - User info is stored in localStorage
   - Session data is stored in Supabase `sessions` table
6. User is redirected to the main app

### Session Management
- Sessions are stored in the `sessions` table with expiration
- Invalid/expired sessions are automatically cleaned up
- Session validation occurs on app load
- User must login again after session expiration

### Logout
- Session token is deleted from database
- User data is cleared from localStorage
- User is redirected to LoginPage

---

## Permission System

### Permission Matrix
Each role has a set of permissions that determine what they can access:

```
ADMIN:
  - view_settings, modify_general, modify_appearance, modify_sounds
  - add_student, import_students
  - view_history, modify_history
  - view_analytics
  - force_pairing
  - manage_groups
  - reset_settings
  - manage_users
  - view_audit_logs
  - lock_settings

MODERATOR:
  - view_settings, modify_appearance, modify_sounds
  - add_student, import_students
  - view_history
  - view_analytics
  - manage_groups

USER:
  - view_settings, modify_appearance, modify_sounds
  - view_history
```

### Permission Checking
- `usePermissions()` hook provides permission checking
- `can(permission)` returns true/false for a permission
- `cannot(permission)` returns the opposite
- `canViewTab(tabId)` checks if user can access a settings tab
- Permissions are checked before displaying UI
- Admin/moderator-only tabs are hidden from normal users

---

## Database Schema

### Users Table
```sql
users (
  id: uuid primary key
  username: text unique
  password_hash: text
  role: 'admin' | 'moderator' | 'user'
  created_at: timestamp
  updated_at: timestamp
)
```

### Sessions Table
```sql
sessions (
  id: uuid primary key
  user_id: uuid (foreign key to users)
  token: text unique
  expires_at: timestamp
  created_at: timestamp
)
```

### Audit Logs Table
```sql
audit_logs (
  id: uuid primary key
  user_id: uuid (foreign key to users)
  action: text
  details: jsonb
  created_at: timestamp
)
```

---

## File Structure

### New Files Created:
```
src/
├── types/
│   └── auth.ts                 # Auth type definitions
├── services/
│   ├── authService.ts          # Authentication logic
│   └── supabaseClient.ts        # Supabase client setup
├── context/
│   └── AuthContext.tsx          # Auth context provider
├── hooks/
│   └── usePermissions.ts        # Permission checking hook
└── components/
    ├── LoginPage.tsx            # Login form
    ├── AdminPanel.tsx           # Admin user management
    └── AuditLogViewer.tsx       # Audit log viewer
```

---

## UI Changes

### Login Page
- Beautiful login form displayed when not authenticated
- Shows demo credentials for testing
- Error messages for invalid credentials
- Loading state during authentication

### Settings Modal
- Dynamically filtered tab list based on user role
- Only shows tabs user has permission to access
- Admin and Moderator tabs are hidden from normal users
- "Insufficient Permissions" message when accessing restricted features

### Admin Panel (Admin-Only)
- User role management interface
- Promote/demote users between roles
- Real-time feedback on actions

### Audit Logs (Admin-Only)
- View all system actions with timestamps
- See details of each action
- Immutable historical record

---

## Audit Logging

### What Gets Logged
- User promotions/demotions
- Settings changes (future expansion)
- Important administrative actions
- Timestamp and user ID for all actions

### Accessing Logs
- Only admins can view audit logs
- Accessible via Settings → Audit Logs tab
- Shows last 100 logs with most recent first
- Includes detailed JSON data for each action

---

## Security Features

### Data Protection
- Row Level Security (RLS) enabled on all tables
- Passwords stored (note: currently plaintext for demo - use bcrypt in production)
- Sessions have automatic expiration (7 days)
- Unauthorized access returns permission denied errors

### Future Enhancements
- Password hashing with bcrypt
- Email verification for new accounts
- Two-factor authentication (2FA)
- Rate limiting on login attempts
- IP-based security restrictions
- Encrypted session tokens

---

## Testing Guide

### Admin User
- Login with `GreenDragon771 / asdf`
- All settings tabs are visible
- Can access Admin Panel to manage users
- Can view Audit Logs

### Moderator User
- Create via Admin Panel (promote any user to moderator)
- Force Pairing tab is hidden
- Admin/Audit tabs are hidden
- Can add and import students

### Normal User
- Create via Admin Panel (default new users)
- Only personal preference settings visible
- Cannot add/import students
- Cannot access analytics or history
- Cannot see admin/moderator features

---

## Integration Notes

### Existing Code Compatibility
- All existing Grade Randomizer features work as before
- Authentication layer added transparently
- Permission system filters features at UI level
- No changes needed to student management logic

### Environment Setup
- Ensure `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Database migrations automatically create RBAC tables
- Default admin user is created on first migration

---

## Future Enhancements

1. **Lock Settings**: Admin can lock settings globally
2. **Read-Only Mode**: Emergency mode where only admins can modify
3. **Custom Permissions**: Create custom roles with specific permissions
4. **Session Management**: Admin view of all active sessions
5. **User Invitation**: Send invites to new users
6. **Password Reset**: Secure password reset flow
7. **2FA Support**: Two-factor authentication
8. **Rate Limiting**: Prevent brute-force attacks
9. **Email Notifications**: Alert on important actions
10. **Detailed Audit Reports**: Export audit logs to CSV/PDF
