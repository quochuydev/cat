// Fetches BTC and XAU (PAXG) hourly prices from Binance

export interface HourlyPrice {
  hour: number; // 0-23
  btc: number;
  xau: number;
}

const BTC_URL = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=6";
const XAU_URL = "https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=1h&limit=6";

let cachedPrices: HourlyPrice[] = [];
let lastFetchHour = -1;
let fetching = false;

function parseKlines(data: unknown[][]): { hour: number; close: number }[] {
  return data.map((k) => {
    const openTime = k[0] as number;
    const close = parseFloat(k[4] as string);
    const hour = new Date(openTime).getHours();
    return { hour, close };
  });
}

export async function fetchPrices(): Promise<HourlyPrice[]> {
  if (fetching) return cachedPrices;
  fetching = true;
  try {
    const [btcRes, xauRes] = await Promise.all([
      fetch(BTC_URL).then((r) => r.json()),
      fetch(XAU_URL).then((r) => r.json()),
    ]);
    const btcData = parseKlines(btcRes);
    const xauData = parseKlines(xauRes);

    const prices: HourlyPrice[] = [];
    for (let i = 0; i < btcData.length && i < xauData.length; i++) {
      prices.push({
        hour: btcData[i].hour,
        btc: btcData[i].close,
        xau: xauData[i].close,
      });
    }
    cachedPrices = prices;
    lastFetchHour = new Date().getHours();
  } catch {
    // keep cached data on error
  }
  fetching = false;
  return cachedPrices;
}

export function getCachedPrices(): HourlyPrice[] {
  return cachedPrices;
}

export function shouldRefresh(): boolean {
  const currentHour = new Date().getHours();
  return currentHour !== lastFetchHour;
}
