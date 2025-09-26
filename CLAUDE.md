# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trekka is a travel-sharing web application built with Next.js 15 (App Router), TypeScript, and Supabase. Users can create profiles, share travel plans, follow friends, and discover upcoming trips. The app uses Supabase for authentication, database, and storage, with Tailwind CSS and shadcn/ui for styling.

## Development Commands

**Development server:** `npm run dev` (uses Turbopack)
**Build:** `npm run build` (production build with Turbopack)
**Type checking:** `npm run typecheck` (TypeScript validation)
**Linting:** `npm run lint` (ESLint with Next.js config)

## Architecture Overview

### Core Structure
- **App Router:** Next.js 15 with App Router architecture in `trekka-web/app/`
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth with magic links
- **State:** React Server Components with Server Actions
- **Styling:** Tailwind CSS v4 with shadcn/ui components

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shared) and `components/ui/` (shadcn/ui)
- `lib/` - Utility functions, Supabase clients, and Server Actions
- `types/` - TypeScript definitions, especially `database.ts` with Supabase types

### Supabase Integration
- **Client:** `lib/supabase/client.ts` for browser-side operations
- **Server:** `lib/supabase/server.ts` for server-side operations
- **Middleware:** `lib/supabase/middleware.ts` for session management
- **Types:** Generated types in `types/database.ts` from Supabase schema

### Authentication Pattern
- Uses Supabase SSR package (`@supabase/ssr`)
- Middleware handles session refresh for all routes
- Server Actions use `getUser()` helper for authentication checks
- Row Level Security enforces data access permissions

### Data Patterns
- **Server Actions:** Located in `lib/actions/` for mutations (trips, notifications, etc.)
- **Validation:** Zod schemas in `lib/utils/validation.ts` for form and API validation
- **Database:** All tables have RLS policies, users can only access their own data
- **Real-time:** Uses Supabase real-time subscriptions for live updates

### Form Handling
- **react-hook-form** with **@hookform/resolvers** for Zod integration
- Server Actions handle form submissions
- Client-side validation with server-side validation as backup

### UI Components
- **shadcn/ui** components in `components/ui/`
- **Tailwind CSS v4** for styling with `@tailwindcss/forms` and `@tailwindcss/typography`
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **next-themes** for dark/light mode support

### File Upload
- **Supabase Storage** for avatars and trip photos
- Storage policies in `storage-policies.sql` restrict access to file owners
- Sharp for image optimization

## Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (optional)
- `NEXT_PUBLIC_APP_URL` - App URL (default: http://localhost:3000)

Database setup requires running `supabase.sql` in Supabase SQL Editor.

## Development Patterns

### Server Actions
- All mutations use Server Actions with proper error handling
- Authentication checked via `getUser()` helper
- Zod validation for all inputs
- Proper redirect patterns after mutations

### TypeScript
- Strict mode enabled with generated Supabase types
- ESLint allows `any` and unused vars (configured in `eslint.config.mjs`)
- Custom types extend Supabase types for joins (e.g., `TripWithCreator`)

### Database Queries
- Use proper TypeScript types from `types/database.ts`
- Leverage RLS policies rather than manual permission checks
- Use joins for related data (profiles, trips, interests)

### Component Structure
- Server Components by default, Client Components when needed
- Shared components in root `components/`, UI primitives in `components/ui/`
- Props interfaces defined inline or in component files

### Testing
No test framework is currently configured. Add testing setup if implementing tests.