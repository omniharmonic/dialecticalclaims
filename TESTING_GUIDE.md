# Testing Guide for Dialectical.Claims MVP

## ✅ Implementation Complete

The MVP is now ready for testing! Here's what has been built:

### Core Features Implemented

- ✅ **Homepage** - Landing page with CTAs
- ✅ **Fighter Selection** - Grid view with search/filters
- ✅ **Thesis Selection** - Custom + provocation deck
- ✅ **Arena (Streaming)** - Real-time dialectic generation with SSE
- ✅ **Synthesis Display** - Multiple AI-generated syntheses
- ✅ **Archive Browser** - View past dialectics
- ✅ **API Routes** - All endpoints functional
- ✅ **Database Schema** - Complete SQL setup
- ✅ **Sample Data** - 5 fighters, 10 provocations

## 🚀 Quick Start Testing

### Step 1: Environment Setup

**Create `.env.local` file** with your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### Step 2: Database Setup

1. Go to your Supabase project
2. Open SQL Editor
3. Copy/paste contents of `supabase-schema.sql`
4. Run the query
5. Verify tables were created in Table Editor

### Step 3: Seed Data

```bash
pnpm db:seed
```

Expected output:
```
Starting database seeding...

Seeding fighters...
✓ Seeded Friedrich Nietzsche
✓ Seeded Donna Haraway
✓ Seeded Karl Marx
✓ Seeded Simone de Beauvoir
✓ Seeded Judith Butler

Seeding provocation deck...
✓ Seeded: "Consciousness is fundamentally social"
✓ Seeded: "Technology extends human capability without changing human nature"
...

✅ Database seeding complete!
```

### Step 4: Start Development Server

```bash
pnpm dev
```

## 🧪 Testing Checklist

### Test 1: Homepage
- [ ] Navigate to http://localhost:3000
- [ ] See "Dialectical.Claims" header
- [ ] Two buttons visible: "Create Dialectic" and "Browse Archive"
- [ ] Feature cards displayed (3 columns)
- [ ] No console errors

### Test 2: Fighter Selection
- [ ] Click "Create Dialectic"
- [ ] Navigate to `/fighters`
- [ ] See grid of 5 fighter cards
- [ ] Each card shows: name, fighter name, era
- [ ] Search bar works (try typing "Nietzsche")
- [ ] Filter dropdowns work (try selecting an era)
- [ ] Click Nietzsche → moves to "Fighter 1" slot
- [ ] Click Haraway → moves to "Fighter 2" slot
- [ ] "Choose Thesis →" button appears
- [ ] No console errors

### Test 3: Thesis Selection
- [ ] Click "Choose Thesis →"
- [ ] Navigate to `/thesis`
- [ ] See selected fighters at top (Nietzsche vs Haraway)
- [ ] Custom thesis textarea present
- [ ] Provocation deck cards visible (grouped by domain)
- [ ] Round count slider works (2-8 range)
- [ ] Type custom thesis: "Technology transforms humanity"
- [ ] "Start Duel →" button appears
- [ ] No console errors

### Test 4: Arena (Most Important!)
- [ ] Click "Start Duel →"
- [ ] Navigate to `/arena/[id]`
- [ ] See fighter names and thesis displayed
- [ ] "Round 1 of [count]" indicator
- [ ] Text starts streaming for Fighter 1
- [ ] Cursor blink animation visible
- [ ] Fighter 1 text completes
- [ ] Fighter 2 text starts streaming
- [ ] Process continues through all rounds
- [ ] After final round, "Generating syntheses..." appears
- [ ] 2-4 synthesis cards display
- [ ] Each synthesis has: title, type badge, content, concept tags
- [ ] "Dialectic Complete" message appears
- [ ] No console errors

**Expected timing:**
- Each fighter response: 10-30 seconds
- 3 rounds total: 1-3 minutes
- Synthesis generation: 10-20 seconds
- **Total dialectic: 1.5-4 minutes**

### Test 5: Archive
- [ ] Navigate to `/archive`
- [ ] See your completed dialectic listed
- [ ] Card shows: fighters, thesis, round count, view count, date
- [ ] Click dialectic card
- [ ] Redirects to arena view
- [ ] Shows completed dialectic (all rounds visible)
- [ ] Syntheses displayed at bottom
- [ ] No streaming (already complete)
- [ ] No console errors

## 🐛 Common Issues & Solutions

### Issue: "Missing environment variables"
**Solution:** 
- Verify `.env.local` exists in project root
- Check all 4 variables are set
- Restart dev server: `Ctrl+C`, then `pnpm dev`

### Issue: No fighters showing up
**Solution:**
- Run `pnpm db:seed` again
- Check Supabase Table Editor → fighters table has data
- Check browser console for API errors

### Issue: Dialectic generation fails / Rate limit errors
**Solution:**
- **API Rate Limits (Gemini 1.5 Flash - Free Tier):**
  - 15 requests per minute
  - 1,500 requests per day
  - Each dialectic round = 2 requests (one per fighter)
  - Synthesis generation = 1 request
  - **Example:** 3-round dialectic = 7 total requests
  - **Daily capacity:** ~200 dialectics per day on free tier! 🎉
- **If you hit rate limits:**
  - Wait for the cooldown period (shown in error message)
  - Per-minute limits reset quickly (60 seconds)
  - Upgrade your Gemini API key for even higher limits
- Verify Gemini API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Look at terminal for detailed error messages

### Issue: "Dialectic not found" error
**Solution:**
- Check Network tab for 404 errors
- Verify database has dialectics table
- Check Supabase logs for errors

### Issue: Streaming not working
**Solution:**
- Check browser supports EventSource (all modern browsers do)
- Look for CORS errors in console
- Verify API route is accessible: `/api/dialectics/[id]/stream`

## 🔍 Debugging Tips

### Browser Console
Open DevTools (F12) → Console tab:
- Should see minimal logs
- No red errors
- Network requests succeeding (200 status)

### Network Tab
Check these endpoints:
- `GET /api/fighters` → 200 OK
- `GET /api/provocation-deck` → 200 OK
- `POST /api/dialectics` → 200 OK (returns dialectic_id)
- `GET /api/dialectics/[id]/stream` → 200 OK (EventStream)

### Server Terminal
Watch for:
- "Compiled successfully" messages
- No TypeScript errors
- SSE events being sent
- Gemini API responses

### Supabase Dashboard
Check Tables:
- `fighters` → 5 rows
- `dialectics` → 1+ rows (after creating)
- `rounds` → 3+ rows per dialectic
- `syntheses` → 2-4 rows per dialectic
- `provocation_deck` → 10 rows

## 📊 Expected Performance

### First Load
- Homepage: < 1 second
- Fighters page: < 2 seconds (loading 5 fighters)
- Thesis page: < 1 second

### Dialectic Generation
- **Per fighter response**: 10-30 seconds
- **3-round dialectic**: 1.5-3 minutes total
- **5-round dialectic**: 2.5-5 minutes total

### API Rate Limits (Gemini 1.5 Flash - Free Tier)
- **Per minute**: 15 requests max
- **Per day**: 1,500 requests max
- **Per 3-round dialectic**: 7 requests (2 per round + 1 for synthesis)
- **Daily limit**: ~200 dialectics per day on free tier! 🎉
- **Upgrade for more**: Google AI Studio offers paid tiers with even higher limits

## ✨ Advanced Testing

Once basic flow works, try:

### Different Fighter Combinations
- Marx vs Beauvoir
- Butler vs Nietzsche  
- Haraway vs Marx

### Different Theses
- "Gender is entirely socially constructed"
- "All hierarchies are inherently violent"
- Custom: "AI will make philosophy obsolete"

### Different Round Counts
- 2 rounds (quick test)
- 5 rounds (deeper exploration)
- 8 rounds (maximum depth)

### Edge Cases
- Very long thesis (500+ chars)
- Very short thesis (exactly 10 chars)
- Special characters in thesis
- Same fighter selected twice (should error)

## 📝 What to Look For

### Good Signs ✅
- Streaming text appears smoothly
- Responses are philosophical and in-character
- Syntheses are thoughtful and distinct
- UI is responsive and beautiful
- No errors in console or terminal

### Red Flags 🚩
- Blank pages
- Error messages
- Frozen streaming
- Generic/boring AI responses
- Missing data

## 🎯 Success Criteria

The MVP is working correctly if you can:

1. ✅ Select two fighters
2. ✅ Choose a thesis
3. ✅ Watch a complete dialectic stream
4. ✅ See thoughtful, in-character responses
5. ✅ View generated syntheses
6. ✅ Browse the dialectic in archive

## 🚀 Next Steps After Testing

Once everything works:

1. **Add more fighters** (edit `scripts/seed-sample-data.ts`)
2. **Add more provocations** (same file)
3. **Customize styling** (tailwind.config.ts, globals.css)
4. **Deploy to Vercel** (connect GitHub repo)
5. **Share with friends** for feedback

## 📞 Getting Help

If stuck:
1. Check this guide's "Common Issues" section
2. Review SETUP.md for configuration details
3. Check browser console and terminal for specific errors
4. Verify environment variables are correct
5. Try the simplest possible test first (2 rounds)

---

**Happy Testing! ⚔️**

The dialectical arena awaits your command.

