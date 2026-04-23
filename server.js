import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const MOEX_API_KEY = process.env.MOEX_API_KEY;

app.get("/", (req, res) => {
  res.json({ ok: true, service: "moex-backend" });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(MOEX_API_KEY)
  });
});

app.get("/api/futoi", async (req, res) => {
  try {
    if (!MOEX_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "MOEX_API_KEY not set"
      });
    }

    const ticker = String(req.query.ticker || "").trim().toLowerCase();
    const from = String(req.query.from || "").trim();
    const till = String(req.query.till || "").trim();

    if (!ticker || !from || !till) {
      return res.status(400).json({
        ok: false,
        error: "ticker, from, till are required"
      });
    }

    const params = new URLSearchParams({
      from,
      till,
      "iss.meta": "off",
      "iss.only": "futoi",
      limit: "50000"
    });

    const url = `https://apim.moex.com/iss/analyticalproducts/futoi/securities/${ticker}.json?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${MOEX_API_KEY}`
      }
    });

    const text = await response.text();
    res.status(response.status).type("application/json").send(text);
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
