import type { Complexity, ServiceType } from '../app/types'

interface Rule {
  label: string
  base: number
  byComplexity?: Record<Complexity, number>
}

export const POINTS_RULES: Record<ServiceType, Rule> = {
  INSTALACAO: {
    label: 'Instalação',
    base: 1,
    byComplexity: {
      SIMPLES: 1.0,
      COMPLEXA: 1.5,
    },
  },
  MANUTENCAO: {
    label: 'Manutenção',
    base: 0.6,
    byComplexity: {
      SIMPLES: 0.6,
      COMPLEXA: 1.0,
    },
  },
  RETIRADA: {
    label: 'Retirada',
    base: 0.3,
  },
}

export function computePoints(
  serviceType: ServiceType,
  complexity: Complexity,
) {
  const rule = POINTS_RULES[serviceType]
  if (!rule) return 0
  if (rule.byComplexity) {
    return rule.byComplexity[complexity]
  }
  return rule.base
}
