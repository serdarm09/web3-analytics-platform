'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Wallet } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { useWallet } from '@/hooks/useWallet'
import { STORAGE_KEYS } from '@/lib/constants'

export default function RegisterPage() {
  const router = useRouter()
  const { connectWallet, address, isConnecting, error: walletError } = useWallet()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [registerMethod, setRegisterMethod] = useState<'email' | 'wallet'>('email')

  const validateForm = () => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    }

    if (registerMethod === 'email') {
      if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      }

      if (!formData.email.includes('@')) {
        newErrors.email = 'Please enter a valid email'
      }

      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else {
      // Wallet registration validation
      if (!address) {
        newErrors.general = 'Please connect your wallet first'
      }
      
      if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      }
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({ username: '', email: '', password: '', confirmPassword: '', general: '' })

    try {
      const payload = registerMethod === 'wallet' 
        ? {
            username: formData.username,
            walletAddress: address,
            registrationMethod: 'wallet'
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            registrationMethod: 'email'
          }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error.includes('already exists')) {
          setErrors({ ...errors, general: 'Username or email already exists' })
        } else {
          setErrors({ ...errors, general: data.error })
        }
        return
      }

      // Store token in localStorage if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      
      // Wait a bit for auth state to update
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error) {
      setErrors({ ...errors, general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletRegister = async () => {
    try {
      await connectWallet()
      setRegisterMethod('wallet')
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
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Create Account
              </h1>
              <p className="text-gray-400">Join the Web3 analytics revolution</p>
            </div>

            {/* Registration Method Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 gap-2 p-1 bg-black-tertiary/60 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => setRegisterMethod('email')}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    registerMethod === 'email'
                      ? 'bg-gradient-primary text-white shadow-lg shadow-accent-teal/20'
                      : 'text-gray-400 hover:text-white hover:bg-black-quaternary'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterMethod('wallet')}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    registerMethod === 'wallet'
                      ? 'bg-gradient-primary text-white shadow-lg shadow-accent-teal/20'
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

            {walletError && registerMethod === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {walletError}
              </motion.div>
            )}

            {registerMethod === 'wallet' && address && (
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
              {registerMethod === 'wallet' && !address && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <PremiumButton
                    type="button"
                    onClick={handleWalletRegister}
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

              {/* Username (always required) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <PremiumInput
                  id="username"
                  type="text"
                  icon={User}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={errors.username}
                  required
                  className="w-full"
                />
              </motion.div>

              {/* Email Registration Fields */}
              {registerMethod === 'email' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
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
                    transition={{ delay: 0.6 }}
                  >
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <PremiumInput
                      id="password"
                      type="password"
                      icon={Lock}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={errors.password}
                      required
                      className="w-full"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <PremiumInput
                      id="confirmPassword"
                      type="password"
                      icon={Lock}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      error={errors.confirmPassword}
                      required
                      className="w-full"
                    />
                  </motion.div>
                </>
              )}

              {(registerMethod === 'email' || (registerMethod === 'wallet' && address)) && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-start space-x-3"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-1 rounded border-gray-600 bg-gray-800 text-accent-slate focus:ring-accent-slate focus:ring-offset-0"
                      required
                    />
                    <span className="text-sm text-gray-400 leading-5">
                      I agree to the{' '}
                      <Link href="/terms" className="text-accent-slate hover:text-accent-slate/80 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-accent-slate hover:text-accent-slate/80 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
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
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Create Account
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </div>
                      )}
                    </PremiumButton>
                  </motion.div>
                </>
              )}
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-accent-slate hover:text-accent-slate/80 font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}