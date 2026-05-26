const express = require("express");
const router = express.Router();
const { generateCSV } = require("../services/csvExportService");

router.get("/csv", (req, res) => {
  try {
    const csv = generateCSV();
    const filename = `coolberg-dry-day-recommendations-${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;