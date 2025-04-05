const axios = require('axios');
const { Redis } = require('@upstash/redis');
const { DateTime } = require('luxon');
const { allSupportedStocks } = require('./../const.js'); // Fix import to destructure named export

class RealTimeStockService {
    constructor(apiKey, redisClient, expirationTime = 120) {
        this.apiKey = apiKey;
        this.redisClient = redisClient;
        this.expirationTime = expirationTime;
    }

    _isStockSupported(symbol) {
        return allSupportedStocks.includes(symbol);
    }

    _checkDataExpiration(data) {
        const cachedTime = DateTime.fromISO(data.lastRefresh);
        const currentTime = DateTime.now();
        return currentTime.diff(cachedTime, 'seconds').seconds < this.expirationTime;
    }

    async _getFromRedis() {
        if (!this.redisClient) return null;

        const start = Date.now(); // Start timer
        const cachedData = await this.redisClient.get('REAL_TIME_DATA');
        const duration = Date.now() - start; // Calculate duration
        console.log(`Redis fetch time for all stocks: ${duration}ms`);

        if (cachedData) {
            try {
                return cachedData; // Parse the JSON string
            } catch (err) {
                console.error(`Redis read error:`, err.message);
            }
        }
        return null;
    }

    async _setToRedis(data) {
        if (!this.redisClient) return;
        try {
            await this.redisClient.set('REAL_TIME_DATA', JSON.stringify(data)); // Store as JSON string
        } catch (err) {
            console.error(`Redis write error:`, err.message);
        }
    }

    _isMarketOpen() {
        const now = DateTime.now().setZone('America/New_York'); // Set to New York timezone
        const dayOfWeek = now.weekday; // 1 = Monday, 7 = Sunday
        const time = now.toFormat('HH:mm');

        // Market is open Monday to Friday, 9:30 AM to 4:00 PM
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        const isWithinMarketHours = time >= '09:30' && time <= '16:00';

        return isWeekday && isWithinMarketHours;
    }

    _isDataFromLastOpenMinutes(data) {
        const lastRefresh = DateTime.fromISO(data.lastRefresh).setZone('America/New_York');
        const now = DateTime.now().setZone('America/New_York');
        const marketClosingTime = lastRefresh.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });

        // If the market is closed and the data was fetched after the market closed
        if (!this._isMarketOpen() && (lastRefresh > marketClosingTime || now.diff(lastRefresh, 'hours').hours < 12)) {
            return true;
        }

        return false;
    }

    async getRealTimeStockPrices(stocks) {
        let cachedData = await this._getFromRedis();

        const results = {};
        const stocksToFetch = [];

        for (const stock of stocks) {
            if (!this._isStockSupported(stock)) {
                results[stock] = { error: `The stock ${stock} is not supported.` };
                continue;
            }

            if (cachedData && cachedData[stock]) {
                const stockData = cachedData[stock];
                if (this._checkDataExpiration(stockData) || this._isDataFromLastOpenMinutes(stockData)) {
                    console.log(`Using cached data for ${stock}`);
                    results[stock] = stockData;
                    continue;
                }
            }

            stocksToFetch.push(stock); // Add to fetch list if not in cache or expired
        }

        if (stocksToFetch.length > 0) {
            for (const stock of stocksToFetch) {
                try {
                    const stockData = await this._stockRealTimePriceApiCall(stock);
                    if (stockData) {
                        results[stock] = stockData;

                        // Update the cached data
                        if (!cachedData) {
                            cachedData = {};
                        }
                        cachedData[stock] = stockData;
                    } else {
                        results[stock] = { error: `Could not fetch data for ${stock}` };
                    }
                } catch (error) {
                    console.error(`Error processing stock ${stock}:`, error.message);
                    results[stock] = { error: `Error fetching data for ${stock}` };
                }
            }

            // Save updated data to Redis
            await this._setToRedis(cachedData);
        }

        return results;
    }

    async getAllRealTimeStockPrices() {
        return await this.getRealTimeStockPrices(allSupportedStocks);
    }

    async _stockRealTimePriceApiCall(symbol) {
        console.log(`Fetching data for ${symbol}...`);
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`;

        const start = Date.now(); // Start timer
        try {
            const response = await axios.get(url);
            const duration = Date.now() - start; // Calculate duration
            console.log(`API fetch time for ${symbol}: ${duration}ms`);

            return {
                lastRefresh: DateTime.now().toISO(),
                price: response.data.c,
                difference: response.data.d,
                differencePercent: response.data.dp,
                high: response.data.h,
                low: response.data.l,
                open: response.data.o,
                previousClose: response.data.pc,
            };
        } catch (error) {
            const duration = Date.now() - start; // Calculate duration even on error
            console.log(`API fetch time for ${symbol} (failed): ${duration}ms`);

            if (error.response?.status === 429) {
                console.error('Rate limit exceeded for API');
            } else {
                console.error('Error fetching data:', error.message);
            }
            return null;
        }
    }
}


const STOCK_API_KEY = process.env.REAL_TIME_API_KEY;

const redisClient = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

const stockService = new RealTimeStockService(STOCK_API_KEY, redisClient);

module.exports = stockService;
