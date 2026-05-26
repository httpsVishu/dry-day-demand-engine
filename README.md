# Coolberg Dry Day Demand Engine

Internal sales ops tool for pre-positioning Coolberg stock before dry days.

## Setup

```bash
cd backend
npm install
npm start
```

Open http://localhost:3001 in your browser.

## Structure

- `backend/` — Node.js + Express API
- `frontend/` — HTML, CSS, vanilla JS
- `backend/data/` — JSON mock data (dry days, city demand, SKU multipliers)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/drydays | All dry days |
| GET | /api/recommendations | City+SKU recommendations (filterable) |
| GET | /api/alerts | Active alerts |
| GET | /api/export/csv | Download CSV |
| POST | /api/recommendations/recalculate | Force recalculate |

## Query Params (recommendations)

`?state=Maharashtra&city=Mumbai&priority=High&days=7`

## Deployment

- **Frontend**: Deploy `/frontend` to Vercel (static)
- **Backend**: Deploy `/backend` to Render (Node.js web service)
- Set `API_BASE` in `frontend/js/api.js` to your Render URL for production