# Trekka - Share Your Travel Plans

Trekka is a web application for sharing travel plans with friends. Create a profile, add your trips, follow friends, and see where everyone is heading next.

## Features

- 🎯 **User Profiles** - Create a profile with avatar, bio, occupation, and social links
- ✈️ **Trip Management** - Add past and upcoming trips with destinations, dates, and descriptions
- 👥 **Social Features** - Follow users and see their public trips in your feed
- ⭐ **Trip Interest** - Mark interest on friends' trips to signal you'd like to join
- 📅 **Calendar Export** - Download ICS files to add trips to your personal calendar
- 🔒 **Privacy Controls** - Toggle trips between public and private visibility

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Authentication:** Supabase Auth (Magic Links)
- **Storage:** Supabase Storage (avatars, trip photos)
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** react-hook-form + Zod validation
- **Deployment:** Vercel

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (optional, for admin functions)
- `NEXT_PUBLIC_APP_URL` - Your app URL (default: http://localhost:3000)

### Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run the contents of `supabase.sql`
3. Enable Email authentication in Authentication settings
4. Configure your email templates if desired
5. Copy your project URL and keys to `.env.local`

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
trekka-web/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication routes
│   ├── feed/              # User feed page
│   ├── login/             # Login page
│   ├── onboarding/        # Profile setup
│   ├── trips/             # Trip pages
│   └── u/                 # User profiles
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── actions/          # Server actions
│   ├── supabase/         # Supabase clients
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Elsewhere

Build the production app:

```bash
npm run build
```

The app can be deployed to any platform that supports Next.js (Railway, Render, AWS, etc.).

## Database Migrations

When updating the database schema:

1. Make changes in `supabase.sql`
2. Run the new SQL in Supabase SQL Editor
3. Update TypeScript types in `types/database.ts` if needed

## Security

- All tables have Row Level Security (RLS) enabled
- Authentication required for most features
- Users can only modify their own data
- Private trips are only visible to the owner

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT