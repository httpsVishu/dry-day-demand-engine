const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/drydays", require("./routes/drydays.routes"));
app.use("/api/recommendations", require("./routes/recommendations.routes"));
app.use("/api/alerts", require("./routes/alerts.routes"));
app.use("/api/export", require("./routes/export.routes"));

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`Coolberg Dry Day Engine running on http://localhost:${PORT}`);
});