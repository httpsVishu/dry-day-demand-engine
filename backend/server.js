const express = require("express");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const { runScraper } = require("./services/scraperService");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/drydays", require("./routes/drydays.routes"));
app.use("/api/recommendations", require("./routes/recommendations.routes"));
app.use("/api/alerts", require("./routes/alerts.routes"));
app.use("/api/export", require("./routes/export.routes"));

app.get("/api/scraper/run", async (req, res) => {
  try {
    console.log("[API] Manual scrape triggered");
    const data = await runScraper();
    res.json({ success: true, message: "Scrape complete", count: data.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/scraper/status", (req, res) => {
  const fs = require("fs");
  const p = path.join(__dirname, "data/drydays.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    const scraped = data.filter((d) => d.scraped);
    const lastScrape = scraped.length
      ? scraped.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt))[0].scrapedAt
      : null;
    res.json({ success: true, total: data.length, scraped: scraped.length, manual: data.length - scraped.length, lastScrape });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, async () => {
  console.log(`Coolberg Dry Day Engine running on http://localhost:${PORT}`);
  console.log("[Scraper] Running initial scrape on startup...");
  try {
    await runScraper();
    console.log("[Scraper] Initial scrape complete");
  } catch (e) {
    console.error("[Scraper] Initial scrape failed, using existing data:", e.message);
  }
});

cron.schedule("0 */6 * * *", async () => {
  console.log("[Cron] Running scheduled scrape...");
  try {
    await runScraper();
    console.log("[Cron] Scheduled scrape complete");
  } catch (e) {
    console.error("[Cron] Scrape failed:", e.message);
  }
});