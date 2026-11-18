import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowsClockwise, GlobeHemisphereWest } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Eyebrow } from "@/components/PageHeader";
import { HistoryRow, type HistoryRecord } from "@/components/history/HistoryRow";
import { DeleteSitesDialog } from "@/components/sites/DeleteSitesDialog";
import { SiteCard } from "@/components/sites/SiteCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";
import { decorateSite, providerMap, type DecoratedSite, type Provider, type SiteRow } from "@/lib/sites";
import { useSiteActions } from "@/lib/useSiteActions";
import { cn } from "@/lib/utils";

type UserSettings = { renewalHour: number; renewalMinute: number; renewalThresholdDays: number; autoDeploy: boolean };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function StatTile({ label, value, hint, to, tone }: { label: string; value: number | string; hint: string; to: string; tone?: "warning" | "danger" }) {
  return (
    <Link
      to={to}
      className="group flex flex-col justify-between rounded-2xl bg-secondary p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
        {label}
        <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
      <div
        className={cn(
          "mt-4 text-[32px] font-semibold leading-none tracking-[-0.045em] tabular-nums",
          tone === "warning" && Number(value) > 0 && "text-warning",
          tone === "danger" && Number(value) > 0 && "text-destructive"
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
    </Link>
  );
}

export function DashboardPage() {
  const { accessToken, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DecoratedSite[]>([]);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [siteItems, providerItems, historyItems, settingItems] = await Promise.all([
        apiRequest<SiteRow[]>("/sites", {}, accessToken),
        apiRequest<Provider[]>("/providers", {}, accessToken),
        apiRequest<HistoryRecord[]>("/history", {}, accessToken).catch(() => [] as HistoryRecord[]),
        apiRequest<UserSettings>("/user-settings", {}, accessToken).catch(() => null)
      ]);
      setSites(siteItems);
      setProviders(providerItems);
      setHistory(historyItems);
      setSettings(settingItems);
    } catch (err) {
      toast({ title: "加载概览失败", description: errorMessage(err), tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const { states, renew, remove } = useSiteActions(accessToken, () => void load());

  const decorated = useMemo(() => {
    const byId = providerMap(providers);
    return sites.map((site) => decorateSite(site, byId));
  }, [sites, providers]);

  const counts = useMemo(() => {
    const result = { expiring: 0, expired: 0, missing: 0 };
    decorated.forEach((site) => {
      if (site.health !== "healthy") result[site.health] += 1;
    });
    return result;
  }, [decorated]);

  const nextUp = useMemo(
    () =>
      decorated
        .filter((site) => site.days !== null)
        .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
        .slice(0, 10),
    [decorated]
  );

  const recent = useMemo(
    () => [...history].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 6),
    [history]
  );

  const attention = counts.expiring + counts.expired;
  const cdnProviders = providers.filter((provider) => provider.providerType !== "tencent_dns").length;
  const schedule = settings
    ? `${String(settings.renewalHour).padStart(2, "0")}:${String(settings.renewalMinute).padStart(2, "0")}`
    : null;

  const confirmDelete = async () => {
    setDeleting(true);
    const { deleted, failed } = await remove(pendingDelete.map((site) => site.id));
    setDeleting(false);
    setPendingDelete([]);
    toast(
      failed
        ? { title: `${failed} 个站点删除失败`, tone: "error" }
        : { title: deleted === 1 ? "站点已删除" : `已删除 ${deleted} 个站点`, tone: "success" }
    );
  };

  return (
    <div>
      <section className="flex flex-col items-center pb-6 pt-6 text-center md:pb-8 md:pt-10">
        <Eyebrow dotClassName={loading ? "bg-muted-foreground/50" : attention > 0 ? "bg-warning" : "bg-success"}>
          {loading ? "正在检查证书" : attention > 0 ? `${attention} 个站点需要关注` : "所有证书运行正常"}
        </Eyebrow>
        <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[2.25rem]">
          {greeting()}{user?.name ? `，${user.name}` : ""}
        </h1>
        <p className="mt-4 max-w-[46ch] text-sm leading-6 text-muted-foreground">
          正在为 <span className="text-foreground">{decorated.length} 个站点</span>自动续签证书
          {schedule ? (
            <>
              ，每天 <span className="text-foreground">{schedule}</span> 运行
            </>
          ) : null}
          。
        </p>
        <form
          className="relative mt-5 w-full max-w-[560px]"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(query.trim() ? `/app/sites?q=${encodeURIComponent(query.trim())}` : "/app/sites");
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="查找一个站点，例如 static.example.com"
            className="h-11 w-full rounded-full bg-secondary pl-5 pr-12 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:bg-accent/70 focus:bg-accent/70 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            aria-label="前往站点"
          >
            <ArrowRight className="h-4 w-4" weight="bold" />
          </button>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeleton h-[124px] rounded-2xl" />)
        ) : (
          <>
            <StatTile label="站点" value={decorated.length} hint={`${counts.missing} 个尚无证书`} to="/app/sites" />
            <StatTile label="30 天内到期" value={counts.expiring} hint="将在下次调度时续签" to="/app/sites" tone="warning" />
            <StatTile label="已过期" value={counts.expired} hint="建议立即手动续签" to="/app/sites" tone="danger" />
            <StatTile label="CDN 凭据" value={cdnProviders} hint="用于同步站点与部署" to="/app/providers" />
          </>
        )}
      </section>

      <section className="pt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">下一批续签</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">按剩余天数排序，最先到期的在最前面。</p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/app/sites">
              全部站点
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-[148px] rounded-2xl" />
            ))}
          </div>
        ) : nextUp.length === 0 ? (
          <EmptyState
            icon={<GlobeHemisphereWest />}
            title="还没有证书记录"
            description="站点接入并签发证书后，这里会列出最先需要续签的站点。"
            action={
              <Button onClick={() => navigate("/app/sites?new=1")}>新建站点</Button>
            }
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-4 gap-y-5">
            {nextUp.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                action={states[site.id]}
                onOpen={() => navigate(`/app/sites?site=${encodeURIComponent(site.id)}`)}
                onRenew={() => void renew(site)}
                onDelete={() => setPendingDelete([site])}
              />
            ))}
          </div>
        )}
      </section>

      <section className="pt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">最近动作</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">续签与部署的最新执行结果。</p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/app/deployments">
              全部历史
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-16" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<ArrowsClockwise />}
            title="暂无动作"
            description="发生续签或部署后，这里会显示最新的执行结果。"
          />
        ) : (
          <div className="-mx-3">
            {recent.map((item) => (
              <HistoryRow key={`${item.category}-${item.id}`} item={item} compact />
            ))}
          </div>
        )}
      </section>

      <DeleteSitesDialog
        sites={pendingDelete}
        loading={deleting}
        onOpenChange={(open) => !open && setPendingDelete([])}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
