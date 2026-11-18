import { useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowElbowDownLeft, Globe, MagnifyingGlass } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { navItems } from "@/components/navigation";
import { StatusPill } from "@/components/ui/chip";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { decorateSite, healthMeta, type SiteRow } from "@/lib/sites";
import { cn } from "@/lib/utils";

type Entry =
  | { kind: "page"; id: string; label: string; to: string; icon: (typeof navItems)[number]["icon"] }
  | { kind: "site"; id: string; label: string; sub: string; to: string; health: keyof typeof healthMeta };

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !accessToken) return;
    apiRequest<SiteRow[]>("/sites", {}, accessToken)
      .then(setSites)
      .catch(() => setSites([]));
  }, [open, accessToken]);

  const entries = useMemo<Entry[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: Entry[] = navItems
      .filter((item) => !q || item.label.toLowerCase().includes(q) || item.keywords?.includes(q))
      .map((item) => ({ kind: "page", id: item.to, label: item.label, to: item.to, icon: item.icon }));
    const emptyMap = new Map();
    const siteEntries: Entry[] = sites
      .filter((site) => !q || site.domain.toLowerCase().includes(q) || site.name.toLowerCase().includes(q))
      .slice(0, q ? 30 : 8)
      .map((site) => {
        const decorated = decorateSite(site, emptyMap);
        return {
          kind: "site",
          id: site.id,
          label: site.domain,
          sub: site.name !== site.domain ? site.name : "",
          to: `/app/sites?site=${encodeURIComponent(site.id)}`,
          health: decorated.health
        };
      });
    return [...siteEntries, ...pages];
  }, [query, sites]);


  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (entry?: Entry) => {
    if (!entry) return;
    onOpenChange(false);
    navigate(entry.to);
  };

  const siteCount = entries.filter((entry) => entry.kind === "site").length;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setQuery("");
          setActive(0);
        }
        onOpenChange(next);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 dark:bg-black/60" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-float focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">搜索</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-border px-5">
            <MagnifyingGlass className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((value) => Math.min(entries.length - 1, value + 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((value) => Math.max(0, value - 1));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  go(entries[active]);
                }
              }}
              placeholder="搜索域名、站点或页面…"
              className="h-16 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="kbd bg-secondary">esc</kbd>
          </div>
          <div ref={listRef} className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
            {entries.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">没有找到「{query}」相关结果</div>
            )}
            {entries.map((entry, index) => {
              const header =
                index === 0 && entry.kind === "site"
                  ? "站点"
                  : (index === 0 || index === siteCount) && entry.kind === "page"
                    ? "页面"
                    : null;
              return (
                <div key={`${entry.kind}-${entry.id}`}>
                  {header && <div className="px-3 pb-1 pt-3 text-xs font-medium text-muted-foreground">{header}</div>}
                  <button
                    type="button"
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(entry)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                      active === index ? "bg-secondary" : "hover:bg-secondary/60"
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                      {entry.kind === "page" ? <entry.icon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{entry.label}</span>
                      {entry.kind === "site" && entry.sub && (
                        <span className="block truncate text-xs text-muted-foreground">{entry.sub}</span>
                      )}
                    </span>
                    {entry.kind === "site" && (
                      <StatusPill tone={healthMeta[entry.health].tone}>{healthMeta[entry.health].label}</StatusPill>
                    )}
                    {active === index && <ArrowElbowDownLeft className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              );
            })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
