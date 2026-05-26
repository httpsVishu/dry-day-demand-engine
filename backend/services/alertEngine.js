const { computeRecommendations } = require("./demandEngine");

const ALERT_WINDOWS = [1, 3, 7, 14];

function generateAlerts() {
  const recs = computeRecommendations();
  const alerts = [];

  recs.forEach((rec) => {
    ALERT_WINDOWS.forEach((window) => {
      if (rec.daysUntil <= window) {
        const topSkus = rec.skuBreakdown
          .sort((a, b) => b.recommended - a.recommended)
          .slice(0, 3)
          .map((s) => s.sku)
          .join(", ");

        const multiplierStr = rec.skuBreakdown[0]
          ? `${rec.skuBreakdown[0].multiplier}x`
          : "2x";

        alerts.push({
          id: `alert-${rec.dryDayId}-${rec.city}-${window}d`,
          dryDayId: rec.dryDayId,
          city: rec.city,
          state: rec.state,
          date: rec.date,
          daysUntil: rec.daysUntil,
          reason: rec.reason,
          priority: rec.priority,
          window,
          totalUnits: rec.totalUnits,
          topSkus,
          multiplierStr,
          message: `🔴 DRY DAY ALERT — ${rec.city} | ${rec.daysUntil} day(s) away\nReason: ${rec.reason}\nPush ${multiplierStr} stock for: ${topSkus}\nTotal Units to Pre-position: ${rec.totalUnits}\nPriority: ${rec.priority}`,
          status: rec.status,
        });
      }
    });
  });

  const seen = new Set();
  return alerts.filter((a) => {
    const key = `${a.dryDayId}-${a.city}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { generateAlerts };