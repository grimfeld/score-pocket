import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useGameStore } from '@/stores/gameStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { players, settings, setNumPlayers, setPlayerNames, setIncrementStep, setDefaultScore, resetGame } = useGameStore()
  const [numPlayers, setNumPlayersLocal] = useState<number | ''>(settings.numPlayers)
  const [playerNames, setPlayerNamesLocal] = useState<string[]>([])
  const [incrementStep, setIncrementStepLocal] = useState<number | ''>(settings.incrementStep)
  const [defaultScore, setDefaultScoreLocal] = useState<number | ''>(settings.defaultScore ?? 0)
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    if (open) {
      setNumPlayersLocal(settings.numPlayers)
      setPlayerNamesLocal(players.map((p) => p.name))
      setIncrementStepLocal(settings.incrementStep)
      setDefaultScoreLocal(settings.defaultScore ?? 0)
    }
  }, [open, settings, players])

  const handleSave = () => {
    const playerCount = typeof numPlayers === 'number' ? numPlayers : settings.numPlayers
    const stepValue = typeof incrementStep === 'number' ? incrementStep : settings.incrementStep
    const defaultScoreValue = typeof defaultScore === 'number' ? defaultScore : settings.defaultScore ?? 0

    if (playerCount !== settings.numPlayers) {
      setNumPlayers(playerCount)
    }

    if (stepValue !== settings.incrementStep) {
      setIncrementStep(stepValue)
    }

    if (defaultScoreValue !== (settings.defaultScore ?? 0)) {
      setDefaultScore(defaultScoreValue)
    }

    // Update player names if they've changed
    const currentNames = players.map((p) => p.name)
    if (JSON.stringify(playerNames) !== JSON.stringify(currentNames)) {
      setPlayerNames(playerNames)
    }

    onOpenChange(false)
  }

  const handleReset = () => {
    resetGame()
    setShowResetDialog(false)
    onOpenChange(false)
  }

  const handleNumPlayersChange = (value: string) => {
    if (value === '') {
      setNumPlayersLocal('')
      return
    }

    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 2) {
      setNumPlayersLocal(num)
      // Update player names array to match new count
      if (num > playerNames.length) {
        const newNames = [...playerNames]
        for (let i = playerNames.length; i < num; i++) {
          newNames.push(`Player ${i + 1}`)
        }
        setPlayerNamesLocal(newNames)
      } else if (num < playerNames.length) {
        setPlayerNamesLocal(playerNames.slice(0, num))
      }
    }
  }

  const handlePlayerNameChange = (index: number, value: string) => {
    const newNames = [...playerNames]
    newNames[index] = value
    setPlayerNamesLocal(newNames)
  }

  const playerCount = typeof numPlayers === 'number' ? numPlayers : 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your game settings and player information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Number of Players */}
            <div className="space-y-2">
              <Label htmlFor="num-players">Number of Players</Label>
              <Input
                id="num-players"
                type="number"
                min="2"
                value={numPlayers === '' ? '' : numPlayers}
                onChange={(e) => handleNumPlayersChange(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Minimum 2 players
              </p>
            </div>

            <Separator />

            {/* Player Names */}
            <div className="space-y-3">
              <Label>Player Names</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from({ length: playerCount }).map((_, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`player-${index}`} className="text-xs text-muted-foreground">
                      Player {index + 1}
                    </Label>
                    <Input
                      id={`player-${index}`}
                      value={playerNames[index] || `Player ${index + 1}`}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Increment Step */}
            <div className="space-y-2">
              <Label htmlFor="increment-step">Increment Step</Label>
              <Input
                id="increment-step"
                type="number"
                min="1"
                value={incrementStep === '' ? '' : incrementStep}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setIncrementStepLocal('')
                    return
                  }

                  const step = parseInt(value, 10)
                  if (!isNaN(step) && step >= 1) {
                    setIncrementStepLocal(step)
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Amount to add/subtract when using +/- buttons
              </p>
            </div>

            <Separator />

            {/* Default Score */}
            <div className="space-y-2">
              <Label htmlFor="default-score">Default Score</Label>
              <Input
                id="default-score"
                type="number"
                value={defaultScore === '' ? '' : defaultScore}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setDefaultScoreLocal('')
                    return
                  }

                  const score = parseInt(value, 10)
                  if (!isNaN(score)) {
                    setDefaultScoreLocal(score)
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Starting value for all counters. Used when resetting scores (useful for decreasing scores or health points).
              </p>
            </div>

            <Separator />

            {/* Reset Button */}
            <div className="space-y-2">
              <Label>Game Actions</Label>
              <Button
                variant="destructive"
                onClick={() => setShowResetDialog(true)}
                className="w-full"
              >
                Reset All Scores
              </Button>
              <p className="text-sm text-muted-foreground">
                Reset all player scores to the default value ({settings.defaultScore ?? 0})
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Scores?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all player scores to {settings.defaultScore ?? 0}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
