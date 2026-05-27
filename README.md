# Coolberg Dry Day Demand Engine

An internal sales ops intelligence tool built for Coolberg (Ghodawat Consumer Limited) that automatically detects upcoming dry days across Indian cities and pre-calculates SKU-level stock recommendations before demand spikes hit. The engine scrapes Google News RSS feeds every 6 hours for election and festival dry day announcements, merges them with auto-generated national holiday data and computes city-wise demand uplift using configurable multipliers per event type. Sales teams get a real-time dashboard with copy-ready WhatsApp-style alerts, priority-ranked city recommendations and one-click CSV export, eliminating the manual effort of tracking dry days across 14 states.

## Problem It Solves

Coolberg loses significant revenue on dry days because stock isn't pre-positioned in advance. Distributors and retailers run dry while demand spikes, especially around elections and national holidays. This tool gives the sales ops team 1–14 days of advance warning with exact SKU quantities to push city by city.

## Live Demo

- **Frontend**: https://dry-day-demand-engine.vercel.app
- **Backend**: [https://dry-day-demand-engine.onrender.com](https://dry-day-demand-engine.onrender.com)

> Note: Render free tier spins down after inactivity. First load may take 30–60 seconds for the backend to wake up.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, Tailwind CSS CDN, Vanilla JavaScript |
| Backend | Node.js, Express |
| Scraping | Axios, Cheerio, Google News RSS |
| Scheduling | node-cron (scrapes every 6 hours) |
| Storage | JSON flat files |
| Export | CSV (server-generated) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

## Repo Structure

```
dry-day-demand-engine/
│
├── frontend/
│   ├── index.html              # Landing page
│   ├── dashboard.html          # Main sales ops dashboard
│   ├── css/
│   │   └── styles.css          # CSS variables, custom components
│   └── js/
│       ├── api.js              # All fetch calls to backend
│       ├── utils.js            # SKU colors, badges, formatters
│       └── dashboard.js        # Dashboard logic, renders, filters
│
├── backend/
│   ├── server.js               # Express app, cron scheduler
│   ├── routes/
│   │   ├── drydays.routes.js
│   │   ├── recommendations.routes.js
│   │   ├── alerts.routes.js
│   │   └── export.routes.js
│   ├── services/
│   │   ├── scraperService.js   # Google News scraper + national holidays
│   │   ├── dryDayService.js
│   │   ├── demandEngine.js     # SKU multiplier calculations
│   │   ├── alertEngine.js      # Alert generation logic
│   │   └── csvExportService.js
│   ├── data/
│   │   ├── drydays.json        # Auto-updated by scraper
│   │   ├── cityDemand.json     # Weekly demand per city per SKU
│   │   └── skuMultipliers.json # Multipliers per event type
│   ├── utils/
│   │   └── dateUtils.js
│   └── package.json
│
└── README.md
```
