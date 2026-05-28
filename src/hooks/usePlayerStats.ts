import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb, type SessionRecord } from '@/lib/pocketbase'

export interface PlayerStat {
  id: string
  name: string
  played: number
  wins: number
  winRate: number | null // null when no games played
}

export function usePlayerStats() {
  const query = useQuery({
    queryKey: ['stats'],
    queryFn: () =>
      pb.collection('sessions').getFullList<SessionRecord>({
        filter: 'status = "finished"',
        expand: 'players,winners',
      }),
  })

  const stats = useMemo<PlayerStat[]>(() => {
    const sessions = query.data ?? []
    const byId = new Map<string, PlayerStat>()

    const ensure = (id: string, name: string) => {
      let stat = byId.get(id)
      if (!stat) {
        stat = { id, name, played: 0, wins: 0, winRate: null }
        byId.set(id, stat)
      }
      return stat
    }

    for (const session of sessions) {
      for (const player of session.expand?.players ?? []) {
        ensure(player.id, player.name).played += 1
      }
      for (const winner of session.expand?.winners ?? []) {
        ensure(winner.id, winner.name).wins += 1
      }
    }

    for (const stat of byId.values()) {
      stat.winRate = stat.played > 0 ? stat.wins / stat.played : null
    }

    return Array.from(byId.values())
  }, [query.data])

  return { ...query, stats }
}
