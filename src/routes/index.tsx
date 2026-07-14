import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToXlsx } from "@/lib/export-xlsx";

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
    direction === "flat" ? true : goodWhen === "down" ? direction === "down" : direction === "up";
  const color =
    direction === "flat" ? "text-muted-foreground" : isGood ? "text-success" : "text-danger";
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : MinusIcon;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <Icon className="h-4 w-4" strokeWidth={2.25} />
      {value}
    </span>
  );
}

type AnalyticalTable = {
  title: string;
  description?: string;
  columns: Array<{ label: string; numeric?: boolean }>;
  rows: string[][];
};

const carregamentoAnalytics: AnalyticalTable = {
  title: "Analítico de Carregamento por Veículo",
  description: "Veículos em operação de carregamento e seus respectivos tempos.",
  columns: [
    { label: "Veículo" },
    { label: "MDF-e" },
    { label: "Cliente" },
    { label: "Remetente" },
    { label: "Destinatário" },
    { label: "Início do carregamento" },
    { label: "Fim do carregamento" },
    { label: "Tempo de carregamento" },
    { label: "Status" },
  ],
  rows: [
    [
      "RVM-4A82",
      "48219",
      "Nestlé",
      "CD Cajamar",
      "Atacadão Fortaleza",
      "14/07/2026 05:42",
      "14/07/2026 07:51",
      "2h 09 min",
      "Concluído",
    ],
    [
      "GHT-7C21",
      "48227",
      "Ambev",
      "Fábrica Guarulhos",
      "CD Recife",
      "14/07/2026 06:05",
      "14/07/2026 08:31",
      "2h 26 min",
      "Concluído",
    ],
    [
      "FDP-9B14",
      "48234",
      "Unilever",
      "CD Osasco",
      "Distribuidor Salvador",
      "14/07/2026 06:48",
      "14/07/2026 09:02",
      "2h 14 min",
      "Concluído",
    ],
    [
      "TLM-2E63",
      "48241",
      "P&G",
      "Planta Louveira",
      "CD Goiânia",
      "14/07/2026 07:20",
      "—",
      "2h 38 min",
      "Em andamento",
    ],
    [
      "QXZ-8D40",
      "48256",
      "Danone",
      "CD Extrema",
      "Rede Rio",
      "14/07/2026 08:12",
      "—",
      "1h 47 min",
      "Em andamento",
    ],
  ],
};

const emissaoDocumentosAnalytics: AnalyticalTable = {
  title: "Analítico de Emissão de Documentos por Veículo",
  description: "Solicitação e emissão do MDF-e para cada veículo liberado.",
  columns: [
    { label: "Veículo" },
    { label: "MDF-e" },
    { label: "Cliente" },
    { label: "Remetente" },
    { label: "Destinatário" },
    { label: "Solicitação" },
    { label: "Emissão" },
    { label: "Tempo de emissão" },
    { label: "Status" },
  ],
  rows: [
    [
      "LPR-6F18",
      "48261",
      "Coca-Cola",
      "Fábrica Jundiaí",
      "CD Curitiba",
      "14/07/2026 07:12",
      "14/07/2026 07:43",
      "31 min",
      "Emitido",
    ],
    [
      "EJK-3H72",
      "48268",
      "Heineken",
      "CD Itu",
      "Distribuidor BH",
      "14/07/2026 07:28",
      "14/07/2026 08:04",
      "36 min",
      "Emitido",
    ],
    [
      "NBD-5C09",
      "48273",
      "PepsiCo",
      "CD Sorocaba",
      "CD Recife",
      "14/07/2026 08:01",
      "14/07/2026 08:43",
      "42 min",
      "Emitido",
    ],
    [
      "AXM-8J44",
      "48280",
      "BRF",
      "Unidade Campinas",
      "CD Salvador",
      "14/07/2026 08:22",
      "14/07/2026 09:00",
      "38 min",
      "Emitido",
    ],
    [
      "KQS-2A57",
      "Pendente",
      "JBS",
      "Unidade Lins",
      "CD Fortaleza",
      "14/07/2026 08:47",
      "—",
      "51 min",
      "Em validação",
    ],
  ],
};

const descarregamentoAnalytics: AnalyticalTable = {
  title: "Analítico de Descarregamento por Veículo",
  description: "Veículos em descarga, documentos vinculados e tempos da operação.",
  columns: [
    { label: "Veículo" },
    { label: "MDF-e" },
    { label: "Cliente" },
    { label: "Remetente" },
    { label: "Destinatário" },
    { label: "Início da descarga" },
    { label: "Fim da descarga" },
    { label: "Tempo de descarga" },
    { label: "Status" },
  ],
  rows: [
    [
      "BCD-1K93",
      "48172",
      "Nestlé",
      "CD Cajamar",
      "Atacadão Fortaleza",
      "14/07/2026 04:31",
      "14/07/2026 06:12",
      "1h 41 min",
      "Concluído",
    ],
    [
      "HNV-7E26",
      "48189",
      "Ambev",
      "Fábrica Guarulhos",
      "CD Recife",
      "14/07/2026 05:08",
      "14/07/2026 07:03",
      "1h 55 min",
      "Concluído",
    ],
    [
      "PRT-9D51",
      "48196",
      "Unilever",
      "CD Osasco",
      "Distribuidor Salvador",
      "14/07/2026 05:44",
      "14/07/2026 07:32",
      "1h 48 min",
      "Concluído",
    ],
    [
      "MGL-4B67",
      "48203",
      "P&G",
      "Planta Louveira",
      "CD Goiânia",
      "14/07/2026 06:19",
      "—",
      "2h 07 min",
      "Em andamento",
    ],
    [
      "VKC-2F38",
      "48211",
      "Danone",
      "CD Extrema",
      "Rede Rio",
      "14/07/2026 07:02",
      "—",
      "1h 36 min",
      "Em andamento",
    ],
  ],
};

const manutencaoAnalytics: AnalyticalTable = {
  title: "Analítico de Manutenção por Veículo",
  description: "Veículos indisponíveis, ordens de serviço e previsão de liberação.",
  columns: [
    { label: "Veículo" },
    { label: "Ordem de serviço" },
    { label: "Tipo de manutenção" },
    { label: "Oficina / Filial" },
    { label: "Entrada" },
    { label: "Previsão de saída" },
    { label: "Tempo parado" },
    { label: "Responsável" },
    { label: "Status" },
  ],
  rows: [
    [
      "DFR-5G81",
      "OS-26147",
      "Freios",
      "Oficina Guarulhos",
      "14/07/2026 01:18",
      "14/07/2026 08:30",
      "7h 12 min",
      "Equipe A",
      "Em manutenção",
    ],
    [
      "XPT-3C46",
      "OS-26152",
      "Sistema elétrico",
      "Filial Cajamar",
      "14/07/2026 02:40",
      "14/07/2026 09:10",
      "6h 30 min",
      "Equipe B",
      "Em manutenção",
    ],
    [
      "JLM-8H29",
      "OS-26158",
      "Pneus",
      "Oficina Osasco",
      "14/07/2026 04:05",
      "14/07/2026 09:35",
      "5h 30 min",
      "Equipe C",
      "Aguardando peça",
    ],
    [
      "CQS-6A74",
      "OS-26161",
      "Revisão preventiva",
      "Filial Extrema",
      "14/07/2026 05:22",
      "14/07/2026 11:00",
      "5h 38 min",
      "Equipe A",
      "Em manutenção",
    ],
    [
      "WBN-1D53",
      "OS-26166",
      "Arrefecimento",
      "Oficina Campinas",
      "14/07/2026 06:10",
      "14/07/2026 13:40",
      "7h 30 min",
      "Equipe D",
      "Em diagnóstico",
    ],
  ],
};

function Card({
  children,
  className = "",
  interactive = true,
  analytics,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  analytics?: AnalyticalTable;
}) {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const canOpenAnalytics = interactive && Boolean(analytics);

  return (
    <>
      <div
        className={`group relative flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 transition-all ${
          canOpenAnalytics
            ? "cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            : ""
        } ${className}`}
        onClick={canOpenAnalytics ? () => setAnalyticsOpen(true) : undefined}
        onKeyDown={
          canOpenAnalytics
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setAnalyticsOpen(true);
                }
              }
            : undefined
        }
        role={canOpenAnalytics ? "button" : undefined}
        tabIndex={canOpenAnalytics ? 0 : undefined}
        aria-haspopup={canOpenAnalytics ? "dialog" : undefined}
        aria-label={analytics ? `Abrir análise de ${analytics.title}` : undefined}
      >
        {children}
      </div>

      {analytics && (
        <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
          <DialogContent className="h-[90vh] w-[96vw] max-w-[96vw] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-4 sm:max-w-[96vw] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <DialogHeader className="pr-8">
                <DialogTitle>{analytics.title}</DialogTitle>
                <DialogDescription>
                  {analytics.description ??
                    "Detalhamento analítico dos dados exibidos no indicador."}
                </DialogDescription>
              </DialogHeader>
              <button
                type="button"
                onClick={() =>
                  exportToXlsx(
                    analytics.title,
                    analytics.columns.map((column) => column.label),
                    analytics.rows,
                  )
                }
                className="mr-8 inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Extrair XLSX
              </button>
            </div>
            <div className="min-h-0 overflow-auto rounded-xl border border-border">
              <Table className="min-w-max">
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    {analytics.columns.map((column) => (
                      <TableHead
                        key={column.label}
                        className={
                          column.numeric ? "whitespace-nowrap text-right" : "whitespace-nowrap"
                        }
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.rows.map((row, rowIndex) => (
                    <TableRow key={`${analytics.title}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={`${rowIndex}-${analytics.columns[cellIndex]?.label}`}
                          className={
                            analytics.columns[cellIndex]?.numeric
                              ? "whitespace-nowrap text-right tabular-nums"
                              : "whitespace-nowrap"
                          }
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground/80">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
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
  analytics,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  value: string;
  unit: string;
  target: string;
  status: Status;
  trend: { direction: "up" | "down" | "flat"; value: string };
  analytics: AnalyticalTable;
}) {
  const s = statusStyles[status];
  return (
    <Card analytics={analytics}>
      <CardHeader icon={icon} title={title} right={<StatusPill status={status} />} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold tracking-tight tabular-nums">{value}</span>
        <span className="text-lg font-medium text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Meta: {target}</span>
          <Trend direction={trend.direction} value={trend.value} goodWhen="down" />
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${s.dot}`}
            style={{
              width: status === "success" ? "45%" : status === "warning" ? "72%" : "92%",
            }}
          />
        </div>
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
    <Card
      analytics={{
        title: "Analítico de OTD por Origem × Destino",
        description: "Viagens por veículo, documento e cumprimento do prazo de entrega.",
        columns: [
          { label: "Veículo" },
          { label: "MDF-e" },
          { label: "Cliente" },
          { label: "Origem" },
          { label: "Destino" },
          { label: "Entrega prevista" },
          { label: "Entrega realizada / previsão" },
          { label: "Desvio" },
          { label: "Status" },
        ],
        rows: [
          [
            "RVM-4A82",
            "48219",
            "Nestlé",
            "Guarulhos",
            "Fortaleza",
            "14/07/2026 06:00",
            "14/07/2026 08:14",
            "+2h 14 min",
            "Atrasada",
          ],
          [
            "GHT-7C21",
            "48227",
            "Ambev",
            "Cajamar",
            "Recife",
            "14/07/2026 07:30",
            "14/07/2026 08:42",
            "+1h 12 min",
            "Atrasada",
          ],
          [
            "FDP-9B14",
            "48234",
            "Unilever",
            "Osasco",
            "Salvador",
            "14/07/2026 09:00",
            "14/07/2026 09:38",
            "+38 min",
            "Atrasada",
          ],
          [
            "TLM-2E63",
            "48241",
            "P&G",
            "Ribeirão Preto",
            "Goiânia",
            "14/07/2026 10:20",
            "14/07/2026 10:20",
            "No prazo",
            "Entregue",
          ],
          [
            "QXZ-8D40",
            "48256",
            "Danone",
            "Extrema",
            "Rio de Janeiro",
            "14/07/2026 11:10",
            "14/07/2026 10:52",
            "-18 min",
            "Entregue",
          ],
          [
            "LPR-6F18",
            "48261",
            "Coca-Cola",
            "Campinas",
            "Belo Horizonte",
            "14/07/2026 12:40",
            "14/07/2026 12:18",
            "-22 min",
            "Entregue",
          ],
          [
            "EJK-3H72",
            "48268",
            "Heineken",
            "São Paulo",
            "Curitiba",
            "14/07/2026 13:30",
            "14/07/2026 13:02",
            "-28 min",
            "Entregue",
          ],
        ],
      }}
    >
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
      <div className="-mx-1 mt-1 min-w-0 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3.5rem_4.5rem] gap-x-2 px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_4rem_5rem] sm:gap-x-4">
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
                className="group/row grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3.5rem_4.5rem] items-center gap-x-2 px-1 py-2.5 text-sm transition-colors hover:bg-muted/60 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_4rem_5rem] sm:gap-x-4"
              >
                <span className="truncate font-medium">{r.origem}</span>
                <span className="truncate text-muted-foreground">{r.destino}</span>
                <span className="text-right tabular-nums text-muted-foreground">{r.viagens}</span>
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
  const periodos = [
    { label: "Hoje", value: "94.1%" },
    { label: "Semana", value: "92.4%" },
    { label: "Mês", value: "91.6%" },
  ];
  return (
    <Card
      analytics={{
        title: "Analítico de OTD Cliente por Veículo",
        description: "Entregas por veículo, cliente e documento consideradas no OTD consolidado.",
        columns: [
          { label: "Veículo" },
          { label: "MDF-e" },
          { label: "Cliente" },
          { label: "Remetente" },
          { label: "Destinatário" },
          { label: "Origem" },
          { label: "Destino" },
          { label: "Prazo de entrega" },
          { label: "Entrega realizada / previsão" },
          { label: "Status OTD" },
        ],
        rows: [
          [
            "RVM-4A82",
            "48219",
            "Nestlé",
            "CD Cajamar",
            "Atacadão Fortaleza",
            "Cajamar",
            "Fortaleza",
            "14/07/2026 06:00",
            "14/07/2026 08:14",
            "Fora do prazo",
          ],
          [
            "GHT-7C21",
            "48227",
            "Ambev",
            "Fábrica Guarulhos",
            "CD Recife",
            "Guarulhos",
            "Recife",
            "14/07/2026 07:30",
            "14/07/2026 08:42",
            "Fora do prazo",
          ],
          [
            "FDP-9B14",
            "48234",
            "Unilever",
            "CD Osasco",
            "Distribuidor Salvador",
            "Osasco",
            "Salvador",
            "14/07/2026 09:00",
            "14/07/2026 08:51",
            "No prazo",
          ],
          [
            "TLM-2E63",
            "48241",
            "P&G",
            "Planta Louveira",
            "CD Goiânia",
            "Louveira",
            "Goiânia",
            "14/07/2026 10:20",
            "14/07/2026 10:03",
            "No prazo",
          ],
          [
            "QXZ-8D40",
            "48256",
            "Danone",
            "CD Extrema",
            "Rede Rio",
            "Extrema",
            "Rio de Janeiro",
            "14/07/2026 11:10",
            "14/07/2026 10:52",
            "No prazo",
          ],
        ],
      }}
    >
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

      <div className="mt-auto pt-6">
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

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
        {periodos.map((k) => (
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
    <Card
      analytics={{
        title: "Analítico de Viagens por Veículo",
        description: "Veículos monitorados, rota, previsão de chegada e desvio do prazo.",
        columns: [
          { label: "Veículo" },
          { label: "MDF-e" },
          { label: "Cliente" },
          { label: "Origem" },
          { label: "Destino" },
          { label: "Última posição" },
          { label: "Chegada prevista" },
          { label: "Chegada realizada / previsão atual" },
          { label: "Desvio" },
          { label: "Situação" },
        ],
        rows: [
          [
            "RVM-4A82",
            "48219",
            "Nestlé",
            "Cajamar",
            "Fortaleza",
            "BR-116 · Feira de Santana",
            "14/07/2026 06:00",
            "14/07/2026 08:14",
            "+2h 14 min",
            "Atrasada",
          ],
          [
            "GHT-7C21",
            "48227",
            "Ambev",
            "Guarulhos",
            "Recife",
            "BR-101 · Maceió",
            "14/07/2026 07:30",
            "14/07/2026 08:42",
            "+1h 12 min",
            "Atrasada",
          ],
          [
            "FDP-9B14",
            "48234",
            "Unilever",
            "Osasco",
            "Salvador",
            "BR-116 · Vitória da Conquista",
            "14/07/2026 09:00",
            "14/07/2026 08:51",
            "-9 min",
            "No prazo",
          ],
          [
            "TLM-2E63",
            "48241",
            "P&G",
            "Louveira",
            "Goiânia",
            "BR-050 · Uberlândia",
            "14/07/2026 10:20",
            "14/07/2026 10:03",
            "-17 min",
            "No prazo",
          ],
          [
            "QXZ-8D40",
            "48256",
            "Danone",
            "Extrema",
            "Rio de Janeiro",
            "BR-116 · Resende",
            "14/07/2026 11:10",
            "14/07/2026 10:52",
            "-18 min",
            "No prazo",
          ],
          [
            "LPR-6F18",
            "48261",
            "Coca-Cola",
            "Campinas",
            "Belo Horizonte",
            "BR-381 · Pouso Alegre",
            "14/07/2026 12:40",
            "14/07/2026 12:18",
            "-22 min",
            "No prazo",
          ],
        ],
      }}
    >
      <CardHeader
        icon={Clock}
        title="Viagens · Prazo vs Atraso"
        subtitle="Janela últimas 24h"
        right={<StatusPill status={status} />}
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
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
            <span className="text-5xl font-semibold tabular-nums text-danger">{atrasadas}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {pctAtraso.toFixed(1)}%
            </span>
          </p>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
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

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mt-8 flex items-end justify-between gap-4 border-b border-border pb-3 first:mt-0">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {description && (
        <p className="hidden text-sm text-muted-foreground md:block">{description}</p>
      )}
    </div>
  );
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
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
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

          <div className="flex flex-wrap items-center gap-3">
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

        <main className="mt-8">
          {/* Seção 2 · Tempos Operacionais */}
          <SectionHeader
            eyebrow="Nível 2"
            title="Tempos Operacionais"
            description="Ciclos médios das operações-chave"
          />
          <section className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TimeMetric
              icon={PackageOpen}
              title="Carregamento"
              value="2h 14"
              unit="min"
              target="≤ 2h"
              status="warning"
              trend={{ direction: "up", value: "+8 min" }}
              analytics={carregamentoAnalytics}
            />
            <TimeMetric
              icon={PackageCheck}
              title="Descarregamento"
              value="1h 48"
              unit="min"
              target="≤ 2h"
              status="success"
              trend={{ direction: "down", value: "-12 min" }}
              analytics={descarregamentoAnalytics}
            />
            <TimeMetric
              icon={Wrench}
              title="Manutenção"
              value="6h 32"
              unit="min"
              target="≤ 5h"
              status="danger"
              trend={{ direction: "up", value: "+42 min" }}
              analytics={manutencaoAnalytics}
            />
            <TimeMetric
              icon={Timer}
              title="Emissão de Documentos"
              value="38"
              unit="min"
              target="≤ 30 min"
              status="warning"
              trend={{ direction: "down", value: "-4 min" }}
              analytics={emissaoDocumentosAnalytics}
            />
          </section>

          {/* Seção 1 · Indicadores de Entrega */}
          <SectionHeader
            eyebrow="Nível 1"
            title="Indicadores de Entrega"
            description="Visão consolidada de OTD por cliente e por rota"
          />
          <section className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-5">
            <div className="h-full md:col-span-2">
              <OTDClienteCard />
            </div>
            <div className="h-full md:col-span-3">
              <OTDRotasCard />
            </div>
          </section>

          {/* Seção 3 · Fluxo de Viagens */}
          <SectionHeader
            eyebrow="Nível 3"
            title="Fluxo de Viagens"
            description="Aderência a prazos e giro entre operações"
          />
          <section className="mt-4 grid grid-cols-1 gap-4">
            <ViagensAtrasadasCard />
            <Card
              analytics={{
                title: "Analítico de Descarga → Novo Carregamento",
                description:
                  "Intervalo por veículo entre o fim da descarga e o próximo carregamento.",
                columns: [
                  { label: "Veículo" },
                  { label: "Filial" },
                  { label: "MDF-e anterior" },
                  { label: "Cliente anterior" },
                  { label: "Fim da descarga" },
                  { label: "Próximo MDF-e" },
                  { label: "Próximo cliente" },
                  { label: "Início do novo carregamento" },
                  { label: "Tempo de giro" },
                  { label: "Status" },
                ],
                rows: [
                  [
                    "BCD-1K93",
                    "Extrema",
                    "48172",
                    "Nestlé",
                    "13/07/2026 22:10",
                    "48244",
                    "Danone",
                    "14/07/2026 04:50",
                    "6h 40 min",
                    "No alvo",
                  ],
                  [
                    "HNV-7E26",
                    "Cajamar",
                    "48189",
                    "Ambev",
                    "13/07/2026 23:35",
                    "48251",
                    "Unilever",
                    "14/07/2026 07:58",
                    "8h 23 min",
                    "No alvo",
                  ],
                  [
                    "PRT-9D51",
                    "Guarulhos",
                    "48196",
                    "P&G",
                    "14/07/2026 00:12",
                    "48263",
                    "Coca-Cola",
                    "14/07/2026 09:24",
                    "9h 12 min",
                    "No alvo",
                  ],
                  [
                    "MGL-4B67",
                    "Fortaleza",
                    "48203",
                    "Danone",
                    "13/07/2026 18:20",
                    "48270",
                    "Nestlé",
                    "14/07/2026 08:42",
                    "14h 22 min",
                    "Crítico",
                  ],
                  [
                    "VKC-2F38",
                    "Campinas",
                    "48211",
                    "BRF",
                    "14/07/2026 01:44",
                    "Pendente",
                    "—",
                    "—",
                    "11h 06 min",
                    "Aguardando carga",
                  ],
                ],
              }}
            >
              <CardHeader
                icon={RefreshCw}
                title="Descarga → Novo Carregamento"
                subtitle="Tempo de giro entre operações"
                right={<StatusPill status="success" />}
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
                <div className="flex min-w-0 flex-col justify-center">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-semibold tracking-tight tabular-nums xl:text-6xl">
                      9h 12
                    </span>
                    <span className="text-lg font-medium text-muted-foreground">min</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <Trend direction="down" value="-38 min vs semana" goodWhen="down" />
                    <span className="text-muted-foreground">Meta: ≤ 10h</span>
                  </div>
                </div>
                <div className="hidden items-end justify-center gap-1.5 border-l border-border pl-5 md:flex lg:order-3">
                  {[7, 9, 6, 10, 8, 7, 9, 11, 8, 6, 7, 9].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-primary/70"
                      style={{ height: `${h * 6}px` }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-3 md:col-span-2 lg:order-2 lg:border-l lg:border-t-0 lg:py-2 lg:pl-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Melhor filial
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-base font-semibold">
                      Extrema <ArrowDownRight className="h-4 w-4 text-success" strokeWidth={2} />
                    </p>
                    <p className="text-xs text-muted-foreground">6h 40 min</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Pior filial
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-base font-semibold">
                      Fortaleza <ArrowUpRight className="h-4 w-4 text-danger" strokeWidth={2} />
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
              </div>
            </Card>
          </section>
        </main>

        <footer className="mt-8 flex flex-col gap-1 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Torre Operacional Dellmar · v1.0</span>
          <span>Atualização automática a cada 30s</span>
        </footer>
      </div>
    </div>
  );
}
