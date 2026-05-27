const fs = require("fs");
const path = require("path");
const { daysUntil, getPriority } = require("../utils/dateUtils");

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../data", file), "utf-8"));
}

function computeRecommendations() {
  const drydays = loadJSON("drydays.json");
  const cityDemand = loadJSON("cityDemand.json");
  const skuMultipliers = loadJSON("skuMultipliers.json");
  const skus = ["Malt", "Cranberry", "Peach", "Mint", "Ginger", "Strawberry"];

  const recommendations = [];

  drydays.forEach((dd) => {
    const days = daysUntil(dd.date);
    if (days < 0) return;
    const priority = getPriority(days);
    const multipliers = skuMultipliers[dd.type] || skuMultipliers["national_holiday"];

    dd.cities.forEach((city) => {
      const demand = cityDemand[city] || cityDemand["Mumbai"];

      const skuBreakdown = skus.map((sku) => {
        const normal = demand[sku] || 0;
        const multiplier = multipliers[sku] || 2.0;
        const recommended = Math.ceil(normal * multiplier);
        return { sku, normal, multiplier, recommended };
      });

      const totalUnits = skuBreakdown.reduce((s, x) => s + x.recommended, 0);

      recommendations.push({
        dryDayId: dd.id,
        date: dd.date,
        state: dd.state,
        city,
        reason: dd.reason,
        type: dd.type,
        daysUntil: days,
        priority,
        confidence: dd.confidence,
        source: dd.source,
        skuBreakdown,
        totalUnits,
        status: days <= 3 ? "Urgent" : days <= 7 ? "Action Required" : "Planned",
      });
    });
  });

  return recommendations.sort((a, b) => a.daysUntil - b.daysUntil);
}

module.exports = { computeRecommendations };