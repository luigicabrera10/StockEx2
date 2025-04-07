const axios = require('axios');
const { Redis } = require('@upstash/redis');
const { DateTime } = require('luxon');
const { allSupportedStocks } = require('./../const.js'); 

class HistoricalStockService {

    constructor(apiKey, redisClient, preview_size = 10) {
        this.apiKey = apiKey;
        this.redisClient = redisClient;

        this.startDateHistorical = '2020-01-01 07:00:00';
        this.preview_size = preview_size;
        this.apiCooldown = 15; // seconds
        this.lastUsed = DateTime.now();

        this._updateAllStocks();
    }

    _isStockSupported(symbol) {
        return allSupportedStocks.includes(symbol);
    }

    async _checkApiCooldown() {

        // Check if the API cooldown period has passed
        const now = DateTime.now();
        const diff = now.diff(this.lastUsed, 'seconds').seconds;
        if (diff < this.apiCooldown) {
            console.log("API cooldown: waiting for ", this.apiCooldown - diff, " seconds.");
            await new Promise(resolve => setTimeout(resolve, (this.apiCooldown - diff) * 1000));
        }
        this.lastUsed = now; // Update the last used time
        return false; // No need to wait
    }

    async _getFromRedisSymbol(symbol) {
        if (!this.redisClient) return null;

        const start = Date.now(); // Start timer
        const cachedData = await this.redisClient.get('H_'+symbol);
        const duration = Date.now() - start; // Calculate duration
        console.log(`Redis fetch time for historical: ${duration}ms`);

        if (cachedData) {
            try {
                if (cachedData.length > 0) {
                    return cachedData; // there is data
                }
                return null; // Its empty
            } catch (err) {
                console.error(`Redis read error:`, err.message);
                return null;
            }
        }

        return null;
    }

    async _setToRedisSymbol(symbol, data) {
        if (!this.redisClient) return;

        // Save entire time serie
        try {
            await this.redisClient.set('H_'+symbol, JSON.stringify(data)); 
        } catch (err) {
            console.error(`Redis write (time serie) error:`, err.message);
        }

        // Get overview of the serie
        const cachedData = await this.redisClient.get('OVERVIEW');

        // Update overview data
        let overview = {};
        if (cachedData) {
            overview = cachedData;
            overview[symbol] = data.slice(0, this.preview_size); // Get the first X elements
        }
        else{
            console.log("No overview data, creating it...");
            overview[symbol] = data.slice(0, this.overview_size); // Get the first X elements
        }

        // Save overview data
        try {
            await this.redisClient.set('OVERVIEW', JSON.stringify(overview)); // Store as JSON string
        } catch (err) {
            console.error(`Redis write (overview) error:`, err.message);
        }

    }

    async _stockHistoricalApiCall(symbol, startDate, useCooldown = false) {

        const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=${this.apiKey}&start_date=${startDate}`;
        
        try {

            if (useCooldown) {
                await this._checkApiCooldown(); // Check API cooldown before making the request
            }

            const response = await axios.get(url, {
                headers: {'User-Agent': 'axios'}
            });

            const keys = Object.keys(response.data);

            // Handle api limit rate
            if (keys.includes("message")) {
                console.log("API ERROR ON SYMBOL '", symbol,": ", response.data.message);
                return null;
            }

            return response.data.values;

        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }

    }


    _dataNeedsUpdate(cachedData) {
        if (!cachedData || cachedData.length === 0) return true;

        const lastCandleDate = DateTime.fromISO(cachedData[0].datetime).startOf('day');
        const today = DateTime.now().startOf('day');

        // Calculate the last market day (excluding today)
        let lastMarketDay = today.minus({ days: 1 });
        while (lastMarketDay.weekday > 5) { // Skip weekends (Saturday=6, Sunday=7)
            lastMarketDay = lastMarketDay.minus({ days: 1 });
        }

        // Check if the last candle date is earlier than the last market day
        return lastCandleDate < lastMarketDay;
    }

    _calculateStartDate(cachedData) {
        if (!cachedData || cachedData.length === 0) return this.startDateHistorical;

        const lastCandleDate = DateTime.fromISO(cachedData[0].datetime);
        const nextDay = lastCandleDate.plus({ days: 1 });

        return nextDay.toFormat('yyyy-MM-dd HH:mm:ss'); // Return the date in the same format as this.startDateHistorical
    }

    async getHistoricalPrices(stock, useCooldown = false) {
        
        const cachedData = await this._getFromRedisSymbol(stock);

        if (cachedData) {

            // Check if data needs to be updated
            if (this._dataNeedsUpdate(cachedData)) {
                console.log(`Cached data for ${stock} is outdated, fetching new data...`);
                
                const startDate = this._calculateStartDate(cachedData);
                const data = await this._stockHistoricalApiCall(stock, startDate, useCooldown); 

                if (!data) {
                    console.log(`Failed to fetch data for ${stock}`);
                    return { values: cachedData }; // Return null if fetching failed
                }

                // Unify the data, data from api first, the cached data
                const unifiedData = [...data, ...cachedData]; // Merge the two arrays

                // Update Redis with the new data (ASYNC)
                this._setToRedisSymbol(stock, unifiedData); // Save the merged data to Redis

                return {values: unifiedData}; // Return the merged data
            } else{
                console.log(`Using cached data for ${stock}`);
                return {values: cachedData}; 
            }

        }
        else{
            console.log(`Cached data for ${stock} is not available`);

            const data = await this._stockHistoricalApiCall(stock, this.startDateHistorical); 
            if (data) {
                console.log(`Fetched data (API) for ${stock}`);

                // Save to Redis (ASYNC)
                this._setToRedisSymbol(stock, data); // Save the fetched data to Redis

                return {values: data}; // Return the fetched data
            } else {
                console.log(`Failed to fetch data for ${stock}`);
                return { error: `Error fetching data for ${stock}` }; // Return null if fetching failed
            }
        }

    }

    async _updateAllStocks(){
        for (const stock of allSupportedStocks) {
            await this.getHistoricalPrices(stock, true); // Fetch historical prices for the stock
        }
    }

    async getPreviewHistoricalPrices() {
        const cachedData = await this.redisClient.get('OVERVIEW'); // Get overview data from Redis
        if (cachedData) {
            return cachedData; // Parse and return the overview data
        } else {
            console.log("No preview data available in Redis.");
            return null; // Return null if no preview data is found
        }
    }

}


const STOCK_API_KEY = process.env.HISTORICAL_API_KEY;

const redisClient = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

const stockService = new HistoricalStockService(STOCK_API_KEY, redisClient);

module.exports = stockService;
