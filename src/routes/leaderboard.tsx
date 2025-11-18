import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useGameStore } from '@/stores/gameStore'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy } from 'lucide-react'
import { type Player } from '@/lib/db'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardView,
})

interface RankedPlayer extends Player {
  rank: number
}

function LeaderboardView() {
  const { players, initialized, init } = useGameStore()
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

  // Sort players by totalScore descending and assign ranks
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore)
  const rankedPlayers: RankedPlayer[] = []
  let currentRank = 1
  
  sortedPlayers.forEach((player, index) => {
    // Handle ties: if previous player has same score, use same rank
    if (index > 0 && sortedPlayers[index - 1].totalScore !== player.totalScore) {
      // Only increment rank if score is different
      currentRank = index + 1
    }
    rankedPlayers.push({ ...player, rank: currentRank })
  })

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  const getRankDisplay = (rank: number) => {
    const medal = getMedalIcon(rank)
    if (medal) {
      return <span className="text-2xl">{medal}</span>
    }
    return <span className="text-lg font-semibold">#{rank}</span>
  }

  const getTopPlayerStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border-yellow-500/40'
    } else if (rank === 2) {
      return 'bg-gradient-to-br from-gray-800/30 to-gray-700/20 border-gray-400/40'
    } else if (rank === 3) {
      return 'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/40'
    }
    return 'bg-card border-border'
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header with Back Button */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Game
        </Button>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Leaderboard</h1>
        </div>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </div>

      {/* Leaderboard List */}
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        {rankedPlayers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No players yet. Start a game to see the leaderboard!
            </CardContent>
          </Card>
        ) : (
          rankedPlayers.map((player) => (
            <Card
              key={player.id}
              className={`transition-shadow hover:shadow-lg border-2 ${getTopPlayerStyle(player.rank)}`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 sm:w-16 flex-shrink-0">
                    {getRankDisplay(player.rank)}
                  </div>

                  {/* Player Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                      {player.name}
                    </h3>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      {player.totalScore}
                    </span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

