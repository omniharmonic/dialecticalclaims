# Dialectical.Claims

**The Arena of Synthetic Thought**

AI-mediated philosophical discourse where ideas collide, evolve, and transcend through structured dialectical combat.

## Overview

Dialectical.Claims is a platform that enables AI-embodied philosophical fighters to engage in dialectical duels. Users select two philosophers, define a thesis, and witness the emergence of novel syntheses through real-time AI-generated philosophical discourse.

## Features

- 🎭 **Fighter Selection**: Choose from 70+ philosophical thinkers across history
- ⚔️ **Dialectical Combat**: Watch AI-embodied philosophers engage in structured debate
- 🔄 **Synthesis Generation**: AI generates multiple synthesis candidates that transcend opposition
- 📚 **Archive Browser**: Explore past dialectics and their syntheses
- 🌐 **Knowledge Graph**: Visualize how ideas connect and evolve (coming soon)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Google AI Studio API key (get one at https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dialectical-claims.git
cd dialectical-claims
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API Configuration  
GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up Supabase database**

- Create a new Supabase project at https://supabase.com
- Run the SQL schema from `.claude/technical_specification.md` (section 3.1) in your Supabase SQL editor to create:
  - Tables: fighters, dialectics, rounds, syntheses, provocation_deck, dialectic_lineage
  - Functions: increment_view_count, increment_synthesis_usage
  - Row Level Security policies

5. **Seed the database**
```bash
pnpm db:seed
```

This will populate your database with sample fighters and provocations.

6. **Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
dialectical-claims/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── fighters/          # Fighter selection page
│   ├── thesis/            # Thesis selection page
│   ├── arena/[id]/        # Dialectic viewing page
│   └── archive/           # Archive browser
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── fighters/         # Fighter-related components
│   ├── thesis/           # Thesis selection components
│   └── arena/            # Arena display components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase clients
│   ├── gemini-client.ts  # Gemini AI configuration
│   └── dialectic-generator.ts  # Core dialectic logic
├── types/                 # TypeScript types
└── scripts/              # Utility scripts
```

## Usage

### Creating a Dialectic

1. Navigate to the fighters page
2. Select two philosophers (e.g., Nietzsche and Haraway)
3. Choose or create a thesis
4. Set the number of rounds (2-8)
5. Watch the dialectic unfold in real-time
6. Explore the generated syntheses

### Viewing Past Dialectics

1. Visit the Archive page
2. Browse completed dialectics
3. Click to replay any dialectic
4. Use syntheses as new theses for recursive exploration

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler check
- `pnpm db:seed` - Seed database with sample data

### Key Technologies

- **Streaming**: Server-Sent Events (SSE) for real-time dialectic generation
- **Database**: PostgreSQL with row-level security
- **AI Generation**: Gemini 2.0 Flash with streaming support
- **State Management**: React hooks + session storage

### Cost Considerations

- Gemini 2.0 Flash pricing: ~$0.01-0.02 per dialectic
- Supabase free tier: Suitable for development and small-scale production
- Vercel free tier: Suitable for MVP deployment

## Troubleshooting

### Common Issues

1. **"Missing environment variables" error**
   - Ensure `.env.local` exists with all required variables
   - Restart the dev server after adding env vars

2. **Database connection errors**
   - Verify Supabase URL and keys are correct
   - Check that database schema has been created

3. **Gemini API errors**
   - Ensure your API key is valid
   - Check quota limits in Google AI Studio

4. **TypeScript errors**
   - Run `pnpm type-check` to see all type errors
   - Ensure database types match your Supabase schema

## Roadmap

- [ ] Add more fighters (target: 70+)
- [ ] Knowledge graph visualization
- [ ] Multi-fighter dialectics (3+ participants)
- [ ] Export dialectics as PDF/Markdown
- [ ] Community features (collections, comments)
- [ ] Mobile app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Write TypeScript types for new components
3. Test thoroughly before submitting PR
4. Update documentation for new features

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Hegelian dialectics and the history of philosophical thought
- Built with cutting-edge AI technology from Google Gemini
- Powered by the open-source community

---

**Made with ⚔️ by the Dialectical.Claims team**
