import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  getBadgeVariantByStatus,
  getCertificateStatusLabel,
  getHistoryCategoryLabel,
  getHistoryTriggerLabel,
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

export function DeploymentsPage() {
  const { accessToken } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<HistoryRecord[]>("/history", {}, accessToken).then(setHistory);
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">历史记录</h2>
        <p className="text-sm text-muted-foreground">统一查看证书续签与 CDN 部署的执行轨迹。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近历史</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>域名</TableHead>
                <TableHead>平台 / 凭据</TableHead>
                <TableHead>方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={`${item.category}-${item.id}`}>
                  <TableCell>
                    <Badge variant="muted">{getHistoryCategoryLabel(item.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.domain || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[180px]">
                      <div className="text-sm font-medium">
                        {getPlatformLabel(item.providerType)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.providerName || item.providerCredentialId || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getHistoryTriggerLabel(item.triggerSource)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariantByStatus(item.status)}>
                      {getCertificateStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.occurredAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.message || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {history.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无历史记录。</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
