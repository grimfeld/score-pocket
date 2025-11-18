import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useGameStore } from '@/stores/gameStore'
import { useEffect } from 'react'
import PlayerCard from '@/components/PlayerCard'
import SettingsPanel from '@/components/SettingsPanel'
import { Settings, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: GameView,
})

function GameView() {
  const { players, initialized, init } = useGameStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Determine grid layout based on number of players
  // Landscape-optimized: horizontal layout for 2-4 players, grid for more
  const getGridClass = () => {
    if (players.length === 2) {
      return 'grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
    } else if (players.length === 3) {
      return 'grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'
    } else if (players.length === 4) {
      return 'grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6'
    } else if (players.length <= 6) {
      return 'grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5'
    } else {
      return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
    }
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8 landscape:p-4">
      {/* Header with Settings and Leaderboard Buttons */}
      <div className="mb-4 sm:mb-6 flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: '/leaderboard' })}
          className="h-10 w-10 sm:h-12 sm:w-12"
        >
          <Trophy className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="h-10 w-10 sm:h-12 sm:w-12"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Players Grid - Optimized for landscape table viewing */}
      <div className={`grid ${getGridClass()} max-w-[2000px] mx-auto`}>
        {players.map((player, index) => (
          <PlayerCard key={player.id} player={player} index={index} />
        ))}
      </div>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
