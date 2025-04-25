const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

interface Quote {
  price: number;
  volume_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
}


export const fetchCryptoPrice = async (cryptoSymbol: string): Promise<Quote | null> => {
    try {

        const response = await fetch(`${BACKEND_BASE_URL}/crypto?symbols=${cryptoSymbol}`, {
            headers: {
                'x-api-key': BACKEND_API_KEY!,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch crypto price');
        }

        const data = await response.json();
        return data[cryptoSymbol] || null;
        
    } catch (err) {
        console.error("Error in fetchCryptoPrice:", err);
        return null;
    }
};