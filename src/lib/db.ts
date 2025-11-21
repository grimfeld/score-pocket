const DB_NAME = 'score-pocket-db'
const DB_VERSION = 1
const STORE_NAME = 'game-session'

export interface GameSession {
  players: Player[]
  settings: GameSettings
}

export interface Player {
  id: string
  name: string
  totalScore: number
  lastScore: number
  diff: number
}

export interface GameSettings {
  incrementStep: number
  numPlayers: number
  defaultScore: number
}

class IndexedDBWrapper {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          objectStore.createIndex('id', 'id', { unique: true })
        }
      }
    })
  }

  async saveSession(session: GameSession): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ id: 'current', ...session })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to save session'))
      }
    })
  }

  async loadSession(): Promise<GameSession | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get('current')

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { id: _id, ...session } = result
          void _id
          resolve(session as GameSession)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        reject(new Error('Failed to load session'))
      }
    })
  }

  async clearSession(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete('current')

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to clear session'))
      }
    })
  }
}

export const db = new IndexedDBWrapper()
