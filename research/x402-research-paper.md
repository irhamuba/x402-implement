# Implementasi Protokol HTTP 402 untuk Sistem Pembayaran Konten Peer-to-Peer (P2P) Tanpa Perantara Menggunakan USDC

---

**Fahril Irkham**

*Independent Researcher - Web3 & Blockchain Technology*

*Email: fahril.irkham@example.com*

*Desember 2025*

---

## Abstrak

Riset ini berfokus pada penerapan standar web HTTP 402 (Payment Required) untuk memfasilitasi transaksi digital langsung (Direct P2P) antara penyedia konten dan konsumen. Menggunakan jaringan Ethereum Sepolia Layer-2 dan stablecoin USDC, sistem ini menghilangkan kebutuhan akan payment gateway pihak ketiga yang menahan dana. Penelitian ini mendemonstrasikan purwarupa (prototype) platform mikro-jurnalisme bernama "MicroNews" di mana konten digital premium dikunci oleh server dan hanya dapat dibuka setelah validasi pembayaran on-chain berhasil, menjamin penerimaan dana 100% real-time bagi pemilik produk. Implementasi menggunakan Next.js sebagai framework, ethers.js untuk interaksi blockchain, dan database JSON untuk manajemen state. Hasil pengujian menunjukkan bahwa protokol x402 mampu memproses transaksi mikro dengan biaya gas kurang dari $0.01 per transaksi, waktu verifikasi rata-rata 12 detik, dan tingkat keberhasilan 100% untuk pembayaran yang valid.

**Kata Kunci:** HTTP 402, x402, Peer-to-Peer Payment, USDC, Blockchain, Content Monetization, Micropayments, Web3, ERC-20

---

## BAB 1: PENDAHULUAN

### 1.1 Latar Belakang

Internet telah mengubah cara manusia mengonsumsi konten digital. Namun, monetisasi konten masih bergantung pada model yang tidak efisien: subscription yang memaksa pengguna membayar konten yang tidak mereka konsumsi, atau advertising yang menciptakan konflik kepentingan antara kualitas konten dan engagement metrics.

Protokol HTTP (Hypertext Transfer Protocol) sebenarnya telah menyediakan mekanisme untuk pembayaran digital sejak awal. HTTP Status Code **402 Payment Required** telah dicadangkan dalam spesifikasi HTTP/1.1 (RFC 7231) untuk penggunaan masa depan [1]. Selama lebih dari dua dekade, kode ini hampir tidak pernah diimplementasikan karena tidak ada infrastruktur pembayaran yang cukup sederhana, murah, dan terstandarisasi.

Sistem pembayaran Web2 saat ini memiliki beberapa kelemahan fundamental:

1. **Biaya Transaksi Tinggi**: Payment gateway seperti Stripe dan PayPal membebankan 2.9% + $0.30 per transaksi, membuat micropayments tidak layak secara ekonomi.

2. **Settlement Delay**: Dana ditahan selama 2-7 hari kerja sebelum sampai ke penjual.

3. **Ketergantungan Geografis**: Banyak negara tidak memiliki akses ke payment gateway internasional.

4. **Single Point of Failure**: Platform dapat membekukan dana tanpa peringatan.

5. **Data Privacy**: Transaksi tercatat dan diawasi oleh pihak ketiga.

Kemunculan teknologi blockchain dan stablecoin seperti USDC membuka kemungkinan baru. Transaksi dapat dilakukan secara peer-to-peer, instan, dengan biaya rendah, dan tanpa memerlukan izin dari pihak ketiga. Protokol x402 yang dikembangkan oleh Coinbase [2] menyediakan standar implementasi untuk menggabungkan HTTP 402 dengan pembayaran cryptocurrency.

### 1.2 Rumusan Masalah

Penelitian ini berusaha menjawab pertanyaan-pertanyaan berikut:

1. Bagaimana implementasi teknis protokol HTTP 402 untuk sistem pembayaran konten digital?
2. Apakah pembayaran peer-to-peer menggunakan USDC dapat menggantikan payment gateway tradisional?
3. Berapa efisiensi biaya dan waktu transaksi dibandingkan sistem konvensional?
4. Apa potensi pengembangan protokol ini untuk use case yang lebih luas?

### 1.3 Tujuan Penelitian

1. Mengimplementasikan protokol x402 dalam bentuk prototype yang fungsional.
2. Mendemonstrasikan pembayaran P2P tanpa perantara menggunakan USDC.
3. Mengukur performa sistem dalam hal biaya, kecepatan, dan reliabilitas.
4. Menganalisis potensi pengembangan untuk e-commerce dan marketplace.

### 1.4 Batasan Penelitian

- Implementasi menggunakan Ethereum Sepolia Testnet (bukan mainnet).
- Database menggunakan JSON file (bukan production database).
- Fokus pada konten digital, bukan barang fisik.
- Tidak mencakup aspek legal dan regulasi.

---

## BAB 2: ARSITEKTUR PROTOKOL X402

### 2.1 Konsep Dasar HTTP 402

HTTP Status Code 402 didefinisikan dalam RFC 7231 Section 6.5.2 sebagai berikut [1]:

> "The 402 (Payment Required) status code is reserved for future use."

Meskipun "reserved for future use", spesifikasi ini memberikan ruang untuk implementasi sistem pembayaran berbasis web. Protokol x402 mengadopsi konsep ini dengan menambahkan header khusus untuk mengkomunikasikan informasi pembayaran.

### 2.2 Komponen Sistem

Arsitektur sistem terdiri dari empat komponen utama:

#### 2.2.1 Client (Browser dengan Web3 Wallet)

Client adalah browser dengan ekstensi wallet (seperti MetaMask) yang mampu:
- Mendeteksi response HTTP 402
- Membaca payment requirements dari header
- Menandatangani dan mengirim transaksi blockchain
- Menyimpan bukti pembayaran (transaction hash)

#### 2.2.2 Server (Next.js Application)

Server bertindak sebagai gatekeeper yang:
- Menyimpan konten premium di backend
- Memeriksa status pembayaran user
- Mengembalikan HTTP 402 jika belum bayar
- Memvalidasi pembayaran on-chain
- Memberikan akses setelah pembayaran terverifikasi

#### 2.2.3 Blockchain (Ethereum Sepolia)

Blockchain berfungsi sebagai:
- Public ledger untuk mencatat transaksi
- Sumber kebenaran (source of truth) untuk verifikasi
- Infrastruktur transfer nilai (USDC)

#### 2.2.4 Smart Contract (USDC ERC-20)

USDC adalah stablecoin yang:
- Memiliki nilai stabil ($1 = 1 USDC)
- Mengikuti standar ERC-20 untuk interoperabilitas
- Tersedia di berbagai network termasuk Layer-2
- Contract address di Sepolia: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### 2.3 Alur Data (Data Flow)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ALUR PROTOKOL X402                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: Client Request                                                  │
│  ──────────────────────                                                  │
│  GET /api/article/123                                                    │
│  Header: X-Wallet-Address: 0xBuyer...                                    │
│                                                                          │
│  Step 2: Server Check Payment Status                                     │
│  ────────────────────────────────────                                    │
│  Query database: Has user purchased this article?                        │
│                                                                          │
│  Step 3a: If NOT PAID                                                    │
│  ────────────────────────                                                │
│  HTTP/1.1 402 Payment Required                                           │
│  X-Payment-Required: {                                                   │
│    "scheme": "exact",                                                    │
│    "network": "ethereum-sepolia",                                        │
│    "amount": 0.50,                                                       │
│    "currency": "USDC",                                                   │
│    "recipient": "0xAuthor..."                                            │
│  }                                                                       │
│  Body: { teaser: "...", fullContent: null }                              │
│                                                                          │
│  Step 3b: If PAID                                                        │
│  ─────────────────                                                       │
│  HTTP/1.1 200 OK                                                         │
│  X-Payment-Response: { status: "paid" }                                  │
│  Body: { teaser: "...", fullContent: "Premium content..." }              │
│                                                                          │
│  Step 4: Client Initiates Payment                                        │
│  ────────────────────────────────                                        │
│  User confirms transaction in wallet                                     │
│  Wallet sends USDC to author's address                                   │
│  Transaction submitted to blockchain                                     │
│                                                                          │
│  Step 5: Client Submits Proof                                            │
│  ────────────────────────────────                                        │
│  POST /api/verify-payment                                                │
│  Body: { txHash: "0xABC...", articleId: "123", buyerAddress: "0x..." }   │
│                                                                          │
│  Step 6: Server Verifies On-Chain                                        │
│  ────────────────────────────────                                        │
│  - Fetch transaction receipt from blockchain                             │
│  - Parse Transfer event logs                                             │
│  - Verify: recipient matches author address                              │
│  - Verify: amount matches article price                                  │
│  - Verify: transaction is confirmed                                      │
│                                                                          │
│  Step 7: Access Granted                                                  │
│  ─────────────────────                                                   │
│  - Save order to database                                                │
│  - Return success response                                               │
│  - Subsequent requests return full content                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Header Protocol Specification

Protokol x402 menggunakan custom HTTP headers untuk komunikasi:

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-Payment-Required` | Server → Client | JSON object berisi payment requirements |
| `X-Payment-Response` | Server → Client | Konfirmasi status pembayaran |
| `X-Wallet-Address` | Client → Server | Alamat wallet user untuk identifikasi |

### 2.5 Security Considerations

#### 2.5.1 Anti-Replay Attack
Sistem mencegah penggunaan ulang transaction hash yang sama dengan menyimpan setiap txHash yang sudah digunakan.

#### 2.5.2 Anti-Scraping
Konten premium tidak pernah dikirim ke client tanpa verifikasi pembayaran. Response 402 hanya berisi teaser.

#### 2.5.3 On-Chain Verification
Pembayaran diverifikasi langsung dari blockchain, bukan dari client. Ini mencegah pemalsuan bukti pembayaran.

---

## BAB 3: IMPLEMENTASI DEMO (STUDI KASUS: MICRONEWS)

### 3.1 Deskripsi Produk

MicroNews adalah platform mikro-jurnalisme yang memungkinkan penulis memonetisasi konten mereka secara langsung. Fitur utama:

- **Pay-per-article**: Pembaca hanya membayar artikel yang mereka baca
- **P2P Payment**: Dana langsung masuk ke wallet penulis
- **No Subscription**: Tidak ada komitmen bulanan
- **Instant Access**: Konten terbuka segera setelah pembayaran

### 3.2 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router) | 15.x |
| Styling | Tailwind CSS | 3.x |
| Blockchain | ethers.js | 6.x |
| Database | JSON Files | - |
| Network | Ethereum Sepolia | - |
| Token | USDC (Circle) | ERC-20 |

### 3.3 Struktur Database

#### 3.3.1 Authors Schema
```typescript
interface Author {
  id: string;           // Unique identifier
  name: string;         // Display name
  walletAddress: string; // Payment address
  loginWallet: string;  // Authentication wallet
  bio: string;          // Author biography
  avatar: string;       // Profile image path
  role: string;         // "author"
}
```

#### 3.3.2 Articles Schema
```typescript
interface Article {
  id: string;
  authorId: string;      // Foreign key to author
  title: string;
  teaser: string;        // Free preview
  fullContent: string;   // Premium content (Markdown)
  price: number;         // Price in USDC
  category: string;
  readTime: string;
  createdAt: string;     // ISO timestamp
}
```

#### 3.3.3 Orders Schema
```typescript
interface Order {
  txHash: string;        // Blockchain transaction hash
  buyerAddress: string;  // Buyer wallet
  articleId: string;     // Purchased article
  authorId: string;      // Article author
  articleTitle: string;  // Stored for history
  amount: number;        // Payment amount
  status: string;        // "VERIFIED"
  timestamp: string;     // ISO timestamp
}
```

### 3.4 Implementasi API Endpoints

#### 3.4.1 GET /api/article/[id]

Endpoint ini mengimplementasikan logika x402:

```typescript
export async function GET(request, { params }) {
  const article = await db.getArticleById(params.id);
  const walletAddress = request.headers.get('X-Wallet-Address');
  
  // Check if author (free access)
  const isAuthor = checkAuthorOwnership(article, walletAddress);
  
  // Check if paid
  const hasPaid = await db.hasUserPurchased(walletAddress, article.id);
  
  if (isAuthor || hasPaid) {
    return Response.json({
      ...article,
      fullContent: article.fullContent, // Premium content
      unlocked: true
    }, { status: 200 });
  }
  
  // Return 402 with payment requirements
  return Response.json({
    ...article,
    fullContent: null, // No premium content
    unlocked: false,
    paymentRequirements: {
      scheme: 'exact',
      network: 'ethereum-sepolia',
      amount: article.price,
      currency: 'USDC',
      recipient: author.walletAddress
    }
  }, { status: 402 });
}
```

#### 3.4.2 POST /api/verify-payment

Endpoint verifikasi pembayaran:

```typescript
export async function POST(request) {
  const { txHash, articleId, buyerAddress } = await request.json();
  
  // Prevent replay attack
  const existingOrder = await db.getOrderByTxHash(txHash);
  if (existingOrder) {
    return Response.json({ error: 'Transaction already used' }, { status: 409 });
  }
  
  // Prevent double payment
  const alreadyPurchased = await db.hasUserPurchased(buyerAddress, articleId);
  if (alreadyPurchased) {
    return Response.json({ success: true, alreadyOwned: true });
  }
  
  // Verify on blockchain
  const verification = await verifyUSDCTransfer(txHash, author.walletAddress, article.price);
  
  if (!verification.valid) {
    return Response.json({ error: verification.error }, { status: 400 });
  }
  
  // Save order
  await db.addOrder({ txHash, buyerAddress, articleId, ... });
  
  return Response.json({ success: true });
}
```

### 3.5 Blockchain Verification Logic

Verifikasi dilakukan dengan membaca event log dari transaction receipt:

```typescript
async function verifyUSDCTransfer(txHash, expectedRecipient, expectedAmount) {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const receipt = await provider.getTransactionReceipt(txHash);
  
  // Parse Transfer event: Transfer(from, to, amount)
  const transferLog = receipt.logs.find(log => 
    log.topics[0] === TRANSFER_EVENT_SIGNATURE
  );
  
  const toAddress = '0x' + transferLog.topics[2].slice(26);
  const amount = BigInt(transferLog.data) / BigInt(10 ** 6); // USDC has 6 decimals
  
  // Verify recipient and amount
  if (toAddress.toLowerCase() !== expectedRecipient.toLowerCase()) {
    return { valid: false, error: 'Wrong recipient' };
  }
  
  if (amount < expectedAmount) {
    return { valid: false, error: 'Insufficient amount' };
  }
  
  return { valid: true };
}
```

### 3.6 Hasil Pengujian

#### 3.6.1 Test Environment
- **OS**: Ubuntu Linux
- **Node.js**: 20.x LTS
- **Browser**: Chrome with MetaMask
- **Network**: Ethereum Sepolia Testnet

#### 3.6.2 Test Scenarios

| Test Case | Result | Notes |
|-----------|--------|-------|
| Connect wallet | ✅ PASS | MetaMask connected successfully |
| View article teaser | ✅ PASS | 402 response with payment info |
| Send USDC payment | ✅ PASS | Transaction confirmed on-chain |
| Verify payment | ✅ PASS | Order saved to database |
| Access content | ✅ PASS | Full content displayed |
| Prevent double payment | ✅ PASS | Returns alreadyOwned flag |
| Author free access | ✅ PASS | Content unlocked without payment |
| Replay attack prevention | ✅ PASS | Duplicate txHash rejected |

#### 3.6.3 Performance Metrics

| Metric | Value |
|--------|-------|
| Average transaction time | ~12 seconds |
| Gas fee per transaction | < $0.01 |
| Verification API latency | ~500ms |
| Database query time | < 10ms |
| Success rate | 100% |

### 3.7 Pembuktian Peer-to-Peer

Untuk membuktikan bahwa pembayaran benar-benar P2P:

1. **Transaction Trace**: Etherscan menunjukkan transfer langsung dari buyer ke author.
2. **No Intermediate Address**: Tidak ada wallet platform yang menerima dana.
3. **Instant Receipt**: Author balance meningkat segera setelah transaksi.

Contoh transaksi sukses:
```
From: 0x34b063cd90c5d69674a9691973ceb76043d9fcba (Buyer)
To: 0xd7ed6cdcf3e25bd2d424058fccb042eb3e8112bc (Author)
Amount: 0.10 USDC
TxHash: 0x13c392a4af1a6bb3aa139fe2c33251c4e46283079ac335daf28cf56efcef7eba
```

---

## BAB 4: PEMBAHASAN DAN PENGEMBANGAN

### 4.1 Analisis Keunggulan Protokol X402

#### 4.1.1 Dibandingkan Payment Gateway Tradisional

| Aspek | Gateway Tradisional | Protokol X402 |
|-------|---------------------|---------------|
| Biaya transaksi | 2.9% + $0.30 | < $0.01 (gas only) |
| Settlement time | 2-7 hari | Instant (~12 detik) |
| Potongan platform | 15-30% | 0% |
| Minimum payout | $50-100 | $0 |
| Geographic restrictions | Banyak | Tidak ada |
| Account freeze risk | Ada | Tidak ada |
| Micropayment feasibility | Tidak layak | Sangat layak |

#### 4.1.2 Keuntungan untuk Creator

1. **100% Revenue**: Seluruh pembayaran masuk ke wallet creator
2. **Instant Access**: Dana tersedia segera
3. **Global Reach**: Siapapun dengan crypto wallet bisa membayar
4. **Pseudonymous**: Tidak perlu KYC untuk menerima pembayaran

### 4.2 Potensi Pengembangan E-Commerce

Meskipun demo fokus pada konten digital, protokol x402 dapat diadaptasi untuk e-commerce:

#### 4.2.1 Modifikasi untuk Barang Fisik

```
Alur E-Commerce x402:

1. User pilih produk → Server return 402 + harga
2. User bayar USDC → Transaction on-chain
3. Server verifikasi → Generate order ID
4. Integrasi shipping API → Generate resi
5. Kirim email konfirmasi ke buyer
6. Update status order: SHIPPED
```

#### 4.2.2 Keuntungan untuk E-Commerce

- **No Chargeback**: Transaksi blockchain irreversible
- **Cross-border**: Tidak perlu konversi mata uang
- **Instant settlement**: Tidak ada holding period
- **Reduced fraud**: Payment verified before fulfillment

### 4.3 Strategi Gasless Transaction

Untuk meningkatkan user experience, penjual dapat menanggung biaya gas:

#### 4.3.1 Konsep Gasless

```
User hanya perlu memiliki USDC
Platform/Seller membayar gas ETH
Implementasi via meta-transaction atau relayer
```

#### 4.3.2 Analisis Kelayakan Ekonomi

| Scenario | Product Price | Gas Fee | Gas as % of Price |
|----------|---------------|---------|-------------------|
| Article | $0.50 | $0.005 | 1% |
| E-book | $10.00 | $0.005 | 0.05% |
| Course | $100.00 | $0.005 | 0.005% |

Dengan biaya gas Layer-2 yang sangat rendah (<$0.01), strategi gasless sangat layak diterapkan untuk meningkatkan konversi penjualan.

#### 4.3.3 Implementasi Teknis

```typescript
// Relayer pattern
async function gaslessTransfer(userTx, relayerPrivateKey) {
  const relayer = new ethers.Wallet(relayerPrivateKey, provider);
  const signedTx = await userTx.populateTransaction();
  
  // Relayer broadcasts and pays gas
  return relayer.sendTransaction({
    ...signedTx,
    gasLimit: 100000
  });
}
```

### 4.4 Skalabilitas: Model Platform Fee

Jika dikembangkan menjadi marketplace multi-vendor:

#### 4.4.1 Smart Contract Splitter

```solidity
contract RevenueSplitter {
    address public platform;
    uint256 public platformFee = 250; // 2.5%
    
    function split(address seller, uint256 amount) external {
        uint256 fee = (amount * platformFee) / 10000;
        uint256 sellerAmount = amount - fee;
        
        USDC.transfer(platform, fee);
        USDC.transfer(seller, sellerAmount);
    }
}
```

#### 4.4.2 Perbandingan dengan Platform Existing

| Platform | Fee | Settlement |
|----------|-----|------------|
| Gumroad | 10% | 7 days |
| Patreon | 8-12% | Monthly |
| Substack | 10% | Monthly |
| **x402 Marketplace** | **2-5%** | **Instant** |

### 4.5 Limitasi dan Tantangan

#### 4.5.1 Technical Challenges

1. **Wallet UX**: User masih perlu memahami crypto wallet
2. **Gas Volatility**: Biaya gas bisa meningkat saat congestion
3. **Private Key Risk**: User bertanggung jawab atas keamanan wallet

#### 4.5.2 Adoption Challenges

1. **Crypto Literacy**: Masih terbatas pada early adopters
2. **Fiat On-ramp**: User perlu mengkonversi fiat ke crypto
3. **Regulatory Uncertainty**: Regulasi crypto berbeda tiap negara

### 4.6 Roadmap Pengembangan

| Phase | Features | Timeline |
|-------|----------|----------|
| MVP (Current) | Basic x402, P2P payment, JSON DB | Done |
| Phase 2 | PostgreSQL, Search, Categories | Q1 2026 |
| Phase 3 | Gasless, Multi-author marketplace | Q2 2026 |
| Phase 4 | Mobile app, Fiat on-ramp | Q3 2026 |
| Phase 5 | Mainnet deployment, Revenue split | Q4 2026 |

---

## BAB 5: KESIMPULAN

### 5.1 Ringkasan Hasil

Implementasi protokol HTTP 402 dalam bentuk platform MicroNews berhasil mendemonstrasikan:

1. **Feasibility**: Protokol x402 dapat diimplementasikan dengan teknologi web modern (Next.js, ethers.js).

2. **Efficiency**: Transaksi mikro USDC di Layer-2 memiliki biaya < $0.01, jauh lebih murah dari payment gateway tradisional.

3. **Speed**: Pembayaran dan verifikasi selesai dalam ~12 detik, lebih cepat dari settlement time 2-7 hari payment gateway.

4. **True P2P**: Dana benar-benar langsung masuk ke wallet penjual tanpa perantara.

5. **Security**: Verifikasi on-chain mencegah fraud dan replay attack.

### 5.2 Kontribusi Penelitian

1. **Proof of Concept**: Demonstrasi implementasi x402 yang fungsional
2. **Technical Documentation**: Arsitektur dan code patterns yang dapat direplikasi
3. **Economic Analysis**: Perbandingan kuantitatif dengan sistem payment tradisional
4. **Future Roadmap**: Analisis potensi pengembangan untuk e-commerce dan marketplace

### 5.3 Rekomendasi

Untuk adopsi protokol x402 yang lebih luas, diperlukan:

1. **Standardisasi**: Spesifikasi x402 perlu diformalkan sebagai RFC
2. **Browser support**: Native support untuk 402 response di browser
3. **Wallet UX**: Simplifikasi pengalaman wallet untuk pengguna awam
4. **Fiat integration**: Kemudahan konversi fiat ↔ crypto

### 5.4 Penutup

Protokol HTTP 402 yang telah lama "dicadangkan untuk penggunaan masa depan" akhirnya menemukan implementasi praktisnya berkat teknologi blockchain. Sistem pembayaran peer-to-peer menggunakan stablecoin USDC menawarkan alternatif yang lebih efisien, transparan, dan adil dibandingkan payment gateway tradisional. 

Dengan biaya rendah dan settlement instan, protokol x402 membuka kemungkinan baru untuk micropayments, creator economy, dan e-commerce global. Meskipun masih ada tantangan adopsi, fondasi teknis yang dibangun dalam penelitian ini membuktikan bahwa masa depan pembayaran internet adalah peer-to-peer, tanpa perantara, dan sepenuhnya dalam kendali pemilik produk.

---

## REFERENSI

[1] Fielding, R., & Reschke, J. (2014). Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content. RFC 7231. IETF.

[2] Coinbase. (2024). x402: HTTP Native Payments. GitHub Repository. https://github.com/coinbase/x402

[3] Buterin, V. (2014). Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform. Ethereum Whitepaper.

[4] Circle. (2024). USDC Technical Documentation. https://developers.circle.com/stablecoins/docs

[5] Ethereum Foundation. (2024). ERC-20 Token Standard. https://eips.ethereum.org/EIPS/eip-20

[6] Optimism Collective. (2024). OP Stack Documentation. https://stack.optimism.io/

[7] MetaMask. (2024). MetaMask Developer Documentation. https://docs.metamask.io/

---

## LAMPIRAN

### Lampiran A: Source Code Repository

Repository: https://github.com/[username]/micronews-x402

### Lampiran B: Transaction Proof

```
Network: Ethereum Sepolia
USDC Contract: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

Sample Transaction:
TxHash: 0x13c392a4af1a6bb3aa139fe2c33251c4e46283079ac335daf28cf56efcef7eba
Block: 9850498
From: 0x34b063cd90c5d69674a9691973ceb76043d9fcba
To: 0xd7ed6cdcf3e25bd2d424058fccb042eb3e8112bc
Amount: 100000 (0.10 USDC)
Status: Success
```

### Lampiran C: API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/articles | List all articles |
| GET | /api/article/[id] | Get article (402 if not paid) |
| POST | /api/verify-payment | Verify on-chain payment |
| GET | /api/author/profile | Get author profile |
| POST | /api/author/profile | Create/update profile |
| GET | /api/author/stats | Get author statistics |
| POST | /api/author/articles | Create new article |
| PUT | /api/author/articles/[id] | Update article |
| DELETE | /api/author/articles/[id] | Delete article |

---

*© 2025 Fahril Irkham. All rights reserved.*

*Dokumen ini dibuat untuk keperluan akademis dan demonstrasi teknologi.*
