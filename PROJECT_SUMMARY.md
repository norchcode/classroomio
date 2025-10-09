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
- `VITE_APP_HOST=codeplanet.qzz.io` (your main domain, with VITE_ prefix for client-side access)
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