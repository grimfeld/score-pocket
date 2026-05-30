import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pb, type SessionRecord } from '@/lib/pocketbase'

const SESSIONS_KEY = ['sessions']

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () =>
      pb.collection('sessions').getFullList<SessionRecord>({
        sort: '-created',
        expand: 'players,winners',
      }),
  })
}

export function useActiveSession() {
  return useQuery({
    queryKey: [...SESSIONS_KEY, 'active'],
    queryFn: async () => {
      const list = await pb.collection('sessions').getList<SessionRecord>(1, 1, {
        filter: 'status = "active"',
        sort: '-created',
        expand: 'players,winners',
      })
      return list.items[0] ?? null
    },
  })
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: [...SESSIONS_KEY, id],
    enabled: !!id,
    queryFn: () =>
      pb
        .collection('sessions')
        .getOne<SessionRecord>(id as string, { expand: 'players,winners' }),
  })
}

interface CreateSessionInput {
  name?: string
  players: string[]
  incrementStep: number
  defaultScore: number
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSessionInput) => {
      const scores: Record<string, number> = {}
      input.players.forEach((id) => {
        scores[id] = input.defaultScore
      })
      return pb.collection('sessions').create<SessionRecord>({
        name: input.name?.trim() ?? '',
        status: 'active',
        players: input.players,
        winners: [],
        scores,
        incrementStep: input.incrementStep,
        defaultScore: input.defaultScore,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  })
}

interface FinishSessionInput {
  id: string
  winners: string[]
  scores: Record<string, number>
}

export function useFinishSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: FinishSessionInput) =>
      pb.collection('sessions').update<SessionRecord>(input.id, {
        status: 'finished',
        winners: input.winners,
        scores: input.scores,
        finishedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SESSIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('sessions').delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SESSIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
