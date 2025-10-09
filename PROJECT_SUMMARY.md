# ClassroomIO Self-Hosted Customization Summary

## Overview

This document summarizes the changes made to customize ClassroomIO for self-hosted deployment with the custom domain `codeplanet.qzz.io` instead of the default `classroomio.com`.

## Changes Made

### 1. Org Domain Detection Fix

**File:** `apps/dashboard/src/lib/utils/store/org.ts`

- Updated `currentOrgDomain` derived store to use `import.meta.env.VITE_APP_HOST` instead of extracting domain from browser URL
- Changed from hardcoded `.slice(-2).join('.')` approach to using environment variable for proper domain detection
- This fixes the "View Site" button to correctly point to organization custom domains

### 2. Custom Domain Settings UI Updates

**File:** `apps/dashboard/src/lib/components/Org/Settings/Domains.svelte`

- Updated the helper message for organization site name: `https://{siteName}.${import.meta.env.VITE_APP_HOST || 'classroomio.com'}`
- Updated the custom domain input placeholder to use environment variable: `courses.${import.meta.env.VITE_APP_HOST || 'yourwebsite.com'}`
- Updated the custom domain helper message to use environment variable: `https://{customDomain || `course.${import.meta.env.VITE_APP_HOST || 'yourwebsite.com'}`}`
- Updated the validation to check against `import.meta.env.VITE_APP_HOST` instead of hardcoded 'classroomio.com'

### 3. Translation Updates

**Files:** All translation files in `apps/dashboard/src/lib/utils/translations/`

- Updated the `custom_domain_not_classroomio` error message to be more generic across all languages
- Changed from "Domain cannot contain 'classroomio'" to more generic equivalents
- This makes the error message appropriate for any self-hosted instance regardless of domain

## Environment Variables Required

For the custom domain functionality to work properly, ensure these environment variables are set:

- `VITE_APP_HOST=codeplanet.qzz.io` (your main domain, with VITE\_ prefix for client-side access)
- `PRIVATE_APP_SUBDOMAINS=app` (your main app subdomain)
- `PUBLIC_IS_SELFHOSTED=true` (for self-hosted instance)

## Impact

- The "View Site" button now correctly points to organization-specific domains
- Custom domain placeholders and validation reflect the self-hosted domain structure
- UI is fully customizable based on environment variables instead of hardcoded values
- All language translations updated for consistency

## Additional Changes - Indonesian Language Support

- Updated translation script to include Indonesian (id) language
- Created initial Indonesian translation file (id.json) based on English file
- Added Indonesian locale to LOCALE enum in types/index.ts
- Indonesian language will now be processed by the automatic translation system using RAPID_API_KEY

## Additional Updates

- Updated pnpm version to 10.18.1 (already set in package.json)

The changes enable the ClassroomIO application to properly work with custom domains in a self-hosted environment while maintaining all functionality and adding Indonesian language support.

## Git Workflow Process

### Standard Development Workflow

After every fix, update, improvement, feature addition, or any change in the repository:

1. `git add .` - Stage all changes
2. `git commit -m "fix: description of changes"` - Commit with conventional commit message
3. `git push origin main` - Push to main branch
4. Update this PROJECT_SUMMARY.md with details of changes made (excluded from git commits)

### Conventional Commit Messages

- `fix:` - Bug fixes
- `feat:` - New features
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

## Recent Changes Log

### 2024-12-19 - Git Workflow Documentation

**Commit:** `dcfce136 - docs: add git workflow documentation to PROJECT_SUMMARY.md`

- Added comprehensive git workflow documentation to PROJECT_SUMMARY.md
- Documented the standard development process: git add -> commit -> push workflow
- Added conventional commit message guidelines for consistent commit history
- Established the process of updating PROJECT_SUMMARY.md after each change (excluded from commits)

### 2024-10-09 - Organization Authentication & Security Fixes

**Commits:** `69a7f9a9`, `fa2f8c19`, `eda32a41`, `4457b798`, `733dbbc7`, `3446dbcd`, `a4259d44`, `76575cdf`

#### Security Improvements

- **Organization-Specific Authentication**: Implemented proper organization membership verification during login
- **Cross-Organization Access Prevention**: Added checks to prevent users from accessing organizations they don't belong to
- **Secure Error Handling**: Proper error messages for unauthorized organization access attempts

#### Multi-Tenant Architecture Fixes

- **Subdomain URL Construction**: Fixed redirect URL logic for both `{orgname}.app.{maindomain}` and `{orgname}.{maindomain}` structures
- **Environment Variable Access**: Corrected client-side environment variable access using VITE\_ prefix
- **Organization Redirect Logic**: Improved URL construction for proper organization subdomain handling

#### Files Modified

- `apps/dashboard/src/routes/login/+page.svelte` - Organization membership verification
- `apps/dashboard/src/lib/utils/functions/appSetup.ts` - Subdomain URL construction
- `apps/dashboard/src/lib/utils/store/org.ts` - Environment variable access
- `apps/dashboard/src/lib/components/Org/Settings/Domains.svelte` - Domain configuration

#### Impact

- Enhanced security for multi-tenant organization access
- Improved self-hosted deployment with custom domain support
- Better user experience with proper error handling and redirects
- More robust subdomain structure handling for `codeplanet.qzz.io`

### 2024-12-19 - Authentication Logic & UI Improvements

**Commit:** `e0183a5c - fix: improve organization authentication logic and error UI/UX`

#### Authentication Fixes

- **Organization Membership Verification**: Fixed logic to properly check if users belong to the organization they're trying to access
- **Organization ID Resolution**: Added fallback logic to get organization ID from URL context when not available in store
- **Cross-Organization Access Prevention**: Implemented proper sign-out for users who try to access organizations they don't belong to
- **Enhanced Error Handling**: Added specific error messages for different authentication scenarios

#### UI/UX Improvements

- **New LoginError Component**: Created a modern, animated error component with better visual design
- **Error Type System**: Implemented different error types (error, warning, info) with appropriate styling and icons
- **User-Friendly Messages**: Improved error messages to be more informative and actionable
- **Dismissible Errors**: Added ability to dismiss error messages with smooth animations
- **Dark Mode Support**: Full dark mode compatibility for error components

#### Technical Improvements

- **Enhanced Logging**: Added comprehensive console logging for debugging authentication issues
- **Better Error Recovery**: Improved error handling flow with proper cleanup
- **Performance Optimization**: Streamlined authentication checks to reduce unnecessary API calls

#### Files Modified

- `apps/dashboard/src/routes/login/+page.svelte` - Authentication logic and error handling
- `apps/dashboard/src/lib/components/ErrorMessage/LoginError.svelte` - New error component

#### Impact

- Resolved issue where users in the same organization were getting "invalid email/password" errors
- Fixed security issue where users from different organizations could still access unauthorized orgs
- Significantly improved user experience with better error messages and visual feedback
- Enhanced debugging capabilities for authentication issues

### 2024-12-19 - Organization Branding Fix After Logout

**Commit:** `0d1d8a2f - fix: preserve organization branding on login page after logout`

#### Issue Resolved

- **Problem**: Login page showed generic "ClassroomIO" branding instead of organization name (e.g., "Deutsch Lernen") after logout
- **Root Cause**: Logout process cleared organization store data, but login page wasn't using server-side layout data properly

#### Solution Implemented

- **Data Priority Fix**: Updated login page to prioritize layout server data over store data for organization context
- **AuthUI Enhancement**: Added `orgName` and `orgLogo` props to AuthUI component for better organization branding
- **Debug Logging**: Added comprehensive logging to track organization data flow and identify issues

#### Technical Changes

- Modified `apps/dashboard/src/routes/login/+page.svelte` to use layout data as primary source
- Enhanced `apps/dashboard/src/lib/components/AuthUI/index.svelte` to accept organization props
- Improved organization data flow: `layout data (server-side) > store data > fallback`

#### Impact

- Organization branding now persists correctly after logout
- Login page properly displays organization name and logo regardless of logout state
- Better debugging capabilities for organization context issues
- Improved user experience with consistent branding across authentication flows
