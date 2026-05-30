import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { ArrowLeft, Users, Plus, Trash2, Check, X, Pencil } from 'lucide-react'
import {
  usePlayers,
  useCreatePlayer,
  useRenamePlayer,
  useDeletePlayer,
} from '@/hooks/usePlayers'
import { type PlayerRecord } from '@/lib/pocketbase'

export const Route = createFileRoute('/players')({
  component: PlayersView,
})

function PlayersView() {
  const navigate = useNavigate()
  const { data: players, isLoading, isError } = usePlayers()
  const createPlayer = useCreatePlayer()
  const renamePlayer = useRenamePlayer()
  const deletePlayer = useDeletePlayer()

  const [newName, setNewName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<PlayerRecord | null>(null)

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    setCreateError(null)
    createPlayer.mutate(name, {
      onSuccess: () => setNewName(''),
      onError: () =>
        setCreateError(`Couldn't add "${name}". Names must be unique.`),
    })
  }

  const startEdit = (player: PlayerRecord) => {
    setEditingId(player.id)
    setEditName(player.name)
  }

  const saveEdit = () => {
    const name = editName.trim()
    if (editingId && name) {
      renamePlayer.mutate(
        { id: editingId, name },
        { onSettled: () => setEditingId(null) }
      )
    } else {
      setEditingId(null)
    }
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
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Players</h1>
        </div>
        <div className="w-[72px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Add player */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newName}
              placeholder="New player name"
              onChange={(e) => {
                setNewName(e.target.value)
                setCreateError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
            />
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || createPlayer.isPending}
              className="gap-1 flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {createError && <p className="text-sm text-red-400">{createError}</p>}
        </div>

        {/* Player list */}
        <div className="space-y-2">
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
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No players yet. Add your first player above.
              </CardContent>
            </Card>
          )}

          {players?.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                {editingId === player.id ? (
                  <>
                    <Input
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" onClick={saveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium truncate">{player.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(player)}
                      title="Rename"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setPendingDelete(player)}
                      title="Delete"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the player and their references from past games, which
              changes the leaderboard stats. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deletePlayer.mutate(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
