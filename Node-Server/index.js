require('dotenv').config();
const express = require("express");
const cors = require('cors');
const stockRealTimeService = require('./stockPrices/realTime/stockRealTime.js'); // Import the stockRealTimeService object
const stockHistoricalService = require('./stockPrices/historical/stockHistorical.js'); // Import the stockHistoricalService object

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:3000', // My local host
    'https://stock-ex2.vercel.app', // Replace with deployed frontend domain
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
}));

// Middleware to protect backend with x-api-key
app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];

  if (!clientKey || clientKey !== process.env.ATHORIZED_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }

  next();
});

// Get all stock data
app.get("/stocks/all", async (req, res) => {
  try {
    console.log("New request: Fetching all stock prices");
    const data = await stockRealTimeService.getAllRealTimeStockPrices(); // Use stockRealTimeService object
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve data" });
  }
});

// Get stock data for a list of ticker symbols
app.get("/stocks", async (req, res) => {
  try {
    console.log("New request: Fetching stock prices for specific symbols");
    const { symbols } = req.query; // Expecting a comma-separated list of symbols
    if (!symbols) {
      return res.status(400).json({ error: "No symbols provided" });
    }
    console.log("Symbols: ", symbols);
    const stockList = symbols.split(",");
    const data = await stockRealTimeService.getRealTimeStockPrices(stockList); // Use stockRealTimeService object
    res.json(data);
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ error: "Could not retrieve data" });
  }
});

// Get historical prices for a specific stock
app.get("/stocks/historical", async (req, res) => {
  try {
    console.log("New request: Fetching historical prices for a stock");
    const { symbol } = req.query; // Expecting a single stock symbol
    if (!symbol) {
      return res.status(400).json({ error: "No symbol provided" });
    }
    console.log("Symbol: ", symbol);
    const data = await stockHistoricalService.getHistoricalPrices(symbol); // Use stockHistoricalService object
    res.json(data);
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ error: "Could not retrieve historical data" });
  }
});

// Get preview of historical prices for all stocks
app.get("/stocks/historical/preview", async (req, res) => {
  try {
    console.log("New request: Fetching preview of historical prices");
    const data = await stockHistoricalService.getPreviewHistoricalPrices(); // Use stockHistoricalService object
    res.json(data);
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ error: "Could not retrieve preview data" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));