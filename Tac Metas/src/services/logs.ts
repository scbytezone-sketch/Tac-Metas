import { supabase } from '../lib/supabaseClient'
import { newUuid } from '../utils/uuid'
import type { PendingLog } from './offlineQueue'
import { enqueue, loadQueue, dequeue } from './offlineQueue'

function isDuplicateError(err: any): boolean {
  const code = err?.code ?? err?.status
  const msg = String(err?.message ?? "")
  // Postgres unique violation
  if (code === "23505") return true
  if (msg.toLowerCase().includes("duplicate key")) return true
  if (msg.toLowerCase().includes("unique constraint")) return true
  return false
}

function isNetworkError(err: any): boolean {
  const msg = String(err?.message ?? "").toLowerCase()
  return (
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout")
  )
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error("Não autenticado")
  return data.user.id
}

async function sendToServer(userId: string, log: PendingLog) {
  const { error } = await supabase.from("logs").insert({
    user_id: userId,
    client_uuid: log.client_uuid,
    type: log.type,
    cargo_id: log.cargo_id ?? null,
    points_awarded: log.points_awarded,
    payload: log.payload ?? null,
    // created_at is handled by default now() in DB or we can pass it if we want to preserve client time
    // For now letting DB decide time, but client_uuid ensures uniqueness.
  })

  if (error) throw error
}

export const logsService = {
  async createLogOnlineOrQueue(params: {
    type: string
    cargo_id?: number | null
    points_awarded: number
    payload?: any
  }): Promise<{ status: "sent" | "queued"; client_uuid: string }> {
    const client_uuid = newUuid()

    const log: PendingLog = {
      client_uuid,
      type: params.type,
      cargo_id: params.cargo_id ?? null,
      points_awarded: params.points_awarded,
      payload: params.payload ?? null,
      created_at_client: new Date().toISOString(),
    }

    try {
      const userId = await getUserId()

      // Resolve cargo_id if missing (essential fix)
      if (!log.cargo_id) {
         const { data: cargoData } = await supabase
          .from('profiles')
          .select('cargo_id')
          .eq('id', userId)
          .single()
         if (cargoData?.cargo_id) {
           log.cargo_id = cargoData.cargo_id
         }
      }

      await sendToServer(userId, log)
      console.log('Log synced to Supabase')
      return { status: "sent", client_uuid }
    } catch (e: any) {
      if (isDuplicateError(e)) {
        console.log('Log duplicate (success)')
        return { status: "sent", client_uuid }
      }
      if (isNetworkError(e)) {
        console.warn('Network error, queueing log')
        enqueue(log)
        return { status: "queued", client_uuid }
      }
      // erro real: ainda assim enfileira para não perder (opcional)
      console.error('Unknown error, queueing just in case:', e)
      enqueue(log)
      return { status: "queued", client_uuid }
    }
  },

  async syncPendingLogs(): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return

    let userId: string
    try {
      userId = await getUserId()
    } catch {
      return
    }

    const queue = loadQueue()
    if (queue.length === 0) return
    console.log(`Syncing ${queue.length} pending logs...`)

    for (const item of queue) {
      try {
        await sendToServer(userId, item)
        dequeue(item.client_uuid)
      } catch (e: any) {
        if (isDuplicateError(e)) {
          dequeue(item.client_uuid)
          continue
        }
        if (isNetworkError(e)) {
          return // para e tenta depois
        }
        // erro inesperado: para para não loopar
        console.error('Fatal sync error for item:', item, e)
        return
      }
    }
    console.log('Sync processing finished')
  },
  
  // Legacy/Helper
  async fetchLogs(userId: string) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
