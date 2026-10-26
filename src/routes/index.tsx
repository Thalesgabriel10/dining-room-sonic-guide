import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  AudioWaveform, Ruler, Users, Layers, Timer, Volume2, UsersRound, BadgeCheck,
  FlaskConical, Lightbulb, FileText, Copy, Printer, X, BookOpen,
} from "lucide-react";
import { calcular, MATERIAIS, CLASSES, ALPHA_TRAT, SNR_MIN, type Classe, type Resultado } from "@/lib/acoustics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RestoAcoust Calc — Acústica de restaurantes" },
      { name: "description", content: "Calcule RT60, ruído com efeito Lombard, capacidade acústica e classe de qualidade (Rindel 2019) para restaurantes." },
      { property: "og:title", content: "RestoAcoust Calc" },
      { property: "og:description", content: "Engenharia acústica para restaurantes: Sabine + modelo de Rindel." },
    ],
  }),
  component: App,
});

const PERFIS = [
  { id: "calmo", nome: "Restaurante sofisticado / calmo", meta: "B" as Classe },
  { id: "familiar", nome: "Restaurante familiar movimentado", meta: "C" as Classe },
  { id: "bar", nome: "Bar / Choperia animado", meta: "D" as Classe },
];

const f = (x: number, d = 2) => (isFinite(x) ? x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");

type Sup = { idx: number; custom: string };

function App() {
  const [comp, setComp] = useState("12");
  const [larg, setLarg] = useState("8");
  const [pd, setPd] = useState("3");
  const [n, setN] = useState("60");
  const [perfil, setPerfil] = useState("familiar");
  const [tMed, setTMed] = useState("");
  const [piso, setPiso] = useState<Sup>({ idx: 1, custom: "" });
  const [parede, setParede] = useState<Sup>({ idx: 5, custom: "" });
  const [forro, setForro] = useState<Sup>({ idx: 9, custom: "" });
  const [painel, setPainel] = useState(0);
  const [modal, setModal] = useState(false);

  const alfa = (s: Sup) => (s.idx === -1 ? Number(s.custom.replace(",", ".")) || 0 : MATERIAIS[s.idx].alfa);
  const num = (s: string) => Number(s.replace(",", ".")) || 0;

  const base = {
    comp: num(comp), larg: num(larg), pd: num(pd), n: Math.max(1, Math.round(num(n))),
    alfaPiso: alfa(piso), alfaParede: alfa(parede), alfaForro: alfa(forro),
    tMedido: tMed ? num(tMed) : null,
  };
  const r = useMemo(() => calcular(base), [JSON.stringify(base)]);
  const sim = useMemo(() => calcular({ ...base, aExtra: painel * 0.85 }), [JSON.stringify(base), painel]);
  const perfilObj = PERFIS.find((p) => p.id === perfil)!;

  const exemplo = () => {
    setComp("20"); setLarg("15"); setPd("3"); setN("100"); setTMed("1,2"); setPainel(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-header text-header-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary p-2"><AudioWaveform className="h-5 w-5" /></div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">RestoAcoust Calc</h1>
              <p className="text-xs opacity-70">Engenharia acústica para restaurantes · Sabine + Rindel (2019)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exemplo} className="inline-flex items-center gap-2 rounded-md border border-header-foreground/30 px-3 py-2 text-sm hover:bg-header-foreground/10">
              <BookOpen className="h-4 w-4" /> Exemplo do artigo
            </button>
            <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <FileText className="h-4 w-4" /> Gerar Relatório Técnico Resumido
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card title="Dimensões do salão" icon={<Ruler className="h-4 w-4" />}>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Comprimento (m)" v={comp} set={setComp} />
              <Field label="Largura (m)" v={larg} set={setLarg} />
              <Field label="Pé-direito (m)" v={pd} set={setPd} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-muted p-3 font-mono text-xs">
              <span>Volume V</span><span className="text-right">{f(r.V, 1)} m³</span>
              <span>Piso</span><span className="text-right">{f(r.sPiso, 1)} m²</span>
              <span>Paredes</span><span className="text-right">{f(r.sParede, 1)} m²</span>
              <span>Forro</span><span className="text-right">{f(r.sForro, 1)} m²</span>
            </div>
          </Card>

          <Card title="Ocupação e perfil" icon={<Users className="h-4 w-4" />}>
            <Field label="Clientes sentados (N)" v={n} set={setN} />
            <label className="mt-3 block text-xs font-medium text-muted-foreground">Tipo de ambiente</label>
            <select value={perfil} onChange={(e) => setPerfil(e.target.value)} className={inputCls}>
              {PERFIS.map((p) => <option key={p.id} value={p.id}>{p.nome} (meta classe {p.meta})</option>)}
            </select>
          </Card>

          <Card title="Materiais de acabamento" icon={<Layers className="h-4 w-4" />}>
            <MatSel label="Piso" s={piso} set={setPiso} />
            <MatSel label="Paredes" s={parede} set={setParede} />
            <MatSel label="Forro" s={forro} set={setForro} />
            <div className="mt-3 border-t pt-3">
              <Field label="T medido da sala vazia (s) — opcional" v={tMed} set={setTMed} placeholder="ex: 1,2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {tMed ? "Usando o T medido no lugar dos materiais." : `A dos materiais: ${f(r.aMat, 1)} m²`}
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={<Timer className="h-4 w-4" />} label="RT60 sala vazia" value={`${f(r.T)} s`} sub={`Ocupada: ${f(r.T_ocupada)} s`} />
            <Kpi icon={<Volume2 className="h-4 w-4" />} label="Ruído previsto (Lombard)" value={`${f(r.LN, 1)} dBA`} sub={`SNR a 1 m: ${f(r.SNR, 1)} dB`} />
            <Kpi icon={<UsersRound className="h-4 w-4" />} label="Capacidade acústica" value={`${Math.round(r.Nmax)} pessoas`} sub={`Ocupação atual: ${base.n}`} />
            <ClasseCard r={r} meta={perfilObj.meta} />
          </div>

          <Card title="Indicadores detalhados" icon={<AudioWaveform className="h-4 w-4" />}>
            <div className="grid gap-x-8 gap-y-1 font-mono text-sm sm:grid-cols-2">
              <Row k="A vazia (Σ S·α)" v={`${f(r.aVazia, 1)} m²`} />
              <Row k="A total (+ N·0,35)" v={`${f(r.aTotal, 1)} m²`} />
              <Row k="Nível de fala a 1 m" v={`${f(r.Lfala, 1)} dBA`} />
              <Row k="SNR mínimo de projeto" v={`${SNR_MIN} dB`} />
              <Row k="Índice T·N/V" v={`${f(r.indice, 3)} s/m³`} />
              <Row k="Meta classe C (T_C)" v={`${f(r.Tc)} s`} />
            </div>
            <ClasseEscala indice={r.indice} />
          </Card>

          <Card title="Sugestão automática de tratamento" icon={<Lightbulb className="h-4 w-4" />}>
            {r.m2Faltam > 0 ? (
              <p className="text-sm">
                O T da sala vazia (<b>{f(r.T)} s</b>) está acima da meta de classe C (<b>{f(r.Tc)} s</b>).
                Faltam aproximadamente <b className="text-primary">{f(r.m2Faltam, 1)} m²</b> de material absorvente com α = {f(ALPHA_TRAT)} (ex: lã de rocha revestida, forro mineral de alto desempenho).
                {r.m2Faltam > r.sForro && " Atenção: a área necessária supera a área do forro — combine forro e paredes."}
              </p>
            ) : (
              <p className="text-sm text-success">✓ O salão atende à meta de classe C (T ≤ {f(r.Tc)} s). Nenhum tratamento adicional obrigatório.</p>
            )}
          </Card>

          <Card title="Simulador de intervenção — e se…" icon={<FlaskConical className="h-4 w-4" />}>
            <p className="text-sm text-muted-foreground">E se eu adicionar <b className="text-foreground">{painel} m²</b> de painéis acústicos no forro (NRC 0,85)?</p>
            <input type="range" min={0} max={Math.max(10, Math.ceil(r.sForro))} value={painel} onChange={(e) => setPainel(Number(e.target.value))} className="mt-3 w-full accent-primary" />
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Cmp label="RT60" a={`${f(r.T)} s`} b={`${f(sim.T)} s`} />
              <Cmp label="Ruído" a={`${f(r.LN, 1)} dBA`} b={`${f(sim.LN, 1)} dBA`} />
              <Cmp label="Capacidade" a={`${Math.round(r.Nmax)}`} b={`${Math.round(sim.Nmax)}`} />
              <Cmp label="Classe" a={r.cls} b={sim.cls} />
            </div>
          </Card>
        </div>
      </main>

      {modal && <Relatorio r={r} base={base} perfil={perfilObj.nome} close={() => setModal(false)} tMed={!!tMed} />}
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><span className="text-primary">{icon}</span>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, v, set, placeholder }: { label: string; v: string; set: (s: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input inputMode="decimal" value={v} placeholder={placeholder} onChange={(e) => set(e.target.value)} className={inputCls} />
    </label>
  );
}

function MatSel({ label, s, set }: { label: string; s: Sup; set: (s: Sup) => void }) {
  return (
    <div className="mb-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        <select value={s.idx} onChange={(e) => set({ ...s, idx: Number(e.target.value) })} className={inputCls}>
          {MATERIAIS.map((m, i) => <option key={m.nome} value={i}>{m.nome} (α {f(m.alfa)})</option>)}
          <option value={-1}>Personalizado…</option>
        </select>
        {s.idx === -1 && <input value={s.custom} placeholder="α" onChange={(e) => set({ ...s, custom: e.target.value })} className={inputCls + " w-20"} />}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-primary">{icon}</span>{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

const corClasse = (c: Classe) => (c === "A" || c === "B" ? "bg-success" : c === "C" ? "bg-warning" : "bg-destructive");
const descClasse: Record<Classe, string> = { A: "Excelente", B: "Bom", C: "Regular (mínimo aceitável)", D: "Insuficiente", E: "Ruim" };

function ClasseCard({ r, meta }: { r: Resultado; meta: Classe }) {
  const ok = r.cls <= meta;
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><BadgeCheck className="h-4 w-4 text-primary" />Classe acústica</div>
      <div className="mt-2 flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-primary-foreground ${corClasse(r.cls)}`}>{r.cls}</span>
        <span className="text-sm font-medium">{descClasse[r.cls]}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">Meta do perfil: {meta} · {ok ? "atende" : "não atende"}</div>
    </div>
  );
}

function ClasseEscala({ indice }: { indice: number }) {
  const all: Classe[] = ["A", "B", "C", "D", "E"];
  const c = CLASSES.find((k) => indice <= k.max)?.c ?? "E";
  return (
    <div className="mt-4 flex gap-1">
      {all.map((k, i) => (
        <div key={k} className={`flex-1 rounded px-2 py-1.5 text-center text-xs ${k === c ? `${corClasse(k)} font-bold text-primary-foreground` : "bg-muted text-muted-foreground"}`}>
          {k} {i < 4 ? `≤ ${f(CLASSES[i].max, 3)}` : "> 0,100"}
        </div>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-dashed py-1"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}

function Cmp({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm"><span className="text-muted-foreground line-through decoration-1">{a}</span> → <b>{b}</b></div>
    </div>
  );
}

function Relatorio({ r, base, perfil, close, tMed }: { r: Resultado; base: ReturnType<typeof Object>; perfil: string; close: () => void; tMed: boolean }) {
  const b = base as { comp: number; larg: number; pd: number; n: number; alfaPiso: number; alfaParede: number; alfaForro: number };
  const txt = `MEMORIAL DE CÁLCULO ACÚSTICO — RestoAcoust Calc
Data: ${new Date().toLocaleDateString("pt-BR")}
Referência: Rindel, J. H. (2019) — modelo de capacidade acústica de restaurantes

1. GEOMETRIA
Dimensões: ${f(b.comp)} x ${f(b.larg)} m, pé-direito ${f(b.pd)} m
Volume V = ${f(r.V, 1)} m³
Áreas: piso ${f(r.sPiso, 1)} m² | paredes ${f(r.sParede, 1)} m² | forro ${f(r.sForro, 1)} m²

2. OCUPAÇÃO
Perfil: ${perfil}
Clientes sentados N = ${b.n}

3. ABSORÇÃO E REVERBERAÇÃO (Sabine)
${tMed ? `T medido (sala vazia) = ${f(r.T)} s  →  A_vazia = 0,161·V/T` : `α piso ${f(b.alfaPiso)} | α paredes ${f(b.alfaParede)} | α forro ${f(b.alfaForro)}\nA_vazia = Σ S·α`}
A_vazia = ${f(r.aVazia, 1)} m²
T (sala vazia) = 0,161·V/A_vazia = ${f(r.T)} s
A_total = A_vazia + N·0,35 = ${f(r.aTotal, 1)} m²

4. RUÍDO (Efeito Lombard, g = 3,5)
L_N = 93 − 20·log10(A_total·g/N) = ${f(r.LN, 1)} dBA
SNR (1 m, Q=2) = 10·log10(Q·A_total·g/(16π·r²·N)) = ${f(r.SNR, 1)} dB  (mín. projeto −3 dB)
Nível de fala a 1 m = ${f(r.Lfala, 1)} dBA

5. CAPACIDADE E CLASSE
N_max = V/(20·T) = ${f(r.Nmax, 1)} ≈ ${Math.round(r.Nmax)} pessoas
Índice T·N/V = ${f(r.indice, 3)} s/m³  →  Classe ${r.cls} (${descClasse[r.cls]})
Meta classe C: T_C = 0,063·V/N = ${f(r.Tc)} s

6. RECOMENDAÇÃO
${r.m2Faltam > 0 ? `Instalar ≈ ${f(r.m2Faltam, 1)} m² de material com α = 0,90 para atingir T_C.` : "Atende à classe C. Sem tratamento adicional obrigatório."}
`;
  const [ok, setOk] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={close}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Relatório técnico resumido</h3>
          <button onClick={close} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <pre id="relatorio" className="flex-1 overflow-auto whitespace-pre-wrap bg-card p-4 font-mono text-xs leading-relaxed">{txt}</pre>
        <div className="flex justify-end gap-2 border-t p-4">
          <button onClick={() => { navigator.clipboard.writeText(txt); setOk(true); }} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <Copy className="h-4 w-4" /> {ok ? "Copiado!" : "Copiar"}
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
