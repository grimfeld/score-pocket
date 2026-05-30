# Score Pocket

A companion app for card and board games that allows users to keep scores for any number of players while displaying them easily by putting the phone in the middle of a table.

## Features

- 👤 Reusable, uniquely-named players stored in the backend
- 🎮 Game sessions with assigned players and live score tracking
- 🏆 Mark one or more winners when a game ends
- 📊 Global leaderboard with games played, wins, and win rate (sortable)
- 📱 Landscape-optimized layout for table viewing
- ➕➖ Per-session increment step and starting score
- 🎨 Beautiful, modern UI with dark mode support
- 📊 Shows total score and current diff from last score

## Tech Stack

- **React 18** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for server-state management
- **Zustand** for live in-game score state
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Pocketbase** for the backend (SQLite + REST API)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- The [Pocketbase](https://pocketbase.io/docs/) binary (single self-contained executable)

### 1. Run the backend (Pocketbase)

The app talks to a Pocketbase instance. There is **no login** — all collections
are world-readable/writable, so only expose the instance to trusted networks.

1. Download the Pocketbase executable for your OS from
   <https://pocketbase.io/docs/> (or its GitHub releases) and place it in the
   project root (it is gitignored).
2. Start it, pointing at the bundled migrations so the schema is created
   automatically on first run:

   ```bash
   ./pocketbase serve --migrationsDir ./pb_migrations
   ```

   - API: `http://127.0.0.1:8090`
   - Admin UI: `http://127.0.0.1:8090/_/`

   The `pb_migrations/` directory creates the `players` and `sessions`
   collections on startup. (Targets Pocketbase v0.23+; tested format against
   v0.28.)

### 2. Run the frontend

1. Install dependencies:
```bash
npm install
```

2. Point the app at your Pocketbase URL (optional — defaults to
   `http://127.0.0.1:8090`):
```bash
cp .env.example .env
# edit VITE_POCKETBASE_URL if needed
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Players** (👥): add the people who play. Names are unique and reused across games.
2. **New Game** (➕): name the game (optional), pick at least 2 players, set the
   increment step and starting score, then start.
3. **Play**: place the device in the middle of the table (landscape is best) and use
   the +/- buttons to update each player's score. The diff shows the recent change.
4. **Finish**: tap *Finish*, pick one or more winners (the current top scorer is
   pre-selected — change it for low-score-wins games or ties), and confirm.
5. **Leaderboard** (🏆): see games played, wins, and win rate per player. Tap a column
   to sort.

## Project Structure

```
score-pocket/
├── pb_migrations/        # Pocketbase schema migrations (players, sessions)
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── PlayerCard.tsx
│   ├── hooks/
│   │   ├── usePlayers.ts      # players CRUD (TanStack Query)
│   │   ├── useSessions.ts     # sessions CRUD + active session
│   │   ├── usePlayerStats.ts  # leaderboard aggregation
│   │   └── usePressAndHold.ts
│   ├── lib/
│   │   ├── pocketbase.ts # Pocketbase client + record types
│   │   └── utils.ts      # Utility functions
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx           # Home (active + recent games)
│   │   ├── players.tsx         # Manage players
│   │   ├── leaderboard.tsx     # Global stats
│   │   └── sessions/
│   │       ├── new.tsx         # Create a game
│   │       └── $sessionId.tsx  # Play / view a game
│   ├── stores/
│   │   └── gameStore.ts  # Live in-game scores (synced to Pocketbase)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
└── package.json
```

## License

MIT
