# Web3 Analytics Platform

A modern Web3 analytics platform for tracking crypto projects, monitoring whale movements, analyzing trends, and managing portfolios.

## Features

- **Advanced Analytics**: Real-time market data and technical indicators
- **Portfolio Management**: Track and manage your crypto investments
- **Whale Tracking**: Monitor large wallet movements and copy trading strategies
- **Trend Detection**: AI-powered algorithms to identify trending projects
- **Price Alerts**: Set custom alerts for price movements
- **Dark Theme**: Sleek, modern interface with glassmorphism effects

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI/UX**: Framer Motion for animations, Custom component library
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT-based authentication
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Prerequisites

- Node.js 16+ 
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/web3-analytics-platform.git
cd web3-analytics-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
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