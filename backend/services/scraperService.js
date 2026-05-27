const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const DRYDAYS_PATH = path.join(__dirname, "../data/drydays.json");

const STATE_CITY_MAP = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  Telangana: ["Hyderabad", "Secunderabad", "Warangal"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar"],
  Haryana: ["Gurugram", "Faridabad", "Panipat"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
};

const STATE_KEYWORDS = Object.keys(STATE_CITY_MAP);

const TYPE_KEYWORDS = {
  election: ["election", "polling", "voting", "poll", "by-election", "bypoll", "lok sabha", "assembly election", "counting"],
  festival: ["diwali", "holi", "ganesh", "navratri", "eid", "muharram", "buddha purnima", "janmashtami", "dussehra", "ram navami", "mahavir", "guru nanak", "christmas", "good friday"],
  national_holiday: ["independence day", "republic day", "gandhi jayanti"],
};

function detectType(text) {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return type;
  }
  return "national_holiday";
}

function detectStates(text) {
  const lower = text.toLowerCase();
  const found = STATE_KEYWORDS.filter((s) => lower.includes(s.toLowerCase()));
  return found.length ? found : ["All States"];
}

function detectCities(states) {
  if (states.includes("All States")) {
    return [...new Set(Object.values(STATE_CITY_MAP).flat())].slice(0, 8);
  }
  return [...new Set(states.flatMap((s) => STATE_CITY_MAP[s] || []))];
}

function parseDateFromText(text) {
  const year = new Date().getFullYear();
  const months = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
    jan: "01", feb: "02", mar: "03", apr: "04", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };

  const patterns = [
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s*,?\s*(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\s*,?\s*(\d{4})/i,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        if (pattern === patterns[0]) {
          const day = match[1].padStart(2, "0");
          const month = months[match[2].toLowerCase()];
          const yr = match[3];
          const d = new Date(`${yr}-${month}-${day}`);
          if (!isNaN(d)) return d.toISOString().split("T")[0];
        } else if (pattern === patterns[1]) {
          const month = months[match[1].toLowerCase()];
          const day = match[2].padStart(2, "0");
          const yr = match[3];
          const d = new Date(`${yr}-${month}-${day}`);
          if (!isNaN(d)) return d.toISOString().split("T")[0];
        } else if (pattern === patterns[2]) {
          return match[0];
        } else if (pattern === patterns[3]) {
          const d = new Date(`${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`);
          if (!isNaN(d)) return d.toISOString().split("T")[0];
        }
      } catch (e) {
        continue;
      }
    }
  }
  return null;
}

function getNationalHolidays() {
  const year = new Date().getFullYear();
  const nextYear = year + 1;
  const allCities = [...new Set(Object.values(STATE_CITY_MAP).flat())];

  return [
    {
      id: `nh-republic-${year}`,
      date: `${year}-01-26`,
      state: "All States",
      cities: allCities,
      reason: "Republic Day",
      source: "https://india.gov.in",
      confidence: "High",
      type: "national_holiday",
      scraped: false,
    },
    {
      id: `nh-independence-${year}`,
      date: `${year}-08-15`,
      state: "All States",
      cities: allCities,
      reason: "Independence Day",
      source: "https://india.gov.in",
      confidence: "High",
      type: "national_holiday",
      scraped: false,
    },
    {
      id: `nh-gandhi-${year}`,
      date: `${year}-10-02`,
      state: "All States",
      cities: allCities,
      reason: "Gandhi Jayanti",
      source: "https://india.gov.in",
      confidence: "High",
      type: "national_holiday",
      scraped: false,
    },
    {
      id: `nh-republic-${nextYear}`,
      date: `${nextYear}-01-26`,
      state: "All States",
      cities: allCities,
      reason: "Republic Day",
      source: "https://india.gov.in",
      confidence: "High",
      type: "national_holiday",
      scraped: false,
    },
    {
      id: `nh-independence-${nextYear}`,
      date: `${nextYear}-08-15`,
      state: "All States",
      cities: allCities,
      reason: "Independence Day",
      source: "https://india.gov.in",
      confidence: "High",
      type: "national_holiday",
      scraped: false,
    },
    {
      id: `nh-gandhi-${nextYear}`,
      date: `${nextYear}-10-02`,
      state: "All States",
      cities: allCities,
      reason: "Gandhi Jayanti",
      source: "https://india.gov.in",
      confidence: "High",
      type: "national_holiday",
      scraped: false,
    },
  ];
}

async function scrapeGoogleNews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CoolbergBot/1.0)" },
    });
    const $ = cheerio.load(res.data, { xmlMode: true });
    const items = [];
    $("item").each((_, el) => {
      items.push({
        title: $(el).find("title").text(),
        description: $(el).find("description").text(),
        pubDate: $(el).find("pubDate").text(),
        link: $(el).find("link").text() || $(el).find("guid").text(),
      });
    });
    return items.slice(0, 15);
  } catch (e) {
    console.error(`[Scraper] Google News fetch failed for "${query}":`, e.message);
    return [];
  }
}

async function scrapeIndiaHolidaysSite() {
  try {
    const year = new Date().getFullYear();
    const url = `https://www.india.gov.in/calendar/${year}`;
    const res = await axios.get(url, { timeout: 10000, headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(res.data);
    const holidays = [];

    $("table tr, .holiday-list li, .calendar-event").each((_, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes("dry") || text.toLowerCase().includes("holiday")) {
        const date = parseDateFromText(text);
        if (date) holidays.push({ text, date });
      }
    });
    return holidays;
  } catch (e) {
    return [];
  }
}

function parseNewsItemsToDryDays(items, sourceQuery) {
  const results = [];
  const seen = new Set();

  items.forEach((item) => {
    const fullText = `${item.title} ${item.description}`;
    const lowerText = fullText.toLowerCase();

    if (!lowerText.includes("dry day") && !lowerText.includes("dry-day") && !lowerText.includes("liquor ban") && !lowerText.includes("alcohol ban")) {
      return;
    }

    const date = parseDateFromText(fullText) || parseDateFromText(item.pubDate);
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    if (eventDate < today) return;

    const states = detectStates(fullText);
    const cities = detectCities(states);
    const type = detectType(fullText);

    const key = `${date}-${states.join("-")}`;
    if (seen.has(key)) return;
    seen.add(key);

    const reason = item.title
      .replace(/<[^>]*>/g, "")
      .replace(/dry day.*/i, "")
      .replace(/alcohol ban.*/i, "")
      .trim()
      .substring(0, 80) || sourceQuery;

    results.push({
      id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      date,
      state: states.length === 1 ? states[0] : states.join(", "),
      cities,
      reason: reason || sourceQuery,
      source: item.link || "https://news.google.com",
      confidence: "Medium",
      type,
      scraped: true,
      scrapedAt: new Date().toISOString(),
    });
  });

  return results;
}

async function runScraper() {
  console.log("[Scraper] Starting dry day data collection...");

  const queries = [
    "India dry day 2026",
    "election dry day India 2026",
    "dry day Maharashtra Mumbai 2026",
    "dry day Delhi 2026",
    "dry day Karnataka Bangalore 2026",
    "liquor ban election India 2026",
    "dry day festival India 2026",
  ];

  const allNewsItems = [];
  for (const query of queries) {
    console.log(`[Scraper] Fetching: "${query}"`);
    const items = await scrapeGoogleNews(query);
    allNewsItems.push(...items);
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`[Scraper] Raw news items collected: ${allNewsItems.length}`);

  const scrapedDryDays = parseNewsItemsToDryDays(allNewsItems, "Scraped Event");
  const nationalHolidays = getNationalHolidays();

  const existing = fs.existsSync(DRYDAYS_PATH)
    ? JSON.parse(fs.readFileSync(DRYDAYS_PATH, "utf-8"))
    : [];

  const manualEntries = existing.filter((e) => !e.scraped);

  const merged = deduplicateAndMerge([...nationalHolidays, ...manualEntries, ...scrapedDryDays]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = merged.filter((d) => new Date(d.date) >= today);
  const sorted = future.sort((a, b) => new Date(a.date) - new Date(b.date));

  fs.writeFileSync(DRYDAYS_PATH, JSON.stringify(sorted, null, 2));

  console.log(`[Scraper] Done. Total dry days saved: ${sorted.length} (${scrapedDryDays.length} scraped, ${nationalHolidays.length} national holidays, ${manualEntries.length} manual)`);
  return sorted;
}

function deduplicateAndMerge(entries) {
  const map = new Map();

  entries.forEach((entry) => {
    const key = `${entry.date}-${entry.state}`;
    if (!map.has(key)) {
      map.set(key, entry);
    } else {
      const existing = map.get(key);
      if (entry.confidence === "High" && existing.confidence !== "High") {
        map.set(key, entry);
      }
    }
  });

  return Array.from(map.values());
}

if (require.main === module) {
  runScraper()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { runScraper };