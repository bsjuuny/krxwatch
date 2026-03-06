'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchAllPrices, PriceData, clearCommodityCache } from '@/utils/api';

const CACHE_DURATION = 60 * 60 * 1000; // 1시간 (ms)

export default function PriceList() {
    const [dataList, setDataList] = useState<PriceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllPrices();
            // 에러 데이터 제외하고 실제 데이터만 필터링
            const validData = data.filter(d => d.type !== 'error');
            setDataList(validData);

            const now = Date.now();
            setLastUpdated(now);
            setTimeLeft(CACHE_DURATION); // 갱신 직후 1시간 타이머 시작
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 타이머 효과 (1초마다 감소 - 버튼 활성화를 위해 필요)
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1000) return 0;
                return prev - 1000;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 초기 로드
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        // 갱신 가능 상태일 때만 실행
        if (timeLeft > 0 && !isLoading) return;

        clearCommodityCache(); // 캐시 초기화
        loadData(); // 데이터 재로드
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr.length < 8) return '-';
        return `${dateStr.substring(2, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    const isRefreshable = timeLeft <= 0 && !isLoading;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 pt-32 pb-12 relative z-10">

            {/* 툴바 */}
            <div className="flex justify-end items-center mb-6">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-500">
                        UPDATED: <span className="text-slate-300">{lastUpdated > 0 ? new Date(lastUpdated).toLocaleTimeString('ko-KR') : '-'}</span>
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={!isRefreshable}
                        className={`px-4 py-1.5 border text-xs font-mono rounded transition-all flex items-center gap-2 shadow-lg ${isRefreshable
                                ? 'bg-cyan-900/30 hover:bg-cyan-800/50 border-cyan-500/50 text-cyan-400 cursor-pointer animate-pulse'
                                : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        {isLoading ? 'SYNCING...' : 'REFRESH'}
                    </button>
                </div>
            </div>

            {/* 헤더 (데스크탑) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-900/80 border-b border-slate-700 text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-2 rounded-t-lg backdrop-blur-sm">
                <div className="col-span-4 pl-2">Instrument</div>
                <div className="col-span-3 text-right">Price (KRW)</div>
                <div className="col-span-3 text-right">Change / Vol</div>
                <div className="col-span-2 text-right pr-2">Base Date</div>
            </div>

            {/* 리스트 본문 */}
            <div className="space-y-3">
                {isLoading && dataList.length === 0 ? (
                    <div className="py-20 text-center animate-pulse">
                        <div className="text-cyan-500 font-mono text-sm">LOADING MARKET DATA...</div>
                    </div>
                ) : (
                    dataList.map((item, index) => {
                        if (item.type === 'gold') {
                            // 금 데이터 렌더링
                            const fltRt = parseFloat(item.fltRt || '0');
                            const clprNum = parseFloat(item.clpr.replace(/,/g, '') || '0');
                            const isUp = fltRt > 0;
                            const changeColor = isUp ? 'text-red-400' : (fltRt < 0 ? 'text-blue-400' : 'text-slate-400');

                            return (
                                <div key={`gold-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 md:px-6 md:py-4 rounded-lg hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group">
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                                            🥇
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-100 text-sm md:text-base">{item.itmsNm}</div>
                                            <div className="text-[10px] text-amber-500 font-mono tracking-wider">KOREA GOLD EXCHANGE</div>
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-right flex justify-between md:block items-center border-t border-slate-800 md:border-0 pt-2 md:pt-0 mt-2 md:mt-0">
                                        <span className="md:hidden text-xs text-slate-500">Price</span>
                                        <div className={`text-lg font-mono font-bold tracking-tight ${changeColor}`}>
                                            {clprNum.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-right flex justify-between md:block items-center">
                                        <span className="md:hidden text-xs text-slate-500">Change</span>
                                        <div className={`text-sm font-bold font-mono ${changeColor} flex items-center justify-end gap-1`}>
                                            <span>{isUp ? '▲' : (fltRt < 0 ? '▼' : '-')}</span>
                                            <span>{Math.abs(fltRt).toFixed(2)}%</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-right flex justify-between md:block items-center">
                                        <span className="md:hidden text-xs text-slate-500">Date</span>
                                        <span className="text-xs font-mono text-slate-400">{formatDate(item.basDt)}</span>
                                    </div>
                                </div>
                            );
                        } else if (item.type === 'oil') {
                            // 석유 데이터 렌더링
                            const priceNum = parseFloat(item.wtAvgPrcCptn.replace(/,/g, '') || '0');
                            const volNum = Number(item.trqu.replace(/,/g, '') || 0);

                            return (
                                <div key={`oil-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 md:px-6 md:py-4 rounded-lg hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group">
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                                            🛢️
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-100 text-sm md:text-base">{item.oilCtg}</div>
                                            <div className="text-[10px] text-emerald-500 font-mono tracking-wider">OIL COMMODITY</div>
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-right flex justify-between md:block items-center border-t border-slate-800 md:border-0 pt-2 md:pt-0 mt-2 md:mt-0">
                                        <span className="md:hidden text-xs text-slate-500">Price</span>
                                        <div className="text-lg font-mono font-bold tracking-tight text-emerald-400">
                                            {priceNum.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-right flex justify-between md:block items-center">
                                        <span className="md:hidden text-xs text-slate-500">Volume</span>
                                        <div className="text-xs font-mono text-slate-400">
                                            VOL: {volNum.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-right flex justify-between md:block items-center">
                                        <span className="md:hidden text-xs text-slate-500">Date</span>
                                        <span className="text-xs font-mono text-slate-400">{formatDate(item.basDt)}</span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })
                )}
            </div>

            {/* 푸터 */}
            <div className="mt-8 text-center border-t border-slate-800 pt-8">
                <p className="text-xs text-slate-500 mb-2">
                    ※ 모든 서비스는 실시간이 아니며, 데이터 갱신은 기준일자로부터 영업일 하루 뒤 오후 1시 이후에 업데이트됩니다.
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                    DATA PROVIDED BY PUBLIC DATA PORTAL KOREA | POWERED BY NEXT.JS
                </p>
            </div>

        </div>
    );
}
