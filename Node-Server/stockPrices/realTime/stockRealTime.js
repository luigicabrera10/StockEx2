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

    async init() {
        if (this.redisClient && !this.redisClient.isOpen) {
            try {
                await this.redisClient.connect();
                console.log("Redis connected");
            } catch (err) {
                console.error("Redis connection failed:", err.message);
                this.redisClient = null;
            }
        }
    }

    _isStockSupported(symbol) {
        return allSupportedStocks.includes(symbol);
    }

    _checkDataExpiration(data) {
        const cachedTime = DateTime.fromISO(data.lastRefresh);
        const currentTime = DateTime.now();
        return currentTime.diff(cachedTime, 'seconds').seconds < this.expirationTime;
    }

    async _getFromRedis(stock) {
        if (!this.redisClient) return null;

        const cachedData = await this.redisClient.get('CURRENT_'+stock);
        if (cachedData) {
            try {
                return cachedData; 
            } catch (err) {
                console.error(`Redis read error for ${stock}:`, err.message);
            }
        }
    }

    async _setToRedis(stock, data) {
        if (!this.redisClient) return;
        try {
            await this.redisClient.set('CURRENT_'+stock, JSON.stringify(data)); // Store as JSON string
        } catch (err) {
            console.error(`Redis write error for ${stock}:`, err.message);
        }
    }

    async getRealTimeStockPrices(stocks) {
        for (const stock of stocks) {
            if (!this._isStockSupported(stock)) {
                return { error: `The stock ${stock} is not supported.` };
            }
        }

        const results = {};

        for (const stock of stocks) {
            try {
                const cachedData = await this._getFromRedis(stock);

                if (cachedData && this._checkDataExpiration(cachedData)) {
                    console.log(`Using cached data for ${stock}`);
                    results[stock] = cachedData;
                    continue;
                }

                const stockData = await this._stockRealTimePriceApiCall(stock);
                if (stockData) {
                    await this._setToRedis(stock, stockData);
                    results[stock] = stockData;
                } else {
                    results[stock] = { error: `Could not fetch data for ${stock}` };
                }
            } catch (error) {
                console.error(`Error processing stock ${stock}:`, error.message);
                results[stock] = { error: `Error fetching data for ${stock}` };
            }
        }

        return results;
    }

    async getAllRealTimeStockPrices() {
        return await this.getRealTimeStockPrices(allSupportedStocks);
    }

    async _stockRealTimePriceApiCall(symbol) {
        console.log(`Fetching data for ${symbol}...`);
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`;
        
        try {
            const response = await axios.get(url);
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
