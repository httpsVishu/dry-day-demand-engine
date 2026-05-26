function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getPriority(daysLeft) {
  if (daysLeft <= 3) return "Critical";
  if (daysLeft <= 7) return "High";
  if (daysLeft <= 14) return "Medium";
  return "Low";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

module.exports = { daysUntil, getPriority, formatDate };