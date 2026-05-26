const fs = require("fs");
const path = require("path");
const { daysUntil } = require("../utils/dateUtils");

function loadDryDays() {
  const raw = fs.readFileSync(path.join(__dirname, "../data/drydays.json"), "utf-8");
  return JSON.parse(raw);
}

function getUpcomingDryDays() {
  const all = loadDryDays();
  return all
    .map((d) => ({ ...d, daysUntil: daysUntil(d.date) }))
    .filter((d) => d.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

module.exports = { loadDryDays, getUpcomingDryDays };