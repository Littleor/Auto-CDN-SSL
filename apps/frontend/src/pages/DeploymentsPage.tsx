import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/PaginationControls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  getBadgeVariantByStatus,
  getCertificateStatusLabel,
  getHistoryCategoryLabel,
  getHistoryTriggerLabel,
  getHistoryTriggerVariant,
  getPlatformLabel
} from "@/lib/statusDisplay";

type HistoryRecord = {
  id: string;
  category: "renew" | "deploy";
  siteId: string;
  domain: string | null;
  providerCredentialId: string | null;
  providerType: string | null;
  providerName: string | null;
  triggerSource: string;
  status: string;
  message: string | null;
  occurredAt: string;
  createdAt: string;
};

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

export function DeploymentsPage() {
  const { accessToken } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<HistoryRecord[]>("/history", {}, accessToken).then(setHistory);
  }, [accessToken]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return history;

    return history.filter((item) => {
      return [item.domain, item.providerName, item.providerCredentialId, item.message]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [history, query]);

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredHistory.length, page, pageSize]);

  const handleCopyMessage = async (item: HistoryRecord) => {
    if (!item.message) return;
    try {
      await navigator.clipboard.writeText(item.message);
      setCopiedId(item.id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === item.id ? null : current));
      }, 1500);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">历史记录</h2>
        <p className="text-sm text-muted-foreground">统一查看证书续签与 CDN 部署的执行轨迹。</p>
        <p className="mt-1 text-xs text-muted-foreground">
          仅记录实际执行的续签与部署；如果定时扫描判断“当前无需续签”，不会生成历史记录。
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>最近历史</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">自动与手动操作会使用不同颜色标识，便于快速分辨来源。</p>
          </div>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              placeholder="搜索域名、凭据名或备注"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table className="min-w-[1120px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[90px] whitespace-nowrap">类型</TableHead>
                <TableHead className="min-w-[180px] whitespace-nowrap">域名</TableHead>
                <TableHead className="min-w-[200px] whitespace-nowrap">平台 / 凭据</TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap">方式</TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap">状态</TableHead>
                <TableHead className="min-w-[170px] whitespace-nowrap">时间</TableHead>
                <TableHead className="min-w-[260px] whitespace-nowrap">备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedHistory.map((item) => (
                <TableRow key={`${item.category}-${item.id}`}>
                  <TableCell className="align-top whitespace-nowrap">
                    <Badge variant="muted">{getHistoryCategoryLabel(item.category)}</Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="max-w-[180px] truncate text-sm" title={item.domain || "-"}>
                      {item.domain || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="min-w-[180px]">
                      <div className="text-sm font-medium">{getPlatformLabel(item.providerType)}</div>
                      <div className="truncate text-xs text-muted-foreground" title={item.providerName || item.providerCredentialId || "-"}>
                        {item.providerName || item.providerCredentialId || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">
                    <Badge variant={getHistoryTriggerVariant(item.triggerSource)}>
                      {getHistoryTriggerLabel(item.triggerSource)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">
                    <Badge variant={getBadgeVariantByStatus(item.status)}>
                      {getCertificateStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">{formatDate(item.occurredAt)}</TableCell>
                  <TableCell className="align-top">
                    {item.message ? (
                      <button
                        type="button"
                        onClick={() => void handleCopyMessage(item)}
                        title={item.message}
                        className="flex max-w-[260px] items-start gap-2 text-left text-xs text-muted-foreground"
                      >
                        {copiedId === item.id ? (
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        ) : (
                          <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{copiedId === item.id ? "已复制完整备注" : truncateText(item.message, 36)}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无匹配的历史记录。</div>
          ) : (
            <PaginationControls
              totalItems={filteredHistory.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
