/**
 * Modelo de dominio: Resumen de Capital del Inversor
 * Representa la métrica calculada de fondos, inversiones y capital disponible.
 */
export interface CapitalOverview {
  totalInvestments: number;
  totalInvested: number;
  maxInvestmentLimit: number | null;
  availableCapital: number | null;
  pendingAmount: number;
  completedInvestments: number;
}
