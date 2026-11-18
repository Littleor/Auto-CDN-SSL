import { useEffect, useMemo, useState } from "react";
import { ClockCounterClockwise } from "@phosphor-icons/react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { SearchField } from "@/components/SearchField";
import { HistoryRow, type HistoryRecord } from "@/components/history/HistoryRow";
import { Chip } from "@/components/ui/chip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiRequest, errorMessage } from "@/lib/api";
import { isScheduledTrigger } from "@/lib/statusDisplay";

type Filter = "all" | "renew" | "deploy" | "failed" | "scheduled" | "manual";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "renew", label: "续签" },
  { value: "deploy", label: "部署" },
  { value: "failed", label: "失败" },
  { value: "scheduled", label: "自动触发" },
  { value: "manual", label: "手动触发" }
];

function matches(item: HistoryRecord, filter: Filter) {
  if (filter === "renew" || filter === "deploy") return item.category === filter;
  if (filter === "failed") return item.status?.toLowerCase() === "failed";
  if (filter === "scheduled") return isScheduledTrigger(item.triggerSource);
  if (filter === "manual") return !isScheduledTrigger(item.triggerSource);
  return true;
}

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知日期";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "今天";
  if (date.toDateString() === yesterday.toDateString()) return "昨天";
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export function DeploymentsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(48);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<HistoryRecord[]>("/history", {}, accessToken)
      .then(setHistory)
      .catch((err: unknown) => toast({ title: "加载历史失败", description: errorMessage(err), tone: "error" }))
      .finally(() => setLoading(false));
  }, [accessToken, toast]);


  const counts = useMemo(() => {
    const result = {} as Record<Filter, number>;
    filters.forEach((item) => (result[item.value] = history.filter((record) => matches(record, item.value)).length));
    return result;
  }, [history]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history
      .filter((item) => matches(item, filter))
      .filter(
        (item) =>
          !q ||
          [item.domain, item.providerName, item.providerCredentialId, item.message]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [history, filter, query]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const groups = useMemo(() => {
    const map = new Map<string, HistoryRecord[]>();
    paged.forEach((item) => {
      const key = dayKey(item.occurredAt);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return [...map.entries()];
  }, [paged]);

  return (
    <div>
      <PageHeader
        title="历史记录"
        description="每一次实际执行的续签与部署。定时扫描判定「无需续签」时不会产生记录。"
        action={<SearchField value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="搜索域名、凭据或信息" className="w-full md:w-[320px]" />}
      />

      <div className="no-scrollbar fade-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-6 md:mx-0 md:px-0">
        {filters.map((item) => (
          <Chip key={item.value} active={filter === item.value} count={counts[item.value]} onClick={() => { setFilter(item.value); setPage(1); }}>
            {item.label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-[72px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise />}
          title={history.length === 0 ? "暂无历史记录" : "没有匹配的记录"}
          description={history.length === 0 ? "发生续签或部署后，记录会出现在这里。" : "换个关键词或筛选条件再看看。"}
        />
      ) : (
        <div className="space-y-8">
          {groups.map(([day, items]) => (
            <section key={day}>
              <h2 className="sticky top-14 z-10 -mx-1 mb-1 bg-background/85 px-1 py-2 text-sm font-semibold text-muted-foreground backdrop-blur-xl">
                {day}
              </h2>
              <div className="-mx-3">
                {items.map((item) => (
                  <HistoryRow key={`${item.category}-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          ))}
          <PaginationControls
            totalItems={filtered.length}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[24, 48, 96]}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        </div>
      )}
    </div>
  );
}
