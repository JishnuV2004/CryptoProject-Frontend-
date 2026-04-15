# BinanceSim Frontend

BinanceSim is a premium crypto exchange simulation platform built with a dark institutional aesthetic.

## 🚀 Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Dark Gold Theme)
- **State Management:** Zustand
- **Market Data:** WebSocket Live Prices (Binance API)
- **Charts:** Lightweight Charts & Recharts
- **Payments:** Razorpay (Test Mode Integration)

## 🛠️ Features

- **Institutional Design:** Deep olive-black & gold aesthetic for a premium trading feel.
- **Live Trading Room:** Real-time candlestick charts and order execution.
- **Multi-Wallet System:** Manage INR and multiple crypto assets.
- **KYC Protocol:** Multi-step identity verification simulation.
- **Virtual E-Card:** Styled 3D virtual card for simulated offline spend.
- **Leaderboard:** Global ROI-based ranking system.

## ⚙️ Internal Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file from the metadata provided.
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   VITE_WS_URL=ws://localhost:8080/ws/prices
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxx
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 📂 Architecture

The project follows a modular structure separated by feature:
- `src/services/api.js`: Centralized Axios instance with interceptors.
- `src/store/authStore.js`: Persistent auth state with Zustand.
- `src/hooks/usePriceWebSocket.js`: Real-time price stream management.
- `src/pages/*`: Dedicated folders for each major feature module.

---
*Internal Confidential Document • BinanceSim v1.0.0*
