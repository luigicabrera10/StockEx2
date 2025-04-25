const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY;
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

type StockHistoricalPreview = {
  [symbol: string]: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
};

type StockHistoricalData = {
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
};

export async function fetchHistoricalPreviewStocks(): Promise<StockHistoricalPreview | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/stocks/historical/preview`, {
      headers: {
        'x-api-key': BACKEND_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch historical preview stocks');
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchHistoricalPreview:", err);
    return null;
  }
}

export async function fetchHistoricalStockPrice(symbol: string): Promise<StockHistoricalData | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/stocks/historical?symbol=${symbol}`, {
      headers: {
        'x-api-key': BACKEND_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch historical stock');
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchHistoricalStockPrice:", err);
    return null;
  }
}
