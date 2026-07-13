import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  MinusIcon,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: TorreOperacional,
});

type Status = "success" | "warning" | "danger";

const statusStyles: Record<Status, { dot: string; text: string; soft: string; label: string }> = {
  success: {
    dot: "bg-success",
    text: "text-success",
    soft: "bg-success-soft text-success",
    label: "No alvo",
  },
  warning: {
    dot: "bg-warning",
    text: "text-warning-foreground",
    soft: "bg-warning-soft text-warning-foreground",
    label: "Atenção",
  },
  danger: {
    dot: "bg-danger",
    text: "text-danger",
    soft: "bg-danger-soft text-danger",
    label: "Crítico",
  },
};

function StatusPill({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${s.soft}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Trend({
  direction,
  value,
  goodWhen = "down",
}: {
  direction: "up" | "down" | "flat";
  value: string;
  goodWhen?: "up" | "down";
}) {
  const isGood =
    direction === "flat"
      ? true
      : goodWhen === "down"
        ? direction === "down"
        : direction === "up";
  const color =
    direction === "flat"
      ? "text-muted-foreground"
      : isGood
        ? "text-success"
        : "text-danger";
  const Icon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : MinusIcon;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <Icon className="h-4 w-4" strokeWidth={2.25} />
      {value}
    </span>
  );
}

function Card({
  children,
  className = "",
  interactive = true,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-2xl border border-border bg-card p-6 transition-all ${
        interactive
          ? "cursor-pointer hover:border-primary/40 hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground/80">{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

function TimeMetric({
  icon,
  title,
  value,
  unit,
  target,
  status,
  trend,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  value: string;
  unit: string;
  target: string;
  status: Status;
  trend: { direction: "up" | "down" | "flat"; value: string };
}) {
  const s = statusStyles[status];
  return (
    <Card>
      <CardHeader icon={icon} title={title} right={<StatusPill status={status} />} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <span className="text-lg font-medium text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Meta: {target}</span>
        <Trend direction={trend.direction} value={trend.value} goodWhen="down" />
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${s.dot}`}
          style={{
            width:
              status === "success" ? "45%" : status === "warning" ? "72%" : "92%",
          }}
        />
      </div>
    </Card>
  );
}

// ----- OTD por Origem/Destino -----
type Rota = { origem: string; destino: string; otd: number; viagens: number };

const rotas: Rota[] = [
  { origem: "Guarulhos", destino: "Fortaleza", otd: 68.2, viagens: 42 },
  { origem: "Cajamar", destino: "Recife", otd: 74.5, viagens: 38 },
  { origem: "Osasco", destino: "Salvador", otd: 81.9, viagens: 55 },
  { origem: "Ribeirão Preto", destino: "Goiânia", otd: 86.4, viagens: 64 },
  { origem: "Extrema", destino: "Rio de Janeiro", otd: 91.7, viagens: 128 },
  { origem: "Campinas", destino: "Belo Horizonte", otd: 94.1, viagens: 96 },
  { origem: "São Paulo", destino: "Curitiba", otd: 96.8, viagens: 152 },
];

function otdStatus(v: number): Status {
  if (v < 80) return "danger";
  if (v < 90) return "warning";
  return "success";
}

function OTDRotasCard() {
  const sorted = [...rotas].sort((a, b) => a.otd - b.otd);
  return (
    <Card className="row-span-2">
      <CardHeader
        icon={Truck}
        title="OTD por Origem × Destino"
        subtitle="Pior desempenho no topo"
        right={
          <span className="text-[11px] font-medium text-muted-foreground">
            {sorted.length} rotas
          </span>
        }
      />
      <div className="-mx-2 mt-2 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-x-4 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Origem</span>
          <span>Destino</span>
          <span className="text-right">Viagens</span>
          <span className="text-right">OTD</span>
        </div>
        <div className="divide-y divide-border">
          {sorted.map((r) => {
            const s = otdStatus(r.otd);
            return (
              <div
                key={`${r.origem}-${r.destino}`}
                className="group/row grid grid-cols-[1fr_1fr_auto_auto] items-center gap-x-4 px-2 py-3 text-sm transition-colors hover:bg-muted/60"
              >
                <span className="truncate font-medium">{r.origem}</span>
                <span className="truncate text-muted-foreground">{r.destino}</span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {r.viagens}
                </span>
                <span
                  className={`flex items-center justify-end gap-2 text-right font-semibold tabular-nums ${statusStyles[s].text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[s].dot}`} />
                  {r.otd.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ----- OTD Cliente -----
function OTDClienteCard() {
  const value = 92.4;
  const meta = 95;
  const status: Status = value >= meta ? "success" : value >= 90 ? "warning" : "danger";
  return (
    <Card className="row-span-2">
      <CardHeader
        icon={PackageCheck}
        title="OTD Cliente"
        subtitle="On-Time Delivery consolidado"
        right={<StatusPill status={status} />}
      />
      <div className="mt-2 flex items-end gap-3">
        <span className="text-7xl font-semibold tracking-tight tabular-nums">
          {value.toFixed(1)}
          <span className="text-3xl text-muted-foreground">%</span>
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Trend direction="up" value="+1.8 p.p. vs semana anterior" goodWhen="up" />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-medium text-foreground">Meta {meta}%</span>
          <span>100%</span>
        </div>
        <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${value}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/80"
            style={{ left: `${meta}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
        {[
          { label: "Hoje", value: "94.1%" },
          { label: "Semana", value: "92.4%" },
          { label: "Mês", value: "91.6%" },
        ].map((k) => (
          <div key={k.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ----- Viagens Atrasadas -----
function ViagensAtrasadasCard() {
  const noPrazo = 428;
  const atrasadas = 63;
  const total = noPrazo + atrasadas;
  const pctPrazo = (noPrazo / total) * 100;
  const pctAtraso = 100 - pctPrazo;
  const status: Status = pctAtraso > 15 ? "danger" : pctAtraso > 8 ? "warning" : "success";

  return (
    <Card className="col-span-2">
      <CardHeader
        icon={Clock}
        title="Viagens · Prazo vs Atraso"
        subtitle="Janela últimas 24h"
        right={<StatusPill status={status} />}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr_2fr] md:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-success">
            No prazo
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums">{noPrazo}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {pctPrazo.toFixed(1)}%
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-danger">
            Atrasadas
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums text-danger">
              {atrasadas}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {pctAtraso.toFixed(1)}%
            </span>
          </p>
        </div>

        <div>
          <div className="flex h-10 w-full overflow-hidden rounded-xl bg-muted">
            <div
              className="flex items-center justify-start bg-success pl-3 text-xs font-semibold text-success-foreground"
              style={{ width: `${pctPrazo}%` }}
            >
              {pctPrazo.toFixed(0)}%
            </div>
            <div
              className="flex items-center justify-end bg-danger pr-3 text-xs font-semibold text-danger-foreground"
              style={{ width: `${pctAtraso}%` }}
            >
              {pctAtraso.toFixed(0)}%
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total monitorado: {total} viagens</span>
            <Trend direction="down" value="-4 atrasadas vs ontem" goodWhen="down" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ----- Filtros -----
function FiltersBar() {
  const [open, setOpen] = useState(false);
  const filtros = [
    { label: "Período", value: "Últimas 24h" },
    { label: "Filial", value: "Todas" },
    { label: "Cliente", value: "Todos" },
    { label: "Origem", value: "Todas" },
    { label: "Destino", value: "Todos" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium">
          <Filter className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          Filtros
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {filtros.length}
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {open ? "Recolher" : "Expandir"}
          {open ? (
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          )}
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 border-t border-border p-4 md:grid-cols-5">
          {filtros.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f.label}
              </p>
              <p className="mt-0.5 font-medium">{f.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function TorreOperacional() {
  const now = useNow();
  const timeString = useMemo(
    () =>
      now.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [now],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1800px] px-6 py-6 lg:px-10 lg:py-8">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Dellmar Transportes
              </p>
              <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                Torre Operacional
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-muted-foreground">Ao vivo</span>
              <span className="h-3 w-px bg-border" />
              <span className="font-medium tabular-nums">{timeString}</span>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Atualizar"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="mt-6">
          <FiltersBar />
        </div>

        <main className="mt-8 space-y-10">
        {/* Seção 1 · Indicadores de Entrega */}
        <SectionHeader
          eyebrow="Nível 1"
          title="Indicadores de Entrega"
          description="Visão consolidada de OTD por cliente e por rota"
        />
        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-5">
          <div className="lg:col-span-2">
            <OTDClienteCard />
          </div>
          <div className="lg:col-span-3">
            <OTDRotasCard />
          </div>
        </section>

        {/* Seção 2 · Tempos Operacionais */}
        <SectionHeader
          eyebrow="Nível 2"
          title="Tempos Operacionais"
          description="Ciclos médios das operações-chave"
        />
        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <TimeMetric
            icon={PackageOpen}
            title="Carregamento"
            value="2h 14"
            unit="min"
            target="≤ 2h"
            status="warning"
            trend={{ direction: "up", value: "+8 min" }}
          />
          <TimeMetric
            icon={PackageCheck}
            title="Descarregamento"
            value="1h 48"
            unit="min"
            target="≤ 2h"
            status="success"
            trend={{ direction: "down", value: "-12 min" }}
          />
          <TimeMetric
            icon={Wrench}
            title="Manutenção"
            value="6h 32"
            unit="min"
            target="≤ 5h"
            status="danger"
            trend={{ direction: "up", value: "+42 min" }}
          />
          <TimeMetric
            icon={Timer}
            title="Emissão de Documentos"
            value="38"
            unit="min"
            target="≤ 30 min"
            status="warning"
            trend={{ direction: "down", value: "-4 min" }}
          />
        </section>

        {/* Seção 3 · Fluxo de Viagens */}
        <SectionHeader
          eyebrow="Nível 3"
          title="Fluxo de Viagens"
          description="Aderência a prazos e giro entre operações"
        />
        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <ViagensAtrasadasCard />
          <Card>
            <CardHeader
              icon={RefreshCw}
              title="Descarga → Novo Carregamento"
              subtitle="Tempo de giro entre operações"
              right={<StatusPill status="success" />}
            />
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-tight tabular-nums">
                    9h 12
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">
                    min
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <Trend direction="down" value="-38 min vs semana" goodWhen="down" />
                  <span className="text-muted-foreground">Meta: ≤ 10h</span>
                </div>
              </div>
              <div className="hidden items-end gap-1.5 md:flex">
                {[7, 9, 6, 10, 8, 7, 9, 11, 8, 6, 7, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-full bg-primary/70"
                    style={{ height: `${h * 6}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Melhor filial
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-semibold">
                  Extrema{" "}
                  <ArrowDownRight className="h-4 w-4 text-success" strokeWidth={2} />
                </p>
                <p className="text-xs text-muted-foreground">6h 40 min</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pior filial
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-semibold">
                  Fortaleza{" "}
                  <ArrowUpRight className="h-4 w-4 text-danger" strokeWidth={2} />
                </p>
                <p className="text-xs text-muted-foreground">14h 22 min</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Frota parada
                </p>
                <p className="mt-1 text-base font-semibold tabular-nums">18 veículos</p>
                <p className="text-xs text-muted-foreground">3.2% da frota</p>
              </div>
            </div>
          </Card>
        </section>

        <footer className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Torre Operacional Dellmar · v1.0</span>
          <span>Atualização automática a cada 30s</span>
        </footer>
      </div>
    </div>
  );
}
