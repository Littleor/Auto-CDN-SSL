import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowsClockwise,
  CircleNotch,
  Check,
  GlobeHemisphereWest,
  ListBullets,
  MagnifyingGlass,
  Plus,
  SortAscending,
  SquaresFour,
  Trash,
  X
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Eyebrow } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { CreateSiteDialog } from "@/components/sites/CreateSiteDialog";
import { DeleteSitesDialog } from "@/components/sites/DeleteSitesDialog";
import { SiteCard } from "@/components/sites/SiteCard";
import { SiteDetailSheet } from "@/components/sites/SiteDetailSheet";
import { SiteMenu } from "@/components/sites/SiteMenu";
import { healthBar } from "@/components/sites/siteVisuals";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip, StatusPill } from "@/components/ui/chip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Segmented } from "@/components/ui/segmented";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";
import { formatDay } from "@/lib/format";
import { decorateSite, healthMeta, providerMap, type DecoratedSite, type Provider, type SiteHealth, type SiteRow } from "@/lib/sites";
import { getCdnStatusLabel, getHttpsStatusLabel, getPlatformLabel, getToneByStatus } from "@/lib/statusDisplay";
import { useSiteActions } from "@/lib/useSiteActions";
import { cn } from "@/lib/utils";

type SortField = "expiresAt" | "name" | "domain" | "provider" | "providerStatus";
type HealthFilter = "all" | SiteHealth;
type ViewMode = "grid" | "list";

const VIEW_KEY = "auto_ssl_sites_view";

const sortLabels: Record<SortField, string> = {
  expiresAt: "到期时间",
  domain: "域名",
  name: "站点名称",
  provider: "平台",
  providerStatus: "CDN 状态"
};

const healthFilters: { value: HealthFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "expiring", label: "即将到期" },
  { value: "expired", label: "已过期" },
  { value: "healthy", label: "正常" },
  { value: "missing", label: "无证书" }
];

function compareNullable(a: string | number | null, b: string | number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "zh-CN");
}

function readView(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

export function SitesPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("expiresAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<ViewMode>(readView);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<DecoratedSite[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [renewingAll, setRenewingAll] = useState(false);

  const detailId = searchParams.get("site");
  const createOpen = searchParams.get("new") === "1";

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([key, value]) => (value === null ? next.delete(key) : next.set(key, value)));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [siteItems, providerItems] = await Promise.all([
        apiRequest<SiteRow[]>("/sites", {}, accessToken),
        apiRequest<Provider[]>("/providers", {}, accessToken)
      ]);
      setSites(siteItems);
      setProviders(providerItems);
    } catch (err) {
      toast({ title: "加载站点失败", description: errorMessage(err), tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const { states, renew, remove } = useSiteActions(accessToken, () => void fetchData());

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // ignore
    }
  }, [view]);

  useEffect(() => {
    setPage(1);
  }, [query, healthFilter, providerFilter, sortField, sortOrder, pageSize]);

  const decorated = useMemo(() => {
    const byId = providerMap(providers);
    return sites.map((site) => decorateSite(site, byId));
  }, [sites, providers]);

  const healthCounts = useMemo(() => {
    const counts: Record<HealthFilter, number> = { all: decorated.length, healthy: 0, expiring: 0, expired: 0, missing: 0 };
    decorated.forEach((site) => (counts[site.health] += 1));
    return counts;
  }, [decorated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = decorated.filter((site) => {
      const matchesQuery =
        !q ||
        site.name.toLowerCase().includes(q) ||
        site.domain.toLowerCase().includes(q) ||
        (site.providerName ?? "").toLowerCase().includes(q);
      const matchesHealth = healthFilter === "all" || site.health === healthFilter;
      const matchesProvider =
        providerFilter === "all" ||
        (providerFilter === "unbound" && !site.providerType) ||
        site.providerType === providerFilter;
      return matchesQuery && matchesHealth && matchesProvider;
    });
    const direction = sortOrder === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      if (sortField === "name") return compareNullable(a.name, b.name) * direction;
      if (sortField === "domain") return compareNullable(a.domain, b.domain) * direction;
      if (sortField === "provider") return compareNullable(a.providerType, b.providerType) * direction;
      if (sortField === "providerStatus") return compareNullable(a.providerStatus ?? null, b.providerStatus ?? null) * direction;
      return compareNullable(a.days, b.days) * direction;
    });
  }, [decorated, healthFilter, providerFilter, query, sortField, sortOrder]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page, pageSize]);

  // Drop selections that no longer exist (e.g. after a delete or refresh).
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(sites.map((site) => site.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [sites]);

  const detailSite = useMemo(() => decorated.find((site) => site.id === detailId) ?? null, [decorated, detailId]);
  const selectedSites = useMemo(() => decorated.filter((site) => selected.has(site.id)), [decorated, selected]);
  const selecting = selected.size > 0;
  const pageAllSelected = paged.length > 0 && paged.every((site) => selected.has(site.id));
  const pageSomeSelected = paged.some((site) => selected.has(site.id));

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const togglePage = (on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      paged.forEach((site) => (on ? next.add(site.id) : next.delete(site.id)));
      return next;
    });

  const renewMany = async (targets: DecoratedSite[]) => {
    if (targets.length === 0) return;
    setRenewingAll(true);
    toast({ title: `已开始续签 ${targets.length} 个站点`, description: "完成后会自动部署到绑定的 CDN。" });
    try {
      await Promise.all(targets.map((site) => renew(site)));
    } finally {
      setRenewingAll(false);
    }
  };

  const confirmDelete = async () => {
    const targets = pendingDelete;
    setDeleting(true);
    const { deleted, failed } = await remove(targets.map((site) => site.id));
    setDeleting(false);
    setPendingDelete([]);
    if (targets.some((site) => site.id === detailId)) updateParams({ site: null });
    setSelected(new Set());
    if (failed > 0) {
      toast({ title: `${failed} 个站点删除失败`, description: deleted ? `已删除 ${deleted} 个` : undefined, tone: "error" });
    } else {
      toast({
        title: targets.length === 1 ? `已删除 ${targets[0].domain}` : `已删除 ${deleted} 个站点`,
        tone: "success"
      });
    }
  };

  const filtersActive = query || healthFilter !== "all" || providerFilter !== "all";

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center pb-6 pt-6 text-center md:pb-8 md:pt-10">
        <Eyebrow>
          {loading ? "正在加载站点" : `${decorated.length} 个站点在管理中`}
        </Eyebrow>
        <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[2.25rem]">
          你的 CDN 站点
        </h1>
        <p className="mt-4 max-w-[46ch] text-sm leading-6 text-muted-foreground">
          每张卡片是一个加速域名，<span className="text-foreground">剩余天数</span>一眼可见，
          <br className="hidden sm:block" />
          续签与部署只需<span className="text-foreground">一次点击</span>。
        </p>
        <form
          className="relative mt-5 w-full max-w-[560px]"
          onSubmit={(event) => {
            event.preventDefault();
            document.getElementById("site-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索域名、站点名或凭据，例如 static.example.com"
            className="h-11 w-full rounded-full bg-secondary pl-5 pr-12 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:bg-accent/70 focus:bg-accent/70 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-11 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-background"
              aria-label="清空搜索"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            aria-label="查看结果"
          >
            <MagnifyingGlass className="h-4 w-4" weight="bold" />
          </button>
        </form>
      </section>

      {/* Toolbar */}
      <div id="site-results" className="sticky top-14 z-30 -mx-4 scroll-mt-14 bg-background/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
        <div className="flex items-center gap-3">
          <div className="no-scrollbar fade-x flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-8">
            {healthFilters.map((item) => (
              <Chip
                key={item.value}
                active={healthFilter === item.value}
                count={healthCounts[item.value]}
                onClick={() => setHealthFilter(item.value)}
              >
                {item.label}
              </Chip>
            ))}
            <span className="mx-1 h-6 w-px shrink-0 bg-border" />
            {[
              { value: "all", label: "全部平台" },
              { value: "tencent", label: "腾讯云" },
              { value: "qiniu", label: "七牛云" },
              { value: "unbound", label: "未绑定" }
            ].map((item) => (
              <Chip key={item.value} active={providerFilter === item.value} onClick={() => setProviderFilter(item.value)}>
                {item.label}
              </Chip>
            ))}
          </div>

          <div className="hidden shrink-0 text-sm tabular-nums text-muted-foreground xl:block">{filtered.length} 个站点</div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="shrink-0 px-4" aria-label="排序">
                <SortAscending className="h-4 w-4" />
                <span className="hidden sm:inline">{sortLabels[sortField]}</span>
                {sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>排序依据</DropdownMenuLabel>
              {(Object.keys(sortLabels) as SortField[]).map((field) => (
                <DropdownMenuItem key={field} onSelect={() => setSortField(field)}>
                  <span className="flex-1">{sortLabels[field]}</span>
                  {sortField === field && <Check weight="bold" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <ArrowDown /> : <ArrowUp />}
                {sortOrder === "asc" ? "切换为降序" : "切换为升序"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Segmented
            ariaLabel="视图"
            value={view}
            onChange={setView}
            className="hidden sm:inline-flex"
            options={[
              { value: "grid", label: <SquaresFour className="h-4 w-4" weight="fill" />, title: "卡片视图" },
              { value: "list", label: <ListBullets className="h-4 w-4" weight="bold" />, title: "列表视图" }
            ]}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="shrink-0 px-4 sm:px-5">
                <Plus className="h-4 w-4" weight="bold" />
                <span className="hidden sm:inline">站点</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onSelect={() => updateParams({ new: "1" })}>
                <Plus />
                新建站点
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void renewMany(filtered)} disabled={renewingAll || filtered.length === 0}>
                <ArrowsClockwise />
                续签当前筛选的 {filtered.length} 个站点
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results */}
      <div className="pt-6">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="skeleton h-[148px] rounded-2xl" />
                <div className="skeleton mt-4 h-4 w-2/3 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<GlobeHemisphereWest />}
            title={filtersActive ? "没有匹配的站点" : "还没有站点"}
            description={
              filtersActive
                ? "换个关键词，或清除筛选条件再看看。"
                : "新建一个站点，或在「CDN 凭据」中同步已有的加速域名。"
            }
            action={
              filtersActive ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setHealthFilter("all");
                    setProviderFilter("all");
                  }}
                >
                  清除筛选
                </Button>
              ) : (
                <Button onClick={() => updateParams({ new: "1" })}>
                  <Plus className="h-4 w-4" weight="bold" />
                  新建站点
                </Button>
              )
            }
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
            {paged.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                action={states[site.id]}
                selected={selected.has(site.id)}
                selecting={selecting}
                onToggleSelect={(on) => toggle(site.id, on)}
                onOpen={() => updateParams({ site: site.id })}
                onRenew={() => void renew(site)}
                onDelete={() => setPendingDelete([site])}
              />
            ))}
          </div>
        ) : (
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="[&>td]:hover:bg-transparent">
                <TableHead className="w-12 pl-3">
                  <Checkbox
                    checked={pageAllSelected}
                    indeterminate={!pageAllSelected && pageSomeSelected}
                    onChange={togglePage}
                    label="选择本页全部站点"
                  />
                </TableHead>
                <TableHead>站点</TableHead>
                <TableHead>证书</TableHead>
                <TableHead>剩余有效期</TableHead>
                <TableHead>CDN 状态</TableHead>
                <TableHead>HTTPS</TableHead>
                <TableHead>平台</TableHead>
                <TableHead className="w-[150px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((site) => {
                const action = states[site.id];
                const busy = action?.phase === "issuing" || action?.phase === "deploying";
                return (
                  <TableRow key={site.id} className="cursor-pointer" onClick={() => updateParams({ site: site.id })}>
                    <TableCell className="pl-3">
                      <Checkbox checked={selected.has(site.id)} onChange={(on) => toggle(site.id, on)} label={`选择 ${site.domain}`} />
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <div className="truncate font-medium text-foreground">{site.domain}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {action?.message ? (
                          <span className={cn(action.phase === "error" ? "text-destructive" : action.phase === "success" ? "text-success" : "")}>
                            {action.message}
                          </span>
                        ) : site.name !== site.domain ? (
                          site.name
                        ) : (
                          site.expiresAt ? `${formatDay(site.expiresAt)} 到期` : "尚未签发证书"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={healthMeta[site.health].tone}>{healthMeta[site.health].label}</StatusPill>
                    </TableCell>
                    <TableCell>
                      <div className="flex w-[160px] items-center gap-3">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn("h-full rounded-full", healthBar[site.health])}
                            style={{ width: `${site.progress ?? (site.health === "expired" ? 100 : 0)}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
                          {site.days === null ? "—" : site.days < 0 ? "已过期" : `${site.days} 天`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {site.providerStatus ? (
                        <StatusPill tone={getToneByStatus(site.providerStatus)}>{getCdnStatusLabel(site.providerStatus)}</StatusPill>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{getHttpsStatusLabel(site.providerHttps)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-foreground">{site.providerType ? getPlatformLabel(site.providerType) : "未绑定"}</div>
                      {site.providerName && <div className="text-xs text-muted-foreground">{site.providerName}</div>}
                    </TableCell>
                    <TableCell className="pr-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="secondary" onClick={() => void renew(site)} disabled={busy}>
                          {busy ? <CircleNotch className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
                          {action?.phase === "issuing" ? "续签中" : action?.phase === "deploying" ? "部署中" : "续签"}
                        </Button>
                        <SiteMenu
                          className="bg-secondary shadow-none hover:bg-accent"
                          busy={busy}
                          onOpen={() => updateParams({ site: site.id })}
                          onRenew={() => void renew(site)}
                          onDelete={() => setPendingDelete([site])}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {!loading && filtered.length > 0 && (
          <PaginationControls
            totalItems={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Selection bar */}
      <AnimatePresence>
        {selecting && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 24, x: "-50%" }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed bottom-6 left-1/2 z-40 flex max-w-[calc(100%-2rem)] items-center gap-1 rounded-full bg-primary p-1.5 pl-5 text-primary-foreground shadow-float"
          >
            <span className="whitespace-nowrap pr-2 text-sm font-medium tabular-nums">已选 {selected.size} 个</span>
            <button
              type="button"
              onClick={() => togglePage(!pageAllSelected)}
              className="hidden h-10 whitespace-nowrap rounded-full px-4 text-sm font-medium opacity-80 transition hover:bg-primary-foreground/10 hover:opacity-100 sm:block"
            >
              {pageAllSelected ? "取消本页" : "全选本页"}
            </button>
            <button
              type="button"
              onClick={() => void renewMany(selectedSites)}
              disabled={renewingAll}
              className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-medium transition hover:bg-primary-foreground/10 disabled:opacity-50"
            >
              <ArrowsClockwise className="h-4 w-4" />
              续签
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(selectedSites)}
              className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-destructive px-4 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
            >
              <Trash className="h-4 w-4" />
              删除
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-primary-foreground/10"
              aria-label="取消选择"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteDetailSheet
        site={detailSite}
        action={detailSite ? states[detailSite.id] : undefined}
        onOpenChange={(open) => !open && updateParams({ site: null })}
        onRenew={(site) => void renew(site)}
        onDelete={(site) => setPendingDelete([site])}
      />

      <CreateSiteDialog
        open={createOpen}
        onOpenChange={(open) => updateParams({ new: open ? "1" : null })}
        providers={providers}
        accessToken={accessToken}
        onCreated={(domain) => {
          toast({ title: `已添加 ${domain}`, tone: "success" });
          void fetchData();
        }}
      />

      <DeleteSitesDialog
        sites={pendingDelete}
        loading={deleting}
        onOpenChange={(open) => !open && setPendingDelete([])}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
