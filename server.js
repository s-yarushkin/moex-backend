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

app.get("/api/test", async (req, res) => {
  try {
    if (!MOEX_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "MOEX_API_KEY not set"
      });
    }

    const response = await fetch(
      "https://apim.moex.com/iss/statistics/engines/futures/markets/forts/analytics/open-positions",
      {
        headers: {
          Authorization: `Bearer ${MOEX_API_KEY}`
        }
      }
    );

    const text = await response.text();
    res.status(response.status).send(text);
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
