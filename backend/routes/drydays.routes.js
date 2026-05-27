const express = require("express");
const router = express.Router();
const { getUpcomingDryDays, loadDryDays } = require("../services/dryDayService");
const { runScraper } = require("../services/scraperService");

router.get("/", (req, res) => {
  try {
    const data = req.query.upcoming === "true" ? getUpcomingDryDays() : loadDryDays();
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post("/scrape", async (req, res) => {
  try {
    const data = await runScraper();
    res.json({ success: true, message: "Scrape complete", count: data.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;