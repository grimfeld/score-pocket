# Score Pocket

A companion app for card and board games that allows users to keep scores for any number of players while displaying them easily by putting the phone in the middle of a table.

## Features

- 🎮 Multi-player score tracking (unlimited players)
- 📱 Landscape-optimized layout for table viewing
- ✏️ Editable player names
- ➕➖ Customizable increment/decrement step
- 💾 Session persistence with IndexedDB (survives page refresh)
- 🎨 Beautiful, modern UI with dark mode support
- 📊 Shows total score and current diff from last score

## Tech Stack

- **React 18** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for data management
- **Zustand** for state management
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **IndexedDB** for local storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Open the app on your phone/tablet
2. Rotate to landscape orientation for best viewing
3. Place the device in the middle of the table
4. Use the settings button (⚙️) to configure:
   - Number of players (minimum 2)
   - Player names
   - Increment step value
5. Click player names to edit them inline
6. Use +/- buttons to update scores
7. The diff shows the change from the last score update

## Project Structure

```
score-pocket/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── PlayerCard.tsx
│   │   └── SettingsPanel.tsx
│   ├── lib/
│   │   ├── db.ts         # IndexedDB wrapper
│   │   └── utils.ts      # Utility functions
│   ├── routes/
│   │   ├── __root.tsx
│   │   └── index.tsx     # Main game view
│   ├── stores/
│   │   └── gameStore.ts  # Game state management
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
└── package.json
```

## License

MIT
