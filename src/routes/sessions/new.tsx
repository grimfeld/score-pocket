import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus, Check } from 'lucide-react'
import { usePlayers, useCreatePlayer } from '@/hooks/usePlayers'
import { useCreateSession } from '@/hooks/useSessions'

export const Route = createFileRoute('/sessions/new')({
  component: NewSessionView,
})

const STEP_KEY = 'sp:incrementStep'
const DEFAULT_SCORE_KEY = 'sp:defaultScore'

function readNumber(key: string, fallback: number) {
  const raw = localStorage.getItem(key)
  const n = raw === null ? NaN : Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function NewSessionView() {
  const navigate = useNavigate()
  const { data: players, isLoading, isError } = usePlayers()
  const createPlayer = useCreatePlayer()
  const createSession = useCreateSession()

  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [incrementStep, setIncrementStep] = useState<number | ''>(() => readNumber(STEP_KEY, 1))
  const [defaultScore, setDefaultScore] = useState<number | ''>(() => readNumber(DEFAULT_SCORE_KEY, 0))
  const [newPlayerName, setNewPlayerName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddPlayer = () => {
    const playerName = newPlayerName.trim()
    if (!playerName) return
    setAddError(null)
    createPlayer.mutate(playerName, {
      onSuccess: (record) => {
        setNewPlayerName('')
        setSelected((prev) => new Set(prev).add(record.id))
      },
      onError: () =>
        setAddError(`Couldn't add "${playerName}". Names must be unique.`),
    })
  }

  const handleStart = () => {
    if (selected.size < 2) {
      setFormError('Pick at least 2 players.')
      return
    }
    const step = typeof incrementStep === 'number' && incrementStep >= 1 ? incrementStep : 1
    const base = typeof defaultScore === 'number' ? defaultScore : 0
    localStorage.setItem(STEP_KEY, String(step))
    localStorage.setItem(DEFAULT_SCORE_KEY, String(base))

    createSession.mutate(
      {
        name: name.trim() || undefined,
        players: Array.from(selected),
        incrementStep: step,
        defaultScore: base,
      },
      {
        onSuccess: (session) =>
          navigate({ to: '/sessions/$sessionId', params: { sessionId: session.id } }),
        onError: () => setFormError("Couldn't create the game. Is the backend running?"),
      }
    )
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">New Game</h1>
        <div className="w-[72px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="session-name">Game name (optional)</Label>
          <Input
            id="session-name"
            value={name}
            placeholder="e.g. Friday Catan"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <Separator />

        {/* Players */}
        <div className="space-y-3">
          <Label>Players</Label>

          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && (
            <Card>
              <CardContent className="p-4 text-sm text-red-400">
                Couldn't reach the backend. Make sure Pocketbase is running (see
                README).
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && (players?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">
              No players yet — add some below.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {players?.map((player) => {
              const isSelected = selected.has(player.id)
              return (
                <Button
                  key={player.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => toggle(player.id)}
                  className="gap-1.5"
                >
                  {isSelected && <Check className="h-4 w-4" />}
                  {player.name}
                </Button>
              )
            })}
          </div>

          {/* Inline add */}
          <div className="space-y-1 pt-2">
            <div className="flex gap-2">
              <Input
                value={newPlayerName}
                placeholder="Add a new player"
                onChange={(e) => {
                  setNewPlayerName(e.target.value)
                  setAddError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddPlayer()
                }}
              />
              <Button
                variant="outline"
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim() || createPlayer.isPending}
                className="gap-1 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {addError && <p className="text-sm text-red-400">{addError}</p>}
          </div>
        </div>

        <Separator />

        {/* Scoring settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="increment-step">Increment step</Label>
            <Input
              id="increment-step"
              type="number"
              min="1"
              value={incrementStep === '' ? '' : incrementStep}
              onChange={(e) => {
                const v = e.target.value
                if (v === '') return setIncrementStep('')
                const n = parseInt(v, 10)
                if (!isNaN(n) && n >= 1) setIncrementStep(n)
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-score">Starting score</Label>
            <Input
              id="default-score"
              type="number"
              value={defaultScore === '' ? '' : defaultScore}
              onChange={(e) => {
                const v = e.target.value
                if (v === '') return setDefaultScore('')
                const n = parseInt(v, 10)
                if (!isNaN(n)) setDefaultScore(n)
              }}
            />
          </div>
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <Button
          size="lg"
          className="w-full h-14 text-base"
          onClick={handleStart}
          disabled={createSession.isPending}
        >
          {createSession.isPending ? 'Starting…' : `Start game (${selected.size})`}
        </Button>
      </div>
    </div>
  )
}
