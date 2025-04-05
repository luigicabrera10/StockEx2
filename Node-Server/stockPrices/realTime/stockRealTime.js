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

                if (cachedData) {
                    if (this._checkDataExpiration(cachedData) || this._isDataFromLastOpenMinutes(cachedData)) {
                        console.log(`Using cached data for ${stock}`);
                        results[stock] = cachedData;
                        continue;
                    }
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
