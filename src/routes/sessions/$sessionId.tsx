import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import PlayerCard from '@/components/PlayerCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Flag, Check, Crown } from 'lucide-react'
import { useSession, useFinishSession } from '@/hooks/useSessions'
import { useGameStore } from '@/stores/gameStore'
import { type PlayerRecord } from '@/lib/pocketbase'

export const Route = createFileRoute('/sessions/$sessionId')({
  component: SessionView,
})

function gridClass(count: number) {
  if (count <= 2) return 'grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'
  if (count === 4) return 'grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6'
  if (count <= 6) return 'grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5'
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
}

function SessionView() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const { data: session, isLoading, isError } = useSession(sessionId)
  const finishSession = useFinishSession()

  const loadSession = useGameStore((s) => s.loadSession)
  const clear = useGameStore((s) => s.clear)
  const syncNow = useGameStore((s) => s.syncNow)
  const liveScores = useGameStore((s) => s.scores)

  const hydratedFor = useRef<string | null>(null)
  const [showFinish, setShowFinish] = useState(false)
  const [winners, setWinners] = useState<Set<string>>(new Set())

  const isActive = session?.status === 'active'
  const players: PlayerRecord[] = session?.expand?.players ?? []

  // Hydrate the live store once per active session.
  useEffect(() => {
    if (session && isActive && hydratedFor.current !== session.id) {
      loadSession(session.id, session.scores ?? {}, session.incrementStep || 1)
      hydratedFor.current = session.id
    }
  }, [session, isActive, loadSession])

  // Flush pending score changes and clear the store on unmount.
  useEffect(() => {
    return () => {
      void syncNow()
      clear()
    }
  }, [syncNow, clear])

  const openFinish = () => {
    // Pre-select the current top scorer(s) as a suggestion.
    const ids = players.map((p) => p.id)
    const top = ids.reduce(
      (max, id) => Math.max(max, liveScores[id] ?? 0),
      Number.NEGATIVE_INFINITY
    )
    const suggested = ids.filter((id) => (liveScores[id] ?? 0) === top)
    setWinners(new Set(suggested))
    setShowFinish(true)
  }

  const toggleWinner = (id: string) => {
    setWinners((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirmFinish = () => {
    if (!session) return
    finishSession.mutate(
      {
        id: session.id,
        winners: Array.from(winners),
        scores: liveScores,
      },
      {
        onSuccess: () => {
          clear()
          hydratedFor.current = null
          setShowFinish(false)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading…</div>
      </div>
    )
  }

  if (isError || !session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Game not found, or backend unreachable.</p>
        <Button variant="outline" className="gap-2" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Button>
      </div>
    )
  }

  const winnerIds = new Set(session.winners ?? [])

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8 landscape:p-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4" />
          {isActive ? 'Home' : 'Back'}
        </Button>
        <h1 className="text-base sm:text-lg font-semibold truncate px-2">
          {session.name || 'Game'}
        </h1>
        {isActive ? (
          <Button size="sm" className="gap-2 flex-shrink-0" onClick={openFinish}>
            <Flag className="h-4 w-4" />
            Finish
          </Button>
        ) : (
          <div className="text-sm text-yellow-400 flex items-center gap-1.5 flex-shrink-0">
            <Crown className="h-4 w-4" />
            Finished
          </div>
        )}
      </div>

      {/* Players grid */}
      <div className={`grid ${gridClass(players.length)} max-w-[2000px] mx-auto`}>
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            playerId={player.id}
            name={player.name}
            index={index}
            readOnly={!isActive}
            score={session.scores?.[player.id] ?? 0}
            isWinner={!isActive && winnerIds.has(player.id)}
          />
        ))}
      </div>

      {/* Finish dialog */}
      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who won?</DialogTitle>
            <DialogDescription>
              Tap the winner(s). The current top scorer is pre-selected — change it
              for low-score-wins games or ties.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 py-2">
            {players.map((player) => {
              const isWinner = winners.has(player.id)
              return (
                <Button
                  key={player.id}
                  variant={isWinner ? 'default' : 'outline'}
                  onClick={() => toggleWinner(player.id)}
                  className="gap-1.5"
                >
                  {isWinner && <Check className="h-4 w-4" />}
                  {player.name}
                  <span className="text-xs opacity-70">{liveScores[player.id] ?? 0}</span>
                </Button>
              )
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinish(false)}>
              Cancel
            </Button>
            <Button onClick={confirmFinish} disabled={finishSession.isPending}>
              {finishSession.isPending ? 'Saving…' : 'Finish game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
