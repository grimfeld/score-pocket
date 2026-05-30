import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pb, type PlayerRecord } from '@/lib/pocketbase'

const PLAYERS_KEY = ['players']

export function usePlayers() {
  return useQuery({
    queryKey: PLAYERS_KEY,
    queryFn: () =>
      pb.collection('players').getFullList<PlayerRecord>({ sort: 'name' }),
  })
}

export function useCreatePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      pb.collection('players').create<PlayerRecord>({ name: name.trim() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}

export function useRenamePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      pb.collection('players').update<PlayerRecord>(id, { name: name.trim() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}

export function useDeletePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('players').delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYERS_KEY })
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
