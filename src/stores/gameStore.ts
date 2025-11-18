import { create } from 'zustand'
import { db, type Player, type GameSettings, type GameSession } from '@/lib/db'

interface GameState {
  players: Player[]
  settings: GameSettings
  initialized: boolean
  diffTimeouts: Map<string, ReturnType<typeof setTimeout>>
  
  // Actions
  init: () => Promise<void>
  updateScore: (playerId: string, delta: number) => void
  updatePlayerName: (playerId: string, name: string) => void
  setIncrementStep: (step: number) => void
  setNumPlayers: (num: number) => void
  setPlayerNames: (names: string[]) => void
  resetGame: () => void
  saveToDB: () => Promise<void>
  resetPlayerDiff: (playerId: string) => void
}

const createDefaultPlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    totalScore: 0,
    lastScore: 0,
    diff: 0,
  }))
}

const defaultSettings: GameSettings = {
  incrementStep: 1,
  numPlayers: 4,
}

export const useGameStore = create<GameState>((set, get) => ({
  players: createDefaultPlayers(4),
  settings: defaultSettings,
  initialized: false,
  diffTimeouts: new Map(),

  init: async () => {
    try {
      const saved = await db.loadSession()
      if (saved) {
        // Reset all diffs to 0 when loading (timeouts aren't persisted)
        const playersWithResetDiff = saved.players.map((player) => ({
          ...player,
          diff: 0,
          lastScore: player.totalScore, // Set lastScore to current totalScore
        }))
        set({
          players: playersWithResetDiff,
          settings: saved.settings,
          initialized: true,
        })
      } else {
        set({
          players: createDefaultPlayers(defaultSettings.numPlayers),
          settings: defaultSettings,
          initialized: true,
        })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      set({
        players: createDefaultPlayers(defaultSettings.numPlayers),
        settings: defaultSettings,
        initialized: true,
      })
    }
  },

  updateScore: (playerId: string, delta: number) => {
    const { players, diffTimeouts } = get()
    
    // Clear existing timeout for this player
    const existingTimeout = diffTimeouts.get(playerId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    const updatedPlayers = players.map((player) => {
      if (player.id === playerId) {
        const previousTotal = player.totalScore
        const newTotalScore = previousTotal + delta
        
        // If diff is 0, this is the start of a new series - reset lastScore
        // Otherwise, accumulate the diff from the lastScore baseline
        const baselineScore = player.diff === 0 ? previousTotal : player.lastScore
        const newDiff = newTotalScore - baselineScore
        
        // Set a timeout to reset the diff after 5 seconds
        const timeout = setTimeout(() => {
          get().resetPlayerDiff(playerId)
        }, 5000)
        
        diffTimeouts.set(playerId, timeout)
        
        return {
          ...player,
          totalScore: newTotalScore,
          lastScore: baselineScore, // Keep the baseline for accumulation
          diff: newDiff,
        }
      }
      return player
    })
    
    set({ players: updatedPlayers })
    get().saveToDB()
  },

  updatePlayerName: (playerId: string, name: string) => {
    const { players } = get()
    const updatedPlayers = players.map((player) =>
      player.id === playerId ? { ...player, name } : player
    )
    set({ players: updatedPlayers })
    get().saveToDB()
  },

  setIncrementStep: (step: number) => {
    const { settings } = get()
    set({
      settings: {
        ...settings,
        incrementStep: step,
      },
    })
    get().saveToDB()
  },

  setNumPlayers: (num: number) => {
    const { players, settings, diffTimeouts } = get()
    const currentCount = players.length
    
    if (num > currentCount) {
      // Add new players
      const newPlayers = Array.from({ length: num - currentCount }, (_, i) => ({
        id: `player-${currentCount + i + 1}`,
        name: `Player ${currentCount + i + 1}`,
        totalScore: 0,
        lastScore: 0,
        diff: 0,
      }))
      set({
        players: [...players, ...newPlayers],
        settings: { ...settings, numPlayers: num },
      })
    } else if (num < currentCount) {
      // Remove players (keep first N) - clean up timeouts for removed players
      const remainingPlayerIds = new Set(players.slice(0, num).map(p => p.id))
      diffTimeouts.forEach((timeout, playerId) => {
        if (!remainingPlayerIds.has(playerId)) {
          clearTimeout(timeout)
          diffTimeouts.delete(playerId)
        }
      })
      
      set({
        players: players.slice(0, num),
        settings: { ...settings, numPlayers: num },
      })
    } else {
      set({
        settings: { ...settings, numPlayers: num },
      })
    }
    get().saveToDB()
  },

  setPlayerNames: (names: string[]) => {
    const { players } = get()
    const updatedPlayers = players.map((player, index) =>
      index < names.length ? { ...player, name: names[index] } : player
    )
    set({ players: updatedPlayers })
    get().saveToDB()
  },

  resetGame: () => {
    const { players, diffTimeouts } = get()
    
    // Clear all timeouts
    diffTimeouts.forEach((timeout) => clearTimeout(timeout))
    diffTimeouts.clear()
    
    const resetPlayers = players.map((player) => ({
      ...player,
      totalScore: 0,
      lastScore: 0,
      diff: 0,
    }))
    set({ players: resetPlayers })
    get().saveToDB()
  },

  resetPlayerDiff: (playerId: string) => {
    const { players, diffTimeouts } = get()
    
    // Clear the timeout
    const timeout = diffTimeouts.get(playerId)
    if (timeout) {
      clearTimeout(timeout)
      diffTimeouts.delete(playerId)
    }
    
    const updatedPlayers = players.map((player) => {
      if (player.id === playerId) {
        // Reset diff to 0 and update lastScore to current totalScore
        return {
          ...player,
          lastScore: player.totalScore,
          diff: 0,
        }
      }
      return player
    })
    
    set({ players: updatedPlayers })
    get().saveToDB()
  },

  saveToDB: async () => {
    try {
      const { players, settings } = get()
      const session: GameSession = { players, settings }
      await db.saveSession(session)
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  },
}))
