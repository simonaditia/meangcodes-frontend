import { useEffect } from "react";

function upsertMeta(name, content, key = "name") {
  if (!content) {
    return;
  }

  const selector = `meta[${key}="${name}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(key, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(url) {
  if (!url) {
    return;
  }

  let canonical = document.head.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);
}

function upsertJsonLd(id, data) {
  if (!data) {
    return;
  }

  const tagId = `seo-jsonld-${id}`;
  let script = document.getElementById(tagId);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = tagId;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function useSeoMetadata(metadata) {
  useEffect(() => {
    if (!metadata) {
      return;
    }

    if (metadata.title) {
      document.title = metadata.title;
    }

    upsertMeta("description", metadata.description || "");
    upsertMeta("keywords", metadata.keywords || "");
    upsertMeta("og:title", metadata.ogTitle || metadata.title || "", "property");
    upsertMeta("og:description", metadata.ogDescription || metadata.description || "", "property");
    upsertMeta("og:type", metadata.ogType || "article", "property");
    upsertMeta("og:url", metadata.url || "", "property");
    upsertMeta("og:image", metadata.image || "", "property");
    upsertMeta("twitter:card", metadata.twitterCard || "summary_large_image");
    upsertMeta("twitter:title", metadata.twitterTitle || metadata.title || "");
    upsertMeta("twitter:description", metadata.twitterDescription || metadata.description || "");
    upsertMeta("twitter:image", metadata.image || "");
    upsertCanonical(metadata.url || "");

    if (metadata.structuredData) {
      upsertJsonLd("article", metadata.structuredData);
    }
  }, [metadata]);
}
