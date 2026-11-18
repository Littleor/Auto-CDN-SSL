import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { DecoratedSite } from "@/lib/sites";

type DeleteSitesDialogProps = {
  sites: DecoratedSite[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteSitesDialog({ sites, loading, onOpenChange, onConfirm }: DeleteSitesDialogProps) {
  const single = sites.length === 1 ? sites[0] : null;
  const imported = sites.filter((site) => site.providerCredentialId);
  const preview = sites.slice(0, 6);

  return (
    <ConfirmDialog
      open={sites.length > 0}
      onOpenChange={onOpenChange}
      destructive
      loading={loading}
      confirmLabel={single ? "删除站点" : `删除 ${sites.length} 个站点`}
      title={single ? `删除 ${single.domain}？` : `删除 ${sites.length} 个站点？`}
      description="站点的证书、部署记录与续签任务会一并删除，此操作无法撤销。CDN 平台上已部署的证书不受影响。"
      onConfirm={onConfirm}
    >
      {!single && (
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-2xl bg-secondary p-2 text-sm">
          {preview.map((site) => (
            <li key={site.id} className="truncate rounded-xl px-3 py-1.5 font-medium">
              {site.domain}
            </li>
          ))}
          {sites.length > preview.length && (
            <li className="px-3 py-1.5 text-muted-foreground">以及另外 {sites.length - preview.length} 个站点</li>
          )}
        </ul>
      )}
      {imported.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {single ? "该站点" : `其中 ${imported.length} 个站点`}绑定了 CDN 凭据：若域名仍在 CDN 平台上，之后在「CDN 凭据」中再次同步时会被重新导入。
        </p>
      )}
    </ConfirmDialog>
  );
}
