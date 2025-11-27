# CuanPro HPP Calculator - AI-Powered Business Analytics

Aplikasi kalkulator Harga Pokok Penjualan (HPP) yang powerful untuk UMKM Indonesia dengan fitur AI-powered price optimization, competitor analysis, dan financial projections.

## 🚀 Fitur Utama

### 1. **HPP Calculator & Multi-Product Support**
- ✅ Form input lengkap untuk biaya bahan baku, tenaga kerja, overhead, dan waste factor
- ✅ Support multi-produk dengan batch input
- ✅ Auto-kalkulasi HPP per unit dengan rumus akurat
- ✅ Upload CSV/Excel untuk batch input (10+ produk)

### 2. **AI-Optimized Pricing**
- ✅ Generate 3-5 opsi harga (kompetitif, standar, premium)
- ✅ Algoritma markup dinamis (20-50% margin)
- ✅ Psychological pricing (Rp 29.900, Rp 49.900, dll)
- ✅ Analisis sentimen kompetitor via AI

### 3. **Advanced Business Projections**
- ✅ Input target laba, volume penjualan, musim (peak/off-peak)
- ✅ Grafik interaktif untuk proyeksi omzet bulanan/tahunan
- ✅ Break-even point analysis
- ✅ ROI dan cash flow forecast
- ✅ Sensitivity analysis dengan simulasi "what-if"

### 4. **Inventory Management**
- ✅ Real-time stock tracking
- ✅ Auto-reorder alerts
- ✅ Integration dengan Google Sheets
- ✅ Supplier management
- ✅ Cost optimization insights

### 5. **Competitor Analysis**
- ✅ Real-time price monitoring dari Tokopedia/Shopee
- ✅ Sentiment analysis dari review kompetitor
- ✅ Market positioning insights
- ✅ Price trend tracking

### 6. **AI-Driven Insights**
- ✅ Demand prediction dengan linear regression
- ✅ Market trend analysis
- ✅ Pricing recommendations
- ✅ Business optimization tips

### 7. **Premium UI/UX**
- ✅ Dark/Light mode dengan smooth transitions
- ✅ Responsive design untuk mobile & desktop
- ✅ Animasi smooth dengan Framer Motion
- ✅ Modern dashboard dengan real-time updates
- ✅ Bahasa Indonesia + English toggle

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** dengan App Router
- **TypeScript 5** untuk type safety
- **Tailwind CSS 4** untuk styling
- **shadcn/ui** components library
- **Recharts** untuk data visualization
- **Framer Motion** untuk animasi
- **next-themes** untuk dark mode

### Backend
- **Next.js API Routes** untuk server-side logic
- **Prisma ORM** dengan SQLite database
- **ZAI SDK** untuk AI integration
- **Zustand** untuk state management
- **TanStack Query** untuk server state

### AI & Analytics
- **z-ai-web-dev-sdk** untuk AI chat completions
- **Linear regression** untuk demand prediction
- **Sentiment analysis** untuk competitor insights
- **Monte Carlo simulation** untuk risk analysis

## 📦 Instalasi & Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd cuanpro-hpp-calculator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database
```bash
npm run db:push
npm run db:generate
```

### 5. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📊 Contoh Penggunaan

### Example: Long Pizza Business

**Input Data:**
- Nama Produk: Long Pizza
- Biaya Produksi: Rp 15.000/unit
- Tenaga Kerja: Rp 5.000/unit  
- Overhead: Rp 3.000/unit
- Waste Factor: 5%
- Unit Produksi: 100
- Target Margin: 30%

**Hasil Perhitungan:**
- **HPP**: Rp 23.000/unit
- **Harga Jual Suggested**: 
  - Competitive: Rp 27.900
  - Standard: Rp 29.900  
  - Premium: Rp 34.900

**Proyeksi Bulanan (50 unit/hari):**
- Revenue: Rp 44.850.000
- Profit: Rp 13.485.000
- Break Even: 20 hari
- ROI: 323%

## 🚀 Deploy ke Production

### 1. Build Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Environment Variables untuk Production
```env
DATABASE_URL="production-database-url"
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

## 📱 API Endpoints

### Price Optimization
```http
POST /api/optimize-prices
Content-Type: application/json

{
  "products": [
    {
      "name": "Long Pizza",
      "productionCost": 15000,
      "laborCost": 5000,
      "overheadCost": 3000,
      "wasteFactor": 5,
      "unitProduction": 100,
      "targetMargin": 30
    }
  ]
}
```

### Business Projection
```http
POST /api/business-projection
Content-Type: application/json

{
  "productName": "Long Pizza",
  "hpp": 23000,
  "currentPrice": 29900,
  "targetProfit": 30,
  "dailyVolume": 50,
  "season": "normal"
}
```

### Competitor Analysis
```http
POST /api/competitor-analysis
Content-Type: application/json

{
  "productName": "Long Pizza",
  "category": "Food",
  "analysisType": "comprehensive"
}
```

## 🎯 Business Model

### Free Tier
- HPP Calculator untuk 5 produk
- Basic projections
- Limited competitor analysis
- Community support

### Premium Tier (Rp 50.000/bulan)
- Unlimited produk
- Advanced AI insights
- Full competitor analysis
- Priority support
- Custom reports
- API access

## 🔧 Configuration

### Database Schema
```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

-- Products  
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT,
  business_id TEXT,
  hpp REAL,
  target_margin REAL,
  production_cost REAL,
  labor_cost REAL,
  overhead_cost REAL,
  waste_factor REAL,
  unit_production INTEGER,
  created_at DATETIME,
  updated_at DATETIME
);

-- Price Points
CREATE TABLE price_points (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  price_type TEXT,
  price REAL,
  confidence REAL,
  reasoning TEXT,
  created_at DATETIME
);
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Email: support@cuanpro.ai
- Documentation: https://docs.cuanpro.ai
- Community: https://community.cuanpro.ai

## 🗺️ Roadmap

### Q1 2024
- [ ] Mobile app (React Native)
- [ ] Advanced reporting dashboard
- [ ] Multi-currency support

### Q2 2024  
- [ ] ERP integration
- [ ] Advanced AI predictions
- [ ] Team collaboration features

### Q3 2024
- [ ] Franchise management
- [ ] Supply chain integration
- [ ] Advanced analytics

---

**CuanPro HPP Calculator** - Empowering Indonesian UMKM with AI-powered business analytics 🚀