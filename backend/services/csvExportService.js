const { computeRecommendations } = require("./demandEngine");

function generateCSV() {
  const recs = computeRecommendations();
  const rows = [];

  const headers = [
    "Date",
    "State",
    "City",
    "Reason",
    "Type",
    "Days Until",
    "Priority",
    "SKU",
    "Normal Weekly Demand",
    "Multiplier",
    "Recommended Stock",
    "Total City Units",
    "Confidence",
    "Status",
    "Source",
  ];

  rows.push(headers.join(","));

  recs.forEach((rec) => {
    rec.skuBreakdown.forEach((sku) => {
      const row = [
        rec.date,
        `"${rec.state}"`,
        `"${rec.city}"`,
        `"${rec.reason}"`,
        rec.type,
        rec.daysUntil,
        rec.priority,
        sku.sku,
        sku.normal,
        sku.multiplier,
        sku.recommended,
        rec.totalUnits,
        rec.confidence,
        rec.status,
        rec.source,
      ];
      rows.push(row.join(","));
    });
  });

  return rows.join("\n");
}

module.exports = { generateCSV };