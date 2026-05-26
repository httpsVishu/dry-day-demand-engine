const express = require("express");
const router = express.Router();
const { computeRecommendations } = require("../services/demandEngine");

router.get("/", (req, res) => {
  try {
    let data = computeRecommendations();

    if (req.query.state) data = data.filter((r) => r.state === req.query.state);
    if (req.query.city) data = data.filter((r) => r.city === req.query.city);
    if (req.query.priority) data = data.filter((r) => r.priority === req.query.priority);
    if (req.query.days) data = data.filter((r) => r.daysUntil <= parseInt(req.query.days));

    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post("/recalculate", (req, res) => {
  try {
    const data = computeRecommendations();
    res.json({ success: true, message: "Recalculated", count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;