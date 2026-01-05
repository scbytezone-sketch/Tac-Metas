import type { Role } from '../app/types'

const META_MAP: Record<Role, number> = {
  TECNICO_MANUTENCAO: 70,
  TECNICO_INSTALACAO: 85,
  AJUDANTE_MANUTENCAO: 70,
  AJUDANTE_INSTALACAO: 85,
}

export function getMetaByRole(role?: Role) {
  if (!role) return 85 // Default fallback to prevent division by zero or NaN
  return META_MAP[role] || 85
}

export function listRoles() {
  return Object.entries(META_MAP).map(([key, value]) => ({ key: key as Role, value }))
}
