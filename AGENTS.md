# AGENTS.md

## Project Overview

**Qui est l'imposteur** is a multiplayer community game for Dofus players. Players join lobbies and are assigned roles - aventurier (adventurer) or imposteur (impostor). The impostor must sabotage the dungeon while adventurers try to identify and stop them.

### Key Features
- Real-time multiplayer lobbies with polling
- Role-based gameplay with configurable impostor counts
- Beautiful dark-themed UI with WebGL shader background
- Host privileges and player management
- Results screen showing roles

### Tech Stack
- **Frontend**: React 19 + TanStack Router
- **Backend**: Nitro + TanStack Start
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4 + custom utilities
- **UI**: Radix UI components
- **State**: Zustand for client state
- **Build**: Vite 7
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Docker, GitHub Actions, Dokploy

### Architecture
- Single package application (not monorepo)
- File-based routing with TanStack Router
- Server functions using TanStack React Start
- Database-driven with Drizzle ORM
- Full TypeScript with strict mode

## Setup Commands

```bash
# Prerequisites: Node 22+, pnpm 10+, PostgreSQL 16+
pnpm install
cp .env.example .env   # then set DATABASE_URL
pnpm db:push
```

Or use Docker Compose to run everything (PostgreSQL + app):
```bash
docker compose up
```

### Environment Variables

See `.env.example`:

| Variable                 | Required | Description                                   |
| ------------------------ | -------- | --------------------------------------------- |
| `DATABASE_URL`           | Yes      | PostgreSQL connection string                   |
| `VITE_SITE_URL`          | No       | Public site URL for SEO (no trailing slash)    |
| `DISABLE_LOBBY_CLEANUP`  | No       | Set to `1` to disable periodic lobby purge     |
| `KICK_COOLDOWN_SECONDS`  | No       | Kick cooldown in seconds (default: 10)         |
| `SESSION_SECRET`         | CI only  | Session secret for E2E tests                   |

## Development Workflow

Start development server:
```bash
pnpm dev
```
Runs at http://localhost:3000 with hot reload.

Build for production:
```bash
pnpm build
pnpm start
```

Database commands:
```bash
pnpm db:push              # Apply schema
pnpm db:generate          # Generate migration
pnpm db:migrate           # Run migrations
pnpm db:migrate:run       # Helper for Docker
pnpm db:studio            # Interactive explorer
```

## Project Structure

- `/app/routes/` - File-based routing
- `/app/components/` - React components
- `/app/server/` - Server-only code (DB, functions)
- `/app/lib/` - Utilities, validators, game logic
- `/app/stores/` - Zustand state management
- `/app/styles/` - Tailwind CSS + custom utilities
- `/app/shaders/` - WebGL shaders
- `/e2e/` - Playwright E2E tests
- `/drizzle/` - Generated migrations

## Code Style Guidelines

No ESLint or Prettier is configured. Follow existing conventions.

### TypeScript
- Strict mode enabled
- Target: ES2022
- Path alias: `@/*` maps to `./app/*`

### Naming
- Components: PascalCase (CreateLobbyDialog.tsx)
- Functions/variables: camelCase (useLobbyPolling)
- Constants: UPPER_SNAKE_CASE (MAX_IMPOSTOR_COUNT)
- Database: plural lowercase (lobbies, players)
- Database values: lowercase with underscores (roles_assigned)

### Imports
Always use path alias for app imports:
```typescript
import { Component } from "@/components/component-name";
import { useLobbyStore } from "@/stores/lobby-store";
```
Never import server code in client components.

### Styling
- Tailwind CSS 4 for utilities
- Dark theme only (html.dark class)
- CSS variables for design tokens (oklch colors)
- GSAP for complex animations

### State Management
- Zustand: useLobbyStore for client state
- Database: source of truth for persistent data
- Session Storage: Player ID per tab
- Flash messages: transient via consumeLobbyFlashMessage()

### Database
- UUID primary keys
- Soft deletes via kickedAt timestamp
- Transactions for multi-step operations
- PostgreSQL enums for status and roles

## Testing

### Unit tests (Vitest)

- Config: `vitest.config.ts`
- Test files: `app/**/*.test.ts` (colocated with source or in `app/lib/__tests__/`)
- Run all: `pnpm test`
- Watch mode: `pnpm test:watch`
- Run a specific test: `pnpm vitest run -t "<test name>"`

### E2E tests (Playwright)

- Config: `playwright.config.ts`
- Test files: `e2e/*.spec.ts`
- Run all: `pnpm test:e2e`
- Interactive: `pnpm test:e2e:ui`
- Browser: Chromium only, workers: 1 (sequential)
- Auto-starts dev server on port 3000
- Retries: 2 on CI, 0 locally

### Before submitting

Always run all checks:
```bash
pnpm typecheck && pnpm test
```
CI also runs: build, Playwright E2E, Trivy security scan, Semgrep SAST analysis.

## Build and Deployment

Build:
```bash
pnpm build
```
Output: .output/ directory
Entry: .output/server/index.mjs

Docker (multi-stage, Node 22 Alpine):
```bash
docker build -t impostor:latest .
docker compose up
```
Runtime runs migrations then starts server: `node scripts/run-migrations.mjs && node .output/server/index.mjs`

CI/CD (GitHub Actions):
- `e2e.yml`: E2E tests with PostgreSQL service on push/PR to main
- `publish.yml`: Full pipeline (typecheck + test + build + Trivy + Semgrep + Docker push to GHCR + Dokploy deploy)
- Docker image tags: `latest` on main, `dev` on dev branch, short SHA for all pushes

## Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Run production build
pnpm typecheck    # Type check only
pnpm test         # Unit tests
pnpm test:watch   # Watch mode
pnpm test:e2e     # E2E tests
pnpm db:push      # Push schema to DB
pnpm db:generate  # Generate migration
pnpm db:migrate   # Run migrations
pnpm db:studio    # Drizzle Studio
```

## Key Patterns

### Server Functions
TanStack React Start createServerFn for type-safe RPC:
```typescript
export const createLobby = createServerFn({ method: "POST" })
  .inputValidator(createLobbySchema)
  .handler(async ({ data }) => {
    // Server-only code
  });
```

### Client Polling
Real-time updates via SSE at /api/lobby/:code/events

### Validation
All inputs validated with Zod schemas

### Game Rules
- MAX_IMPOSTOR_COUNT = 3
- minPlayersForLobby(count) = count × 2 + 1
- Located in app/lib/lobby-lifecycle.ts

## Common Workflows

Adding an API endpoint:
1. Create /app/routes/api.<name>.ts
2. Use createServerFn() or return response
3. Add Zod validation
4. Test with E2E

Modifying database schema:
1. Edit /app/server/db/schema.ts
2. Run pnpm db:generate
3. Review /drizzle/ migration
4. Run pnpm db:migrate
5. Update server functions
6. Add tests

Adding client state:
1. Add to LobbyState in /app/stores/lobby-store.ts
2. Add setter function
3. Use useLobbyStore() in components

Creating a component:
1. Create in /app/components/ (PascalCase)
2. Use Radix UI from ./ui/
3. Apply Tailwind classes
4. Add tests
5. Import in routes

## Troubleshooting

Database connection:
```bash
psql postgresql://postgres:postgres@localhost:5432/impostor
docker ps
cat .env
```

Port already in use:
```bash
PORT=3001 pnpm dev
```

Build fails:
```bash
rm -rf .output dist
pnpm typecheck
pnpm build
```

E2E tests fail:
```bash
pnpm dev
pnpm exec playwright install
pnpm db:push
```

## Requirements

- Node.js 22+
- PostgreSQL 16+
- pnpm 10+

## Key Considerations

### Security
- All inputs validated with Zod
- Role-based access control (host-only)
- Token-based player ID
- No sensitive data in URLs

### Performance
- Background job cleans old lobbies
- Soft deletes for kicked players
- Lazy-loaded components
- Database indexes

### Accessibility
- Radix UI primitives
- ARIA labels
- Full keyboard navigation

## Key Files

- Server functions: app/server/functions/lobby.ts
- Database schema: app/server/db/schema.ts
- Validators: app/lib/validators.ts
- Game rules: app/lib/lobby-lifecycle.ts
- Client state: app/stores/lobby-store.ts
- Styling: app/styles/app.css
- CI/CD: .github/workflows/
