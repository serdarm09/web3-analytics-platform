# Web3 Analytics Platform

**Kripto proje takip ve analiz platformu** - Yeni nesil Web3 projelerini keşfedin, takip edin ve yönetin.

## 🚀 Proje Hakkında

Web3 Analytics Platform, kripto para dünyasındaki projeleri, özellikle **yeni çıkan Testnet projelerini** sistematik bir şekilde keşfetmenizi ve yönetmenizi sağlayan kapsamlı bir analiz platformudur.

### ✨ Temel Özellikler

- **🔍 Proje Keşfi**: Yeni kripto projelerini keşfedin ve toplulukla paylaşın
- **📊 Portföy Yönetimi**: Kripto varlıklarınızı gerçek zamanlı takip edin
- **🐋 Whale Tracking**: Büyük cüzdan hareketlerini izleyin ve kopyala-trade stratejileri geliştirin
- **📈 Trend Analizi**: AI destekli algoritmalarla trend projelerini keşfedin
- **💼 Topluluk Paylaşımı**: Keşfettiğiniz projeleri toplulukla paylaşın
- **📝 Not Sistemi**: Projeler hakkında kişisel notlarınızı tutun
- **🎯 Watchlist**: İlgilendiğiniz projeleri takip listesine ekleyin

### 🎯 Nasıl Çalışır?

1. **Keşfet**: Topluluk üyeleri yeni projeleri keşfeder ve platforma ekler
2. **Paylaş**: Projeler herkese açık şekilde paylaşılır
3. **Takip Et**: İlgilendiğiniz projeleri kendi listenize ekleyebilirsiniz
4. **Analiz Et**: Proje hakkında detaylı analizler ve notları inceleyebilirsiniz
5. **Yönet**: Kendi notlarınızı ekleyerek projeleri kişiselleştirebilirsiniz

### 🔮 Gelecek Özellikler

- **🔐 Kod ile Giriş**: Alpha aşamasında davet kodu sistemi eklenecek
- **🤖 AI Analiz**: Otomatik proje risk analizi
- **📱 Mobil Uygulama**: iOS ve Android desteği
- **🔔 Akıllı Bildirimler**: Önemli güncellemeler için otomatik uyarılar

### 🎨 Platform Özellikleri

### 🎨 Platform Özellikleri

- **📊 Gerçek Zamanlı Analitik**: Anlık pazar verileri ve teknik göstergeler
- **💰 Portföy Yönetimi**: Kripto yatırımlarınızı takip edin ve yönetin
- **🐋 Whale Takibi**: Büyük cüzdan hareketlerini izleyin ve kopyala-trade stratejileri geliştirin
- **📈 Trend Tespiti**: AI destekli algoritmalarla trend projeleri keşfedin
- **🌙 Dark Tema**: Modern, şık arayüz ve glassmorphism efektleri

## 🛠️ Teknoloji Stack'i

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI/UX**: Framer Motion animasyonları, Özel component kütüphanesi
- **Backend**: Next.js API Routes, MongoDB ve Mongoose
- **Kimlik Doğrulama**: JWT tabanlı authentication
- **Grafikler**: Recharts ile veri görselleştirme
- **İkonlar**: Lucide React

## 📋 Gereksinimler

- Node.js 16+ 
- MongoDB (yerel veya cloud instance)
- npm veya yarn

## 🚀 Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/yourusername/web3-analytics-platform.git
cd web3-analytics-platform
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:
Proje kök dizininde `.env.local` dosyası oluşturun:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/web3-analytics

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web3-analytics-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # UI components
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── auth/             # Authentication utilities
│   └── database/         # Database connection
├── models/               # Mongoose models
├── public/               # Static assets
└── types/                # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects (Coming Soon)
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details

### Portfolio (Coming Soon)
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/assets` - Add asset to portfolio

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Complete portfolio management features
- [ ] Implement real-time price tracking
- [ ] Add whale wallet monitoring
- [ ] Create mobile app
- [ ] Add more blockchain networks
- [ ] Implement social features
- [ ] Add AI-powered insights

## Support

For support, email support@web3analytics.com or join our Discord server.