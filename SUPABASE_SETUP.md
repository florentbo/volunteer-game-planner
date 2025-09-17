# Supabase Setup Guide

## 🚀 Quick Setup Instructions

### 1. Create Your Environment File

Copy `.env.local` and add your actual Supabase credentials:

```bash
# .env.local (already created for you)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Get Your Credentials

1. Go to **https://supabase.com**
2. Create a new project called `fruits-app-games`
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon key**
5. Replace the values in `.env.local`

### 3. Set Up Your Database

1. In Supabase dashboard, go to **SQL Editor**
2. Run the SQL from `supabase-schema.sql`
3. This creates the `games` table and sample data

### 4. Test It!

```bash
npm run dev
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
- `.env.local` - Your secret credentials (not committed to git)

## 🚨 Important Notes

- **Never commit** your `.env.local` file - it contains secrets!
- The app will show an error until you add your real Supabase credentials
- Your Supabase project includes a generous free tier
- Real-time subscriptions work automatically with the SupabaseDatabase class

## 🔧 Troubleshooting

**"Missing Supabase environment variables"**
→ Make sure your `.env.local` has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

**"Failed to fetch games"**
→ Check that you ran the SQL schema in Supabase and your credentials are correct

**No real-time updates**
→ Make sure you have the real-time subscription enabled in your Supabase project settings
