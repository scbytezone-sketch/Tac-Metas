const KEY = "pending_logs_v1";

export type PendingLog = {
  client_uuid: string;
  type: string;
  cargo_id?: number | null;
  points_awarded: number;
  payload?: any;
  created_at_client: string; // ISO
};

export function loadQueue(): PendingLog[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQueue(items: PendingLog[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function enqueue(item: PendingLog) {
  const q = loadQueue();
  if (q.some(x => x.client_uuid === item.client_uuid)) return; // anti-dup local
  q.push(item);
  saveQueue(q);
}

export function dequeue(client_uuid: string) {
  const q = loadQueue().filter(x => x.client_uuid !== client_uuid);
  saveQueue(q);
}

export function clearQueue() {
  localStorage.removeItem(KEY);
}
