---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [API Design](#4-api-design)
5. [Gemini Integration](#5-gemini-integration)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Deployment & Infrastructure](#7-deployment--infrastructure)
8. [Performance Optimization](#8-performance-optimization)
9. [Security Considerations](#9-security-considerations)
10. [Development Workflow](#10-development-workflow)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (React)                 │  │
│  │  - Fighter Selection UI                          │  │
│  │  - Arena Streaming Display                       │  │
│  │  - Archive Browser                               │  │
│  │  - Knowledge Graph Viz                           │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                           │ HTTPS/SSE
                           │
┌──────────────────────────▼──────────────────────────────┐
│              VERCEL DEPLOYMENT                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Next.js App Router (App Directory)         │  │
│  │  - Static Pages (SSG)                            │  │
│  │  - Dynamic Routes (SSR)                          │  │
│  │  - API Routes (Serverless Functions)            │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌──────────────────────┼──────────────────────────┐  │
│  │    API Route Handlers (Serverless)               │  │
│  │  - /api/fighters/*                               │  │
│  │  - /api/dialectics/*                             │  │
│  │  - /api/dialectics/[id]/stream (SSE)            │  │
│  │  - /api/archive/*                                │  │
│  │  - /api/graph/*                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│   SUPABASE    │  │ GEMINI API   │  │ VERCEL EDGE  │
│               │  │              │  │   FUNCTIONS  │
│ - PostgreSQL  │  │ - Gemini 2.0 │  │              │
│ - Auth (off)  │  │   Flash      │  │ - Rate Limit │
│ - Storage     │  │ - Streaming  │  │ - Caching    │
│ - Realtime    │  │              │  │              │
└───────────────┘  └──────────────┘  └──────────────┘
```

### 1.2 Request Flow Examples

**Creating a New Dialectic:**
```
1. User selects fighters + thesis → Frontend
2. POST /api/dialectics → Vercel Serverless Function
3. Insert dialectic record → Supabase
4. Return dialectic ID → Frontend
5. Frontend connects to SSE → /api/dialectics/[id]/stream
6. Backend streams rounds → Gemini API
7. Tokens stream back → Frontend displays
8. Generate syntheses → Gemini API
9. Save to Supabase → Complete
```

**Browsing Archive:**
```
1. User visits /archive → Next.js SSR page
2. Fetch dialectics → Supabase query
3. Render archive list → Client
4. User filters by fighter → Client-side or new SSR
5. Query updated results → Supabase
```

**Viewing Knowledge Graph:**
```
1. User visits /graph → Next.js page
2. Fetch all syntheses + lineage → Supabase
3. Client-side D3.js renders graph
4. User clicks node → Fetch dialectic details
5. Display in modal/side panel
```

---

## 2. Technology Stack

### 2.1 Frontend

**Framework:**
- **Next.js 14+** (App Router)
  - Server-side rendering for SEO
  - Static generation for fighter pages
  - API routes for backend
  - Built-in optimization (images, fonts, etc.)

**UI Libraries:**
- **React 18+** with hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components (dialogs, dropdowns)
- **D3.js** for knowledge graph visualization
- **Lucide React** for icons

**State Management:**
- **Zustand** (lightweight, simple state)
- React Query / TanStack Query for server state
- Local state with useState/useReducer where appropriate

### 2.2 Backend

**Platform:**
- **Vercel** (Serverless deployment)
  - Automatic HTTPS
  - Edge network CDN
  - Serverless functions for API
  - Environment variable management

**Database:**
- **Supabase** (PostgreSQL)
  - Postgres 15+
  - Row Level Security (RLS) - disabled for public read
  - Full-text search
  - PostGIS for potential geo features
  - Automatic API generation
  - Real-time subscriptions (optional)

**Storage:**
- **Supabase Storage** for fighter portraits/avatars
- **Vercel Blob Storage** as alternative for static assets

### 2.3 AI/LLM

**Primary:**
- **Google Gemini 2.0 Flash** via Gemini API
  - Fast inference
  - Streaming support
  - Long context window (1M+ tokens)
  - Cost-effective ($0.10/1M input tokens)
  - Good instruction following

**SDK:**
- `@google/generative-ai` npm package
- Server-side only (API key never exposed)

### 2.4 Development Tools

- **Git** + **GitHub** for version control
- **pnpm** for package management (faster than npm)
- **ESLint** + **Prettier** for code quality
- **TypeScript** strict mode
- **Vitest** for unit tests (optional)
- **Playwright** for E2E tests (optional)

---

## 3. Database Schema

### 3.1 Supabase PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- FIGHTERS TABLE
-- =============================================
CREATE TABLE fighters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  fighter_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly: "nietzsche"
  era VARCHAR(100) NOT NULL,
  tradition TEXT[] NOT NULL, -- Array of traditions
  style VARCHAR(100) NOT NULL,
  special_move VARCHAR(255) NOT NULL,
  attributes TEXT[] NOT NULL,
  system_prompt TEXT NOT NULL, -- Full system prompt (3000+ chars)
  portrait_url TEXT,
  short_bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fighters_slug ON fighters(slug);
CREATE INDEX idx_fighters_era ON fighters(era);
CREATE INDEX idx_fighters_name_search ON fighters USING gin(name gin_trgm_ops);

-- =============================================
-- DIALECTICS TABLE
-- =============================================
CREATE TABLE dialectics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fighter1_id UUID NOT NULL REFERENCES fighters(id),
  fighter2_id UUID NOT NULL REFERENCES fighters(id),
  thesis TEXT NOT NULL,
  round_count INTEGER NOT NULL CHECK (round_count >= 2 AND round_count <= 8),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, generating, complete, failed
  view_count INTEGER DEFAULT 0,
  parent_synthesis_id UUID REFERENCES syntheses(id), -- If spawned from synthesis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT different_fighters CHECK (fighter1_id != fighter2_id)
);

-- Indexes
CREATE INDEX idx_dialectics_fighter1 ON dialectics(fighter1_id);
CREATE INDEX idx_dialectics_fighter2 ON dialectics(fighter2_id);
CREATE INDEX idx_dialectics_status ON dialectics(status);
CREATE INDEX idx_dialectics_created_at ON dialectics(created_at DESC);
CREATE INDEX idx_dialectics_thesis_search ON dialectics USING gin(thesis gin_trgm_ops);

-- =============================================
-- ROUNDS TABLE
-- =============================================
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dialectic_id UUID NOT NULL REFERENCES dialectics(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  fighter1_response TEXT NOT NULL,
  fighter2_response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dialectic_id, round_number)
);

-- Indexes
CREATE INDEX idx_rounds_dialectic ON rounds(dialectic_id, round_number);

-- =============================================
-- SYNTHESES TABLE
-- =============================================
CREATE TABLE syntheses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dialectic_id UUID NOT NULL REFERENCES dialectics(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL, -- resolution, subsumption, transcendence, paradox
  content TEXT NOT NULL,
  concept_tags TEXT[] NOT NULL,
  used_as_thesis_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_syntheses_dialectic ON syntheses(dialectic_id);
CREATE INDEX idx_syntheses_type ON syntheses(type);
CREATE INDEX idx_syntheses_used_count ON syntheses(used_as_thesis_count DESC);
CREATE INDEX idx_syntheses_tags ON syntheses USING gin(concept_tags);

-- =============================================
-- PROVOCATION_DECK TABLE (Curated Theses)
-- =============================================
CREATE TABLE provocation_deck (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thesis TEXT NOT NULL UNIQUE,
  domain VARCHAR(100) NOT NULL, -- ontology, ethics, epistemology, etc.
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  tags TEXT[] NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_provocation_domain ON provocation_deck(domain);
CREATE INDEX idx_provocation_usage ON provocation_deck(usage_count DESC);

-- =============================================
-- LINEAGE TABLE (Knowledge Graph Edges)
-- =============================================
CREATE TABLE dialectic_lineage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_synthesis_id UUID NOT NULL REFERENCES syntheses(id) ON DELETE CASCADE,
  child_dialectic_id UUID NOT NULL REFERENCES dialectics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(parent_synthesis_id, child_dialectic_id)
);

-- Indexes
CREATE INDEX idx_lineage_parent ON dialectic_lineage(parent_synthesis_id);
CREATE INDEX idx_lineage_child ON dialectic_lineage(child_dialectic_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fighters_updated_at BEFORE UPDATE ON fighters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment view count function
CREATE OR REPLACE FUNCTION increment_view_count(dialectic_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE dialectics 
  SET view_count = view_count + 1 
  WHERE id = dialectic_uuid;
END;
$$ LANGUAGE plpgsql;

-- Increment synthesis usage count
CREATE OR REPLACE FUNCTION increment_synthesis_usage(synthesis_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE syntheses 
  SET used_as_thesis_count = used_as_thesis_count + 1 
  WHERE id = synthesis_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (Disabled for public read)
-- =============================================

-- Enable RLS but allow all reads
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialectics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE syntheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE provocation_deck ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialectic_lineage ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on fighters" ON fighters FOR SELECT USING (true);
CREATE POLICY "Allow public read on dialectics" ON dialectics FOR SELECT USING (true);
CREATE POLICY "Allow public read on rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "Allow public read on syntheses" ON syntheses FOR SELECT USING (true);
CREATE POLICY "Allow public read on provocation_deck" ON provocation_deck FOR SELECT USING (true);
CREATE POLICY "Allow public read on lineage" ON dialectic_lineage FOR SELECT USING (true);

-- Writes only from service role (backend API)
CREATE POLICY "Service role write on dialectics" ON dialectics FOR INSERT 
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role write on rounds" ON rounds FOR INSERT 
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role write on syntheses" ON syntheses FOR INSERT 
  USING (auth.role() = 'service_role');
```

### 3.2 TypeScript Types (Generated from Schema)

```typescript
// types/database.types.ts

export interface Fighter {
  id: string;
  name: string;
  fighter_name: string;
  slug: string;
  era: string;
  tradition: string[];
  style: string;
  special_move: string;
  attributes: string[];
  system_prompt: string;
  portrait_url: string | null;
  short_bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dialectic {
  id: string;
  fighter1_id: string;
  fighter2_id: string;
  thesis: string;
  round_count: number;
  status: 'pending' | 'generating' | 'complete' | 'failed';
  view_count: number;
  parent_synthesis_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Round {
  id: string;
  dialectic_id: string;
  round_number: number;
  fighter1_response: string;
  fighter2_response: string;
  created_at: string;
}

export interface Synthesis {
  id: string;
  dialectic_id: string;
  title: string;
  type: 'resolution' | 'subsumption' | 'transcendence' | 'paradox';
  content: string;
  concept_tags: string[];
  used_as_thesis_count: number;
  created_at: string;
}

export interface ProvocationDeck {
  id: string;
  thesis: string;
  domain: string;
  difficulty: number;
  tags: string[];
  usage_count: number;
  created_at: string;
}

export interface DialecticLineage {
  id: string;
  parent_synthesis_id: string;
  child_dialectic_id: string;
  created_at: string;
}

// Extended types with relations
export interface DialecticWithFighters extends Dialectic {
  fighter1: Fighter;
  fighter2: Fighter;
}

export interface DialecticWithRounds extends DialecticWithFighters {
  rounds: Round[];
  syntheses: Synthesis[];
}
```

---

## 4. API Design

### 4.1 API Route Structure

```
app/
├── api/
│   ├── fighters/
│   │   ├── route.ts              # GET /api/fighters (list all)
│   │   ├── [slug]/
│   │   │   └── route.ts          # GET /api/fighters/[slug]
│   │   └── search/
│   │       └── route.ts          # GET /api/fighters/search?q=name
│   │
│   ├── dialectics/
│   │   ├── route.ts              # POST /api/dialectics (create)
│   │   │                         # GET /api/dialectics?page=1
│   │   ├── [id]/
│   │   │   ├── route.ts          # GET /api/dialectics/[id]
│   │   │   └── stream/
│   │   │       └── route.ts      # GET /api/dialectics/[id]/stream (SSE)
│   │   └── archive/
│   │       └── route.ts          # GET /api/dialectics/archive
│   │
│   ├── syntheses/
│   │   └── [id]/
│   │       ├── route.ts          # GET /api/syntheses/[id]
│   │       └── descendants/
│   │           └── route.ts      # GET /api/syntheses/[id]/descendants
│   │
│   ├── provocation-deck/
│   │   └── route.ts              # GET /api/provocation-deck
│   │
│   └── graph/
│       ├── nodes/
│       │   └── route.ts          # GET /api/graph/nodes
│       └── edges/
│           └── route.ts          # GET /api/graph/edges
```

### 4.2 API Endpoint Specifications

#### GET /api/fighters

**Purpose:** List all fighters

**Query Params:**
- `era` (optional): Filter by era
- `tradition` (optional): Filter by tradition
- `search` (optional): Search by name

**Response:**
```typescript
{
  fighters: Fighter[]
}
```

**Example:**
```typescript
// app/api/fighters/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const era = searchParams.get('era');
  const tradition = searchParams.get('tradition');
  const search = searchParams.get('search');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase
    .from('fighters')
    .select('*')
    .order('name');

  if (era) {
    query = query.eq('era', era);
  }

  if (tradition) {
    query = query.contains('tradition', [tradition]);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ fighters: data });
}
```

#### POST /api/dialectics

**Purpose:** Create new dialectic

**Request Body:**
```typescript
{
  fighter1_id: string;
  fighter2_id: string;
  thesis: string;
  round_count: number; // 2-8
  parent_synthesis_id?: string; // Optional
}
```

**Response:**
```typescript
{
  dialectic_id: string;
  status: 'pending';
}
```

**Implementation:**
```typescript
// app/api/dialectics/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fighter1_id, fighter2_id, thesis, round_count, parent_synthesis_id } = body;

    // Validation
    if (!fighter1_id || !fighter2_id || !thesis || !round_count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (fighter1_id === fighter2_id) {
      return NextResponse.json(
        { error: 'Fighters must be different' },
        { status: 400 }
      );
    }

    if (round_count < 2 || round_count > 8) {
      return NextResponse.json(
        { error: 'Round count must be between 2 and 8' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create dialectic record
    const { data: dialectic, error } = await supabase
      .from('dialectics')
      .insert({
        fighter1_id,
        fighter2_id,
        thesis,
        round_count,
        parent_synthesis_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If spawned from synthesis, increment usage count
    if (parent_synthesis_id) {
      await supabase.rpc('increment_synthesis_usage', {
        synthesis_uuid: parent_synthesis_id
      });
      
      // Create lineage record
      await supabase.from('dialectic_lineage').insert({
        parent_synthesis_id,
        child_dialectic_id: dialectic.id
      });
    }

    return NextResponse.json({
      dialectic_id: dialectic.id,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error creating dialectic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### GET /api/dialectics/[id]/stream

**Purpose:** Stream dialectic generation in real-time using Server-Sent Events

**Response:** SSE stream with events:
- `status`: Status updates
- `round-start`: Round beginning
- `fighter1-chunk`: Token from fighter 1
- `fighter2-chunk`: Token from fighter 2
- `round-complete`: Round finished
- `synthesis-start`: Synthesis generation beginning
- `synthesis-complete`: Synthesis finished
- `complete`: Entire dialectic complete
- `error`: Error occurred

**Implementation:**
```typescript
// app/api/dialectics/[id]/stream/route.ts
import { createClient } from '@supabase/supabase-js';
import { generateDialectic } from '@/lib/dialectic-generator';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dialecticId = params.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch dialectic with fighters
  const { data: dialectic, error } = await supabase
    .from('dialectics')
    .select(`
      *,
      fighter1:fighters!fighter1_id(*),
      fighter2:fighters!fighter2_id(*)
    `)
    .eq('id', dialecticId)
    .single();

  if (error || !dialectic) {
    return new Response('Dialectic not found', { status: 404 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        // Update status to generating
        await supabase
          .from('dialectics')
          .update({ status: 'generating' })
          .eq('id', dialecticId);

        sendEvent('status', { status: 'generating' });

        // Generate dialectic
        await generateDialectic({
          dialectic,
          onRoundStart: (roundNumber) => {
            sendEvent('round-start', { roundNumber });
          },
          onFighter1Chunk: (chunk) => {
            sendEvent('fighter1-chunk', { chunk });
          },
          onFighter2Chunk: (chunk) => {
            sendEvent('fighter2-chunk', { chunk });
          },
          onRoundComplete: async (roundNumber, fighter1Response, fighter2Response) => {
            // Save round to database
            await supabase.from('rounds').insert({
              dialectic_id: dialecticId,
              round_number: roundNumber,
              fighter1_response: fighter1Response,
              fighter2_response: fighter2Response
            });
            
            sendEvent('round-complete', { roundNumber });
          },
          onSynthesisStart: () => {
            sendEvent('synthesis-start', {});
          },
          onSynthesisComplete: async (syntheses) => {
            // Save syntheses to database
            const synthesisRecords = syntheses.map(s => ({
              dialectic_id: dialecticId,
              ...s
            }));
            
            await supabase.from('syntheses').insert(synthesisRecords);
            
            sendEvent('synthesis-complete', { syntheses });
          }
        });

        // Update status to complete
        await supabase
          .from('dialectics')
          .update({ 
            status: 'complete',
            completed_at: new Date().toISOString()
          })
          .eq('id', dialecticId);

        sendEvent('complete', { status: 'complete' });
        controller.close();

      } catch (error) {
        console.error('Error generating dialectic:', error);
        
        await supabase
          .from('dialectics')
          .update({ status: 'failed' })
          .eq('id', dialecticId);

        sendEvent('error', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

#### GET /api/dialectics/archive

**Purpose:** Get paginated list of dialectics with filtering

**Query Params:**
- `page` (default: 1)
- `per_page` (default: 20, max: 100)
- `fighter1_id` (optional)
- `fighter2_id` (optional)
- `sort` (optional: 'recent', 'viewed', 'oldest')

**Response:**
```typescript
{
  dialectics: DialecticWithFighters[];
  total: number;
  page: number;
  per_page: number;
}
```

#### GET /api/graph/nodes

**Purpose:** Get all synthesis nodes for knowledge graph

**Response:**
```typescript
{
  nodes: Array<{
    id: string;
    title: string;
    dialectic_id: string;
    fighter1_name: string;
    fighter2_name: string;
    thesis: string;
    type: string;
    used_as_thesis_count: number;
    created_at: string;
  }>
}
```

#### GET /api/graph/edges

**Purpose:** Get all lineage connections for knowledge graph

**Response:**
```typescript
{
  edges: Array<{
    source: string; // parent_synthesis_id
    target: string; // child_dialectic_id
  }>
}
```

---

## 5. Gemini Integration

### 5.1 Gemini API Setup

**Installation:**
```bash
pnpm add @google/generative-ai
```

**Environment Variables:**
```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5.2 Gemini Client Configuration

```typescript
// lib/gemini-client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash for speed and cost-effectiveness
export const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.9, // High creativity for philosophical discourse
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

// Streaming model for real-time generation
export const streamingModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048, // Per response
  },
});
```

### 5.3 Dialectic Generation Logic

```typescript
// lib/dialectic-generator.ts
import { streamingModel, model } from './gemini-client';
import type { DialecticWithFighters } from '@/types/database.types';

interface GenerateDialecticOptions {
  dialectic: DialecticWithFighters;
  onRoundStart: (roundNumber: number) => void;
  onFighter1Chunk: (chunk: string) => void;
  onFighter2Chunk: (chunk: string) => void;
  onRoundComplete: (
    roundNumber: number,
    fighter1Response: string,
    fighter2Response: string
  ) => Promise<void>;
  onSynthesisStart: () => void;
  onSynthesisComplete: (syntheses: any[]) => Promise<void>;
}

export async function generateDialectic(options: GenerateDialecticOptions) {
  const {
    dialectic,
    onRoundStart,
    onFighter1Chunk,
    onFighter2Chunk,
    onRoundComplete,
    onSynthesisStart,
    onSynthesisComplete,
  } = options;

  const conversationHistory: Array<{ role: string; parts: string }> = [];

  // Generate each round
  for (let roundNum = 1; roundNum <= dialectic.round_count; roundNum++) {
    onRoundStart(roundNum);

    // Fighter 1 response
    const fighter1Response = await generateFighterResponse({
      fighter: dialectic.fighter1,
      thesis: dialectic.thesis,
      conversationHistory,
      isFirstRound: roundNum === 1,
      onChunk: onFighter1Chunk,
    });

    conversationHistory.push({
      role: 'model',
      parts: fighter1Response,
    });

    // Fighter 2 response
    const fighter2Response = await generateFighterResponse({
      fighter: dialectic.fighter2,
      thesis: dialectic.thesis,
      conversationHistory,
      isFirstRound: roundNum === 1,
      onChunk: onFighter2Chunk,
    });

    conversationHistory.push({
      role: 'model',
      parts: fighter2Response,
    });

    // Save round
    await onRoundComplete(roundNum, fighter1Response, fighter2Response);
  }

  // Generate syntheses
  onSynthesisStart();
  const syntheses = await generateSyntheses({
    thesis: dialectic.thesis,
    fighter1: dialectic.fighter1,
    fighter2: dialectic.fighter2,
    conversationHistory,
  });

  await onSynthesisComplete(syntheses);
}

interface GenerateFighterResponseOptions {
  fighter: any;
  thesis: string;
  conversationHistory: Array<{ role: string; parts: string }>;
  isFirstRound: boolean;
  onChunk: (chunk: string) => void;
}

async function generateFighterResponse(
  options: GenerateFighterResponseOptions
): Promise<string> {
  const { fighter, thesis, conversationHistory, isFirstRound, onChunk } = options;

  // Build prompt
  let prompt = fighter.system_prompt + '\n\n';
  
  if (isFirstRound) {
    prompt += `THESIS TO ADDRESS: "${thesis}"\n\n`;
    prompt += `This is Round 1. Present your opening position on this thesis. `;
    prompt += `Engage directly with the claim. Be rigorous, stay in character, `;
    prompt += `and make your philosophical position clear.\n\n`;
    prompt += `Respond in 2-4 paragraphs.`;
  } else {
    prompt += `THESIS: "${thesis}"\n\n`;
    prompt += `CONVERSATION SO FAR:\n`;
    
    // Add last 2 exchanges to keep context manageable
    const recentHistory = conversationHistory.slice(-4);
    recentHistory.forEach((msg, idx) => {
      const speakerLabel = idx % 2 === 0 ? 'OPPONENT' : 'YOU (previous)';
      prompt += `\n${speakerLabel}:\n${msg.parts}\n`;
    });
    
    prompt += `\nRespond to your opponent's latest argument. Stay in character, `;
    prompt += `address their points directly, and advance your position.\n\n`;
    prompt += `Respond in 2-4 paragraphs.`;
  }

  // Stream response
  const result = await streamingModel.generateContentStream(prompt);
  
  let fullResponse = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText;
    onChunk(chunkText);
  }

  return fullResponse;
}

interface GenerateSynthesesOptions {
  thesis: string;
  fighter1: any;
  fighter2: any;
  conversationHistory: Array<{ role: string; parts: string }>;
}

async function generateSyntheses(
  options: GenerateSynthesesOptions
): Promise<any[]> {
  const { thesis, fighter1, fighter2, conversationHistory } = options;

  const prompt = `You are a philosophical synthesis engine. You have just observed a dialectical exchange between ${fighter1.name} and ${fighter2.name} on the thesis: "${thesis}"

FULL TRANSCRIPT:
${conversationHistory.map((msg, idx) => {
  const speaker = idx % 2 === 0 ? fighter1.name : fighter2.name;
  return `${speaker}:\n${msg.parts}`;
}).join('\n\n')}

Generate 3-4 synthesis candidates that transcend this dialectical opposition. Each synthesis should use a different integrative logic:

1. RESOLUTION: Both positions are partial truths of a larger whole
2. SUBSUMPTION: One position subsumes the other at a different level
3. TRANSCENDENCE: The binary itself is problematic; propose new ground
4. PARADOX: The contradiction should be held in productive tension

For each synthesis, provide:
- title: A poetic, compelling title (max 60 chars)
- type: One of the four types above
- content: 2-3 paragraphs explaining the synthesis
- concept_tags: 3-5 key philosophical concepts (array)

Respond ONLY with valid JSON in this format:
{
  "syntheses": [
    {
      "title": "...",
      "type": "resolution",
      "content": "...",
      "concept_tags": ["...", "..."]
    },
    ...
  ]
}

CRITICAL: Your response must be ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Strip markdown code blocks if present
  let cleaned = response.trim();
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  try {
    const parsed = JSON.parse(cleaned);
    return parsed.syntheses || [];
  } catch (error) {
    console.error('Failed to parse synthesis JSON:', error);
    console.error('Response was:', cleaned);
    
    // Fallback: return basic synthesis
    return [{
      title: 'Synthesis Unavailable',
      type: 'resolution',
      content: 'The synthesis generation encountered an error. Please try again.',
      concept_tags: ['error', 'fallback']
    }];
  }
}
```

### 5.4 Cost Optimization

**Gemini 2.0 Flash Pricing:**
- Input: $0.10 per 1M tokens
- Output: $0.40 per 1M tokens

**Estimated Costs per Dialectic:**
- System prompts (2 fighters): ~8,000 tokens input
- Per round (both fighters): ~1,500 tokens output
- 5-round dialectic: ~8,000 tokens output
- Synthesis generation: ~10,000 tokens input, ~2,000 tokens output
- **Total per dialectic: ~$0.01 - $0.02**

**Optimization Strategies:**
1. Cache fighter system prompts (use context caching when available)
2. Limit conversation history in prompts (last 4 exchanges)
3. Use streaming to show progress without increasing cost
4. Set reasonable maxOutputTokens limits
5. Monitor usage with Gemini API dashboard

### 5.5 Error Handling & Retries

```typescript
// lib/gemini-utils.ts

export async function generateWithRetry<T>(
  generateFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateFn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);

      // Check if error is retryable
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        // Don't retry on invalid API key or quota exceeded
        if (
          message.includes('api key') ||
          message.includes('quota') ||
          message.includes('billing')
        ) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError || new Error('Generation failed after retries');
}

export function handleGeminiError(error: any): string {
  if (error.message?.includes('quota')) {
    return 'API quota exceeded. Please try again later.';
  }
  if (error.message?.includes('api key')) {
    return 'API key configuration error.';
  }
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  return 'An error occurred during generation.';
}
```

---

## 6. Frontend Implementation

### 6.1 Project Structure

```
dialectical-claims/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Homepage
│   ├── fighters/
│   │   ├── page.tsx              # Fighter selection
│   │   └── [slug]/
│   │       └── page.tsx          # Fighter detail page
│   ├── arena/
│   │   └── [id]/
│   │       └── page.tsx          # Watch dialectic
│   ├── archive/
│   │   └── page.tsx              # Browse archive
│   ├── graph/
│   │   └── page.tsx              # Knowledge graph
│   └── api/                      # API routes (see section 4)
│
├── components/
│   ├── fighters/
│   │   ├── FighterGrid.tsx       # Grid of fighter cards
│   │   ├── FighterCard.tsx       # Individual fighter card
│   │   └── FighterSelector.tsx   # Selection interface
│   ├── arena/
│   │   ├── ArenaView.tsx         # Main arena container
│   │   ├── RoundDisplay.tsx      # Round-by-round display
│   │   ├── StreamingText.tsx     # Token-by-token text
│   │   └── SynthesisCards.tsx    # Synthesis display
│   ├── archive/
│   │   ├── DialecticList.tsx     # List of dialectics
│   │   ├── DialecticCard.tsx     # Single dialectic preview
│   │   └── ArchiveFilters.tsx    # Filter controls
│   ├── graph/
│   │   └── KnowledgeGraph.tsx    # D3 visualization
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Select.tsx
│       └── ... (Radix UI components)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase
│   │   └── server.ts             # Server-side Supabase
│   ├── gemini-client.ts
│   ├── dialectic-generator.ts
│   ├── gemini-utils.ts
│   └── utils.ts
│
├── types/
│   └── database.types.ts
│
├── hooks/
│   ├── useDialecticStream.ts     # SSE hook
│   ├── useFighters.ts            # Fetch fighters
│   └── useArchive.ts             # Archive queries
│
├── styles/
│   └── globals.css
│
├── public/
│   ├── fighters/                 # Fighter portraits
│   └── ...
│
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 6.2 Key Components

#### Fighter Selector Component

```typescript
// components/fighters/FighterSelector.tsx
'use client';

import { useState } from 'react';
import { FighterCard } from './FighterCard';
import { Button } from '@/components/ui/Button';
import type { Fighter } from '@/types/database.types';

interface FighterSelectorProps {
  fighters: Fighter[];
  onComplete: (fighter1: Fighter, fighter2: Fighter) => void;
}

export function FighterSelector({ fighters, onComplete }: FighterSelectorProps) {
  const [fighter1, setFighter1] = useState<Fighter | null>(null);
  const [fighter2, setFighter2] = useState<Fighter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFighters = fighters.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFighterClick = (fighter: Fighter) => {
    if (!fighter1) {
      setFighter1(fighter);
    } else if (!fighter2 && fighter.id !== fighter1.id) {
      setFighter2(fighter);
    } else if (fighter1 && fighter.id === fighter1.id) {
      setFighter1(null);
      if (fighter2) {
        setFighter1(fighter2);
        setFighter2(null);
      }
    } else if (fighter2 && fighter.id === fighter2.id) {
      setFighter2(null);
    }
  };

  const canProceed = fighter1 && fighter2;

  return (
    <div className="space-y-8">
      {/* Selected Fighters Display */}
      <div className="flex items-center justify-center gap-8">
        <div className="w-48 h-64">
          {fighter1 ? (
            <FighterCard fighter={fighter1} selected onClick={() => setFighter1(null)} />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Select Fighter 1</span>
            </div>
          )}
        </div>

        <div className="text-4xl font-bold text-red-500">VS</div>

        <div className="w-48 h-64">
          {fighter2 ? (
            <FighterCard fighter={fighter2} selected onClick={() => setFighter2(null)} />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Select Fighter 2</span>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search fighters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
      />

      {/* Fighter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredFighters.map(fighter => (
          <FighterCard
            key={fighter.id}
            fighter={fighter}
            selected={fighter.id === fighter1?.id || fighter.id === fighter2?.id}
            disabled={
              (fighter1 && fighter2 && fighter.id !== fighter1.id && fighter.id !== fighter2.id)
            }
            onClick={() => handleFighterClick(fighter)}
          />
        ))}
      </div>

      {/* Proceed Button */}
      {canProceed && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => onComplete(fighter1!, fighter2!)}
          >
            Choose Thesis →
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### Streaming Arena Component

```typescript
// components/arena/ArenaView.tsx
'use client';

import { useEffect, useState } from 'react';
import { StreamingText } from './StreamingText';
import { SynthesisCards } from './SynthesisCards';
import type { DialecticWithFighters, Synthesis } from '@/types/database.types';

interface ArenaViewProps {
  dialectic: DialecticWithFighters;
}

export function ArenaView({ dialectic }: ArenaViewProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [fighter1Text, setFighter1Text] = useState('');
  const [fighter2Text, setFighter2Text] = useState('');
  const [syntheses, setSyntheses] = useState<Synthesis[]>([]);
  const [status, setStatus] = useState<'streaming' | 'complete' | 'error'>('streaming');

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/dialectics/${dialectic.id}/stream`
    );

    eventSource.addEventListener('round-start', (e) => {
      const data = JSON.parse(e.data);
      setCurrentRound(data.roundNumber);
      setFighter1Text('');
      setFighter2Text('');
    });

    eventSource.addEventListener('fighter1-chunk', (e) => {
      const data = JSON.parse(e.data);
      setFighter1Text(prev => prev + data.chunk);
    });

    eventSource.addEventListener('fighter2-chunk', (e) => {
      const data = JSON.parse(e.data);
      setFighter2Text(prev => prev + data.chunk);
    });

    eventSource.addEventListener('synthesis-complete', (e) => {
      const data = JSON.parse(e.data);
      setSyntheses(data.syntheses);
    });

    eventSource.addEventListener('complete', () => {
      setStatus('complete');
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      console.error('SSE error:', e);
      setStatus('error');
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [dialectic.id]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-8">
          <div className="text-right">
            <h2 className="text-2xl font-bold">{dialectic.fighter1.name}</h2>
            <p className="text-sm text-gray-400">{dialectic.fighter1.fighter_name}</p>
          </div>
          
          <div className="text-4xl font-bold text-red-500">⚔️</div>
          
          <div className="text-left">
            <h2 className="text-2xl font-bold">{dialectic.fighter2.name}</h2>
            <p className="text-sm text-gray-400">{dialectic.fighter2.fighter_name}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <p className="text-xl italic">"{dialectic.thesis}"</p>
        </div>

        <div className="text-sm text-gray-500">
          Round {currentRound} of {dialectic.round_count}
        </div>
      </div>

      {/* Arena */}
      <div className="space-y-6">
        {fighter1Text && (
          <div className="p-6 bg-blue-950 bg-opacity-30 rounded-lg border border-blue-800">
            <h3 className="font-bold mb-2 text-blue-400">
              {dialectic.fighter1.name}:
            </h3>
            <StreamingText text={fighter1Text} />
          </div>
        )}

        {fighter2Text && (
          <div className="p-6 bg-red-950 bg-opacity-30 rounded-lg border border-red-800">
            <h3 className="font-bold mb-2 text-red-400">
              {dialectic.fighter2.name}:
            </h3>
            <StreamingText text={fighter2Text} />
          </div>
        )}
      </div>

      {/* Syntheses */}
      {syntheses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center">Syntheses</h2>
          <SynthesisCards syntheses={syntheses} dialecticId={dialectic.id} />
        </div>
      )}

      {/* Status */}
      {status === 'complete' && (
        <div className="text-center text-green-500">
          ✓ Dialectic Complete
        </div>
      )}
    </div>
  );
}
```

#### SSE Hook

```typescript
// hooks/useDialecticStream.ts
import { useEffect, useState } from 'react';

export interface StreamEvent {
  type: 'round-start' | 'fighter1-chunk' | 'fighter2-chunk' | 'round-complete' | 
        'synthesis-start' | 'synthesis-complete' | 'complete' | 'error';
  data: any;
}

export function useDialecticStream(dialecticId: string) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/dialectics/${dialecticId}/stream`);

    const handleEvent = (type: StreamEvent['type']) => (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setEvents(prev => [...prev, { type, data }]);

      if (type === 'complete') {
        setIsComplete(true);
      }
      if (type === 'error') {
        setError(data.error);
      }
    };

    eventSource.addEventListener('round-start', handleEvent('round-start'));
    eventSource.addEventListener('fighter1-chunk', handleEvent('fighter1-chunk'));
    eventSource.addEventListener('fighter2-chunk', handleEvent('fighter2-chunk'));
    eventSource.addEventListener('round-complete', handleEvent('round-complete'));
    eventSource.addEventListener('synthesis-complete', handleEvent('synthesis-complete'));
    eventSource.addEventListener('complete', handleEvent('complete'));
    eventSource.addEventListener('error', handleEvent('error'));

    eventSource.onerror = () => {
      setError('Connection lost');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [dialecticId]);

  return { events, isComplete, error };
}
```

### 6.3 Page Implementations

#### Homepage

```typescript
// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-6xl font-bold">
          Dialectical<span className="text-red-500">.Claims</span>
        </h1>
        
        <p className="text-2xl text-gray-400">
          The Arena Where Ideas Collide
        </p>

        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Watch AI-embodied philosophers engage in dialectical combat.
          Curate the fighters. Define the thesis. Witness synthesis emerge.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/fighters">
            <Button size="lg">
              Create Dialectic
            </Button>
          </Link>
          
          <Link href="/archive">
            <Button size="lg" variant="outline">
              Browse Archive
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          <div>
            <h3 className="font-bold text-xl mb-2">70+ Fighters</h3>
            <p className="text-gray-400">
              From Socrates to Žižek, each with unique philosophical weapons
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Real-Time Combat</h3>
            <p className="text-gray-400">
              Watch ideas clash and evolve through structured rounds
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Emergent Synthesis</h3>
            <p className="text-gray-400">
              Multiple AI-generated syntheses transcending opposition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Fighter Selection Page

```typescript
// app/fighters/page.tsx
import { createClient } from '@/lib/supabase/server';
import { FighterSelector } from '@/components/fighters/FighterSelector';
import { redirect } from 'next/navigation';

export default async function FightersPage() {
  const supabase = createClient();
  
  const { data: fighters } = await supabase
    .from('fighters')
    .select('*')
    .order('name');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Select Your Fighters
      </h1>
      
      <FighterSelector 
        fighters={fighters || []}
        onComplete={(f1, f2) => {
          // This will be handled client-side with router.push
        }}
      />
    </div>
  );
}
```

---

## 7. Deployment & Infrastructure

### 7.1 Vercel Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Enable streaming for SSE
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 7.2 Environment Variables (Vercel)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
```

### 7.3 Supabase Configuration

**Project Setup:**
1. Create new Supabase project
2. Run SQL schema from Section 3.1
3. Set up Storage bucket for fighter portraits:
   - Bucket name: `fighters`
   - Public bucket: Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

**RLS Policies:**
- Already configured in schema (public read, service role write)

**API Settings:**
- Enable Realtime (optional, for future features)
- Set connection pooling mode: Transaction
- Max connections: 15 (for free tier)

### 7.4 Deployment Steps

**Initial Deployment:**

```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Link project
vercel link

# 3. Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY

# 4. Deploy
vercel --prod
```

**Continuous Deployment:**
- Connect GitHub repository to Vercel
- Automatic deployments on push to main branch
- Preview deployments for pull requests

### 7.5 Database Seeding

```typescript
// scripts/seed-fighters.ts
import { createClient } from '@supabase/supabase-js';
import { fightersData } from './fighters-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedFighters() {
  console.log('Seeding fighters...');
  
  const { data, error } = await supabase
    .from('fighters')
    .insert(fightersData);

  if (error) {
    console.error('Error seeding fighters:', error);
    return;
  }

  console.log(`✓ Seeded ${data?.length || 0} fighters`);
}

async function seedProvocationDeck() {
  console.log('Seeding provocation deck...');
  
  const theses = [
    {
      thesis: 'Reality is fundamentally relational, not substantial',
      domain: 'ontology',
      difficulty: 4,
      tags: ['ontology', 'metaphysics', 'relations']
    },
    // ... more theses
  ];

  const { data, error } = await supabase
    .from('provocation_deck')
    .insert(theses);

  if (error) {
    console.error('Error seeding provocation deck:', error);
    return;
  }

  console.log(`✓ Seeded ${data?.length || 0} theses`);
}

async function main() {
  await seedFighters();
  await seedProvocationDeck();
  console.log('✓ Database seeding complete');
}

main();
```

Run seeding:
```bash
tsx scripts/seed-fighters.ts
```

---

## 8. Performance Optimization

### 8.1 Next.js Optimizations

**Static Generation:**
```typescript
// app/fighters/[slug]/page.tsx
export async function generateStaticParams() {
  const supabase = createClient();
  const { data: fighters } = await supabase
    .from('fighters')
    .select('slug');

  return fighters?.map(f => ({ slug: f.slug })) || [];
}

export default async function FighterPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Page pre-rendered at build time
  const supabase = createClient();
  const { data: fighter } = await supabase
    .from('fighters')
    .select('*')
    .eq('slug', params.slug)
    .single();

  return <FighterDetail fighter={fighter} />;
}
```

**Image Optimization:**
```typescript
import Image from 'next/image';

// In FighterCard component
<Image
  src={fighter.portrait_url || '/placeholder-fighter.png'}
  alt={fighter.name}
  width={200}
  height={300}
  className="rounded-lg"
  priority={false} // Lazy load by default
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Generate blur placeholder
/>
```

**Route Caching:**
```typescript
// app/archive/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function ArchivePage() {
  // This page will be statically generated and revalidated
  const supabase = createClient();
  const { data: dialectics } = await supabase
    .from('dialectics')
    .select('*, fighter1:fighters!fighter1_id(*), fighter2:fighters!fighter2_id(*)')
    .order('created_at', { ascending: false })
    .limit(20);

  return <ArchiveView dialectics={dialectics} />;
}
```

### 8.2 Database Optimizations

**Connection Pooling:**
```typescript
// lib/supabase/server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use connection pooler for serverless functions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // Don't persist in serverless
    },
    global: {
      headers: { 'x-connection-mode': 'transaction' }, // Use transaction mode
    },
  });
};
```

**Query Optimization:**
```typescript
// Fetch with specific fields only
const { data } = await supabase
  .from('dialectics')
  .select(`
    id,
    thesis,
    created_at,
    fighter1:fighters!fighter1_id(id, name, fighter_name),
    fighter2:fighters!fighter2_id(id, name, fighter_name)
  `)
  .order('created_at', { ascending: false })
  .limit(20);

// Use .single() when expecting one result
const { data: fighter } = await supabase
  .from('fighters')
  .select('*')
  .eq('slug', slug)
  .single(); // Returns object instead of array
```

**Pagination:**
```typescript
// Efficient pagination with range
export async function getDialectics(page: number = 1, perPage: number = 20) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = createClient();
  
  const { data, error, count } = await supabase
    .from('dialectics')
    .select('*, fighter1(*), fighter2(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  return {
    dialectics: data || [],
    total: count || 0,
    page,
    perPage,
    hasMore: (count || 0) > to + 1,
  };
}
```

### 8.3 Caching Strategy

**API Route Caching:**
```typescript
// app/api/fighters/route.ts
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.from('fighters').select('*');

  return Response.json(
    { fighters: data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    }
  );
}
```

**Client-Side Caching with React Query:**
```typescript
// hooks/useFighters.ts
import { useQuery } from '@tanstack/react-query';

export function useFighters() {
  return useQuery({
    queryKey: ['fighters'],
    queryFn: async () => {
      const res = await fetch('/api/fighters');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

**Vercel Edge Caching:**
```typescript
// Leverage Vercel's edge network
export const runtime = 'edge'; // Deploy to edge for faster response

export async function GET(request: Request) {
  // Edge function runs close to user
  const { searchParams } = new URL(request.url);
  // ... handle request
}
```

### 8.4 Frontend Performance

**Code Splitting:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const KnowledgeGraph = dynamic(
  () => import('@/components/graph/KnowledgeGraph'),
  {
    loading: () => <div>Loading graph...</div>,
    ssr: false, // Don't render on server (D3 is client-only)
  }
);
```

**Bundle Size Optimization:**
```typescript
// Use tree-shaking friendly imports
import { Button } from '@/components/ui/Button'; // ✓ Good
import * as UI from '@/components/ui'; // ✗ Bad (imports everything)

// For D3, import only what you need
import { select, scaleLinear, axisBottom } from 'd3';
// Instead of: import * as d3 from 'd3';
```

**Optimize Streaming Text:**
```typescript
// components/arena/StreamingText.tsx
import { memo } from 'react';

export const StreamingText = memo(({ text }: { text: string }) => {
  // Memoize to prevent unnecessary re-renders
  return (
    <div className="whitespace-pre-wrap">
      {text}
      <span className="animate-pulse">|</span>
    </div>
  );
});
```

---

## 9. Security Considerations

### 9.1 API Key Protection

**Never Expose API Keys:**
```typescript
// ✓ Correct: Server-side only
// app/api/dialectics/[id]/stream/route.ts
import { streamingModel } from '@/lib/gemini-client';
// API key accessed from environment, never sent to client

// ✗ Wrong: Client-side
// Never import gemini-client in client components
```

**Environment Variable Validation:**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### 9.2 Rate Limiting

**Basic Rate Limiting with Vercel Edge:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis (optional, for production rate limiting)
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour per IP
  analytics: true,
});

// Use in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  // Process request
}
```

**Simple In-Memory Rate Limiting (Development):**
```typescript
// lib/simple-rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000) {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}
```

### 9.3 Input Validation

**Validate Dialectic Creation:**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const createDialecticSchema = z.object({
  fighter1_id: z.string().uuid(),
  fighter2_id: z.string().uuid(),
  thesis: z.string().min(10).max(1000),
  round_count: z.number().int().min(2).max(8),
  parent_synthesis_id: z.string().uuid().optional(),
}).refine(
  (data) => data.fighter1_id !== data.fighter2_id,
  { message: 'Fighters must be different' }
);

// Use in API route
export async function POST(request: Request) {
  const body = await request.json();
  
  const validation = createDialecticSchema.safeParse(body);
  if (!validation.success) {
    return Response.json(
      { error: validation.error.issues },
      { status: 400 }
    );
  }

  const validatedData = validation.data;
  // Proceed with validated data
}
```

**Sanitize User Input:**
```typescript
// lib/sanitize.ts
export function sanitizeThesis(input: string): string {
  // Remove potential XSS vectors
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}
```

### 9.4 Content Security Policy

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 9.5 Supabase Security

**Row Level Security:**
```sql
-- Already configured in schema
-- Public read access via policies
-- Write access only through service role key (backend)

-- Additional security: Prevent direct writes even with service key
CREATE POLICY "Restrict fighter updates" ON fighters FOR UPDATE
  USING (false); -- No updates allowed (fighters are static)

CREATE POLICY "Restrict fighter deletes" ON fighters FOR DELETE
  USING (false); -- No deletes allowed
```

**Service Role Key Usage:**
```typescript
// Only use service role key on server-side
// Never expose in client code

// Server-side (API routes, server components)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✓ Safe on server
);

// Client-side (client components)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✓ Use anon key for client
);
```

---

## 10. Development Workflow

### 10.1 Local Development Setup

**Prerequisites:**
- Node.js 18+
- pnpm
- Git

**Initial Setup:**
```bash
# Clone repository
git clone https://github.com/your-org/dialectical-claims.git
cd dialectical-claims

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations (if using migrations)
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development server
pnpm dev
```

**Environment Files:**
```bash
# .env.example (committed to repo)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key

# .env.local (not committed, developer specific)
# Copy from .env.example and fill in actual values
```

### 10.2 npm Scripts

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:types": "supabase gen types typescript --project-id your-project > types/database.types.ts",
    "db:seed": "tsx scripts/seed-database.ts",
    "db:reset": "tsx scripts/reset-database.ts",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### 10.3 Git Workflow

**Branch Strategy:**
```
main                 # Production branch (protected)
├── develop          # Development branch
    ├── feature/fighter-selection
    ├── feature/arena-streaming
    └── bugfix/synthesis-parsing
```

**Commit Convention:**
```bash
# Use conventional commits
git commit -m "feat: add fighter selection grid"
git commit -m "fix: handle SSE reconnection"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize dialectic generation"
git commit -m "perf: add database indexes"
```

**Pull Request Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Tested in staging

## Screenshots
(if applicable)
```

### 10.4 Testing Strategy

**Unit Tests (Vitest):**
```typescript
// __tests__/lib/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeThesis } from '@/lib/sanitize';

describe('sanitizeThesis', () => {
  it('removes script tags', () => {
    const input = 'Hello <script>alert("XSS")</script> world';
    const output = sanitizeThesis(input);
    expect(output).toBe('Hello  world');
  });

  it('trims whitespace', () => {
    const input = '  Test thesis  ';
    const output = sanitizeThesis(input);
    expect(output).toBe('Test thesis');
  });
});
```

**E2E Tests (Playwright):**
```typescript
// e2e/create-dialectic.spec.ts
import { test, expect } from '@playwright/test';

test('create dialectic flow', async ({ page }) => {
  // Navigate to fighter selection
  await page.goto('/fighters');

  // Select first fighter
  await page.click('[data-testid="fighter-card-nietzsche"]');
  
  // Select second fighter
  await page.click('[data-testid="fighter-card-haraway"]');

  // Proceed to thesis
  await page.click('button:has-text("Choose Thesis")');

  // Enter custom thesis
  await page.fill('[data-testid="thesis-input"]', 'Technology extends human capability');

  // Start duel
  await page.click('button:has-text("Start Duel")');

  // Wait for arena to load
  await expect(page.locator('[data-testid="arena"]')).toBeVisible();

  // Verify streaming starts
  await expect(page.locator('[data-testid="round-1"]')).toBeVisible({ timeout: 10000 });
});
```

### 10.5 Monitoring & Logging

**Vercel Analytics:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Error Tracking (Sentry - Optional):**
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of transactions
    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}
```

**Custom Logging:**
```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
}

export function log(level: LogLevel, message: string, context?: any) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to external service (e.g., Datadog, LogDNA)
    console.log(JSON.stringify(entry));
  } else {
    // Pretty print in development
    console[level](message, context || '');
  }
}

// Usage
log('info', 'Dialectic created', { dialecticId: 'abc-123' });
log('error', 'Failed to generate synthesis', { error: err.message });
```

---

## 11. Cost Analysis

### 11.1 Monthly Cost Breakdown (Estimated)

**Vercel:**
- Hobby plan: Free (1 concurrent build, 100GB bandwidth)
- Pro plan: $20/month (Recommended for production)
  - Unlimited concurrent builds
  - 1TB bandwidth
  - Advanced analytics
  - Team collaboration

**Supabase:**
- Free tier: $0 (Good for development/MVP)
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
- Pro plan: $25/month (Recommended for production)
  - 8GB database
  - 100GB file storage
  - 100,000 monthly active users
  - Daily backups

**Gemini API:**
- Pay-as-you-go
- Gemini 2.0 Flash: $0.10 per 1M input tokens, $0.40 per 1M output tokens
- Estimated cost per dialectic: $0.01-0.02
- Monthly estimates:
  - 100 dialectics/day: ~$30-60/month
  - 500 dialectics/day: ~$150-300/month
  - 1000 dialectics/day: ~$300-600/month

**Total Monthly Cost:**
- Development: ~$0 (free tiers)
- MVP/Launch: ~$50-100 (low traffic)
- Production (moderate): ~$200-400 (500 dialectics/day)
- Production (high): ~$500-1000 (1000+ dialectics/day)

### 11.2 Scaling Considerations

**Vertical Scaling:**
- Supabase: Upgrade to higher tier for more database capacity
- Vercel: Pro plan handles most traffic, Enterprise for very high scale

**Horizontal Scaling:**
- Vercel automatically scales serverless functions
- Supabase uses connection pooling for concurrent requests
- Consider Supabase read replicas for high-traffic read operations

**Cost Optimization:**
- Cache frequently accessed data (fighters, popular dialectics)
- Implement CDN for static assets
- Use ISR (Incremental Static Regeneration) for archive pages
- Rate limit API to prevent abuse
- Monitor Gemini API usage and optimize prompts

---

## 12. Deployment Checklist

### 12.1 Pre-Launch

**Code:**
- [ ] All features implemented and tested
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passing
- [ ] ESLint passing
- [ ] Production build succeeds: `pnpm build`

**Database:**
- [ ] Schema deployed to production Supabase
- [ ] RLS policies configured
- [ ] All 70+ fighters seeded
- [ ] Provocation deck seeded
- [ ] Database backups enabled

**Configuration:**
- [ ] Environment variables set in Vercel
- [ ] API keys rotated from development keys
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active
- [ ] Error tracking configured (Sentry)

**Security:**
- [ ] Content Security Policy configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] API keys never exposed client-side
- [ ] CORS properly configured

**Performance:**
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Caching strategy in place
- [ ] Lighthouse score > 90

**Content:**
- [ ] All fighter portraits uploaded
- [ ] Fighter bios and system prompts reviewed
- [ ] Provocation deck curated
- [ ] Homepage copy finalized

### 12.2 Post-Launch

**Monitoring:**
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Monitor API usage and costs
- [ ] Track key metrics (dialectics created, archive views)

**Documentation:**
- [ ] User guide published
- [ ] API documentation complete
- [ ] README updated
- [ ] Contributing guide added

**Optimization:**
- [ ] Monitor performance metrics
- [ ] Optimize slow queries
- [ ] Adjust caching based on usage
- [ ] Review and optimize Gemini prompts

---

## 13. Future Technical Enhancements

### 13.1 Phase 2 Features

**Real-time Collaboration:**
```typescript
// Use Supabase Realtime for synchronized viewing
const channel = supabase.channel(`dialectic-${dialecticId}`)
  .on('presence', { event: 'sync' }, () => {
    // Show who's watching
  })
  .subscribe();
```

**Advanced Caching:**
```typescript
// Implement Vercel KV for edge caching
import { kv } from '@vercel/kv';

export async function GET(request: Request) {
  const cacheKey = `fighters:all`;
  
  // Try cache first
  const cached = await kv.get(cacheKey);
  if (cached) return Response.json(cached);

  // Fetch from database
  const fighters = await fetchFighters();
  
  // Cache for 1 hour
  await kv.setex(cacheKey, 3600, fighters);
  
  return Response.json(fighters);
}
```

**Background Jobs:**
```typescript
// Use Vercel Cron for background tasks
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-old-dialectics",
      "schedule": "0 2 * * *" // 2am daily
    }
  ]
}

// app/api/cron/cleanup-old-dialectics/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Archive old dialectics
  const supabase = createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  await supabase
    .from('dialectics')
    .update({ archived: true })
    .lt('created_at', sixMonthsAgo.toISOString());

  return Response.json({ success: true });
}
```

### 13.2 Advanced Features

**WebSocket Streaming:**
```typescript
// For lower latency than SSE
import { Server } from 'socket.io';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('start-dialectic', async (data) => {
        // Stream dialectic generation
        for await (const chunk of generateDialectic(data)) {
          socket.emit('dialectic-chunk', chunk);
        }
      });
    });
  }
  res.end();
}
```

**GraphQL API:**
```typescript
// For more flexible querying
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

const typeDefs = `
  type Fighter {
    id: ID!
    name: String!
    fighterName: String!
    style: String!
  }

  type Query {
    fighters: [Fighter!]!
    fighter(id: ID!): Fighter
  }
`;

const resolvers = {
  Query: {
    fighters: () => fetchAllFighters(),
    fighter: (_parent, args) => fetchFighter(args.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
export default startServerAndCreateNextHandler(server);
```

---

## Appendix A: Complete Package.json

```json
{
  "name": "dialectical-claims",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:types": "supabase gen types typescript --project-id your-project > types/database.types.ts",
    "db:seed": "tsx scripts/seed-database.ts",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.56.2",
    "@vercel/analytics": "^1.3.1",
    "clsx": "^2.1.1",
    "d3": "^7.9.0",
    "framer-motion": "^11.5.4",
    "lucide-react": "^0.445.0",
    "next": "14.2.13",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.2",
    "zod": "^3.23.8",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.2",
    "@types/d3": "^7.4.3",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.8",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.13",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2",
    "vitest": "^2.1.1"
  }
}
```

---

## Appendix B: Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f5f5f5',
        primary: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        secondary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Conclusion

This technical specification provides a complete blueprint for implementing Dialectical.Claims using:

- **Vercel** for hosting and serverless functions
- **Supabase** for PostgreSQL database and storage
- **Gemini 2.0 Flash** for AI-powered dialectics

The architecture is optimized for:
- **Performance**: Edge caching, SSR/SSG, streaming responses
- **Scalability**: Serverless functions, connection pooling, CDN
- **Cost-effectiveness**: Free tiers for development, ~$200-400/month for production
- **Security**: API key protection, rate limiting, input validation, RLS
- **Developer Experience**: TypeScript, modern tooling, clear structure

**Key Technical Decisions:**

1. **Next.js 14 App Router**: Modern React framework with built-in optimization
2. **Supabase PostgreSQL**: Managed database with excellent DX and built-in APIs
3. **Gemini 2.0 Flash**: Fast, cost-effective LLM with streaming support
4. **Server-Sent Events**: Simple real-time streaming without WebSocket complexity
5. **Vercel Edge**: Deploy close to users for minimal latency

**Implementation Priority:**

**Phase 1 (MVP - 6-8 weeks):**
- Database schema and seeding
- Fighter selection UI
- Basic arena with SSE streaming
- Synthesis generation
- Simple archive

**Phase 2 (Enhancement - 4-6 weeks):**
- Knowledge graph visualization
- Advanced filtering and search
- Performance optimization
- Error handling improvements

**Phase 3 (Polish - 2-4 weeks):**
- UI/UX refinement
- Mobile optimization
- Documentation
- Testing coverage

**Development Team Requirements:**
- 1 Full-stack developer (Next.js + TypeScript)
- 1 Backend developer (API design + database)
- 1 Frontend developer (React + UI/UX)
- 1 AI/prompt engineer (Gemini integration)
- 1 Designer (UI/UX, fighter portraits)

**Total Estimated Development Time:** 12-18 weeks

---

## Appendix C: Example API Responses

### GET /api/fighters

```json
{
  "fighters": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Friedrich Nietzsche",
      "fighter_name": "The Zarathustra",
      "slug": "nietzsche",
      "era": "Late 19th Century",
      "tradition": ["Western", "Continental"],
      "style": "Poetic/Provocative",
      "special_move": "Aphorism Barrage",
      "attributes": ["Genealogical", "Aesthetic", "Radical"],
      "portrait_url": "https://yourproject.supabase.co/storage/v1/object/public/fighters/nietzsche.jpg",
      "short_bio": "Genealogist of morals attacking herd mentality...",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
    // ... more fighters
  ]
}
```

### POST /api/dialectics

**Request:**
```json
{
  "fighter1_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fighter2_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "thesis": "Technology extends human capability",
  "round_count": 5
}
```

**Response:**
```json
{
  "dialectic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "status": "pending"
}
```

### GET /api/dialectics/[id]/stream (SSE)

**Event Stream:**
```
event: status
data: {"status":"generating"}

event: round-start
data: {"roundNumber":1}

event: fighter1-chunk
data: {"chunk":"Technology"}

event: fighter1-chunk
data: {"chunk":" does"}

event: fighter1-chunk
data: {"chunk":" not"}

event: fighter1-chunk
data: {"chunk":" 'extend'"}

...

event: round-complete
data: {"roundNumber":1}

event: synthesis-complete
data: {"syntheses":[{"title":"Technology as Co-Constitution","type":"resolution","content":"...","concept_tags":["co-evolution","cyborg"]}]}

event: complete
data: {"status":"complete"}
```

### GET /api/dialectics/archive

**Response:**
```json
{
  "dialectics": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "thesis": "Technology extends human capability",
      "round_count": 5,
      "status": "complete",
      "view_count": 42,
      "created_at": "2025-01-20T14:30:00Z",
      "fighter1": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Friedrich Nietzsche",
        "fighter_name": "The Zarathustra"
      },
      "fighter2": {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": "Donna Haraway",
        "fighter_name": "Cyborg Siren"
      }
    }
  ],
  "total": 156,
  "page": 1,
  "per_page": 20
}
```

### GET /api/graph/nodes

**Response:**
```json
{
  "nodes": [
    {
      "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
      "title": "Technology as Co-Constitution",
      "dialectic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "fighter1_name": "Nietzsche",
      "fighter2_name": "Haraway",
      "thesis": "Technology extends human capability",
      "type": "resolution",
      "used_as_thesis_count": 3,
      "created_at": "2025-01-20T15:00:00Z"
    }
  ]
}
```

### GET /api/graph/edges

**Response:**
```json
{
  "edges": [
    {
      "source": "d4e5f6a7-b8c9-0123-def1-234567890123",
      "target": "e5f6a7b8-c9d0-1234-ef12-345678901234"
    }
  ]
}
```

---

## Appendix D: Sample Supabase Queries

### Fetch Dialectic with Full Details

```typescript
const { data: dialectic } = await supabase
  .from('dialectics')
  .select(`
    *,
    fighter1:fighters!fighter1_id(*),
    fighter2:fighters!fighter2_id(*),
    rounds(*),
    syntheses(*),
    parent_synthesis:syntheses!parent_synthesis_id(*)
  `)
  .eq('id', dialecticId)
  .single();
```

### Search Dialectics by Thesis

```typescript
const { data: dialectics } = await supabase
  .from('dialectics')
  .select('*, fighter1(*), fighter2(*)')
  .textSearch('thesis', searchTerm, {
    type: 'websearch',
    config: 'english'
  })
  .limit(20);
```

### Get Fighter with Recent Dialectics

```typescript
const { data: fighter } = await supabase
  .from('fighters')
  .select(`
    *,
    dialectics_as_fighter1:dialectics!fighter1_id(
      id,
      thesis,
      created_at,
      fighter2:fighters!fighter2_id(name, fighter_name)
    ),
    dialectics_as_fighter2:dialectics!fighter2_id(
      id,
      thesis,
      created_at,
      fighter1:fighters!fighter1_id(name, fighter_name)
    )
  `)
  .eq('slug', slug)
  .single();
```

### Get Knowledge Graph Data

```typescript
// Get all syntheses with dialectic info
const { data: nodes } = await supabase
  .from('syntheses')
  .select(`
    id,
    title,
    type,
    used_as_thesis_count,
    created_at,
    dialectic:dialectics!dialectic_id(
      id,
      thesis,
      fighter1:fighters!fighter1_id(name),
      fighter2:fighters!fighter2_id(name)
    )
  `)
  .order('created_at', { ascending: false });

// Get all lineage connections
const { data: edges } = await supabase
  .from('dialectic_lineage')
  .select('parent_synthesis_id, child_dialectic_id');
```

### Get Top Syntheses by Usage

```typescript
const { data: topSyntheses } = await supabase
  .from('syntheses')
  .select(`
    *,
    dialectic:dialectics!dialectic_id(
      thesis,
      fighter1:fighters!fighter1_id(name),
      fighter2:fighters!fighter2_id(name)
    )
  `)
  .order('used_as_thesis_count', { ascending: false })
  .limit(10);
```

---

## Appendix E: Error Handling Patterns

### API Route Error Handling

```typescript
// lib/api-handler.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function apiHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);

    // Zod validation error
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Supabase error
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { error: 'Database error', code: error.code },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Usage
export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = await request.json();
    // ... handle request
    return { success: true };
  });
}
```

### Client-Side Error Handling

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### SSE Error Recovery

```typescript
// hooks/useDialecticStream.ts (enhanced)
export function useDialecticStream(dialecticId: string) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/dialectics/${dialecticId}/stream`);

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        reconnectAttemptsRef.current = 0; // Reset on successful connection
      };

      eventSource.onerror = (e) => {
        console.error('SSE error:', e);
        eventSource?.close();

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
          setTimeout(() => connect(), 2000 * reconnectAttemptsRef.current);
        } else {
          setError('Connection lost. Please refresh the page.');
        }
      };

      // ... event listeners
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, [dialecticId]);

  return { events, isComplete, error };
}
```

---

## Appendix F: Performance Monitoring

### Custom Performance Metrics

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static mark(name: string) {
    this.marks.set(name, performance.now());
  }

  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`No mark found for ${startMark}`);
      return 0;
    }

    const duration = performance.now() - start;
    
    // Log to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }

    return duration;
  }
}

// Usage in components
useEffect(() => {
  PerformanceMonitor.mark('dialectic-start');
  
  return () => {
    const duration = PerformanceMonitor.measure(
      'dialectic-generation',
      'dialectic-start'
    );
    console.log(`Dialectic completed in ${duration}ms`);
  };
}, []);
```

### Database Query Performance

```typescript
// lib/supabase/with-timing.ts
export async function queryWithTiming<T>(
  name: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      console.warn(`Slow query: ${name} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Failed query: ${name} (${duration}ms)`, error);
    throw error;
  }
}

// Usage
const dialectics = await queryWithTiming(
  'fetch-archive-dialectics',
  async () => {
    return supabase
      .from('dialectics')
      .select('*, fighter1(*), fighter2(*)')
      .limit(20);
  }
);
```

---

## Appendix G: Deployment Automation

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Type check
        run: pnpm type-check
        
      - name: Lint
        run: pnpm lint
        
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Final Notes

This technical specification provides everything needed to build Dialectical.Claims from scratch using modern web technologies optimized for performance, scalability, and developer experience.

**Key Takeaways:**

1. **Architecture**: Serverless-first with Next.js + Vercel for automatic scaling
2. **Database**: Supabase PostgreSQL with RLS for security and built-in APIs
3. **AI**: Gemini 2.0 Flash for cost-effective, fast LLM inference with streaming
4. **Real-time**: Server-Sent Events for simple, reliable streaming without WebSocket complexity
5. **Performance**: Edge caching, ISR, image optimization, and query optimization
6. **Security**: API key protection, rate limiting, input validation, CSP headers
7. **Cost**: ~$50-100/month for MVP, ~$200-400/month for production with moderate traffic

**Next Steps:**

1. Set up development environment
2. Create Supabase project and deploy schema
3. Seed database with fighters and theses
4. Implement core features (fighter selection → arena → synthesis)
5. Deploy to Vercel staging environment
6. Test thoroughly
7. Launch to production

**Support & Resources:**

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Gemini API Docs: https://ai.google.dev/docs
- Vercel Docs: https://vercel.com/docs

The platform is ready to be built. Time to make philosophy spectacular. 🎭⚔️🧠# Dialectical.Claims Technical Specification
## Vercel + Supabase + Gemini API