const SKU_COLORS = {
  Malt: "#D4A843",
  Cranberry: "#C2185B",
  Peach: "#E8873A",
  Mint: "#2E7D5E",
  Ginger: "#B5651D",
  Strawberry: "#E53935",
};

const PRIORITY_COLORS = {
  Critical: "#FF3B3B",
  High: "#FF8C00",
  Medium: "#F5C518",
  Low: "#4CAF50",
};

const TYPE_LABELS = {
  election: "ELECTION",
  national_holiday: "NATIONAL HOLIDAY",
  festival: "FESTIVAL",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLabel(n) {
  if (n === 0) return "TODAY";
  if (n === 1) return "TOMORROW";
  return `${n} DAYS`;
}

function priorityBadge(priority) {
  const color = PRIORITY_COLORS[priority] || "#fff";
  return `<span class="badge" style="border-color:${color};color:${color}">${priority.toUpperCase()}</span>`;
}

function skuPill(sku) {
  const color = SKU_COLORS[sku] || "#fff";
  return `<span class="sku-pill" style="border-color:${color};color:${color}">${sku}</span>`;
}

function typeTag(type) {
  const label = TYPE_LABELS[type] || type.toUpperCase();
  return `<span class="type-tag">${label}</span>`;
}