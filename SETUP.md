# Quick Setup Guide

Follow these steps to get Dialectical.Claims running locally:

## 1. Prerequisites

Make sure you have:
- Node.js 18 or higher installed
- pnpm installed (`npm install -g pnpm`)
- A Supabase account (free tier is fine)
- A Google AI Studio API key

## 2. Get API Keys

### Supabase Setup:
1. Go to https://supabase.com and create a new project
2. Wait for the project to be provisioned (~2 minutes)
3. Go to Project Settings → API
4. Copy:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon/public` key
   - `service_role` key (⚠️ Keep this secret!)

### Gemini API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key

## 3. Install Dependencies

```bash
pnpm install
```

## 4. Configure Environment Variables

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

Replace the placeholder values with your actual keys.

## 5. Set Up Database

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click "Run" to execute the schema
6. Wait for confirmation that all tables were created

## 6. Seed the Database

Run the seeding script to add sample fighters and provocations:

```bash
pnpm db:seed
```

You should see output like:
```
Seeding fighters...
✓ Seeded Friedrich Nietzsche
✓ Seeded Donna Haraway
...
✓ Database seeding complete!
```

## 7. Start the Development Server

```bash
pnpm dev
```

The app should now be running at http://localhost:3000

## 8. Test the Application

1. **Homepage**: Visit http://localhost:3000
   - You should see the landing page with "Create Dialectic" button

2. **Fighter Selection**: Click "Create Dialectic"
   - You should see the fighter grid with sample fighters
   - Select Nietzsche and Haraway

3. **Thesis Selection**: Choose a thesis
   - Try "Technology extends human capability"
   - Set rounds to 3 for faster testing

4. **Watch Dialectic**: Click "Start Duel"
   - You should see the arena with real-time streaming
   - Responses will appear token-by-token
   - After all rounds, syntheses will be generated

5. **Archive**: Visit http://localhost:3000/archive
   - You should see your completed dialectic listed

## Troubleshooting

### "Missing environment variables" error
- Double-check your `.env.local` file
- Ensure all four variables are set
- Restart the dev server: `Ctrl+C` then `pnpm dev`

### Database errors
- Verify the schema was created successfully in Supabase
- Check that all tables exist in the Table Editor
- Ensure RLS policies are enabled

### Gemini API errors
- Check your API key is valid
- Ensure you have quota available (free tier has limits)
- Try the API key at https://aistudio.google.com

### TypeScript errors
- Run `pnpm type-check` to see detailed errors
- Most issues will auto-resolve on restart

### No fighters showing up
- Ensure `pnpm db:seed` completed successfully
- Check the fighters table in Supabase Table Editor
- Verify the data is there

## Next Steps

Once everything is working:

1. **Add More Fighters**: Edit `scripts/seed-sample-data.ts` to add more philosophers
2. **Customize Styling**: Modify `tailwind.config.ts` and `app/globals.css`
3. **Explore Features**: Try different fighter combinations and theses
4. **Check Performance**: Monitor Gemini API usage in Google AI Studio

## Development Tips

- Use `pnpm dev` for hot-reloading during development
- Use `pnpm build` to test production builds locally
- Check browser console for any client-side errors
- Check terminal for any server-side errors

## Need Help?

- Check the main README.md for more details
- Review the technical specification in `.claude/technical_specification.md`
- Look at example code in similar components

Happy dialectical dueling! ⚔️

