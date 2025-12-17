# MicroNews - Decentralized Micro-Journalism Platform

> Pay-per-article journalism platform powered by HTTP x402 protocol on Ethereum Sepolia.

![MicroNews Banner](https://img.shields.io/badge/Powered%20by-x402%20Protocol-blue)
![Ethereum Sepolia](https://img.shields.io/badge/Network-Ethereum%20Sepolia-purple)
![USDC](https://img.shields.io/badge/Currency-USDC-blue)

## 🎬 Demo

[![Watch Demo](https://github.com/irhamuba/x402-implement/raw/main/research/screenshots/01-article-locked.png)](https://github.com/irhamuba/x402-implement/raw/main/demo/x402-payment-demo.mp4)

> 👆 **Click the image above to watch the demo video**
>
> *Full payment flow: Browse Article → HTTP 402 → Pay USDC → Content Unlocked*

## 🌟 Features

- **Pay Per Article**: No subscriptions, just pay for what you want to read
- **Direct P2P Payments**: 100% of payment goes directly to the author via blockchain
- **Privacy First**: No email, password, or personal data required
- **Blockchain Verified**: All transactions verified on Ethereum Sepolia
- **HTTP 402 Implementation**: Following the x402 protocol standard
- **Author Dashboard**: Publish and manage your articles
- **Rich Text Editor**: Write articles with Markdown formatting

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Blockchain │
│  (Next.js)  │◀────│ (API Routes)│◀────│ (Sepolia)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │  Database   │
       │            │ (JSON Files)│
       └───────────▶└─────────────┘
```

## 📁 Project Structure

```
x402/
├── data/                      # JSON Database
│   ├── authors.json           # Author profiles
│   ├── articles.json          # Article content
│   └── orders.json            # Payment records
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── article/[id]/  # Article endpoint (402-enabled)
│   │   │   ├── articles/      # List all articles
│   │   │   ├── verify-payment/# Payment verification
│   │   │   ├── author/        # Author profile & articles API
│   │   │   └── user/purchases/# User purchase history
│   │   ├── article/[id]/      # Article page
│   │   ├── dashboard/         # Author dashboard
│   │   │   ├── settings/      # Profile settings
│   │   │   └── write/         # Article editor
│   │   ├── library/           # User library page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ArticleCard.tsx    # Article preview card
│   │   ├── ArticleContent.tsx # Markdown renderer
│   │   ├── ConnectWalletButton.tsx
│   │   ├── Navbar.tsx
│   │   └── PaywallOverlay.tsx # Paywall with blur effect
│   ├── contexts/
│   │   └── WalletContext.tsx  # MetaMask integration
│   └── lib/
│       ├── blockchain.ts      # Blockchain verification
│       ├── config.ts          # Network & contract config
│       ├── db.ts              # JSON database handler
│       └── utils.ts           # Utility functions
├── .env.local                 # Environment variables
├── next.config.ts
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **MetaMask** browser extension
- **Sepolia ETH** for gas (get from faucet)
- **USDC on Sepolia** for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd x402
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Getting Test Tokens

1. **Get Sepolia ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Or [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

2. **Get Test USDC**
   - USDC Contract on Sepolia: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
   - Get test USDC from [Circle Faucet](https://faucet.circle.com/)

### Add Sepolia to MetaMask

| Setting | Value |
|---------|-------|
| Network Name | Sepolia |
| RPC URL | https://rpc.sepolia.org |
| Chain ID | 11155111 |
| Currency Symbol | ETH |
| Block Explorer | https://sepolia.etherscan.io |

## 📖 How It Works

### For Readers
1. Browse articles on the homepage
2. Click on an article to read the teaser
3. Connect wallet and pay USDC to unlock full content
4. Payment goes directly to the author

### For Authors
1. Connect wallet and go to Dashboard
2. Set up your profile with payment address
3. Write articles with the rich text editor
4. Set price and publish
5. Receive payments directly to your wallet

## 🔧 API Endpoints

### GET `/api/article/[id]`
Fetch article details. Include `X-Wallet-Address` header to check purchase status.

### POST `/api/verify-payment`
Verify and record a payment.

### GET/POST `/api/author/profile`
Get or update author profile.

### GET/POST `/api/author/articles`
List or create articles.

## 🔒 Security

1. **Server-side content protection** - Premium content only sent after verification
2. **Prevent replay attacks** - Each txHash only valid once
3. **On-chain verification** - All payments verified on blockchain
4. **No private keys on server** - Only verification, no signing

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Blockchain**: ethers.js v6
- **Database**: JSON files
- **Network**: Ethereum Sepolia
- **Token**: USDC (ERC-20)

## 📝 License

MIT License

## 🙏 Acknowledgments

- [Coinbase x402 Protocol](https://github.com/coinbase/x402)
- [Circle USDC](https://www.circle.com/en/usdc)

---

**Built with 💙 for decentralized journalism**
