# 🚀 Quick Setup Guide

Get Meowshunt running with sample data in minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Git (to clone the repo)

## ⚡ Quick Start

### 1. **Clone & Install**
```bash
git clone <your-repo-url>
cd Meowshunt
npm install
```

### 2. **Environment Setup**
```bash
# Copy environment template
cp env.local.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local  # or use your preferred editor
```

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For seeding data
```

### 3. **Database Setup**
```bash
# Push database schema
npx supabase db push

# Seed with sample data
npm run seed
```

### 4. **Start Development**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎮

## 🎯 What You Get

After seeding, your game will have:

- **5 Ranks**: Novice → Legendary Hunter
- **2 Locations**: Backyard Garden + Mystic Forest
- **9 Items**: Traps, rugs, and baits of varying rarity
- **6 Meows**: Cats from common to epic rarity
- **Starter Equipment**: Basic hunting gear for new users

## 🐛 Troubleshooting

### Seed Script Fails
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Verify Supabase connection
npx supabase status
```

### Database Issues
```bash
# Reset database
npx supabase db reset

# Re-seed
npm run seed
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## 🔧 Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run seed     # Seed database
```

## 📱 Test the Game

1. **Register** a new account
2. **Visit Camp** to see your energy and equipment
3. **Go Hunting** with your starter gear
4. **Visit Shop** to buy better equipment
5. **Check Inventory** to manage your items
6. **Explore Locations** to find different meows

## 🎉 You're Ready!

The game is now fully playable with sample data. Hunt meows, earn XP, rank up, and unlock new locations! 🐱✨
