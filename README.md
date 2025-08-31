# Meowshunt 🐱

A fun cat hunting game built with Next.js, Supabase, and TypeScript.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Environment Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Database Setup

1. **Run Supabase migrations:**
   ```bash
   npx supabase db push
   ```

2. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```
   
   This will create:
   - 5 ranks for progression
   - 2 hunting locations
   - 9 shop items (traps, rugs, baits)
   - 6 meows to catch
   - Spawn mappings and starter inventory

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## 🎮 Game Features

- **Hunting System** - Catch meows with traps, rugs, and bait
- **Progression** - Earn XP and rank up
- **Shop System** - Buy better equipment
- **Inventory Management** - Manage your items
- **Energy System** - Regenerates over time
- **Multiple Locations** - Unlock new hunting grounds

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

### Database Seeding

The seed script (`scripts/seed.ts`) populates your database with:

- **Ranks**: Novice Hunter → Legendary Hunter
- **Locations**: Backyard Garden (unlocked), Mystic Forest (Rank 2+)
- **Items**: 3 traps, 3 rugs, 3 baits of varying rarity
- **Meows**: 6 cats from common to epic rarity
- **Mappings**: Where items and meows can spawn
- **Starter Equipment**: Basic trap, rug, and bait for new users

### Running the Seed Script

```bash
# Using npm script
npm run seed

# Or directly with tsx
npx tsx scripts/seed.ts
```

**Note**: Requires `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` for admin operations.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Styling**: Tailwind CSS
- **State**: React hooks + Server Actions
- **Database**: PostgreSQL with Row Level Security

## 📁 Project Structure

```
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                # Utilities and configurations
├── scripts/            # Database seeding and utilities
├── supabase/           # Database migrations and config
└── types/              # TypeScript type definitions
```

## 🐛 Troubleshooting

### Common Issues

1. **"User not authenticated" errors**: Ensure you're logged in
2. **Database connection issues**: Check Supabase credentials
3. **Seed script fails**: Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Reset Database

To start fresh:
```bash
npx supabase db reset
npm run seed
```

## 📝 License

This project is private and proprietary.
