# CodeReview Mentor

AI-powered code review application with a **Security Specialist** persona. Submit code snippets and receive real-time streaming security-focused feedback.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **API:** tRPC v10
- **Database:** Prisma + SQLite
- **Validation:** Zod
- **AI:** Vercel AI SDK (streaming) + OpenAI GPT-4o-mini
- **UI:** Tailwind CSS + shadcn/ui components
- **Code Editor:** react-simple-code-editor + PrismJS

## Setup Instructions

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd codereview-mentor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

## Key Technical Decisions

### Architecture

- **tRPC for type-safe APIs:** Used tRPC v10 with `fetchRequestHandler` for the App Router. Provides end-to-end type safety between client and server without code generation.
- **Separate streaming route:** The AI review uses a dedicated Next.js Route Handler (`/api/ai/review`) with Vercel AI SDK's `streamText` for real-time streaming, while tRPC handles CRUD operations for submissions.
- **SQLite for simplicity:** SQLite via Prisma provides zero-config database setup, ideal for prototyping and local development. Easily swappable to PostgreSQL for production.

### AI Implementation

- **Security Specialist persona:** Single focused reviewer that analyzes code for security vulnerabilities, with a structured prompt enforcing consistent output format.
- **Streaming UX:** Real-time character-by-character feedback display using `useCompletion` from `ai/react`, with skeleton loading states and a pulsing cursor indicator during generation.
- **Auto-save on completion:** Submissions are automatically persisted to the database via `onFinish` callback when streaming completes.

### UI/UX

- **Responsive layout:** Desktop shows sidebar + main area; mobile stacks vertically with history below the form.
- **Syntax highlighting:** PrismJS-powered code editor with support for JavaScript, TypeScript, and Python.
- **shadcn/ui components:** Button, Textarea, Card, Skeleton, and Select — manually included for zero-dependency setup without the CLI.

### Bonus Feature: Feedback Reactions

- Thumbs up/down rating on saved submissions
- Persisted to database via `rating` field
- Visual indicators in submission history list

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/review/route.ts    # AI streaming endpoint
│   │   └── trpc/[trpc]/route.ts  # tRPC HTTP handler
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Main page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── code-form.tsx              # Code input with syntax highlighting
│   ├── feedback-display.tsx       # Streaming AI feedback display
│   ├── providers.tsx              # tRPC + React Query providers
│   └── submission-history.tsx     # History sidebar with detail view
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   └── utils.ts                   # Utility functions (cn)
├── server/
│   ├── routers/
│   │   ├── _app.ts                # Root tRPC router
│   │   └── submissions.ts        # Submissions CRUD + rating
│   └── trpc.ts                    # tRPC initialization
└── trpc/
    └── client.ts                  # tRPC React client
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Known Limitations

- **No authentication:** All submissions are public and shared across users.
- **SQLite limitations:** Not suitable for concurrent production workloads; switch to PostgreSQL for deployment.
- **Single AI persona:** Only the Security Specialist reviewer is implemented.
- **API key required:** Requires a valid OpenAI API key to function.
- **No rate limiting:** No protection against excessive API calls.
- **Code length limit:** Input restricted to 30-500 characters per the validation requirements.

## Deployment (Vercel)

1. Push to GitHub/GitLab
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` — use a hosted database (e.g., Turso, PlanetScale)
   - `OPENAI_API_KEY` — your OpenAI API key
4. Deploy

> **Note:** For production, replace SQLite with a hosted database provider compatible with serverless environments.
