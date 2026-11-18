import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, errorMessage } from "@/lib/api";
import type { DecoratedSite } from "@/lib/sites";

export type ActionPhase = "idle" | "issuing" | "deploying" | "success" | "error";
export type ActionState = { phase: ActionPhase; message?: string };

type Job = { id: string; status: string; message: string | null };

/**
 * Renew (issue) a certificate for a site, poll the job, then deploy to the bound CDN.
 * Also exposes single/bulk delete. Bulk delete fans out over DELETE /sites/:id.
 */
export function useSiteActions(accessToken: string | null, onChanged: () => void) {
  const [states, setStates] = useState<Record<string, ActionState>>({});
  const timers = useRef<Record<string, number>>({});
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    const active = timers.current;
    return () => Object.values(active).forEach((timer) => window.clearInterval(timer));
  }, []);

  const set = useCallback((siteId: string, next: ActionState) => {
    setStates((prev) => ({ ...prev, [siteId]: next }));
  }, []);

  const deploy = useCallback(
    async (site: DecoratedSite) => {
      if (!accessToken) return;
      if (!site.providerCredentialId) {
        set(site.id, { phase: "success", message: "续签成功，未绑定 CDN 凭据，已跳过部署" });
        return;
      }
      set(site.id, { phase: "deploying", message: "续签成功，正在部署到 CDN…" });
      try {
        await apiRequest("/deployments", { method: "POST", body: JSON.stringify({ siteId: site.id }) }, accessToken);
        set(site.id, { phase: "success", message: "续签并部署成功" });
      } catch (err) {
        set(site.id, { phase: "error", message: `续签成功，但部署失败：${errorMessage(err, "部署失败")}` });
      }
    },
    [accessToken, set]
  );

  const renew = useCallback(
    (site: DecoratedSite) =>
      new Promise<void>((resolve) => {
        if (!accessToken) return resolve();
        set(site.id, { phase: "issuing", message: "正在提交续签任务…" });

        apiRequest<{ jobId: string }>(
          "/certificates/issue",
          { method: "POST", body: JSON.stringify({ siteId: site.id }) },
          accessToken
        )
          .then(({ jobId }) => {
            let settled = false;
            let inFlight = false;
            const finish = () => {
              window.clearInterval(timers.current[jobId]);
              delete timers.current[jobId];
              onChangedRef.current();
              resolve();
            };
            const poll = async () => {
              if (settled || inFlight) return;
              inFlight = true;
              try {
                const job = await apiRequest<Job>(`/jobs/${jobId}`, {}, accessToken);
                if (settled) return;
                if (job.status === "success") {
                  settled = true;
                  window.clearInterval(timers.current[jobId]);
                  await deploy(site);
                  finish();
                } else if (job.status === "failed") {
                  settled = true;
                  set(site.id, { phase: "error", message: job.message || "续签失败" });
                  finish();
                } else if (job.message) {
                  set(site.id, { phase: "issuing", message: job.message });
                }
              } catch (err) {
                if (settled) return;
                settled = true;
                set(site.id, { phase: "error", message: errorMessage(err, "续签失败") });
                finish();
              } finally {
                inFlight = false;
              }
            };
            timers.current[jobId] = window.setInterval(() => void poll(), 2000);
            void poll();
          })
          .catch((err: unknown) => {
            set(site.id, { phase: "error", message: errorMessage(err, "续签失败") });
            resolve();
          });
      }),
    [accessToken, deploy, set]
  );

  const remove = useCallback(
    async (siteIds: string[]) => {
      if (!accessToken) return { deleted: 0, failed: siteIds.length };
      const results = await Promise.allSettled(
        siteIds.map((id) => apiRequest(`/sites/${id}`, { method: "DELETE" }, accessToken))
      );
      const failed = results.filter((result) => result.status === "rejected").length;
      setStates((prev) => {
        const next = { ...prev };
        siteIds.forEach((id) => delete next[id]);
        return next;
      });
      onChangedRef.current();
      return { deleted: siteIds.length - failed, failed };
    },
    [accessToken]
  );

  return { states, renew, remove };
}
