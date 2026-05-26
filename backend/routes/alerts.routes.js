const express = require("express");
const router = express.Router();
const { generateAlerts } = require("../services/alertEngine");

router.get("/", (req, res) => {
  try {
    let data = generateAlerts();
    if (req.query.priority) data = data.filter((a) => a.priority === req.query.priority);
    if (req.query.city) data = data.filter((a) => a.city === req.query.city);
    res.json({ success: true, count: data.length, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;