import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { AuthProvider } from "@/contexts/AuthContext";
import "./index.css";

const analyticsSnippet = import.meta.env.VITE_ANALYTICS_SNIPPET as string | undefined;

function injectAnalyticsSnippet(snippet?: string) {
  if (!snippet || typeof document === "undefined") return;
  const trimmed = snippet.trim();
  if (!trimmed) return;
  const normalizeSrc = (value: string) => value.trim().replace(/^['"]+|['"]+$/g, "");

  if (!trimmed.includes("<script")) {
    const src = normalizeSrc(trimmed);
    if (!src) return;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.setAttribute("data-analytics", "env");
    document.head.appendChild(script);
    return;
  }
  const container = document.createElement("div");
  container.innerHTML = trimmed;
  const scriptTag = container.querySelector("script");
  if (!scriptTag) return;
  const src = scriptTag.getAttribute("src");
  const normalizedSrc = src ? normalizeSrc(src) : null;
  if (normalizedSrc && document.querySelector(`script[src="${normalizedSrc}"]`)) return;
  const script = document.createElement("script");
  for (const attr of Array.from(scriptTag.attributes)) {
    if (attr.name === "src") {
      const normalized = normalizeSrc(attr.value);
      if (normalized) {
        script.setAttribute(attr.name, normalized);
      }
      continue;
    }
    script.setAttribute(attr.name, attr.value);
  }
  if (scriptTag.textContent) {
    script.text = scriptTag.textContent;
  }
  script.setAttribute("data-analytics", "env");
  document.head.appendChild(script);
}

injectAnalyticsSnippet(analyticsSnippet);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
