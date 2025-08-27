# Meowshunt 🐱

A mobile-first web game where players hunt for "Meows" using traps, rugs, and baits.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router + TypeScript)
- **UI**: shadcn/ui components with TailwindCSS
- **Backend**: Supabase (PostgreSQL, authentication, API)
- **Hosting**: Vercel (frontend + API routes)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
meowshunt/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with meta tags
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/ui/          # shadcn/ui components
│   ├── button.tsx         # Button component
│   ├── card.tsx           # Card component
│   ├── dialog.tsx         # Dialog component
│   ├── sheet.tsx          # Sheet component
│   ├── tabs.tsx           # Tabs component
│   └── toast.tsx          # Toast component
├── lib/                    # Utility libraries
│   ├── utils.ts           # Utility functions
│   └── supabase/          # Supabase helpers
│       ├── client.ts      # Client-side Supabase
│       └── server.ts      # Server-side Supabase
└── config files           # TypeScript, Tailwind, etc.
```

## Game Features (Planned)

- **Hunting System**: Equip traps, rugs, and baits to catch Meows
- **Energy Management**: 15 energy cap, regenerates over time
- **Progression**: Experience points, ranks, and unlockable locations
- **Collection**: Catch and collect different Meow types
- **Shop**: Purchase equipment and consumables
- **Admin Dashboard**: Content management for game administrators

## Development

- **Mobile-first design** with responsive components
- **Accessibility** built-in with ARIA labels and keyboard navigation
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for consistent, accessible components

## Next Steps

1. Set up Supabase database schema
2. Implement authentication system
3. Create game mechanics and hunting logic
4. Build user interface components
5. Add admin dashboard functionality

## Contributing

This is a development project. Follow the established patterns and ensure all components are mobile-responsive and accessible.
