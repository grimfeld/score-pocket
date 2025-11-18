import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGameStore } from '@/stores/gameStore'
import { type Player } from '@/lib/db'
import { Plus, Minus } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  index: number
}

// Pastel colors for dark mode - soft, muted colors that differentiate cards
// Using HSL-based colors for better pastel effect in dark mode
const pastelColors = [
  'bg-[hsl(270,40%,15%)] border-[hsl(270,50%,25%)]',      // Soft purple
  'bg-[hsl(340,40%,15%)] border-[hsl(340,50%,25%)]',      // Soft pink
  'bg-[hsl(220,40%,15%)] border-[hsl(220,50%,25%)]',      // Soft blue
  'bg-[hsl(190,40%,15%)] border-[hsl(190,50%,25%)]',      // Soft cyan
  'bg-[hsl(170,40%,15%)] border-[hsl(170,50%,25%)]',      // Soft teal
  'bg-[hsl(150,40%,15%)] border-[hsl(150,50%,25%)]',      // Soft green
  'bg-[hsl(160,40%,15%)] border-[hsl(160,50%,25%)]',      // Soft emerald
  'bg-[hsl(50,40%,15%)] border-[hsl(50,50%,25%)]',        // Soft yellow
  'bg-[hsl(40,40%,15%)] border-[hsl(40,50%,25%)]',        // Soft amber
  'bg-[hsl(25,40%,15%)] border-[hsl(25,50%,25%)]',        // Soft orange
  'bg-[hsl(0,40%,15%)] border-[hsl(0,50%,25%)]',          // Soft red
  'bg-[hsl(350,40%,15%)] border-[hsl(350,50%,25%)]',      // Soft rose
  'bg-[hsl(260,40%,15%)] border-[hsl(260,50%,25%)]',      // Soft violet
  'bg-[hsl(240,40%,15%)] border-[hsl(240,50%,25%)]',      // Soft indigo
  'bg-[hsl(200,40%,15%)] border-[hsl(200,50%,25%)]',      // Soft sky
  'bg-[hsl(75,40%,15%)] border-[hsl(75,50%,25%)]',        // Soft lime
]

export default function PlayerCard({ player, index }: PlayerCardProps) {
  const { updateScore, updatePlayerName, settings } = useGameStore()
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(player.name)

  // Sync nameValue when player.name changes externally (e.g., from settings)
  useEffect(() => {
    if (!isEditingName) {
      setNameValue(player.name)
    }
  }, [player.name, isEditingName])

  const handleNameEdit = () => {
    setIsEditingName(true)
  }

  const handleNameSave = () => {
    if (nameValue.trim()) {
      updatePlayerName(player.id, nameValue.trim())
    } else {
      setNameValue(player.name)
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setNameValue(player.name)
      setIsEditingName(false)
    }
  }

  const handleIncrement = () => {
    updateScore(player.id, settings.incrementStep)
  }

  const handleDecrement = () => {
    updateScore(player.id, -settings.incrementStep)
  }

  // Determine diff color - optimized for dark mode
  const getDiffColor = () => {
    if (player.diff > 0) return 'text-green-400'
    if (player.diff < 0) return 'text-red-400'
    return 'text-muted-foreground'
  }

  // Get pastel background color based on player index
  const getCardColor = () => {
    return pastelColors[index % pastelColors.length]
  }

  return (
    <Card className={`flex flex-col h-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] transition-shadow hover:shadow-lg border-2 ${getCardColor()}`}>
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        {isEditingName ? (
          <Input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            className="text-base sm:text-lg font-semibold h-auto py-1.5 px-2"
            autoFocus
          />
        ) : (
          <h3
            onClick={handleNameEdit}
            className="text-base sm:text-lg md:text-xl font-semibold cursor-pointer hover:underline truncate text-center"
            title="Click to edit name"
          >
            {player.name}
          </h3>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center space-y-3 sm:space-y-4 pb-4 sm:pb-6 px-4 sm:px-6">
        {/* Total Score - Large and readable for table viewing */}
        <div className="text-center w-full flex-1 flex items-center justify-center">
          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight landscape:text-7xl landscape:md:text-8xl landscape:lg:text-9xl">
            {player.totalScore}
          </div>
        </div>

        {/* Diff Display */}
        <div className={`text-2xl sm:text-3xl md:text-4xl font-semibold ${getDiffColor()}`}>
          {player.diff > 0 ? '+' : ''}
          {player.diff}
        </div>

        {/* Score Controls - Large touch targets */}
        <div className="flex items-center gap-3 sm:gap-4 w-full justify-center pt-2">
          <Button
            onClick={handleDecrement}
            variant="outline"
            size="lg"
            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 text-3xl font-bold rounded-full touch-manipulation border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-950/30 hover:border-red-500/60"
          >
            <Minus className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>
          <Button
            onClick={handleIncrement}
            variant="outline"
            size="lg"
            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 text-3xl font-bold rounded-full touch-manipulation border-green-500/40 bg-green-950/20 text-green-400 hover:bg-green-950/30 hover:border-green-500/60"
          >
            <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
