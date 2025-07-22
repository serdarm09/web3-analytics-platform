'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Wallet } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { useWallet } from '@/hooks/useWallet'
import { STORAGE_KEYS } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const { connectWallet, address, isConnecting, error: walletError } = useWallet()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ email: '', password: '', general: '' })
    setIsLoading(true)

    try {
      const payload = loginMethod === 'wallet' 
        ? {
            walletAddress: address,
            loginMethod: 'wallet'
          }
        : {
            email: formData.email,
            password: formData.password,
            loginMethod: 'email'
          }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'Invalid credentials') {
          setErrors({ email: '', password: '', general: 'Invalid credentials' })
        } else {
          setErrors({ email: '', password: '', general: data.error })
        }
        return
      }

      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setErrors({ email: '', password: '', general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletLogin = async () => {
    try {
      await connectWallet()
      setLoginMethod('wallet')
    } catch (error) {
      setErrors({ ...errors, general: 'Failed to connect wallet' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-mesh"></div>
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(155, 153, 254, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(155, 153, 254, 0.1) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <PremiumCard className="glassmorphism-dark border border-white/10 shadow-2xl glow-primary/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 glow-primary"
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            {/* Login Method Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 gap-2 p-1 bg-black-tertiary/60 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    loginMethod === 'email'
                      ? 'bg-gradient-primary text-white shadow-lg glow-purple'
                      : 'text-gray-400 hover:text-white hover:bg-black-quaternary'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('wallet')}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    loginMethod === 'wallet'
                      ? 'bg-gradient-primary text-white shadow-lg glow-purple'
                      : 'text-gray-400 hover:text-white hover:bg-black-quaternary'
                  }`}
                >
                  Wallet
                </button>
              </div>
            </motion.div>

            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            {walletError && loginMethod === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {walletError}
              </motion.div>
            )}

            {loginMethod === 'wallet' && address && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
              >
                Wallet Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wallet Connection */}
              {loginMethod === 'wallet' && !address && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PremiumButton
                    type="button"
                    onClick={handleWalletLogin}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting Wallet...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </div>
                    )}
                  </PremiumButton>
                </motion.div>
              )}

              {/* Email Login Fields */}
              {loginMethod === 'email' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <PremiumInput
                      id="email"
                      type="email"
                      icon={Mail}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                      required
                      className="w-full"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PremiumInput
                      id="password"
                      type="password"
                      icon={Lock}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={errors.password}
                      required
                      className="w-full"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="ml-2 text-sm text-gray-400">Remember me</span>
                    </label>
                  </motion.div>
                </>
              )}

              {(loginMethod === 'email' || (loginMethod === 'wallet' && address)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <PremiumButton
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign In
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </PremiumButton>
                </motion.div>
              )}
            </form>

            {/* Social Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg bg-black-tertiary/60 text-sm font-medium text-gray-300 hover:bg-black-tertiary transition-colors duration-200 backdrop-blur-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
                
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg bg-black-tertiary/60 text-sm font-medium text-gray-300 hover:bg-black-tertiary transition-colors duration-200 backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.1.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.598 2.31-.744 2.869-.27 1.028-1.004 2.308-1.496 3.089C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                  <span className="ml-2">GitHub</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}