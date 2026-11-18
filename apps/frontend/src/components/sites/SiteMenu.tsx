import { ArrowsClockwise, DotsThree, SidebarSimple, Trash } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SiteMenuProps = {
  onOpen: () => void;
  onRenew: () => void;
  onDelete: () => void;
  busy?: boolean;
  className?: string;
};

export function SiteMenu({ onOpen, onRenew, onDelete, busy, className }: SiteMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          aria-label="更多操作"
        >
          <DotsThree className="h-4 w-4" weight="bold" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onSelect={onOpen}>
          <SidebarSimple />
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onRenew} disabled={busy}>
          <ArrowsClockwise />
          续签并部署
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={onDelete}>
          <Trash />
          删除站点
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
