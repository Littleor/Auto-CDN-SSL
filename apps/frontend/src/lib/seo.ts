import { useEffect } from "react";

type StructuredData = Record<string, unknown> | Record<string, unknown>[];

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
  keywords?: string;
  type?: "website" | "article";
  structuredData?: StructuredData;
};

const DEFAULT_SITE_NAME = "Auto CDN SSL";
const DEFAULT_SITE_URL = "https://auto-cdn-ssl.littleor.cn";
const DEFAULT_IMAGE = `${DEFAULT_SITE_URL}/og-image.svg`;

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function resolveSiteUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_URL;
  }
  return window.location.origin || DEFAULT_SITE_URL;
}

function normalizeStructuredData(input?: StructuredData) {
  if (!input) return null;
  return Array.isArray(input) ? input : [input];
}

export function usePageSeo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  robots = "index,follow",
  keywords,
  type = "website",
  structuredData
}: SeoOptions) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const siteUrl = resolveSiteUrl();
    const canonical = new URL(path, `${siteUrl}/`).toString();
    const absoluteImage = image.startsWith("http") ? image : new URL(image, `${siteUrl}/`).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", absoluteImage);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", DEFAULT_SITE_NAME);
    upsertMeta("property", "og:locale", "zh_CN");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", absoluteImage);
    upsertMeta("property", "og:image:alt", `${DEFAULT_SITE_NAME} 页面预览`);
    upsertLink("canonical", canonical);

    if (keywords) {
      upsertMeta("name", "keywords", keywords);
    }

    const items = normalizeStructuredData(structuredData);
    const scripts: HTMLScriptElement[] = [];

    if (items) {
      items.forEach((item) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-script", "true");
        script.text = JSON.stringify(item);
        document.head.appendChild(script);
        scripts.push(script);
      });
    }

    return () => {
      scripts.forEach((script) => script.remove());
    };
  }, [description, image, keywords, path, robots, structuredData, title, type]);
}

