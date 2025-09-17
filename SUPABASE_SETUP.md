# Supabase Setup Guide

## 🚀 Quick Setup Instructions

### 1. Get Your Supabase Credentials
1. Go to **https://supabase.com**
2. Create a new project called `fruits-app-games`
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon key**

### 2. Create Your Environment Script
Copy the template and add your actual Supabase credentials:

```bash
# Copy the template
cp scripts/set-dev-env.sh.template scripts/set-dev-env.sh

# Edit scripts/set-dev-env.sh with your actual credentials:
export VITE_SUPABASE_URL="https://your-actual-project-id.supabase.co"
export VITE_SUPABASE_ANON_KEY="your_actual_anon_key_here"
```

### 3. Set Up Your Database
1. In Supabase dashboard, go to **SQL Editor**
2. Run the SQL from `supabase-schema.sql`
3. This creates the `games` table and sample data

### 4. Run the App!
```bash
# Option 1: Use the convenient npm script
npm run dev:env

# Option 2: Manual approach
source scripts/set-dev-env.sh && npm run dev
```

Your app now uses a real PostgreSQL database with real-time updates! 🎉

## 🔥 What You Get

✅ **Real-time updates** - When someone claims a game, everyone sees it instantly
✅ **Persistent data** - Games survive browser refresh
✅ **Multi-user support** - Multiple people can use the app simultaneously
✅ **Type safety** - Full TypeScript support
✅ **Row-level security** - Built-in data protection

## 🧪 Testing Real-time

1. Open the app in two browser windows
2. Claim a game in one window
3. Watch it update instantly in the other window!

## 📁 Files Changed

- `src/lib/supabase.ts` - Supabase client setup
- `src/database/SupabaseDatabase.ts` - Database implementation
- `src/main.tsx` - Uses Supabase instead of MockDatabase
- `scripts/set-dev-env.sh.template` - Environment variables template (copy to create your own)

## 🚨 Important Notes

- **Never commit** your actual credentials to git!
- The app will show an error until you add your real Supabase credentials to the script
- Your Supabase project includes a generous free tier
- Real-time subscriptions work automatically with the SupabaseDatabase class

## 🔧 Development Workflow

```bash
# Easiest way - use the npm script:
npm run dev:env

# Or traditional approach:
source scripts/set-dev-env.sh && npm run dev

# For testing and building (source once per terminal session):
source scripts/set-dev-env.sh
npm test
npm run build
```

## 🔧 Troubleshooting

**"Missing Supabase environment variables"**
→ Make sure you've copied `scripts/set-dev-env.sh.template` to `scripts/set-dev-env.sh` and updated it with your actual credentials

**"Failed to fetch games"**
→ Check that you ran the SQL schema in Supabase and your credentials are correct

**No real-time updates**
→ Make sure you have the real-time subscription enabled in your Supabase project settings