import { describe, it, expect } from "vitest";
import { calcular } from "@/lib/acoustics";

describe("exemplo do artigo (Rindel 2019)", () => {
  const r = calcular({ comp: 20, larg: 15, pd: 3, n: 100, alfaPiso: 0, alfaParede: 0, alfaForro: 0, tMedido: 1.2 });
  it("A_vazia", () => expect(r.aVazia).toBeCloseTo(120.75, 1));
  it("A_total", () => expect(r.aTotal).toBeCloseTo(155.75, 1));
  it("ruído", () => expect(r.LN).toBeCloseTo(78.3, 1));
  it("SNR", () => expect(r.SNR).toBeCloseTo(-6.6, 0));
  it("capacidade", () => expect(Math.round(r.Nmax)).toBe(38));
  it("meta classe C", () => expect(r.Tc).toBeCloseTo(0.57, 2));
  it("classe E", () => expect(r.cls).toBe("E"));
});
