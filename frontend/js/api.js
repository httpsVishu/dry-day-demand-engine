const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:3001/api"
  : "https://dry-day-demand-engine.onrender.com/api";

async function fetchJSON(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

const API = {
  getDryDays: () => fetchJSON("/drydays?upcoming=true"),
  getRecommendations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJSON(`/recommendations${q ? "?" + q : ""}`);
  },
  getAlerts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJSON(`/alerts${q ? "?" + q : ""}`);
  },
  recalculate: () => fetchJSON("/recommendations/recalculate", { method: "POST" }),
  exportCSV: () => window.open(`${API_BASE}/export/csv`, "_blank"),
  triggerScrape: () => fetchJSON("/drydays/scrape", { method: "POST" }),
  getScraperStatus: () => fetchJSON("/scraper/status"),
};