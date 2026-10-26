// Motor de cálculo — Rindel (2019) + Sabine
export const AP = 0.35; // m² por pessoa sentada
export const G = 3.5; // tamanho médio dos grupos
export const Q = 2;
export const R = 1;
export const SNR_MIN = -3;
export const ALPHA_TRAT = 0.9;

export type Classe = "A" | "B" | "C" | "D" | "E";
export const CLASSES: { c: Classe; max: number }[] = [
  { c: "A", max: 0.025 },
  { c: "B", max: 0.04 },
  { c: "C", max: 0.063 },
  { c: "D", max: 0.1 },
];

export const MATERIAIS: { nome: string; alfa: number }[] = [
  { nome: "Concreto aparente", alfa: 0.02 },
  { nome: "Cerâmica / porcelanato", alfa: 0.02 },
  { nome: "Piso vinílico", alfa: 0.03 },
  { nome: "Madeira (assoalho)", alfa: 0.1 },
  { nome: "Carpete", alfa: 0.3 },
  { nome: "Alvenaria rebocada pintada", alfa: 0.03 },
  { nome: "Drywall / gesso acartonado", alfa: 0.08 },
  { nome: "Vidro", alfa: 0.04 },
  { nome: "Madeira perfurada", alfa: 0.55 },
  { nome: "Forro de gesso liso", alfa: 0.05 },
  { nome: "Forro mineral acústico", alfa: 0.7 },
  { nome: "Lã de rocha com tecido", alfa: 0.9 },
];

export function classe(indice: number): Classe {
  for (const k of CLASSES) if (indice <= k.max) return k.c;
  return "E";
}

export interface Entrada {
  comp: number;
  larg: number;
  pd: number;
  n: number;
  alfaPiso: number;
  alfaParede: number;
  alfaForro: number;
  tMedido?: number | null;
  aExtra?: number; // absorção adicional (m²)
}

export function calcular(e: Entrada) {
  const V = e.comp * e.larg * e.pd;
  const sPiso = e.comp * e.larg;
  const sForro = sPiso;
  const sParede = 2 * (e.comp + e.larg) * e.pd;
  const aMat = sPiso * e.alfaPiso + sParede * e.alfaParede + sForro * e.alfaForro;
  const aBase = e.tMedido && e.tMedido > 0 ? (0.161 * V) / e.tMedido : aMat;
  const aVazia = aBase + (e.aExtra ?? 0);
  const T = (0.161 * V) / aVazia;
  const N = Math.max(e.n, 1);
  const aTotal = aVazia + N * AP;
  const T_ocupada = (0.161 * V) / aTotal;
  const LN = 93 - 20 * Math.log10((aTotal * G) / N);
  const SNR = 10 * Math.log10((Q * aTotal * G) / (16 * Math.PI * R * R * N));
  const Lfala = LN + SNR;
  const Nmax = V / (20 * T);
  const indice = (T * N) / V;
  const cls = classe(indice);
  const Tc = (0.063 * V) / N;
  const aMeta = (0.161 * V) / Tc;
  const m2Faltam = Math.max(0, (aMeta - aVazia) / ALPHA_TRAT);
  return { V, sPiso, sParede, sForro, aMat, aVazia, aTotal, T, T_ocupada, LN, SNR, Lfala, Nmax, indice, cls, Tc, m2Faltam };
}

export type Resultado = ReturnType<typeof calcular>;
