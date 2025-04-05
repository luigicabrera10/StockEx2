const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

type StockData = {
  [symbol: string]: {
    lastRefresh: string;
    price: number;
    difference: number;
    differencePercent: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
  };
};

export async function fetchAllRealTimeStocks(): Promise<StockData | null> {
    try {

        const response = await fetch(`${BACKEND_BASE_URL}/stocks/all`, {
            headers: {
                'x-api-key': BACKEND_API_KEY!,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch all stocks');
        }

        return await response.json();
    } catch (err) {
        console.error("Error in fetchAllStocks:", err);
        return null;
    }
}

export async function fetchRealTimeStocks(symbols: string[]): Promise<StockData | null> {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/stocks?symbols=${symbols.join(',')}`, {
        headers: {
            'x-api-key': BACKEND_API_KEY!,
        },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch selected stocks');
        }

        return await response.json();
    } catch (err) {
        console.error("Error in fetchStocksBySymbols:", err);
        return null;
    }
}
