const express = require("express");
const router = express.Router();
const { getUpcomingDryDays, loadDryDays } = require("../services/dryDayService");

router.get("/", (req, res) => {
  try {
    const { upcoming } = req.query;
    const data = upcoming === "true" ? getUpcomingDryDays() : loadDryDays();
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;