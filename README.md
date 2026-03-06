# 금 & 석유 시세 물리 대시보드

Matter.js 물리 엔진을 활용한 인터랙티브 금 및 석유 시세 조회 대시보드입니다.

## 🎮 특징

- **물리 기반 인터랙션**: 데이터 카드가 중력에 의해 떨어지고 서로 충돌합니다
- **마우스 드래그**: 카드를 집어서 던질 수 있습니다
- **실시간 API 연동**: 공공데이터포털에서 금/석유 시세 데이터를 가져옵니다
- **색상 구분**: 금(황금색), 석유(녹색), 오류(빨간색)

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 API 키를 입력하세요:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 내용:
```
NEXT_PUBLIC_API_KEY=여기에_공공데이터포털_API_키_입력
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📊 API 명세

### 금 시세 (getGoldPriceInfo)
- 종목명 (itmsNm)
- 종가 (clpr)
- 등락률 (fltRt)

### 석유 시세 (getOilPriceInfo)
- 유종 (oilCtg): 휘발유, 경유, 등유, LPG
- 가중평균가격 (wtAvgPrcCptn)
- 거래량 (trqu)

## 🛠 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Physics Engine**: Matter.js
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Language**: TypeScript

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx      # 레이아웃 컴포넌트
│   ├── page.tsx        # 메인 페이지
│   └── globals.css     # 전역 스타일
├── components/
│   └── PhysicsCanvas.tsx  # Matter.js 물리 캔버스
└── utils/
    └── api.ts          # API 호출 유틸리티
```

## ⚠️ 주의사항

- Node.js 20.9.0 이상이 필요합니다
- 공공데이터포털 API 키가 필요합니다
- 주말/공휴일에는 시세 데이터가 없을 수 있습니다

## 📝 라이선스

MIT License
