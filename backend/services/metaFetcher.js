
import fetch from "node-fetch";

const TIMEOUT_MS = 4000;

export const fetchPageTitle = async (url) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BookmarkManager/1.0 (title-fetcher)" },
    });
    clearTimeout(timer);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (match?.[1]) return match[1].trim().slice(0, 200);

    return new URL(url).hostname;
  } catch {
    try { return new URL(url).hostname; } catch { return url; }
  }
};