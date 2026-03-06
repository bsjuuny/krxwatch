'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DonationPopup from '@/components/DonationPopup';

const PriceList = dynamic(() => import('@/components/PriceList'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-500 text-xs font-mono animate-pulse">LOADING LIST...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-y-auto font-sans selection:bg-cyan-500/30">

      {/* 배경 그리드 및 효과 (기존 디자인 유지) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 그리드 패턴 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-20"></div>

        {/* 상단 레이저 라인 */}
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 box-shadow-[0_0_10px_#06b6d4]"></div>

        {/* 배경 글로우 */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 헤더 및 컨트롤 패널 */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none ${isScrolled
        ? 'bg-slate-950/90 backdrop-blur-md shadow-lg py-4 px-6 border-b border-slate-800/50'
        : 'bg-transparent p-6'
        }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          {/* 타이틀 섹션 */}
          <div className="pointer-events-auto">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-1 tracking-tighter drop-shadow-lg">
              KRX <span className="text-cyan-400">MARKET</span> WATCH
            </h1>
            <div className="flex items-center">
              <p className="text-slate-400 text-xs font-mono tracking-widest uppercase">
                Commodity & Gold Price Dashboard
              </p>
            </div>
          </div>

          {/* 시스템 상태 패널 (데스크탑 전용) */}
          <div className="hidden md:flex flex-col items-end pointer-events-auto bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded border border-slate-800 shadow-2xl">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></div>
              <span className="text-[10px] text-green-400 font-bold tracking-wider">SYSTEM ONLINE</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-right leading-tight">
              SOURCE: KOREA PUBLIC DATA PORTAL<br />
              VIEW: LIST MODE<br />
              SERVER TIME: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>

        </div>
      </div>

      {/* 메인 컨텐츠 영역 (리스트) */}
      <div className="relative z-10 w-full min-h-screen pt-20">
        <PriceList />
      </div>
      <DonationPopup />
    </main>
  );
}
