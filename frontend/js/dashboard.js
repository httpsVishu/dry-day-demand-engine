let allRecommendations = [];
let allAlerts = [];
let allDryDays = [];
let activeFilters = {};

async function initDashboard() {
  showLoading(true);
  try {
    const [recRes, alertRes, ddRes] = await Promise.all([
      API.getRecommendations(),
      API.getAlerts(),
      API.getDryDays(),
    ]);

    allRecommendations = recRes.data;
    allAlerts = alertRes.data;
    allDryDays = ddRes.data;

    renderMetrics();
    renderAlertBanner();
    renderRecommendationsTable(allRecommendations);
    renderDryDayTimeline();
    populateFilters();
  } catch (e) {
    showError("Failed to load data. Is the backend running?");
  } finally {
    showLoading(false);
  }
}

function renderMetrics() {
  const upcomingCount = allDryDays.length;
  const highPriorityCities = new Set(
    allRecommendations.filter((r) => r.priority === "Critical" || r.priority === "High").map((r) => r.city)
  ).size;
  const totalUnits = allRecommendations.reduce((s, r) => s + r.totalUnits, 0);
  const alertCount = allAlerts.length;

  document.getElementById("metric-upcoming").textContent = upcomingCount;
  document.getElementById("metric-cities").textContent = highPriorityCities;
  document.getElementById("metric-units").textContent = totalUnits.toLocaleString("en-IN");
  document.getElementById("metric-alerts").textContent = alertCount;
}

function renderAlertBanner() {
  const container = document.getElementById("alert-previews");
  if (!container) return;
  container.innerHTML = "";

  const top = allAlerts.slice(0, 5);
  top.forEach((alert) => {
    const card = document.createElement("div");
    card.className = "alert-card";
    card.innerHTML = `
      <div class="alert-header">
        <span class="alert-city">${alert.city}</span>
        ${priorityBadge(alert.priority)}
        <span class="alert-days">${daysLabel(alert.daysUntil)}</span>
      </div>
      <div class="alert-reason">${alert.reason}</div>
      <div class="alert-message">${alert.message}</div>
      <button class="btn-copy" onclick="copyAlert(this, \`${alert.message.replace(/`/g, "'")}\`)">
        COPY ALERT
      </button>
    `;
    container.appendChild(card);
  });
}

function renderRecommendationsTable(data) {
  const tbody = document.getElementById("rec-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">NO RECOMMENDATIONS FOUND</td></tr>`;
    return;
  }

  data.forEach((rec) => {
    const topSkus = rec.skuBreakdown
      .sort((a, b) => b.recommended - a.recommended)
      .slice(0, 3);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(rec.date)}</td>
      <td><span class="city-name">${rec.city}</span><span class="state-sub">${rec.state}</span></td>
      <td>${typeTag(rec.type)}</td>
      <td class="reason-cell">${rec.reason}</td>
      <td>${priorityBadge(rec.priority)}</td>
      <td class="sku-cell">${topSkus.map((s) => skuPill(s.sku)).join("")}</td>
      <td class="units-cell">${rec.totalUnits.toLocaleString("en-IN")}</td>
      <td><span class="status-tag status-${rec.status.toLowerCase().replace(" ", "-")}">${rec.status.toUpperCase()}</span></td>
    `;
    tr.addEventListener("click", () => openDetailModal(rec));
    tbody.appendChild(tr);
  });
}

function renderDryDayTimeline() {
  const container = document.getElementById("timeline-container");
  if (!container) return;
  container.innerHTML = "";

  allDryDays.slice(0, 6).forEach((dd) => {
    const days = dd.daysUntil;
    const priority = days <= 3 ? "Critical" : days <= 7 ? "High" : days <= 14 ? "Medium" : "Low";
    const el = document.createElement("div");
    el.className = "timeline-item";
    el.innerHTML = `
      <div class="timeline-dot" style="background:${PRIORITY_COLORS[priority]}"></div>
      <div class="timeline-content">
        <div class="timeline-date">${formatDate(dd.date)}</div>
        <div class="timeline-label">${dd.reason}</div>
        <div class="timeline-cities">${dd.cities.slice(0, 3).join(" · ")}${dd.cities.length > 3 ? ` +${dd.cities.length - 3}` : ""}</div>
      </div>
      <div class="timeline-days" style="color:${PRIORITY_COLORS[priority]}">${daysLabel(days)}</div>
    `;
    container.appendChild(el);
  });
}

function populateFilters() {
  const states = [...new Set(allRecommendations.map((r) => r.state))].sort();
  const cities = [...new Set(allRecommendations.map((r) => r.city))].sort();

  const stateSelect = document.getElementById("filter-state");
  const citySelect = document.getElementById("filter-city");

  states.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    stateSelect.appendChild(opt);
  });

  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    citySelect.appendChild(opt);
  });
}

function applyFilters() {
  const state = document.getElementById("filter-state").value;
  const city = document.getElementById("filter-city").value;
  const priority = document.getElementById("filter-priority").value;
  const days = document.getElementById("filter-days").value;

  let filtered = [...allRecommendations];
  if (state) filtered = filtered.filter((r) => r.state === state);
  if (city) filtered = filtered.filter((r) => r.city === city);
  if (priority) filtered = filtered.filter((r) => r.priority === priority);
  if (days) filtered = filtered.filter((r) => r.daysUntil <= parseInt(days));

  renderRecommendationsTable(filtered);
}

function clearFilters() {
  ["filter-state", "filter-city", "filter-priority", "filter-days"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  renderRecommendationsTable(allRecommendations);
}

function openDetailModal(rec) {
  const modal = document.getElementById("detail-modal");
  document.getElementById("modal-city").textContent = rec.city;
  document.getElementById("modal-date").textContent = formatDate(rec.date);
  document.getElementById("modal-reason").textContent = rec.reason;
  document.getElementById("modal-priority").innerHTML = priorityBadge(rec.priority);
  document.getElementById("modal-days").textContent = daysLabel(rec.daysUntil);
  document.getElementById("modal-total").textContent = rec.totalUnits.toLocaleString("en-IN");

  const skuGrid = document.getElementById("modal-sku-grid");
  skuGrid.innerHTML = rec.skuBreakdown
    .map(
      (s) => `
    <div class="sku-card" style="border-color:${SKU_COLORS[s.sku]}20">
      <div class="sku-name" style="color:${SKU_COLORS[s.sku]}">${s.sku}</div>
      <div class="sku-stat">Normal: <b>${s.normal}</b></div>
      <div class="sku-stat">×<b>${s.multiplier}</b></div>
      <div class="sku-recommended">${s.recommended}</div>
      <div class="sku-unit-label">UNITS</div>
    </div>
  `
    )
    .join("");

  const alertMsg = `🔴 DRY DAY ALERT — ${rec.city} | ${daysLabel(rec.daysUntil)}\nReason: ${rec.reason}\nTotal Units: ${rec.totalUnits}\nPriority: ${rec.priority}\nSKUs: ${rec.skuBreakdown.map((s) => `${s.sku}(${s.recommended})`).join(", ")}`;
  document.getElementById("modal-alert-text").textContent = alertMsg;

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("detail-modal").classList.remove("active");
}

function copyAlert(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "COPIED ✓";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "COPY ALERT";
      btn.classList.remove("copied");
    }, 2000);
  });
}

function copyModalAlert() {
  const text = document.getElementById("modal-alert-text").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("modal-copy-btn");
    btn.textContent = "COPIED ✓";
    setTimeout(() => (btn.textContent = "COPY MESSAGE"), 2000);
  });
}

async function recalculate() {
  const btn = document.getElementById("recalc-btn");
  btn.textContent = "RECALCULATING...";
  btn.disabled = true;
  try {
    await API.recalculate();
    await initDashboard();
  } finally {
    btn.textContent = "RECALCULATE";
    btn.disabled = false;
  }
}

function showLoading(state) {
  const el = document.getElementById("loading-overlay");
  if (el) el.style.display = state ? "flex" : "none";
}

function showError(msg) {
  const el = document.getElementById("error-banner");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);