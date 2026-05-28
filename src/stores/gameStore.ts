import { create } from 'zustand'
import { pb } from '@/lib/pocketbase'

const DIFF_RESET_MS = 5000
const SYNC_DEBOUNCE_MS = 800

interface LiveGameState {
  sessionId: string | null
  scores: Record<string, number>
  diffs: Record<string, number>
  baselines: Record<string, number>
  incrementStep: number
  diffTimeouts: Map<string, ReturnType<typeof setTimeout>>
  syncTimeout: ReturnType<typeof setTimeout> | null

  loadSession: (
    sessionId: string,
    scores: Record<string, number>,
    incrementStep: number
  ) => void
  updateScore: (playerId: string, delta: number) => void
  resetDiff: (playerId: string) => void
  scheduleSync: () => void
  syncNow: () => Promise<void>
  clear: () => void
}

export const useGameStore = create<LiveGameState>((set, get) => ({
  sessionId: null,
  scores: {},
  diffs: {},
  baselines: {},
  incrementStep: 1,
  diffTimeouts: new Map(),
  syncTimeout: null,

  loadSession: (sessionId, scores, incrementStep) => {
    const { diffTimeouts, syncTimeout } = get()
    diffTimeouts.forEach((t) => clearTimeout(t))
    diffTimeouts.clear()
    if (syncTimeout) clearTimeout(syncTimeout)

    set({
      sessionId,
      scores: { ...scores },
      diffs: {},
      baselines: {},
      incrementStep,
      syncTimeout: null,
    })
  },

  updateScore: (playerId, delta) => {
    const { scores, diffs, baselines, diffTimeouts } = get()

    const existing = diffTimeouts.get(playerId)
    if (existing) clearTimeout(existing)

    const prevTotal = scores[playerId] ?? 0
    const newTotal = prevTotal + delta
    const currentDiff = diffs[playerId] ?? 0
    // Start a new diff series from the current total, or keep accumulating
    // against the existing baseline while a series is in progress.
    const baseline = currentDiff === 0 ? prevTotal : baselines[playerId] ?? prevTotal
    const newDiff = newTotal - baseline

    const timeout = setTimeout(() => get().resetDiff(playerId), DIFF_RESET_MS)
    diffTimeouts.set(playerId, timeout)

    set({
      scores: { ...scores, [playerId]: newTotal },
      diffs: { ...diffs, [playerId]: newDiff },
      baselines: { ...baselines, [playerId]: baseline },
    })
    get().scheduleSync()
  },

  resetDiff: (playerId) => {
    const { diffs, diffTimeouts } = get()
    const timeout = diffTimeouts.get(playerId)
    if (timeout) {
      clearTimeout(timeout)
      diffTimeouts.delete(playerId)
    }
    set({ diffs: { ...diffs, [playerId]: 0 } })
  },

  scheduleSync: () => {
    const { syncTimeout } = get()
    if (syncTimeout) clearTimeout(syncTimeout)
    const timeout = setTimeout(() => get().syncNow(), SYNC_DEBOUNCE_MS)
    set({ syncTimeout: timeout })
  },

  syncNow: async () => {
    const { sessionId, scores, syncTimeout } = get()
    if (syncTimeout) {
      clearTimeout(syncTimeout)
      set({ syncTimeout: null })
    }
    if (!sessionId) return
    try {
      await pb.collection('sessions').update(sessionId, { scores })
    } catch (error) {
      console.error('Failed to sync scores:', error)
    }
  },

  clear: () => {
    const { diffTimeouts, syncTimeout } = get()
    diffTimeouts.forEach((t) => clearTimeout(t))
    diffTimeouts.clear()
    if (syncTimeout) clearTimeout(syncTimeout)
    set({
      sessionId: null,
      scores: {},
      diffs: {},
      baselines: {},
      syncTimeout: null,
    })
  },
}))
