import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaginationControlsProps = {
  totalItems: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function PaginationControls({
  totalItems,
  page,
  pageSize,
  pageSizeOptions = [24, 48, 96],
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-8 text-sm text-muted-foreground sm:flex-row">
      <div className="tabular-nums">
        {start}–{end} / 共 {totalItems} 条
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="h-9 w-[104px] rounded-full bg-secondary text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} 条/页
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="上一页">
          <CaretLeft className="h-4 w-4" weight="bold" />
        </Button>
        <span className="min-w-14 text-center tabular-nums text-foreground">
          {page} / {totalPages}
        </span>
        <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="下一页">
          <CaretRight className="h-4 w-4" weight="bold" />
        </Button>
      </div>
    </div>
  );
}
