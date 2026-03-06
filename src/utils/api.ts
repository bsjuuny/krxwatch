import axios from 'axios';

const BASE_URL = 'https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// 캐시 설정
const CACHE_KEY_PREFIX = 'commodity_price_cache_';
const CACHE_DURATION = 60 * 60 * 1000; // 1시간 캐시

// 최근 평일 계산 (주말 제외)
function getRecentWeekday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1); // 하루 전
    const day = date.getDay();
    if (day === 0) date.setDate(date.getDate() - 2);
    else if (day === 6) date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${dayStr}`;
}

export interface GoldPrice {
    type: 'gold';
    itmsNm: string;
    clpr: string;
    fltRt: string;
    basDt?: string; // 기준일 추가
}

export interface OilPrice {
    type: 'oil';
    oilCtg: string;
    wtAvgPrcCptn: string;
    trqu: string;
    basDt?: string; // 기준일 추가
}

export interface ApiError {
    type: 'error';
    message: string;
    code: string;
}

export type PriceData = GoldPrice | OilPrice | ApiError;

// 더미 데이터 (API 호출 제한 시 사용)
const MOCK_DATA: PriceData[] = [
    { type: 'gold', itmsNm: '금(99.99K)', clpr: '0', fltRt: '0' },
    { type: 'gold', itmsNm: '금(Mini)', clpr: '0', fltRt: '-0' },
    { type: 'oil', oilCtg: '휘발유', wtAvgPrcCptn: '0', trqu: '0' },
    { type: 'oil', oilCtg: '경유', wtAvgPrcCptn: '0', trqu: '0' },
    { type: 'oil', oilCtg: '등유', wtAvgPrcCptn: '0', trqu: '0' },
    { type: 'oil', oilCtg: 'LPG', wtAvgPrcCptn: '0', trqu: '0' },
];

function checkCache(key: string): unknown | null {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;
    try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log(`✅ [CACHE HIT] ${key} - Using cached data`);
            return data;
        } else {
            console.log(`[CACHE EXPIRED] ${key} - Refetching...`);
            localStorage.removeItem(CACHE_KEY_PREFIX + key);
        }
    } catch (e) {
        console.warn('Cache parsing error', e);
    }
    return null;
}

function setCache(key: string, data: unknown) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
        data,
        timestamp: Date.now(),
    }));
}



// 금 시세 조회
export async function fetchGoldPrices(): Promise<PriceData[]> {
    const cacheKey = `gold_${getRecentWeekday()}`;
    const cachedData = checkCache(cacheKey);
    if (cachedData) return cachedData as PriceData[];

    console.log('🚀 [API CALL] Fetching Gold Prices...');

    try {
        const basDt = getRecentWeekday();
        const url = `${BASE_URL}/getGoldPriceInfo`;

        const response = await axios.get(url, {
            params: {
                serviceKey: decodeURIComponent(API_KEY),
                resultType: 'json',
                // basDt: basDt, // 주석 처리됨 (최신 데이터 조회)
                numOfRows: 6,
                pageNo: 1,
            },
            timeout: 5000,
        });

        const data = response.data;
        console.log('📦 [API RESPONSE] Gold Data:', data); // 디버깅용
        if (data.response?.header?.resultCode !== '00') {
            console.warn('Gold API Error, using mock data');
            return MOCK_DATA.filter(d => d.type === 'gold');
        }

        const items = data.response?.body?.items?.item;
        if (!items) {
            return MOCK_DATA.filter(d => d.type === 'gold');
        }

        const itemList = Array.isArray(items) ? items : [items];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = itemList.map((item: any) => ({
            type: 'gold' as const,
            itmsNm: String(item?.itmsNm || '금'),
            clpr: String(item?.clpr || '0'),
            fltRt: String(item?.fltRt || '0'),
            basDt: String(item?.basDt || item?.srtnDt || basDt || ''), // 기준일 추출
        }));

        setCache(cacheKey, result);
        return result;

    } catch (error) {
        console.error('Gold API Error:', error);
        return MOCK_DATA.filter(d => d.type === 'gold');
    }
}

// 석유 시세 조회
export async function fetchOilPrices(): Promise<PriceData[]> {
    const cacheKey = `oil_${getRecentWeekday()}`;
    const cachedData = checkCache(cacheKey);
    if (cachedData) return cachedData as PriceData[];

    console.log('🚀 [API CALL] Fetching Oil Prices...');

    const oilCategories = ['휘발유', '경유', '등유', 'LPG'];
    const results: PriceData[] = [];
    const basDt = getRecentWeekday();
    const url = `${BASE_URL}/getOilPriceInfo`;

    const requests = oilCategories.map(async (oilCtg) => {
        try {
            // 딜레이 추가 (API 제한 회피)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 300));

            const response = await axios.get(url, {
                params: {
                    serviceKey: decodeURIComponent(API_KEY),
                    resultType: 'json',
                    // basDt: basDt, // 주석 처리됨 (최신 데이터 조회)
                    numOfRows: 2,
                    pageNo: 1,
                    oilCtg: oilCtg,
                },
                timeout: 5000,
            });

            const data = response.data;
            // console.log(`📦 [API RESPONSE] Oil Data (${oilCtg}):`, data);
            const items = data.response?.body?.items?.item;
            if (!items) return null;

            const item = Array.isArray(items) ? items[0] : items;
            return {
                type: 'oil',
                oilCtg: String(item?.oilCtg || oilCtg),
                wtAvgPrcCptn: String(item?.wtAvgPrcCptn || '0'),
                trqu: String(item?.trqu || '0'),
                basDt: String(item?.basDt || item?.srtnDt || basDt || ''), // 기준일 추출
            } as OilPrice;

        } catch {
            return null;
        }
    });

    try {
        const responses = await Promise.all(requests);
        responses.forEach(res => {
            if (res) results.push(res);
        });

        if (results.length > 0) {
            setCache(cacheKey, results);
            return results;
        } else {
            return MOCK_DATA.filter(d => d.type === 'oil');
        }
    } catch {
        return MOCK_DATA.filter(d => d.type === 'oil');
    }
}

export async function fetchAllPrices(): Promise<PriceData[]> {
    try {
        const [goldPrices, oilPrices] = await Promise.all([
            fetchGoldPrices(),
            fetchOilPrices(),
        ]);
        return [...goldPrices, ...oilPrices];
    } catch (error) {
        console.error("Critical API Error, using full mock data", error);
        return MOCK_DATA;
    }
}

// 캐시 강제 초기화 함수
export function clearCommodityCache() {
    if (typeof window === 'undefined') return;
    // 모든 관련 캐시 키 삭제
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
    console.log('🧹 [CACHE CLEARED] Manual cache reset');
}
