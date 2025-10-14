## Summary

This implementation plan breaks down the Dialectical.Claims project into **10 phases** with **~200 individual sub-tasks**.

**Key Features:**
- ✅ Clear dependencies between tasks
- ✅ Each sub-task is small and executable (2-8 hours)
- ✅ Assignee roles specified
- ✅ Duration estimates provided
- ✅ Success criteria defined
- ✅ Risk mitigation strategies included
- ✅ Parallel work opportunities identified
- ✅ Testing integrated throughout
- ✅ Documentation requirements specified
- ✅ Monitoring and optimization planned

**Total Estimated Duration:** 12-18 weeks  
**Minimum Viable Product:** 10 weeks (Phases 0-8)  
**Full Launch:** 12 weeks (includes Phase 9)  
**Advanced Features:** Ongoing (Phase 10+)

The plan is designed to be **agile and adaptable** while providing clear structure and accountability. Each task can be tracked in a project management tool (Jira, Linear, GitHub Projects) with this document as the source of truth.

**Next Steps:**
1. Create project in management tool
2. Import all tasks with dependencies
3. Assign team members
4. Set up daily standups
5. Begin Phase 0

Let's build something spectacular! 🚀🧠⚔️# Dialectical.Claims - Technical Implementation Plan
## Detailed Task Breakdown with Dependencies

---

## Overview

**Total Estimated Duration:** 12-18 weeks  
**Team Size:** 3-5 developers  
**Methodology:** Agile with 2-week sprints

---

## Phase 0: Project Setup & Infrastructure (Week 1)
**Duration:** 5 days  
**Dependencies:** None  
**Goal:** Complete development environment and infrastructure foundation

### Task 0.1: Repository & Project Initialization
**Assignee:** Lead Developer  
**Duration:** 4 hours

- [ ] **0.1.1** Create GitHub repository
  - Create new repo: `dialectical-claims`
  - Add README.md with project description
  - Add LICENSE file (MIT or appropriate)
  - Initialize with .gitignore for Node.js

- [ ] **0.1.2** Set up branch protection rules
  - Protect `main` branch (require PR reviews)
  - Protect `develop` branch
  - Create initial `develop` branch

- [ ] **0.1.3** Create project structure
  ```bash
  mkdir -p {app,components,lib,types,hooks,styles,public,scripts,__tests__}
  ```

- [ ] **0.1.4** Initialize Next.js project
  ```bash
  pnpm create next-app@latest . --typescript --tailwind --app --src-dir
  ```

- [ ] **0.1.5** Configure package.json scripts
  - Add: `dev`, `build`, `start`, `lint`, `type-check`
  - Add: `db:types`, `db:seed`, `test`

### Task 0.2: Development Tools Setup
**Assignee:** Lead Developer  
**Duration:** 3 hours  
**Dependencies:** 0.1

- [ ] **0.2.1** Install core dependencies
  ```bash
  pnpm add @supabase/supabase-js @google/generative-ai
  pnpm add @tanstack/react-query zustand clsx tailwind-merge
  pnpm add zod framer-motion lucide-react
  ```

- [ ] **0.2.2** Install UI dependencies
  ```bash
  pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
  pnpm add @radix-ui/react-select @radix-ui/react-tabs
  ```

- [ ] **0.2.3** Install dev dependencies
  ```bash
  pnpm add -D @types/node @types/react @types/react-dom
  pnpm add -D eslint prettier typescript tsx
  pnpm add -D @playwright/test vitest
  ```

- [ ] **0.2.4** Configure ESLint
  - Create `.eslintrc.json` with Next.js config
  - Add custom rules for TypeScript strict mode
  - Configure import ordering

- [ ] **0.2.5** Configure Prettier
  - Create `.prettierrc` with formatting rules
  - Add `.prettierignore` file
  - Configure VSCode integration

- [ ] **0.2.6** Configure TypeScript strict mode
  - Update `tsconfig.json` with strict: true
  - Add path aliases (@/components, @/lib, etc.)
  - Enable incremental compilation

### Task 0.3: Supabase Project Setup
**Assignee:** Backend Developer  
**Duration:** 2 hours  
**Dependencies:** None (can run parallel)

- [ ] **0.3.1** Create Supabase project
  - Sign up at supabase.com
  - Create new project: "dialectical-claims"
  - Note project URL and keys
  - Select region closest to target users

- [ ] **0.3.2** Configure project settings
  - Enable connection pooling (Transaction mode)
  - Set connection limit to 15 (free tier)
  - Enable Realtime (for future features)

- [ ] **0.3.3** Create storage bucket
  - Create public bucket: `fighters`
  - Set file size limit: 5MB
  - Configure MIME types: `image/*`
  - Enable public access

- [ ] **0.3.4** Save credentials securely
  - Document in team password manager
  - Create `.env.example` template
  - Never commit actual keys

### Task 0.4: Vercel Project Setup
**Assignee:** DevOps/Lead Developer  
**Duration:** 2 hours  
**Dependencies:** 0.1

- [ ] **0.4.1** Create Vercel account/project
  - Sign up at vercel.com
  - Import GitHub repository
  - Configure project name

- [ ] **0.4.2** Configure environment variables
  - Add `NEXT_PUBLIC_SUPABASE_URL`
  - Add `SUPABASE_SERVICE_ROLE_KEY`
  - Add `GEMINI_API_KEY` (placeholder for now)
  - Set for Production, Preview, and Development

- [ ] **0.4.3** Configure build settings
  - Set build command: `pnpm build`
  - Set output directory: `.next`
  - Set install command: `pnpm install`
  - Set Node.js version: 18.x

- [ ] **0.4.4** Set up preview deployments
  - Enable automatic deployments on PR
  - Configure preview environment variables
  - Test preview deployment URL

### Task 0.5: Gemini API Setup
**Assignee:** AI/Backend Developer  
**Duration:** 1 hour  
**Dependencies:** None (can run parallel)

- [ ] **0.5.1** Create Google Cloud project
  - Go to console.cloud.google.com
  - Create new project: "dialectical-claims"
  - Enable Gemini API

- [ ] **0.5.2** Generate API key
  - Navigate to APIs & Services > Credentials
  - Create API key for Gemini API
  - Restrict key to Gemini API only
  - Set application restrictions (optional)

- [ ] **0.5.3** Test API access
  - Create test script: `scripts/test-gemini.ts`
  - Make simple API call
  - Verify streaming works
  - Document rate limits

- [ ] **0.5.4** Add to environment variables
  - Add to local `.env.local`
  - Add to Vercel project settings
  - Document in team docs

### Task 0.6: Database Schema Implementation
**Assignee:** Backend Developer  
**Duration:** 4 hours  
**Dependencies:** 0.3

- [ ] **0.6.1** Create SQL schema file
  - Create `supabase/schema.sql`
  - Copy schema from technical spec
  - Review and validate syntax

- [ ] **0.6.2** Execute schema in Supabase
  - Open Supabase SQL Editor
  - Run schema creation script
  - Verify all tables created
  - Check indexes created

- [ ] **0.6.3** Configure Row Level Security
  - Verify RLS enabled on all tables
  - Test public read policies
  - Test service role write policies
  - Document RLS rules

- [ ] **0.6.4** Generate TypeScript types
  ```bash
  pnpm supabase gen types typescript --project-id [project-id] > types/database.types.ts
  ```
  - Verify types generated correctly
  - Add to version control
  - Document regeneration process

- [ ] **0.6.5** Create database utility functions
  - Create `lib/supabase/client.ts`
  - Create `lib/supabase/server.ts`
  - Add connection helpers
  - Add type-safe query helpers

### Task 0.7: Project Documentation
**Assignee:** Lead Developer  
**Duration:** 2 hours  
**Dependencies:** 0.1-0.6

- [ ] **0.7.1** Create README.md
  - Project description
  - Tech stack overview
  - Setup instructions
  - Development workflow

- [ ] **0.7.2** Create CONTRIBUTING.md
  - Code style guidelines
  - Git workflow
  - PR process
  - Testing requirements

- [ ] **0.7.3** Create developer setup guide
  - Prerequisites
  - Environment setup
  - Database setup
  - Running locally

- [ ] **0.7.4** Document architecture decisions
  - Create `docs/architecture.md`
  - Document key technical choices
  - Add diagrams (optional)

---

## Phase 1: Core Data Layer (Week 2)
**Duration:** 5 days  
**Dependencies:** Phase 0 complete  
**Goal:** Fighter data infrastructure and seeding

### Task 1.1: Fighter Data Preparation
**Assignee:** Content/Backend Developer  
**Duration:** 8 hours

- [ ] **1.1.1** Create fighter data structure
  - Create `scripts/data/fighters-data.ts`
  - Define Fighter interface matching schema
  - Set up data validation with Zod

- [ ] **1.1.2** Write Socrates fighter data
  - Name, fighter_name, slug
  - Era, tradition array, style, special_move
  - Full system prompt (3000+ chars)
  - Short bio
  - Validate against schema

- [ ] **1.1.3** Write Plato fighter data
  - Complete all fields
  - Write full system prompt
  - Ensure distinct from Socrates
  - Validate

- [ ] **1.1.4** Write Aristotle fighter data
  - Complete all fields
  - Full system prompt
  - Validate

- [ ] **1.1.5** Write Nietzsche fighter data
  - Complete all fields
  - Full system prompt (reference PRD example)
  - Validate

- [ ] **1.1.6** Write Haraway fighter data
  - Complete all fields
  - Full system prompt (reference PRD example)
  - Validate

- [ ] **1.1.7** Create remaining 65+ fighters (batch work)
  - Prioritize most important 20 fighters first
  - Use PRD roster table as reference
  - Work in batches of 5-10
  - Validate each batch

- [ ] **1.1.8** Review all fighter data
  - Check for duplicates
  - Verify slug uniqueness
  - Ensure era/tradition consistency
  - Spell check and grammar

### Task 1.2: Fighter Portrait Collection
**Assignee:** Designer/Frontend Developer  
**Duration:** 6 hours

- [ ] **1.2.1** Source or generate portrait for Socrates
  - AI-generated or public domain
  - Format: JPG/PNG, 400x600px minimum
  - Optimize for web (<200KB)
  - Name: `socrates.jpg`

- [ ] **1.2.2** Source portraits for initial 10 fighters
  - Plato, Aristotle, Nietzsche, Haraway, Marx
  - Kant, Heidegger, Foucault, Butler, Žižek
  - Consistent style/quality
  - Optimize all images

- [ ] **1.2.3** Source portraits for next 20 fighters
  - Follow priority order
  - Maintain consistent aesthetic
  - Optimize

- [ ] **1.2.4** Source portraits for remaining fighters
  - Complete all 70+ fighters
  - Final quality check
  - Create placeholder for any missing

- [ ] **1.2.5** Upload to Supabase Storage
  - Upload to `fighters` bucket
  - Verify public URLs work
  - Document URLs in spreadsheet

- [ ] **1.2.6** Update fighter data with portrait URLs
  - Add portrait_url to each fighter object
  - Verify URLs are correct
  - Test loading in browser

### Task 1.3: Database Seeding Script
**Assignee:** Backend Developer  
**Duration:** 4 hours  
**Dependencies:** 1.1, 1.2

- [ ] **1.3.1** Create seeding script structure
  - Create `scripts/seed-database.ts`
  - Import fighter data
  - Set up Supabase client with service role

- [ ] **1.3.2** Implement fighter seeding
  - Write `seedFighters()` function
  - Batch insert in groups of 10
  - Handle errors gracefully
  - Log progress

- [ ] **1.3.3** Test seeding locally
  - Run script: `pnpm tsx scripts/seed-database.ts`
  - Verify all fighters inserted
  - Check foreign key constraints
  - Verify portraits load

- [ ] **1.3.4** Create provocation deck data
  - Create `scripts/data/provocation-deck.ts`
  - Add 20 initial theses
  - Categorize by domain
  - Set difficulty levels

- [ ] **1.3.5** Implement provocation seeding
  - Write `seedProvocationDeck()` function
  - Insert all theses
  - Handle duplicates
  - Log results

- [ ] **1.3.6** Create reset script
  - Create `scripts/reset-database.ts`
  - Truncate all tables safely
  - Respect foreign keys
  - Add confirmation prompt

### Task 1.4: Supabase Client Setup
**Assignee:** Backend Developer  
**Duration:** 3 hours  
**Dependencies:** 0.6

- [ ] **1.4.1** Create server-side client
  - File: `lib/supabase/server.ts`
  - Import createClient from supabase-js
  - Use service role key
  - Configure for serverless

- [ ] **1.4.2** Create client-side client
  - File: `lib/supabase/client.ts`
  - Use anon key (public read)
  - Configure for browser
  - Add error handling

- [ ] **1.4.3** Create query helpers
  - File: `lib/supabase/queries.ts`
  - `getAllFighters()`
  - `getFighterBySlug(slug)`
  - `getFighterById(id)`
  - Type-safe return types

- [ ] **1.4.4** Write tests for queries
  - Test getAllFighters returns array
  - Test getFighterBySlug finds fighter
  - Test error handling
  - Mock Supabase client

### Task 1.5: Fighter API Endpoints
**Assignee:** Backend Developer  
**Duration:** 4 hours  
**Dependencies:** 1.4

- [ ] **1.5.1** Create GET /api/fighters route
  - File: `app/api/fighters/route.ts`
  - Implement GET handler
  - Add query params: era, tradition, search
  - Return JSON response

- [ ] **1.5.2** Add caching to fighters endpoint
  - Set revalidate to 3600 seconds
  - Add Cache-Control headers
  - Test cache works

- [ ] **1.5.3** Create GET /api/fighters/[slug] route
  - File: `app/api/fighters/[slug]/route.ts`
  - Fetch fighter by slug
  - Return 404 if not found
  - Add type safety

- [ ] **1.5.4** Create GET /api/fighters/search route
  - File: `app/api/fighters/search/route.ts`
  - Implement text search
  - Support fuzzy matching
  - Limit results

- [ ] **1.5.5** Test all endpoints
  - Test with curl/Postman
  - Verify JSON responses
  - Check error handling
  - Document in API docs

---

## Phase 2: Fighter Selection UI (Week 3)
**Duration:** 5 days  
**Dependencies:** Phase 1 complete  
**Goal:** Complete fighter selection interface

### Task 2.1: Base UI Components
**Assignee:** Frontend Developer  
**Duration:** 6 hours

- [ ] **2.1.1** Create Button component
  - File: `components/ui/Button.tsx`
  - Support variants: primary, secondary, outline
  - Support sizes: sm, md, lg
  - Add loading state
  - Add disabled state

- [ ] **2.1.2** Create Card component
  - File: `components/ui/Card.tsx`
  - Basic card container
  - Support hover effects
  - Responsive padding
  - TypeScript props

- [ ] **2.1.3** Create Input component
  - File: `components/ui/Input.tsx`
  - Text input with label
  - Error state
  - Icon support
  - Focus states

- [ ] **2.1.4** Create Select component
  - File: `components/ui/Select.tsx`
  - Wrap Radix UI Select
  - Custom styling
  - Accessible
  - Type-safe options

- [ ] **2.1.5** Configure Tailwind theme
  - Update `tailwind.config.ts`
  - Add color palette (dark theme)
  - Add custom animations
  - Add font families

- [ ] **2.1.6** Create global styles
  - Update `app/globals.css`
  - Add dark theme variables
  - Add base styles
  - Add utility classes

### Task 2.2: Fighter Card Component
**Assignee:** Frontend Developer  
**Duration:** 4 hours  
**Dependencies:** 2.1

- [ ] **2.2.1** Create FighterCard component structure
  - File: `components/fighters/FighterCard.tsx`
  - Accept Fighter type prop
  - Support selected state
  - Support disabled state
  - Add onClick handler

- [ ] **2.2.2** Implement card layout
  - Portrait image at top
  - Fighter name and fighter_name
  - Special move display
  - Style indicator
  - Hover effects

- [ ] **2.2.3** Add image optimization
  - Use Next.js Image component
  - Set proper width/height
  - Add loading state
  - Add fallback placeholder

- [ ] **2.2.4** Style selected state
  - Add border highlight
  - Add glow effect
  - Add checkmark indicator
  - Animate transition

- [ ] **2.2.5** Style disabled state
  - Reduce opacity
  - Disable pointer events
  - Gray out colors
  - Show disabled cursor

- [ ] **2.2.6** Make responsive
  - Mobile: Full width
  - Tablet: 2-3 columns
  - Desktop: 4-6 columns
  - Test all breakpoints

### Task 2.3: Fighter Grid Component
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 2.2

- [ ] **2.3.1** Create FighterGrid component
  - File: `components/fighters/FighterGrid.tsx`
  - Accept fighters array prop
  - Accept onSelect callback
  - Track selected fighters

- [ ] **2.3.2** Implement grid layout
  - Use CSS Grid
  - Responsive columns
  - Proper spacing
  - Scroll container

- [ ] **2.3.3** Add loading state
  - Show skeleton cards
  - Animate skeleton
  - Match card dimensions

- [ ] **2.3.4** Add empty state
  - Show when no fighters
  - Helpful message
  - Call to action

- [ ] **2.3.5** Add error state
  - Show when fetch fails
  - Display error message
  - Retry button

### Task 2.4: Fighter Search & Filters
**Assignee:** Frontend Developer  
**Duration:** 4 hours  
**Dependencies:** 2.1

- [ ] **2.4.1** Create search input component
  - File: `components/fighters/FighterSearch.tsx`
  - Text input with icon
  - Clear button
  - Debounce input (300ms)
  - onChange callback

- [ ] **2.4.2** Implement client-side search
  - Filter fighters by name
  - Case-insensitive
  - Update in real-time
  - Highlight matches (optional)

- [ ] **2.4.3** Create filter component
  - File: `components/fighters/FighterFilters.tsx`
  - Era dropdown
  - Tradition dropdown
  - Style dropdown
  - Clear filters button

- [ ] **2.4.4** Implement filter logic
  - AND logic (all filters apply)
  - Update grid in real-time
  - Show filtered count
  - Preserve search term

- [ ] **2.4.5** Add filter state management
  - Use Zustand store or useState
  - Persist to URL params (optional)
  - Clear all filters
  - Show active filters

### Task 2.5: Fighter Selector Component
**Assignee:** Frontend Developer  
**Duration:** 5 hours  
**Dependencies:** 2.2, 2.3, 2.4

- [ ] **2.5.1** Create FighterSelector container
  - File: `components/fighters/FighterSelector.tsx`
  - Manage selection state
  - fighter1 and fighter2
  - Handle selection logic

- [ ] **2.5.2** Implement selection logic
  - First click: select fighter1
  - Second click: select fighter2
  - Click selected: deselect
  - Prevent same fighter twice
  - Limit to 2 selections

- [ ] **2.5.3** Create selection display area
  - Show selected fighters at top
  - Fighter1 | VS | Fighter2
  - Large preview cards
  - Click to deselect

- [ ] **2.5.4** Add VS animation
  - Animate when both selected
  - Zoom/fade effect
  - Sound effect (optional)
  - Celebration feel

- [ ] **2.5.5** Create proceed button
  - Show when both selected
  - "Choose Thesis →" text
  - Prominent styling
  - Navigate to next step

- [ ] **2.5.6** Add keyboard navigation
  - Arrow keys to navigate grid
  - Enter to select
  - Escape to deselect
  - Tab navigation

### Task 2.6: Fighters Page Implementation
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 2.5, 1.5

- [ ] **2.6.1** Create fighters page
  - File: `app/fighters/page.tsx`
  - Server component
  - Fetch fighters on server
  - Pass to FighterSelector

- [ ] **2.6.2** Implement data fetching
  - Use Supabase server client
  - Fetch all fighters
  - Order by name
  - Handle errors

- [ ] **2.6.3** Add page layout
  - Header with title
  - Instructions text
  - FighterSelector component
  - Responsive container

- [ ] **2.6.4** Handle navigation
  - Pass selection to thesis page
  - Use URL params or state
  - Implement router.push
  - Preserve selection

- [ ] **2.6.5** Add loading state
  - Show during server fetch
  - Skeleton UI
  - Smooth transition

- [ ] **2.6.6** Add error handling
  - Catch fetch errors
  - Display error message
  - Retry button
  - Log errors

### Task 2.7: Homepage Implementation
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 2.1

- [ ] **2.7.1** Create homepage
  - File: `app/page.tsx`
  - Hero section
  - Value propositions
  - CTA buttons

- [ ] **2.7.2** Design hero section
  - Large title: "Dialectical.Claims"
  - Tagline
  - Description text
  - Compelling copy

- [ ] **2.7.3** Add CTA buttons
  - "Create Dialectic" → /fighters
  - "Browse Archive" → /archive
  - Prominent styling
  - Hover effects

- [ ] **2.7.4** Create features section
  - 3 columns
  - Icons + text
  - Benefits/features
  - Responsive

- [ ] **2.7.5** Style and polish
  - Animations on scroll
  - Beautiful typography
  - Color accents
  - Mobile responsive

---

## Phase 3: Gemini Integration & Dialectic Generation (Week 4-5)
**Duration:** 10 days  
**Dependencies:** Phase 2 complete  
**Goal:** AI-powered dialectic generation with streaming

### Task 3.1: Gemini Client Setup
**Assignee:** AI/Backend Developer  
**Duration:** 3 hours

- [ ] **3.1.1** Create Gemini client file
  - File: `lib/gemini-client.ts`
  - Import GoogleGenerativeAI
  - Initialize with API key
  - Export model instances

- [ ] **3.1.2** Configure generation settings
  - temperature: 0.9
  - topP: 0.95
  - topK: 40
  - maxOutputTokens: 2048
  - Document reasoning

- [ ] **3.1.3** Create streaming model config
  - Separate config for streaming
  - Optimize for real-time
  - Test streaming works

- [ ] **3.1.4** Add error handling
  - Catch API errors
  - Handle rate limits
  - Retry logic
  - Graceful degradation

- [ ] **3.1.5** Create test script
  - File: `scripts/test-gemini.ts`
  - Simple generation test
  - Streaming test
  - Verify API works

### Task 3.2: Prompt Engineering - Fighter Responses
**Assignee:** AI Developer  
**Duration:** 8 hours  
**Dependencies:** 3.1

- [ ] **3.2.1** Design first round prompt template
  - Include system prompt
  - Include thesis
  - Opening move instructions
  - Format specifications

- [ ] **3.2.2** Test Nietzsche first round
  - Use test thesis
  - Generate response
  - Evaluate quality
  - Iterate on prompt

- [ ] **3.2.3** Test Haraway first round
  - Same thesis as Nietzsche test
  - Verify distinct voice
  - Check philosophical accuracy
  - Iterate

- [ ] **3.2.4** Design subsequent round prompt template
  - Include conversation history
  - Include opponent's last response
  - Response instructions
  - Stay in character

- [ ] **3.2.5** Test multi-round conversation
  - Generate 3-5 rounds
  - Check consistency
  - Check engagement
  - Verify they address each other

- [ ] **3.2.6** Optimize prompt length
  - Minimize token usage
  - Keep only recent history (last 4 exchanges)
  - Test quality maintained
  - Document choices

- [ ] **3.2.7** Test edge cases
  - Very abstract thesis
  - Very concrete thesis
  - Contradictory thesis
  - Ambiguous thesis

- [ ] **3.2.8** Document prompt templates
  - Create prompt template file
  - Document variables
  - Document best practices
  - Add examples

### Task 3.3: Prompt Engineering - Synthesis Generation
**Assignee:** AI Developer  
**Duration:** 6 hours  
**Dependencies:** 3.2

- [ ] **3.3.1** Design synthesis prompt template
  - Include full transcript
  - Include fighter names and thesis
  - Specify 3-4 synthesis types
  - Request JSON format

- [ ] **3.3.2** Define JSON output schema
  - Array of syntheses
  - Each: title, type, content, concept_tags
  - Clear structure
  - Validation rules

- [ ] **3.3.3** Test synthesis generation
  - Use completed test dialectic
  - Generate syntheses
  - Parse JSON
  - Evaluate quality

- [ ] **3.3.4** Handle JSON parsing errors
  - Strip markdown code blocks
  - Fallback parsing
  - Error messages
  - Retry logic

- [ ] **3.3.5** Test synthesis variety
  - Verify 4 different types
  - Check distinct approaches
  - Evaluate philosophical depth
  - Iterate on prompt

- [ ] **3.3.6** Optimize synthesis prompt
  - Minimize token usage
  - Maintain quality
  - Test with multiple dialectics
  - Document final version

### Task 3.4: Dialectic Generator Core Logic
**Assignee:** Backend Developer  
**Duration:** 8 hours  
**Dependencies:** 3.2, 3.3

- [ ] **3.4.1** Create dialectic generator file
  - File: `lib/dialectic-generator.ts`
  - Define interfaces
  - Import Gemini client
  - Set up structure

- [ ] **3.4.2** Implement generateFighterResponse()
  - Build prompt from template
  - Call Gemini API
  - Stream response
  - Return full text

- [ ] **3.4.3** Add streaming callback support
  - onChunk callback
  - Emit each token
  - Handle backpressure
  - Error handling

- [ ] **3.4.4** Implement round loop
  - For each round (1 to N)
  - Generate fighter1 response
  - Generate fighter2 response
  - Save to conversation history

- [ ] **3.4.5** Implement generateSyntheses()
  - Build synthesis prompt
  - Call Gemini API
  - Parse JSON response
  - Handle errors

- [ ] **3.4.6** Create main generateDialectic()
  - Accept options with callbacks
  - Run round loop
  - Generate syntheses
  - Handle all errors

- [ ] **3.4.7** Add retry logic
  - File: `lib/gemini-utils.ts`
  - Exponential backoff
  - Max 3 retries
  - Skip non-retryable errors

- [ ] **3.4.8** Write unit tests
  - Mock Gemini API
  - Test round generation
  - Test synthesis generation
  - Test error handling

### Task 3.5: Dialectic API Endpoints
**Assignee:** Backend Developer  
**Duration:** 6 hours  
**Dependencies:** 3.4

- [ ] **3.5.1** Create POST /api/dialectics route
  - File: `app/api/dialectics/route.ts`
  - Accept fighter IDs, thesis, rounds
  - Validate input with Zod
  - Create dialectic record

- [ ] **3.5.2** Add input validation
  - Create validation schema
  - Check fighter IDs exist
  - Check fighters are different
  - Validate round count (2-8)

- [ ] **3.5.3** Implement dialectic creation
  - Insert to database
  - Set status: 'pending'
  - Return dialectic ID
  - Handle database errors

- [ ] **3.5.4** Add rate limiting
  - File: `lib/rate-limit.ts`
  - Limit to 5 per hour per IP
  - Return 429 if exceeded
  - Log attempts

- [ ] **3.5.5** Create GET /api/dialectics/[id] route
  - File: `app/api/dialectics/[id]/route.ts`
  - Fetch with fighters and rounds
  - Include syntheses
  - Return 404 if not found

- [ ] **3.5.6** Test endpoints
  - Test create dialectic
  - Test fetch dialectic
  - Test validation errors
  - Test rate limiting

### Task 3.6: Server-Sent Events Implementation
**Assignee:** Backend Developer  
**Duration:** 8 hours  
**Dependencies:** 3.4, 3.5

- [ ] **3.6.1** Create SSE stream endpoint
  - File: `app/api/dialectics/[id]/stream/route.ts`
  - Set up ReadableStream
  - Set SSE headers
  - Handle connection

- [ ] **3.6.2** Implement event emission
  - Create sendEvent() helper
  - Format: `event: type\ndata: json\n\n`
  - Encode with TextEncoder
  - Enqueue to controller

- [ ] **3.6.3** Integrate dialectic generator
  - Fetch dialectic with fighters
  - Call generateDialectic()
  - Pass callback functions
  - Stream events to client

- [ ] **3.6.4** Implement all event types
  - status: generating/complete/error
  - round-start: {roundNumber}
  - fighter1-chunk: {chunk}
  - fighter2-chunk: {chunk}
  - round-complete: {roundNumber}
  - synthesis-complete: {syntheses}

- [ ] **3.6.5** Save rounds to database
  - In onRoundComplete callback
  - Insert round record
  - Include both responses
  - Handle errors

- [ ] **3.6.6** Save syntheses to database
  - In onSynthesisComplete callback
  - Insert all syntheses
  - Link to dialectic
  - Handle errors

- [ ] **3.6.7** Update dialectic status
  - Set to 'generating' on start
  - Set to 'generating' on start
  - Set to 'complete' when done
  - Set to 'failed' on error
  - Set completed_at timestamp

- [ ] **3.6.8** Add error handling
  - Try-catch around generation
  - Send error event
  - Update dialectic status
  - Close stream gracefully

- [ ] **3.6.9** Test SSE endpoint
  - Use curl with --no-buffer
  - Verify events stream
  - Test error cases
  - Test reconnection

### Task 3.7: Client-Side SSE Hook
**Assignee:** Frontend Developer  
**Duration:** 4 hours  
**Dependencies:** 3.6

- [ ] **3.7.1** Create useDialecticStream hook
  - File: `hooks/useDialecticStream.ts`
  - Accept dialectic ID
  - Set up EventSource
  - Return events, isComplete, error

- [ ] **3.7.2** Implement event listeners
  - Listen to all event types
  - Parse JSON data
  - Add to events array
  - Update state

- [ ] **3.7.3** Add reconnection logic
  - Track reconnect attempts
  - Max 3 attempts
  - Exponential backoff
  - Set error after max

- [ ] **3.7.4** Handle cleanup
  - Close EventSource on unmount
  - Clear reconnect timers
  - Prevent memory leaks

- [ ] **3.7.5** Add TypeScript types
  - StreamEvent type
  - Event data types
  - Hook return type

- [ ] **3.7.6** Write tests
  - Mock EventSource
  - Test event handling
  - Test reconnection
  - Test cleanup

---

## Phase 4: Arena UI & Streaming Display (Week 5-6)
**Duration:** 10 days  
**Dependencies:** Phase 3 complete  
**Goal:** Real-time arena with streaming text display

### Task 4.1: Arena Layout Components
**Assignee:** Frontend Developer  
**Duration:** 4 hours

- [ ] **4.1.1** Create ArenaView component
  - File: `components/arena/ArenaView.tsx`
  - Accept dialectic prop
  - Set up state management
  - Overall layout structure

- [ ] **4.1.2** Design arena header
  - Fighter avatars with names
  - VS indicator
  - Thesis display (large, centered)
  - Special moves shown

- [ ] **4.1.3** Create round counter
  - Show current round
  - Show total rounds
  - Progress indicator
  - Animated transitions

- [ ] **4.1.4** Design response containers
  - Fighter 1: Blue theme
  - Fighter 2: Red theme
  - Distinct backgrounds
  - Proper spacing

- [ ] **4.1.5** Add responsive layout
  - Desktop: Side by side
  - Tablet: Stacked
  - Mobile: Full width
  - Test all breakpoints

### Task 4.2: Streaming Text Component
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 4.1

- [ ] **4.2.1** Create StreamingText component
  - File: `components/arena/StreamingText.tsx`
  - Accept text prop
  - Display with cursor
  - Memoize for performance

- [ ] **4.2.2** Add typing cursor
  - Blinking cursor at end
  - Animate blink (CSS)
  - Remove when complete
  - Smooth animation

- [ ] **4.2.3** Add text formatting
  - Preserve whitespace
  - Handle line breaks
  - Proper typography
  - Readable font size

- [ ] **4.2.4** Optimize rendering
  - Use React.memo
  - Prevent unnecessary re-renders
  - Test with rapid updates
  - Profile performance

### Task 4.3: Arena State Management
**Assignee:** Frontend Developer  
**Duration:** 5 hours  
**Dependencies:** 3.7, 4.1

- [ ] **4.3.1** Set up arena state
  - currentRound: number
  - fighter1Text: string
  - fighter2Text: string
  - syntheses: array
  - status: string

- [ ] **4.3.2** Integrate useDialecticStream
  - Call hook with dialectic ID
  - Destructure events, isComplete, error
  - Process events in useEffect

- [ ] **4.3.3** Handle round-start events
  - Update currentRound
  - Clear fighter texts
  - Animate transition
  - Update UI

- [ ] **4.3.4** Handle chunk events
  - Append to fighter1Text
  - Append to fighter2Text
  - Smooth streaming
  - Handle backpressure

- [ ] **4.3.5** Handle round-complete events
  - Mark round as done
  - Prepare for next round
  - Save full responses (optional)

- [ ] **4.3.6** Handle synthesis events
  - Store syntheses array
  - Trigger synthesis display
  - Animate reveal

- [ ] **4.3.7** Handle error events
  - Display error message
  - Offer retry option
  - Log error details

### Task 4.4: Round Display Component
**Assignee:** Frontend Developer  
**Duration:** 4 hours  
**Dependencies:** 4.2, 4.3

- [ ] **4.4.1** Create RoundDisplay component
  - File: `components/arena/RoundDisplay.tsx`
  - Accept round number, fighter texts
  - Display both responses
  - Styling

- [ ] **4.4.2** Fighter 1 response section
  - Fighter name header
  - StreamingText component
  - Blue-themed container
  - Animated entrance

- [ ] **4.4.3** Fighter 2 response section
  - Fighter name header
  - StreamingText component
  - Red-themed container
  - Animated entrance

- [ ] **4.4.4** Add animations
  - Fade in on round start
  - Slide in from sides
  - Smooth transitions
  - Framer Motion

- [ ] **4.4.5** Add scroll behavior
  - Auto-scroll to new content
  - Smooth scrolling
  - Respect user scroll
  - Scroll to bottom button

### Task 4.5: Synthesis Display Components
**Assignee:** Frontend Developer  
**Duration:** 5 hours  
**Dependencies:** 4.1

- [ ] **4.5.1** Create SynthesisCard component
  - File: `components/arena/SynthesisCard.tsx`
  - Accept synthesis prop
  - Display title, type, content
  - Show concept tags

- [ ] **4.5.2** Design card layout
  - Distinct styling per type
  - Resolution: Green theme
  - Transcendence: Purple theme
  - Paradox: Orange theme
  - Subsumption: Blue theme

- [ ] **4.5.3** Add expand/collapse
  - Show summary by default
  - Click to expand full content
  - Smooth animation
  - Icon indicator

- [ ] **4.5.4** Create SynthesisCards container
  - File: `components/arena/SynthesisCards.tsx`
  - Accept syntheses array
  - Grid layout
  - Responsive

- [ ] **4.5.5** Add "Use as Thesis" button
  - On each synthesis card
  - Navigate to new dialectic
  - Pre-fill thesis
  - Track lineage

- [ ] **4.5.6** Add reveal animation
  - Stagger card appearance
  - Fade in + slide up
  - Celebratory feel
  - Framer Motion

### Task 4.6: Arena Page Implementation
**Assignee:** Frontend Developer  
**Duration:** 4 hours  
**Dependencies:** 4.1-4.5

- [ ] **4.6.1** Create arena page
  - File: `app/arena/[id]/page.tsx`
  - Accept dialectic ID param
  - Fetch dialectic on server
  - Pass to ArenaView

- [ ] **4.6.2** Implement data fetching
  - Fetch dialectic with fighters
  - Handle not found
  - Handle already complete
  - Handle errors

- [ ] **4.6.3** Add loading state
  - Show while fetching
  - Skeleton UI
  - Match arena layout

- [ ] **4.6.4** Add error handling
  - Display error message
  - Back to selection button
  - Log errors
  - User-friendly messages

- [ ] **4.6.5** Handle completed dialectics
  - Show full transcript
  - Show syntheses
  - No streaming needed
  - Replay option (Phase 5)

### Task 4.7: Thesis Selection UI
**Assignee:** Frontend Developer  
**Duration:** 6 hours  
**Dependencies:** Phase 2 complete

- [ ] **4.7.1** Create thesis page
  - File: `app/thesis/page.tsx`
  - Get fighters from URL/state
  - Display both fighters
  - Thesis input

- [ ] **4.7.2** Create custom thesis input
  - Large textarea
  - Character counter
  - Validation (10-1000 chars)
  - AI suggestions (optional)

- [ ] **4.7.3** Create provocation deck UI
  - File: `components/thesis/ProvocationDeck.tsx`
  - Fetch from API
  - Display as cards
  - Click to select

- [ ] **4.7.4** Implement deck filtering
  - Filter by domain
  - Search theses
  - Sort options
  - Clear filters

- [ ] **4.7.5** Create round selector
  - Radio buttons or select
  - 2-8 rounds
  - Show descriptions
  - Default: 5

- [ ] **4.7.6** Create start button
  - "Start Duel" CTA
  - Submit dialectic creation
  - Navigate to arena
  - Loading state

- [ ] **4.7.7** Handle form submission
  - Validate all inputs
  - POST to /api/dialectics
  - Get dialectic ID
  - Navigate to /arena/[id]

### Task 4.8: Loading & Error States
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 4.6

- [ ] **4.8.1** Create loading component
  - File: `components/ui/Loading.tsx`
  - Spinner animation
  - Optional message
  - Consistent styling

- [ ] **4.8.2** Create error component
  - File: `components/ui/Error.tsx`
  - Error message display
  - Retry button
  - Back button
  - Icon

- [ ] **4.8.3** Add to all pages
  - Fighter selection
  - Thesis selection
  - Arena
  - Archive

- [ ] **4.8.4** Add skeleton loaders
  - Fighter cards skeleton
  - Arena skeleton
  - Synthesis cards skeleton
  - Match actual layout

---

## Phase 5: Archive & History (Week 7)
**Duration:** 5 days  
**Dependencies:** Phase 4 complete  
**Goal:** Browse and replay past dialectics

### Task 5.1: Archive API Endpoints
**Assignee:** Backend Developer  
**Duration:** 4 hours

- [ ] **5.1.1** Create GET /api/dialectics/archive route
  - File: `app/api/dialectics/archive/route.ts`
  - Support pagination
  - Support filtering by fighters
  - Support sorting

- [ ] **5.1.2** Implement query logic
  - Parse query params
  - Build Supabase query
  - Filter by fighter1_id, fighter2_id
  - Sort by created_at, view_count

- [ ] **5.1.3** Add pagination
  - Page and per_page params
  - Use range() for pagination
  - Return total count
  - Calculate hasMore

- [ ] **5.1.4** Include related data
  - Join with fighter tables
  - Include fighter names
  - Optimize query
  - Limit to needed fields

- [ ] **5.1.5** Add caching
  - Set revalidate: 60
  - Cache-Control headers
  - Vary by query params

- [ ] **5.1.6** Test endpoint
  - Test pagination
  - Test filtering
  - Test sorting
  - Test performance

### Task 5.2: Archive UI Components
**Assignee:** Frontend Developer  
**Duration:** 5 hours  
**Dependencies:** 5.1

- [ ] **5.2.1** Create DialecticCard component
  - File: `components/archive/DialecticCard.tsx`
  - Show fighter names
  - Show thesis (truncated)
  - Show round count, date
  - Click to view

- [ ] **5.2.2** Style dialectic card
  - Fighter avatars (small)
  - VS indicator
  - Thesis quote
  - Metadata (date, views)
  - Hover effect

- [ ] **5.2.3** Create DialecticList component
  - File: `components/archive/DialecticList.tsx`
  - Accept dialectics array
  - Grid or list layout
  - Empty state
  - Loading state

- [ ] **5.2.4** Add pagination controls
  - Previous/Next buttons
  - Page numbers
  - Disable when not available
  - Show current page

- [ ] **5.2.5** Create ArchiveFilters component
  - File: `components/archive/ArchiveFilters.tsx`
  - Fighter checkboxes
  - Sort dropdown
  - Apply button
  - Clear button

- [ ] **5.2.6** Implement filter state
  - URL query params
  - Update on change
  - Preserve on navigation
  - Clear filters

### Task 5.3: Archive Page Implementation
**Assignee:** Frontend Developer  
**Duration:** 4 hours  
**Dependencies:** 5.2

- [ ] **5.3.1** Create archive page
  - File: `app/archive/page.tsx`
  - Server component
  - Fetch dialectics
  - Render list + filters

- [ ] **5.3.2** Implement data fetching
  - Call archive API
  - Parse query params
  - Pass to components
  - Handle errors

- [ ] **5.3.3** Add page layout
  - Header with title
  - Filters sidebar
  - Main content area
  - Responsive

- [ ] **5.3.4** Handle pagination
  - Client-side navigation
  - Update URL
  - Scroll to top
  - Loading state

- [ ] **5.3.5** Add search functionality
  - Search bar
  - Search by thesis text
  - Debounce input
  - Update results

### Task 5.4: Dialectic Replay Feature
**Assignee:** Frontend Developer  
**Duration:** 5 hours  
**Dependencies:** 4.6

- [ ] **5.4.1** Update arena to support replay
  - Check dialectic status
  - If complete, show all rounds
  - No streaming needed
  - Load from database

- [ ] **5.4.2** Fetch completed dialectic
  - Get dialectic with rounds
  - Get syntheses
  - Order rounds correctly
  - Handle errors

- [ ] **5.4.3** Display full transcript
  - Show all rounds at once
  - Or paginate through rounds
  - Expand/collapse rounds
  - Smooth scrolling

- [ ] **5.4.4** Add replay controls
  - Restart button
  - Speed control (optional)
  - Pause/Play (optional)
  - Navigate rounds

- [ ] **5.4.5** Add share functionality
  - Copy link button
  - Social share buttons (optional)
  - Embed code (optional)

### Task 5.5: View Counter Implementation
**Assignee:** Backend Developer  
**Duration:** 2 hours  
**Dependencies:** 5.4

- [ ] **5.5.1** Create view increment endpoint
  - POST /api/dialectics/[id]/view
  - Call increment_view_count()
  - Return success

- [ ] **5.5.2** Add to arena page
  - Call on page load
  - Only once per session
  - Handle errors silently
  - Don't block rendering

- [ ] **5.5.3** Display view count
  - Show on dialectic cards
  - Show in archive
  - Format numbers (1.2k)
  - Update after increment

---

## Phase 6: Knowledge Graph (Week 8)
**Duration:** 5 days  
**Dependencies:** Phase 5 complete  
**Goal:** Visual knowledge graph of synthesis lineage

### Task 6.1: Graph Data API
**Assignee:** Backend Developer  
**Duration:** 3 hours

- [ ] **6.1.1** Create GET /api/graph/nodes route
  - File: `app/api/graph/nodes/route.ts`
  - Fetch all syntheses
  - Join with dialectic data
  - Join with fighter names

- [ ] **6.1.2** Format node data
  - id, title, type
  - dialectic_id, thesis
  - fighter names
  - used_as_thesis_count
  - created_at

- [ ] **6.1.3** Create GET /api/graph/edges route
  - File: `app/api/graph/edges/route.ts`
  - Fetch from dialectic_lineage
  - Return source and target IDs
  - Simple array format

- [ ] **6.1.4** Add caching
  - Cache nodes for 5 minutes
  - Cache edges for 5 minutes
  - Invalidate on new dialectic

- [ ] **6.1.5** Test endpoints
  - Verify data structure
  - Check performance
  - Test with large dataset

### Task 6.2: D3 Graph Visualization
**Assignee:** Frontend Developer  
**Duration:** 8 hours  
**Dependencies:** 6.1

- [ ] **6.2.1** Install D3 dependencies
  ```bash
  pnpm add d3 @types/d3
  ```

- [ ] **6.2.2** Create KnowledgeGraph component
  - File: `components/graph/KnowledgeGraph.tsx`
  - Client component only
  - Accept nodes and edges props
  - SVG container

- [ ] **6.2.3** Implement force simulation
  - Import d3-force
  - Create forceSimulation
  - Add forceLink, forceCharge, forceCenter
  - Configure forces

- [ ] **6.2.4** Render nodes
  - Draw circles for each node
  - Size by used_as_thesis_count
  - Color by synthesis type
  - Add labels

- [ ] **6.2.5** Render edges
  - Draw lines between nodes
  - Use arrow markers
  - Style connections
  - Animate (optional)

- [ ] **6.2.6** Add interactivity
  - Hover to highlight
  - Click to view details
  - Drag nodes
  - Zoom and pan

- [ ] **6.2.7** Add node tooltips
  - Show on hover
  - Display full title
  - Show dialectic info
  - Styled popup

- [ ] **6.2.8** Optimize performance
  - Limit simulation ticks
  - Throttle rendering
  - Only render visible nodes
  - Test with 100+ nodes

### Task 6.3: Graph UI Controls
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 6.2

- [ ] **6.3.1** Create graph controls panel
  - Zoom in/out buttons
  - Reset view button
  - Filter controls
  - Legend

- [ ] **6.3.2** Add filtering
  - Filter by synthesis type
  - Filter by thinker
  - Filter by date range
  - Update graph

- [ ] **6.3.3** Create graph legend
  - Node colors meaning
  - Node sizes meaning
  - Edge types
  - Clear labels

- [ ] **6.3.4** Add node details panel
  - Show on node click
  - Display full synthesis
  - Show lineage
  - Link to dialectic

### Task 6.4: Graph Page Implementation
**Assignee:** Frontend Developer  
**Duration:** 3 hours  
**Dependencies:** 6.2, 6.3

- [ ] **6.4.1** Create graph page
  - File: `app/graph/page.tsx`
  - Fetch nodes and edges
  - Client-side rendering
  - Full screen layout

- [ ] **6.4.2** Implement data fetching
  - Parallel fetch nodes and edges
  - Handle loading state
  - Handle errors
  - Transform data for D3

- [ ] **6.4.3** Add page layout
  - Header with title
  - Graph canvas (full width)
  - Controls sidebar
  - Responsive

- [ ] **6.4.4** Add loading state
  - Show while fetching
  - Skeleton or spinner
  - Smooth transition

- [ ] **6.4.5** Handle empty state
  - Show when no syntheses
  - Helpful message
  - Link to create dialectic

---

## Phase 7: Testing & Quality Assurance (Week 9)
**Duration:** 5 days  
**Dependencies:** Phases 1-6 complete  
**Goal:** Comprehensive testing and bug fixes

### Task 7.1: Unit Testing
**Assignee:** All Developers  
**Duration:** 8 hours

- [ ] **7.1.1** Set up Vitest
  - Configure vitest.config.ts
  - Set up test environment
  - Configure coverage

- [ ] **7.1.2** Write utils tests
  - Test sanitization functions
  - Test validation schemas
  - Test helper functions
  - 80%+ coverage

- [ ] **7.1.3** Write API route tests
  - Test fighter endpoints
  - Test dialectic endpoints
  - Test graph endpoints
  - Mock Supabase

- [ ] **7.1.4** Write component tests
  - Test FighterCard
  - Test Button, Input
  - Test StreamingText
  - Test SynthesisCard

- [ ] **7.1.5** Write hook tests
  - Test useDialecticStream
  - Mock EventSource
  - Test state updates
  - Test cleanup

- [ ] **7.1.6** Run coverage report
  - Generate coverage
  - Aim for 70%+ overall
  - Identify gaps
  - Add missing tests

### Task 7.2: Integration Testing
**Assignee:** QA/Full-stack Developer  
**Duration:** 6 hours

- [ ] **7.2.1** Test fighter selection flow
  - Select two fighters
  - Navigate to thesis
  - Verify state preserved
  - Test back button

- [ ] **7.2.2** Test dialectic creation
  - Submit valid dialectic
  - Verify database insert
  - Verify navigation to arena
  - Test validation errors

- [ ] **7.2.3** Test arena streaming
  - Start dialectic
  - Verify SSE connection
  - Verify text streams
  - Verify syntheses appear

- [ ] **7.2.4** Test archive browsing
  - Browse dialectics
  - Test filtering
  - Test pagination
  - Test sorting

- [ ] **7.2.5** Test knowledge graph
  - Load graph
  - Test node interactions
  - Test filtering
  - Test performance

### Task 7.3: E2E Testing with Playwright
**Assignee:** QA Developer  
**Duration:** 8 hours

- [ ] **7.3.1** Set up Playwright
  - Install Playwright
  - Configure playwright.config.ts
  - Set up test database
  - Create helper functions

- [ ] **7.3.2** Write homepage test
  - Navigate to homepage
  - Verify title
  - Click CTA buttons
  - Verify navigation

- [ ] **7.3.3** Write fighter selection test
  - Navigate to fighters
  - Search for fighter
  - Select two fighters
  - Proceed to thesis

- [ ] **7.3.4** Write full dialectic test
  - Complete flow end-to-end
  - Create dialectic
  - Wait for completion
  - Verify syntheses

- [ ] **7.3.5** Write archive test
  - Browse archive
  - Apply filters
  - Click dialectic
  - Verify replay

- [ ] **7.3.6** Write mobile tests
  - Test on mobile viewport
  - Test touch interactions
  - Test responsive layout
  - Test hamburger menu (if any)

### Task 7.4: Performance Testing
**Assignee:** Full-stack Developer  
**Duration:** 4 hours

- [ ] **7.4.1** Run Lighthouse audits
  - Test homepage
  - Test fighters page
  - Test arena page
  - Aim for 90+ scores

- [ ] **7.4.2** Test database query performance
  - Profile slow queries
  - Add missing indexes
  - Optimize joins
  - Test with large dataset

- [ ] **7.4.3** Test SSE streaming performance
  - Monitor memory usage
  - Test with multiple connections
  - Check for memory leaks
  - Profile token streaming

- [ ] **7.4.4** Test graph performance
  - Test with 100+ nodes
  - Profile D3 rendering
  - Optimize force simulation
  - Test zoom/pan smoothness

- [ ] **7.4.5** Optimize bundle size
  - Analyze bundle with @next/bundle-analyzer
  - Tree-shake unused code
  - Lazy load heavy components
  - Compress images

### Task 7.5: Bug Fixes & Polish
**Assignee:** All Developers  
**Duration:** 8 hours

- [ ] **7.5.1** Fix critical bugs
  - Prioritize P0 bugs
  - Test fixes thoroughly
  - Add regression tests
  - Document fixes

- [ ] **7.5.2** Fix UI/UX issues
  - Inconsistent spacing
  - Broken layouts
  - Accessibility issues
  - Mobile issues

- [ ] **7.5.3** Fix performance issues
  - Slow pages
  - Memory leaks
  - Unnecessary re-renders
  - Database timeouts

- [ ] **7.5.4** Polish animations
  - Smooth transitions
  - Remove janky animations
  - Add subtle effects
  - Test on low-end devices

- [ ] **7.5.5** Polish typography
  - Consistent font sizes
  - Proper line heights
  - Readable color contrast
  - Mobile font sizes

---

## Phase 8: Production Preparation (Week 10)
**Duration:** 5 days  
**Dependencies:** Phase 7 complete  
**Goal:** Production-ready deployment

### Task 8.1: Security Hardening
**Assignee:** Backend/DevOps Developer  
**Duration:** 4 hours

- [ ] **8.1.1** Review environment variables
  - No secrets in code
  - All keys in Vercel settings
  - Rotate development keys
  - Document all vars

- [ ] **8.1.2** Implement rate limiting
  - Add to all POST endpoints
  - Configure limits appropriately
  - Test limit enforcement
  - Add to documentation

- [ ] **8.1.3** Add input sanitization
  - Sanitize thesis input
  - Prevent XSS
  - Prevent SQL injection
  - Test with malicious input

- [ ] **8.1.4** Configure CSP headers
  - Add Content-Security-Policy
  - Test in browser
  - Fix violations
  - Document policy

- [ ] **8.1.5** Review RLS policies
  - Verify read policies work
  - Test write policies
  - No data leakage
  - Document policies

### Task 8.2: Production Database Setup
**Assignee:** Backend Developer  
**Duration:** 3 hours

- [ ] **8.2.1** Create production Supabase project
  - New project for production
  - Select optimal region
  - Configure settings
  - Document credentials

- [ ] **8.2.2** Run schema in production
  - Execute schema.sql
  - Verify all tables
  - Verify indexes
  - Test RLS

- [ ] **8.2.3** Seed production database
  - Run seed script
  - Verify all fighters
  - Verify provocation deck
  - Test queries

- [ ] **8.2.4** Set up backups
  - Configure daily backups
  - Test restoration
  - Document procedure
  - Set up monitoring

- [ ] **8.2.5** Upload fighter portraits
  - Upload to production bucket
  - Verify URLs
  - Test loading
  - Optimize images

### Task 8.3: Production Deployment
**Assignee:** DevOps/Lead Developer  
**Duration:** 3 hours

- [ ] **8.3.1** Configure production environment
  - Add production env vars
  - Use production Supabase
  - Use production Gemini key
  - Verify all vars set

- [ ] **8.3.2** Deploy to production
  - Merge to main branch
  - Trigger Vercel deployment
  - Monitor build logs
  - Verify deployment success

- [ ] **8.3.3** Verify production deployment
  - Test all major features
  - Check database connections
  - Check API endpoints
  - Check streaming works

- [ ] **8.3.4** Set up custom domain (optional)
  - Configure DNS
  - Add to Vercel
  - Verify SSL
  - Test domain

- [ ] **8.3.5** Configure edge caching
  - Review cache headers
  - Test cache behavior
  - Monitor cache hit rate
  - Optimize as needed

### Task 8.4: Monitoring & Analytics
**Assignee:** DevOps Developer  
**Duration:** 3 hours

- [ ] **8.4.1** Set up Vercel Analytics
  - Enable Web Analytics
  - Verify tracking works
  - Configure dashboard
  - Document access

- [ ] **8.4.2** Set up error tracking (optional)
  - Install Sentry SDK
  - Configure Sentry
  - Test error capture
  - Set up alerts

- [ ] **8.4.3** Set up uptime monitoring
  - Use UptimeRobot or similar
  - Monitor homepage
  - Monitor API endpoints
  - Set up alerts

- [ ] **8.4.4** Create monitoring dashboard
  - Track dialectics created
  - Track API usage
  - Track error rates
  - Track performance

- [ ] **8.4.5** Set up cost monitoring
  - Monitor Gemini API costs
  - Monitor Vercel usage
  - Monitor Supabase usage
  - Set up budget alerts

### Task 8.5: Documentation & Handoff
**Assignee:** Lead Developer  
**Duration:** 4 hours

- [ ] **8.5.1** Update README
  - Production URLs
  - Setup instructions
  - Architecture overview
  - Contributing guide

- [ ] **8.5.2** Create API documentation
  - Document all endpoints
  - Request/response examples
  - Authentication (none)
  - Rate limits

- [ ] **8.5.3** Create deployment guide
  - Step-by-step deployment
  - Rollback procedure
  - Emergency contacts
  - Troubleshooting

- [ ] **8.5.4** Create maintenance guide
  - Database maintenance
  - Adding new fighters
  - Updating system prompts
  - Monitoring dashboards

- [ ] **8.5.5** Document known issues
  - List any known bugs
  - Workarounds
  - Plans to fix
  - Priority levels

---

## Phase 9: Launch & Post-Launch (Week 11-12)
**Duration:** 10 days  
**Dependencies:** Phase 8 complete  
**Goal:** Public launch and initial improvements

### Task 9.1: Pre-Launch Checklist
**Assignee:** All Team  
**Duration:** 4 hours

- [ ] **9.1.1** Final testing sweep
  - Test all critical paths
  - Test on multiple browsers
  - Test on mobile devices
  - Fix any blockers

- [ ] **9.1.2** Performance verification
  - Run Lighthouse audits
  - Verify API response times
  - Check database performance
  - Load test (optional)

- [ ] **9.1.3** Content review
  - Review all copy
  - Check for typos
  - Verify fighter data accuracy
  - Review legal text (if any)

- [ ] **9.1.4** SEO optimization
  - Add meta tags
  - Create sitemap.xml
  - Add robots.txt
  - Submit to search engines

- [ ] **9.1.5** Prepare launch assets
  - Screenshots
  - Demo video (optional)
  - Press release (optional)
  - Social media posts

### Task 9.2: Soft Launch
**Assignee:** Product/Marketing Lead  
**Duration:** 2 days

- [ ] **9.2.1** Share with beta testers
  - Send access to 10-20 beta users
  - Collect feedback
  - Monitor for issues
  - Fix critical bugs quickly

- [ ] **9.2.2** Monitor system performance
  - Watch server metrics
  - Monitor API costs
  - Track error rates
  - Check database load

- [ ] **9.2.3** Gather user feedback
  - Create feedback form
  - Interview key users
  - Analyze usage patterns
  - Document pain points

- [ ] **9.2.4** Make quick improvements
  - Fix obvious bugs
  - Improve confusing UX
  - Optimize slow features
  - Update documentation

### Task 9.3: Public Launch
**Assignee:** Product/Marketing Lead  
**Duration:** 1 day

- [ ] **9.3.1** Announce on social media
  - Twitter/X post
  - LinkedIn post
  - Reddit (r/philosophy, r/webdev)
  - Hacker News (Show HN)

- [ ] **9.3.2** Share with communities
  - Philosophy forums
  - AI communities
  - Education groups
  - Academic networks

- [ ] **9.3.3** Create launch post
  - Product Hunt (optional)
  - Blog post
  - Demo walkthrough
  - Feature highlights

- [ ] **9.3.4** Monitor launch metrics
  - Track visitor count
  - Track dialectics created
  - Track engagement time
  - Monitor error rates

### Task 9.4: Post-Launch Support
**Assignee:** All Team  
**Duration:** 5 days

- [ ] **9.4.1** Set up support channels
  - Create support email
  - Set up GitHub issues
  - Create FAQ page
  - Document common issues

- [ ] **9.4.2** Monitor and respond
  - Check support channels daily
  - Respond to issues quickly
  - Prioritize bugs
  - Communicate fixes

- [ ] **9.4.3** Collect feature requests
  - Track in GitHub issues
  - Prioritize by impact
  - Group similar requests
  - Plan roadmap

- [ ] **9.4.4** Create usage reports
  - Weekly metrics summary
  - Top dialectics
  - Popular fighters
  - User behavior insights

- [ ] **9.4.5** Plan iterations
  - Review feedback
  - Prioritize improvements
  - Plan Phase 10 features
  - Update roadmap

### Task 9.5: Initial Optimizations
**Assignee:** Development Team  
**Duration:** 5 days

- [ ] **9.5.1** Performance optimizations
  - Optimize slow queries
  - Add missing indexes
  - Improve caching
  - Reduce bundle size

- [ ] **9.5.2** UI/UX improvements
  - Fix confusing flows
  - Improve mobile experience
  - Better error messages
  - Smoother animations

- [ ] **9.5.3** Content improvements
  - Add more theses to deck
  - Refine fighter prompts
  - Add more portraits
  - Improve copy

- [ ] **9.5.4** Cost optimization
  - Optimize Gemini prompts
  - Reduce token usage
  - Improve caching strategy
  - Monitor spend closely

- [ ] **9.5.5** SEO improvements
  - Add more meta tags
  - Improve page titles
  - Add structured data
  - Build backlinks

---

## Phase 10: Advanced Features (Week 13+)
**Duration:** Ongoing  
**Dependencies:** Phase 9 complete  
**Goal:** Enhanced functionality based on user feedback

### Task 10.1: Enhanced Archive Features
**Assignee:** Frontend Developer  
**Duration:** 1 week

- [ ] **10.1.1** Add advanced search
  - Full-text search on thesis
  - Search within dialectic content
  - Search by fighter combination
  - Search by concepts

- [ ] **10.1.2** Add collections feature
  - Create named collections
  - Add dialectics to collections
  - Share collections
  - Featured collections

- [ ] **10.1.3** Add sorting options
  - By date
  - By views
  - By rounds
  - By synthesis count

- [ ] **10.1.4** Add filtering improvements
  - Filter by date range
  - Filter by round count
  - Filter by synthesis types
  - Multiple filters

- [ ] **10.1.5** Add export features
  - Export transcript as PDF
  - Export as markdown
  - Share on social media
  - Embed code

### Task 10.2: Synthesis Improvements
**Assignee:** AI Developer  
**Duration:** 1 week

- [ ] **10.2.1** Improve synthesis quality
  - Refine prompts
  - Test with more dialectics
  - A/B test approaches
  - Gather user feedback

- [ ] **10.2.2** Add synthesis regeneration
  - Allow re-generating syntheses
  - Different "voices"
  - More or fewer syntheses
  - Save alternatives

- [ ] **10.2.3** Add synthesis voting (optional)
  - Let users rate syntheses
  - Track which are best
  - Surface top syntheses
  - Improve prompts based on ratings

- [ ] **10.2.4** Add synthesis lineage view
  - Visual tree of descendants
  - Show how synthesis evolved
  - Track recursive depth
  - Highlight active branches

### Task 10.3: Enhanced Graph Features
**Assignee:** Frontend Developer  
**Duration:** 1 week

- [ ] **10.3.1** Add graph search
  - Search nodes by title
  - Search by fighter
  - Highlight results
  - Navigate to nodes

- [ ] **10.3.2** Add path finding
  - Show path between two nodes
  - Highlight path
  - Show relationship
  - Export path

- [ ] **10.3.3** Add graph clustering
  - Identify concept clusters
  - Color by cluster
  - Name clusters
  - Explore clusters

- [ ] **10.3.4** Add timeline view
  - Chronological layout
  - Time slider
  - Animate growth
  - Replay history

- [ ] **10.3.5** Improve performance
  - WebGL rendering (optional)
  - Level of detail
  - Only render visible
  - Optimize updates

### Task 10.4: Social & Community Features
**Assignee:** Full-stack Developer  
**Duration:** 2 weeks

- [ ] **10.4.1** Add commenting (optional)
  - Comment on dialectics
  - Comment on syntheses
  - Reply to comments
  - Moderation tools

- [ ] **10.4.2** Add sharing improvements
  - Better social cards
  - Specific synthesis sharing
  - Round-by-round sharing
  - Quote images

- [ ] **10.4.3** Add user profiles (optional)
  - Track created dialectics
  - Follow users
  - User collections
  - Achievements

- [ ] **10.4.4** Add collaborative features
  - Shared viewing sessions
  - Real-time chat
  - Collaborative curation
  - Group dialectics

### Task 10.5: Mobile App (Optional)
**Assignee:** Mobile Developer  
**Duration:** 4-6 weeks

- [ ] **10.5.1** Evaluate mobile approach
  - React Native vs PWA
  - Feature priorities
  - Budget and timeline
  - Resource allocation

- [ ] **10.5.2** Create mobile design
  - Mobile-first UI
  - Touch interactions
  - Simplified flows
  - Native feel

- [ ] **10.5.3** Implement core features
  - Fighter selection
  - Arena viewing
  - Archive browsing
  - Push notifications

- [ ] **10.5.4** Test and launch
  - Beta testing
  - App store submission
  - Marketing
  - Support

---

## Appendix A: Task Dependencies Map

```
Phase 0 (Setup)
  └─> Phase 1 (Data Layer)
       └─> Phase 2 (Fighter UI)
            └─> Phase 3 (AI Integration)
                 └─> Phase 4 (Arena UI)
                      ├─> Phase 5 (Archive)
                      └─> Phase 6 (Graph)
                           └─> Phase 7 (Testing)
                                └─> Phase 8 (Production Prep)
                                     └─> Phase 9 (Launch)
                                          └─> Phase 10 (Advanced)
```

**Parallel Work Opportunities:**
- Phase 0.3 (Supabase) can run parallel with 0.1-0.2
- Phase 0.5 (Gemini) can run parallel with 0.1-0.4
- Phase 1.1 (Fighter Data) can run parallel with 1.2 (Portraits)
- Phase 2.1 (UI Components) can start while Phase 1 completes
- Phase 5 (Archive) and Phase 6 (Graph) can partially overlap
- Phase 8 (Production Prep) tasks can run parallel

---

## Appendix B: Critical Path

**Must Complete in Order (Critical Path):**

1. **Week 1**: Project Setup (Phase 0)
2. **Week 2**: Database + Fighter Data (Phase 1)
3. **Week 3**: Fighter Selection UI (Phase 2)
4. **Week 4-5**: Gemini + Dialectic Generation (Phase 3)
5. **Week 5-6**: Arena Streaming UI (Phase 4)
6. **Week 7**: Archive (Phase 5)
7. **Week 8**: Knowledge Graph (Phase 6)
8. **Week 9**: Testing (Phase 7)
9. **Week 10**: Production Prep (Phase 8)
10. **Week 11-12**: Launch (Phase 9)

**Total Critical Path Duration:** 12 weeks minimum

---

## Appendix C: Team Assignment Guide

### Small Team (3 developers):

**Developer 1 (Full-stack Lead):**
- Phase 0: All tasks
- Phase 1: Tasks 1.3, 1.4, 1.5
- Phase 3: All Gemini integration
- Phase 5: Backend tasks
- Phase 7: Testing coordination
- Phase 8-9: Deployment & launch

**Developer 2 (Frontend Specialist):**
- Phase 2: All fighter UI
- Phase 4: All arena UI
- Phase 5: Frontend tasks
- Phase 6: Knowledge graph
- Phase 7: E2E testing
- Phase 10: Advanced UI features

**Developer 3 (Backend/Data):**
- Phase 1: Tasks 1.1, 1.2, 1.3
- Phase 3: Prompt engineering
- Phase 4: SSE implementation
- Phase 5: Archive API
- Phase 6: Graph API
- Phase 7: Integration testing

### Larger Team (5 developers):

Add:
- **QA Engineer**: Focus on Phase 7
- **Designer/Frontend**: Phase 2 UI polish, Phase 4 animations

---

## Appendix D: Risk Mitigation

### High-Risk Items & Mitigations:

**Risk 1: Gemini API Costs Exceed Budget**
- **Mitigation**: 
  - Monitor costs daily
  - Implement aggressive rate limiting
  - Optimize prompts for token efficiency
  - Set budget alerts at 50%, 75%, 90%
  - Have fallback: disable creation if budget hit

**Risk 2: Poor Synthesis Quality**
- **Mitigation**:
  - Extensive prompt testing (Task 3.3)
  - A/B test different approaches
  - Gather user feedback early
  - Iterate rapidly on prompts
  - Budget extra time for tuning (Phase 10)

**Risk 3: SSE Streaming Issues**
- **Mitigation**:
  - Test across browsers early
  - Implement robust reconnection
  - Add fallback: poll for updates
  - Monitor connection drops
  - Graceful degradation

**Risk 4: Performance Problems with Large Dataset**
- **Mitigation**:
  - Implement database indexes early (Task 0.6)
  - Load test before launch (Task 7.4)
  - Optimize queries proactively
  - Add pagination everywhere
  - Monitor query performance

**Risk 5: Schedule Slippage**
- **Mitigation**:
  - Build 2-week buffer into schedule
  - Prioritize MVP features
  - Cut scope if needed (Phase 10 optional)
  - Daily standups to catch delays early
  - Track progress with project management tool

---

## Appendix E: Success Metrics per Phase

### Phase 1 Success Criteria:
- [ ] All 70+ fighters seeded in database
- [ ] All fighter portraits uploaded and accessible
- [ ] Fighter API endpoints return correct data
- [ ] Database schema matches specification

### Phase 2 Success Criteria:
- [ ] User can select 2 fighters smoothly
- [ ] Search and filters work correctly
- [ ] Mobile responsive layout works
- [ ] Page loads in <2 seconds

### Phase 3 Success Criteria:
- [ ] Dialectic generates successfully
- [ ] Fighter responses are philosophically coherent
- [ ] Syntheses are high quality (manual review)
- [ ] Gemini API costs are <$0.02 per dialectic

### Phase 4 Success Criteria:
- [ ] Streaming works without lag
- [ ] Text appears token-by-token smoothly
- [ ] Syntheses display correctly
- [ ] No memory leaks during long sessions

### Phase 5 Success Criteria:
- [ ] Archive loads quickly (<2s)
- [ ] Filtering works correctly
- [ ] Pagination works smoothly
- [ ] Dialectics are replayable

### Phase 6 Success Criteria:
- [ ] Graph renders 100+ nodes smoothly
- [ ] Interactivity works (zoom, pan, click)
- [ ] Graph is visually appealing
- [ ] Performance is acceptable (60fps pan/zoom)

### Phase 7 Success Criteria:
- [ ] 70%+ test coverage
- [ ] All critical paths tested E2E
- [ ] Lighthouse scores >90
- [ ] Zero P0/P1 bugs remaining

### Phase 8 Success Criteria:
- [ ] Production deployment successful
- [ ] All features work in production
- [ ] Security measures in place
- [ ] Monitoring operational

### Phase 9 Success Criteria:
- [ ] Public launch completed
- [ ] 100+ dialectics created in first week
- [ ] <1% error rate
- [ ] Positive user feedback

---

## Appendix F: Daily Standup Template

**What did you complete yesterday?**
- List completed tasks with task IDs
- Any blockers resolved

**What will you work on today?**
- List planned tasks with task IDs
- Estimated completion time

**Any blockers or concerns?**
- Technical blockers
- Resource needs
- Questions for team

**Risk updates:**
- Any new risks identified
- Mitigation status

---

## Appendix G: Sprint Planning Template

### Sprint N: [Dates]

**Sprint Goal:**  
[Clear objective, e.g., "Complete fighter selection UI"]

**Tasks Planned:**
- [ ] Task ID - Description (Assignee, Est. hours)
- [ ] Task ID - Description (Assignee, Est. hours)

**Carry-over from Previous Sprint:**
- [ ] Task ID - Reason for carry-over

**Risks:**
- Risk description and mitigation

**Definition of Done:**
- Code merged to develop
- Tests written and passing
- Reviewed by 1+ team member
- Deployed to staging
- No known bugs

---

## Appendix H: Weekly Progress Report Template

### Week N: [Dates]

**Completed:**
- Phase/Task completed
- Metrics (e.g., 45 fighters seeded)

**In Progress:**
- Phase/Task status (% complete)

**Blockers:**
- Blocker description
- Action plan

**Metrics:**
- Lines of code
- Tests added
- Test coverage %
- Bugs fixed

**Next Week Plan:**
- Priority tasks
- Expected completions

**Budget:**
- Hours spent vs. planned
- Costs incurred (API, hosting)

---

## Appendix I: Code Review Checklist

**Before Submitting PR:**
- [ ] Code follows style guide
- [ ] Tests written and passing
- [ ] No console.log statements
- [ ] TypeScript errors resolved
- [ ] ESLint passing
- [ ] Committed .env.example (not .env)
- [ ] Updated documentation if needed

**Reviewer Checks:**
- [ ] Code is readable and maintainable
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Tests are meaningful
- [ ] Naming is clear

---

## Appendix J: Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Staging tested
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Backups completed

**Deployment:**
- [ ] Merge to main branch
- [ ] Verify build succeeds
- [ ] Monitor deployment logs
- [ ] Smoke test production

**Post-Deployment:**
- [ ] Verify all features work
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Check API costs
- [ ] Update documentation
- [ ] Notify team

**Rollback Plan:**
- [ ] Revert deployment in Vercel
- [ ] Restore database if needed
- [ ] Communicate issues
- [ ] Document what went wrong

---