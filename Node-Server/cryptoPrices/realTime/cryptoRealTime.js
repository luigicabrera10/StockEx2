const axios = require('axios');
const { allSupportedCrypto } = require('./../const.js'); // Fix import to destructure named export

class RealTimeCryptoService {

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    _isCryptoSupported(symbol) {
        return allSupportedCrypto.includes(symbol);
    }

    async _cryptoRealTimePriceApiCall(symbols) {
        const url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';

        try {
            const response = await axios.get(url, {
                headers: {
                    'X-CMC_PRO_API_KEY': this.apiKey,
                    'Accept': 'application/json'
                },
                params: {
                    symbol: symbols.join(','),
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching crypto quote:', error.message);
            return null;
        }
    }

    async getRealTimeCryptoPrices(cryptos){
        const results = {};

        if (!cryptos || cryptos.length === 0) {
            return results;
        }

        const cryptosToFetch = cryptos.filter(symbol => this._isCryptoSupported(symbol));

        const cryptoData = await this._cryptoRealTimePriceApiCall(cryptosToFetch);
        if (cryptoData && cryptoData.data) {
            for (const symbol of cryptos) {
                if (cryptoData.data[symbol] && cryptoData.data[symbol].length > 0) {
                    results[symbol] = cryptoData.data[symbol][0].quote.USD;
                } else {
                    results[symbol] = { error: `No data found for ${symbol}` };
                }
            }
        } else {
            console.error('Error fetching crypto data:', cryptoData);
        }

        return results;
    }



};


const CRYPTO_API_KEY = process.env.CRYPTO_REAL_TIME_API_KEY;

const cryptoService = new RealTimeCryptoService(CRYPTO_API_KEY);
module.exports = cryptoService;

