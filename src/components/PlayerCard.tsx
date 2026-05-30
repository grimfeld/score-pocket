import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/stores/gameStore'
import { usePressAndHold } from '@/hooks/usePressAndHold'
import { Plus, Minus, Crown } from 'lucide-react'

interface PlayerCardProps {
  playerId: string
  name: string
  index: number
  /** Read-only view (finished session): hides the +/- controls. */
  readOnly?: boolean
  /** Score to display when read-only (live store isn't loaded). */
  score?: number
  /** Marks the player as a winner of a finished session. */
  isWinner?: boolean
}

// Pastel colors for dark mode - soft, muted colors that differentiate cards
const pastelColors = [
  'bg-[hsl(270,40%,15%)] border-[hsl(270,50%,25%)]', // Soft purple
  'bg-[hsl(340,40%,15%)] border-[hsl(340,50%,25%)]', // Soft pink
  'bg-[hsl(220,40%,15%)] border-[hsl(220,50%,25%)]', // Soft blue
  'bg-[hsl(190,40%,15%)] border-[hsl(190,50%,25%)]', // Soft cyan
  'bg-[hsl(170,40%,15%)] border-[hsl(170,50%,25%)]', // Soft teal
  'bg-[hsl(150,40%,15%)] border-[hsl(150,50%,25%)]', // Soft green
  'bg-[hsl(160,40%,15%)] border-[hsl(160,50%,25%)]', // Soft emerald
  'bg-[hsl(50,40%,15%)] border-[hsl(50,50%,25%)]', // Soft yellow
  'bg-[hsl(40,40%,15%)] border-[hsl(40,50%,25%)]', // Soft amber
  'bg-[hsl(25,40%,15%)] border-[hsl(25,50%,25%)]', // Soft orange
  'bg-[hsl(0,40%,15%)] border-[hsl(0,50%,25%)]', // Soft red
  'bg-[hsl(350,40%,15%)] border-[hsl(350,50%,25%)]', // Soft rose
  'bg-[hsl(260,40%,15%)] border-[hsl(260,50%,25%)]', // Soft violet
  'bg-[hsl(240,40%,15%)] border-[hsl(240,50%,25%)]', // Soft indigo
  'bg-[hsl(200,40%,15%)] border-[hsl(200,50%,25%)]', // Soft sky
  'bg-[hsl(75,40%,15%)] border-[hsl(75,50%,25%)]', // Soft lime
]

export default function PlayerCard({
  playerId,
  name,
  index,
  readOnly = false,
  score: scoreProp,
  isWinner = false,
}: PlayerCardProps) {
  const liveScore = useGameStore((s) => s.scores[playerId] ?? 0)
  const diff = useGameStore((s) => s.diffs[playerId] ?? 0)
  const incrementStep = useGameStore((s) => s.incrementStep)
  const updateScore = useGameStore((s) => s.updateScore)

  const score = readOnly ? scoreProp ?? 0 : liveScore

  const incrementHandlers = usePressAndHold(() => updateScore(playerId, incrementStep))
  const decrementHandlers = usePressAndHold(() => updateScore(playerId, -incrementStep))

  const getDiffColor = () => {
    if (diff > 0) return 'text-green-400'
    if (diff < 0) return 'text-red-400'
    return 'text-muted-foreground'
  }

  const cardColor = pastelColors[index % pastelColors.length]
  const winnerRing = isWinner ? 'ring-2 ring-yellow-500/70' : ''

  return (
    <Card
      className={`flex flex-col h-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] transition-shadow hover:shadow-lg border-2 ${cardColor} ${winnerRing}`}
    >
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold truncate text-center flex items-center justify-center gap-1.5">
          {isWinner && <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />}
          {name}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center space-y-3 sm:space-y-4 pb-4 sm:pb-6 px-4 sm:px-6">
        {/* Total Score - Large and readable for table viewing */}
        <div className="text-center w-full flex-1 flex items-center justify-center">
          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight landscape:text-7xl landscape:md:text-8xl landscape:lg:text-9xl">
            {score}
          </div>
        </div>

        {!readOnly && (
          <>
            {/* Diff Display */}
            <div className={`text-2xl sm:text-3xl md:text-4xl font-semibold ${getDiffColor()}`}>
              {diff > 0 ? '+' : ''}
              {diff}
            </div>

            {/* Score Controls - Large touch targets */}
            <div className="flex items-center gap-3 sm:gap-4 w-full justify-center pt-2">
              <Button
                {...decrementHandlers}
                variant="outline"
                size="lg"
                className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 p-0 aspect-square rounded-full touch-none select-none border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-950/30 hover:border-red-500/60 flex items-center justify-center"
              >
                <Minus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 stroke-[2.5]" />
              </Button>
              <Button
                {...incrementHandlers}
                variant="outline"
                size="lg"
                className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 p-0 aspect-square rounded-full touch-none select-none border-green-500/40 bg-green-950/20 text-green-400 hover:bg-green-950/30 hover:border-green-500/60 flex items-center justify-center"
              >
                <Plus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 stroke-[2.5]" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
