// Application Constants

// localStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  WALLET_CONNECTED: 'wallet_connected',
  WALLET_ADDRESS: 'wallet_address',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const

// API Endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  MARKET_DATA: {
    BASE: '/api/market-data',
    GLOBAL: '/api/market-data/global',
    TRENDING: '/api/market-data/trending',
  },
  PROJECTS: '/api/projects',
  PORTFOLIOS: '/api/portfolios',
  WHALE_WALLETS: '/api/whale-wallets',
} as const

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: {
    HOME: '/dashboard',
    PORTFOLIO: '/dashboard/portfolio',
    ANALYTICS: '/dashboard/analytics',
    PROJECTS: '/dashboard/projects',
    TRENDING: '/dashboard/trending',
    WATCHLIST: '/dashboard/watchlist',
    WHALE_TRACKER: '/dashboard/whale-tracker',
    SETTINGS: '/dashboard/settings',
  },
} as const

// Wallet Constants
export const WALLET = {
  SUPPORTED_CHAINS: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism'],
  DEFAULT_CHAIN_ID: 1, // Ethereum Mainnet
} as const

// UI Constants
export const UI = {
  ITEMS_PER_PAGE: 20,
  CHART_COLORS: ['#9B99FE', '#2BC8B7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  ANIMATION_DURATION: 300,
} as const