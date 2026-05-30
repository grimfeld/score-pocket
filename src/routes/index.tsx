import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Users, Plus, Play, Crown } from 'lucide-react'
import { useActiveSession, useSessions } from '@/hooks/useSessions'
import { type SessionRecord } from '@/lib/pocketbase'

export const Route = createFileRoute('/')({
  component: HomeView,
})

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function sessionLabel(session: SessionRecord) {
  if (session.name) return session.name
  return `Game · ${formatDate(session.created)}`
}

function HomeView() {
  const navigate = useNavigate()
  const { data: activeSession } = useActiveSession()
  const { data: sessions, isLoading, isError } = useSessions()

  const finished = (sessions ?? []).filter((s) => s.status === 'finished')

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Score Pocket</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: '/players' })}
            className="h-10 w-10 sm:h-12 sm:w-12"
            title="Players"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: '/leaderboard' })}
            className="h-10 w-10 sm:h-12 sm:w-12"
            title="Leaderboard"
          >
            <Trophy className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Active session */}
        {activeSession && (
          <Card className="border-2 border-green-500/40 bg-green-950/10">
            <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-green-400 mb-1">
                  Game in progress
                </p>
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {sessionLabel(activeSession)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeSession.expand?.players?.length ?? activeSession.players.length} players
                </p>
              </div>
              <Button
                size="lg"
                className="gap-2 flex-shrink-0"
                onClick={() =>
                  navigate({
                    to: '/sessions/$sessionId',
                    params: { sessionId: activeSession.id },
                  })
                }
              >
                <Play className="h-5 w-5" />
                Resume
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New game */}
        <Button
          size="lg"
          className="w-full h-14 text-base gap-2"
          onClick={() => navigate({ to: '/sessions/new' })}
        >
          <Plus className="h-5 w-5" />
          New Game
        </Button>

        {/* Recent games */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent games
          </h2>

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}

          {isError && (
            <Card>
              <CardContent className="p-4 text-sm text-red-400">
                Couldn't reach the backend. Make sure Pocketbase is running (see
                README).
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && finished.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No finished games yet. Start a new game to track stats.
              </CardContent>
            </Card>
          )}

          {finished.map((session) => {
            const winners = session.expand?.winners ?? []
            return (
              <Card
                key={session.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() =>
                  navigate({
                    to: '/sessions/$sessionId',
                    params: { sessionId: session.id },
                  })
                }
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{sessionLabel(session)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {session.expand?.players?.length ?? session.players.length} players
                      {session.finishedAt ? ` · ${formatDate(session.finishedAt)}` : ''}
                    </p>
                  </div>
                  {winners.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm flex-shrink-0 text-yellow-400">
                      <Crown className="h-4 w-4" />
                      <span className="truncate max-w-[40vw]">
                        {winners.map((w) => w.name).join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
