import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, ArrowUpDown } from 'lucide-react'
import { usePlayerStats, type PlayerStat } from '@/hooks/usePlayerStats'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardView,
})

type SortKey = 'played' | 'wins' | 'winRate'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'played', label: 'Played' },
  { key: 'wins', label: 'Wins' },
  { key: 'winRate', label: 'Win rate' },
]

function sortValue(stat: PlayerStat, key: SortKey) {
  if (key === 'winRate') return stat.winRate ?? -1
  return stat[key]
}

function formatWinRate(rate: number | null) {
  if (rate === null) return '—'
  return `${Math.round(rate * 100)}%`
}

function LeaderboardView() {
  const navigate = useNavigate()
  const { stats, isLoading, isError } = usePlayerStats()
  const [sortKey, setSortKey] = useState<SortKey>('winRate')

  const sorted = useMemo(() => {
    return [...stats].sort((a, b) => {
      const diff = sortValue(b, sortKey) - sortValue(a, sortKey)
      if (diff !== 0) return diff
      // Tie-breakers keep the order stable and sensible.
      if (b.wins !== a.wins) return b.wins - a.wins
      return a.name.localeCompare(b.name)
    })
  }, [stats, sortKey])

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between max-w-3xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Leaderboard</h1>
        </div>
        <div className="w-[72px]" />
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Sort controls */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort by
          </span>
          {COLUMNS.map((col) => (
            <Button
              key={col.key}
              size="sm"
              variant={sortKey === col.key ? 'default' : 'outline'}
              onClick={() => setSortKey(col.key)}
            >
              {col.label}
            </Button>
          ))}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {isError && (
          <Card>
            <CardContent className="p-4 text-sm text-red-400">
              Couldn't reach the backend. Make sure Pocketbase is running (see
              README).
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No stats yet. Finish a game with a winner to populate the leaderboard.
            </CardContent>
          </Card>
        )}

        {sorted.length > 0 && (
          <Card>
            <CardContent className="p-0">
              {/* Header row */}
              <div className="grid grid-cols-[2rem_1fr_4rem_4rem_5rem] sm:grid-cols-[3rem_1fr_5rem_5rem_6rem] items-center gap-2 px-3 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">
                <span>#</span>
                <span>Player</span>
                <span className="text-right">Played</span>
                <span className="text-right">Wins</span>
                <span className="text-right">Win rate</span>
              </div>

              {sorted.map((stat, index) => (
                <div
                  key={stat.id}
                  className="grid grid-cols-[2rem_1fr_4rem_4rem_5rem] sm:grid-cols-[3rem_1fr_5rem_5rem_6rem] items-center gap-2 px-3 sm:px-4 py-3 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="font-medium truncate">{stat.name}</span>
                  <span className="text-right tabular-nums">{stat.played}</span>
                  <span className="text-right tabular-nums">{stat.wins}</span>
                  <span className="text-right tabular-nums font-semibold">
                    {formatWinRate(stat.winRate)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
