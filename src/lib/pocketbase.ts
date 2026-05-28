import PocketBase, { type RecordModel } from 'pocketbase'

const url = import.meta.env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090'

export const pb = new PocketBase(url)

// React Query manages request lifecycles; disable the SDK's auto-cancellation
// so overlapping/identical requests aren't aborted underneath it.
pb.autoCancellation(false)

export interface PlayerRecord extends RecordModel {
  name: string
}

export type SessionStatus = 'active' | 'finished'

export interface SessionRecord extends RecordModel {
  name: string
  status: SessionStatus
  players: string[]
  winners: string[]
  scores: Record<string, number>
  incrementStep: number
  defaultScore: number
  finishedAt: string
  expand?: {
    players?: PlayerRecord[]
    winners?: PlayerRecord[]
  }
}
