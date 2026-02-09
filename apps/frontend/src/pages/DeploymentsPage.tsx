import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function DeploymentsPage() {
  const { accessToken } = useAuth();
  const [deployments, setDeployments] = useState<any[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    apiRequest<any[]>("/deployments", {}, accessToken).then(setDeployments);
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">部署记录</h2>
        <p className="text-sm text-muted-foreground">追踪 CDN 证书部署结果与失败原因。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近部署</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>平台</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell>{deployment.provider_type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={deployment.status === "success" ? "success" : deployment.status === "failed" ? "warning" : "muted"}
                    >
                      {deployment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(deployment.created_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {deployment.message || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {deployments.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无部署记录。</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
