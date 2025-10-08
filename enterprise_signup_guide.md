# Enterprise User Sign-up Guide for ClassroomIO

This guide explains how to create a user/signup manually with organization name that has the highest privilege (Enterprise level) in ClassroomIO.

## Overview

ClassroomIO's authentication system is built on top of Supabase Auth. The actual sign-up flow is different from what I initially described. Here's how it actually works:

## Current Signup Flow

### 1. Standard Email/Password Registration
- User goes to `/signup` page
- Fills email, password, and confirm password fields
- System creates a Supabase Auth user account
- System creates a profile in the `profile` table
- **User is redirected to `/login` page, NOT onboarding**
- System sends a verification email to the provided email address

### 2. Actual Database Schema Created During Sign-up
1. **`auth.users`** - Supabase Auth table (automatically created via `supabase.auth.signUp()`)
2. **`profile`** - User profile information created with:
   - id: Supabase user ID
   - username: Extracted from email prefix + timestamp
   - fullname: Extracted from email prefix
   - email: Provided email address
   - metadata: IP-based location data

### 3. No Organization Created During Sign-up
- The signup process does NOT create an organization
- The signup process does NOT create an organization member record
- The user needs to log in first, then go through onboarding to create an organization

## Corrected Step-by-Step Enterprise Setup Process

### Step 1: Sign Up (Email/Password)
- Go to `/signup`
- Fill email, password, confirm password
- Submit the form
- Check your email for verification
- You'll be redirected to `/login`

### Step 2: Log In After Verification
- Go to `/login`
- Use the registered email and password
- After successful login, if you don't have an organization, you'll be automatically redirected to `/onboarding`

### Step 3: Onboarding Process for Enterprise Setup
- On the `/onboarding` page:
  - **Full name**: Your full name
  - **Organization name**: The name of your organization (e.g., "My Enterprise Org")
  - **Site name**: Subdomain name for the organization
- Complete both steps of the onboarding flow
- Submit the form

### Step 4: Enterprise Privilege Assignment
- During the onboarding process, the system creates:
  1. An organization in the `organization` table
  2. An organization member record in `organizationmember` table with `role_id: 1` (ADMIN)
- This gives you full administrative control over your organization

## Role System

### Roles Mapping
- `ROLE.ADMIN = 1` (highest privilege - full access)
- `ROLE.TUTOR = 2` (instructor/teacher access)
- `ROLE.STUDENT = 3` (student access)

## Enterprise Features Access

The user with `role_id: 1` (ADMIN) gets access to:
- Full organization management
- All courses and content creation
- User management (teachers, students)
- Billing and subscription management
- All settings and configurations
- Advanced analytics and reporting

## Important Notes

1. **Verification Required**: The signup process sends a verification email to the provided address. The user must verify their email to fully activate the account.

2. **No Automatic Organization**: The signup process does NOT create an organization automatically.

3. **Onboarding Trigger**: The onboarding process is triggered after login if the user doesn't have an associated organization.

4. **Admin Role Assignment**: Only during the onboarding process is the user assigned the ADMIN role (role_id: 1) when they create their organization.

5. **Email Verification**: After signup, users must verify their email address before they can proceed with the onboarding process.

## Database Schema for Complete Enterprise Setup

### Tables Involved
1. **`auth.users`** - Created during sign-up
2. **`profile`** - Created during sign-up 
3. **`organization`** - Created during onboarding
4. **`organizationmember`** - Created during onboarding with role_id: 1 (ADMIN)

## Manual Enterprise Setup Process

To create an enterprise user manually:

1. Navigate to the signup page (`/signup`)
2. Fill in email, password, and confirm password
3. Check your email and verify the account
4. Log in at `/login` with the credentials
5. Complete the onboarding flow by providing:
   - Full name
   - Organization name
   - Site name (subdomain)
   - Use case information (optional)
6. The system automatically assigns ADMIN privileges (role_id: 1) to the organization
7. User gains full administrative control over their organization

This creates a complete enterprise setup with an admin user who has the highest privileges in the ClassroomIO system.