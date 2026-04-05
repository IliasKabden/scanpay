# Mening Deregim — Data Marketplace on Solana

> **Consumer Intelligence from Real Purchase Data**
>
> Users scan receipts via Telegram, AI processes data, companies buy anonymized consumer insights with automatic smart contract payments on Solana.

**Live Demo:** [app.aiqalam.kz](https://app.aiqalam.kz)

---

## Problem

Every day, millions of Kazakhstani consumers make purchases generating valuable data. Companies like Coca-Cola, Samsung, and retailers spend millions buying this data from intermediaries. But consumers get **nothing** for their own data.

**92% of consumers want to control their data** — we give them that power.

## Solution

**Mening Deregim** is a data marketplace on Solana blockchain where:

1. **Users** scan receipts in Telegram → AI extracts data → hash stored on Solana → user earns ~50 T per receipt
2. **Companies** browse available audience data → AI matches optimal profiles → smart contract executes payment → anonymized data delivered
3. **Everything is verified** — SHA256 hashes on Solana, immutable proof of data authenticity

## Architecture

```
User (Telegram)  →  Receipt Photo  →  Claude AI OCR  →  SHA256 Hash  →  Solana Blockchain
                                                                              ↓
Company (Dashboard)  ←  AI Matching  ←  Smart Contract Payment  ←  Data Marketplace
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, MUI Material Design, Recharts, Leaflet Maps |
| **Backend** | Node.js, Express, SQLite |
| **Blockchain** | Solana (Devnet), Anchor Framework (Rust), SPL Tokens |
| **AI** | Claude Sonnet 4 (OCR + Autonomous Matching) |
| **Mobile** | Telegram Mini App (React, 3 languages: RU/KZ/EN) |
| **Infrastructure** | Ubuntu, Nginx, PM2, Let's Encrypt SSL |

## Product — 6 Modules

### 1. Telegram Mini App (B2C)
- Receipt scanning via camera or screenshot
- Wallet with SOL/T balance
- Onboarding (phone, age, gender, city)
- 3 languages: Russian, Kazakh, English

### 2. Company Dashboard (B2B)
- **Overview** — Executive dashboard with KPIs, sparklines, AI Insights, funnel
- **Audience** — Demographics, age groups, spending patterns, geographic coverage
- **Buy Data** — AI-powered audience matching, Solana smart contract payment
- **Price Monitoring** — RRP compliance tracking, store violations, deviation alerts
- **Products** — Spreadsheet-style catalog with auto-save
- **Analytics** — Zebra BI reports, P&L tables, product×store matrix

### 3. Admin Panel
- Moderation queue (auto + manual) with approve/reject
- Withdrawal management (pending → processing → completed)
- Audit log of all actions
- User/receipt/company management with DataGrid
- Analytics funnel and KPI dashboard

### 4. Live Screen Scanner
- Screen sharing via `getDisplayMedia()` API
- Real-time receipt scanning from any open window
- Claude Vision AI processes captured frames
- Results with scanning animation

### 5. Telegram Bot
- Send any receipt photo directly to bot
- Instant Claude AI processing
- Returns parsed receipt + earnings
- Works with screenshots from Kaspi, Halyk, Jusan

### 6. Smart Contract (Solana)
- Anchor framework (Rust)
- Data hash storage on-chain
- Automated payments to users
- Transaction verification

## Business Model

| Revenue Stream | Description |
|---------------|-------------|
| **Commission 15%** | From each data transaction |
| **Subscription** | Premium analytics for companies |
| **API Access** | Paid API for CRM/ERP integration |

## Key Metrics

- **202** verified consumer profiles
- **835** receipts processed by AI
- **2.5M+ T** total receipt revenue tracked
- **279** product detections across 3 cities
- **6** retail chains monitored
- **35+** API endpoints

## Live URLs

| Service | URL |
|---------|-----|
| Landing Page | [app.aiqalam.kz](https://app.aiqalam.kz) |
| Company Dashboard | [app.aiqalam.kz/dashboard](https://app.aiqalam.kz/dashboard/) |
| Admin Panel | [app.aiqalam.kz/admin](https://app.aiqalam.kz/admin/) |
| Screen Scanner | [app.aiqalam.kz/scan](https://app.aiqalam.kz/scan/) |

**Dashboard login:** `demo@cocacola.kz` / `demo`

## Project Structure

```
mening-deregim/
├── backend/              # Node.js + Express + SQLite (35+ API endpoints)
│   └── src/
│       ├── server.js     # API server + business logic
│       ├── db.js         # Database schema (9 tables)
│       ├── claude.js     # Claude AI integration (OCR + Matching)
│       ├── solana.js     # Solana blockchain integration
│       ├── bot.js        # Telegram bot (photo processing)
│       └── notify.js     # Telegram notifications
├── company-dashboard/    # React + MUI + Recharts + Leaflet
│   └── src/
│       ├── App.jsx       # Main app with login + routing
│       └── components/   # Overview, Audience, Purchase, Pricing, Products, Analytics
├── admin-panel/          # React + MUI + DataGrid
│   └── src/
│       └── pages/        # Dashboard, Users, Receipts, Moderation, Withdrawals, Audit
├── telegram-app/         # React Telegram Mini App
├── smart-contract/       # Solana Anchor (Rust)
├── landing/              # Landing page (static HTML)
├── scan/                 # Live Screen Scanner (getDisplayMedia)
└── docs/                 # Business processes (DOCX), Pitch deck (PPTX)
```

## Quick Start

```bash
# Backend
cd backend && npm install && node src/server.js

# Company Dashboard
cd company-dashboard && npm install && npm run dev

# Admin Panel
cd admin-panel && npm install && npm run dev
```

## Team

Built for **National Solana Hackathon powered by Decentrathon** — Kazakhstan 2026

---

*Data is the new oil. Let the profit go to the people.*
