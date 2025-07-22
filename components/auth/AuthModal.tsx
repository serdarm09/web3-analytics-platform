'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Wallet, Check } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { useAuth } from '@/hooks/use-auth'
import { useWallet } from '@/hooks/useWallet'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const { login, register } = useAuth()
  const { connectWallet, address, isConnecting } = useWallet()
  const router = useRouter()
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        if (!formData.agreeToTerms) {
          setError('Please agree to the Terms of Service and Privacy Policy')
          return
        }
        
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          registrationMethod: 'email'
        })
        onClose()
        router.push('/dashboard')
      } else {
        await login({
          email: formData.email,
          password: formData.password
        })
        onClose()
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      await connectWallet()
      
      if (address) {
        await register({
          username: `user_${address.slice(0, 8)}`,
          email: `${address.slice(0, 8)}@wallet.local`,
          password: '',
          registrationMethod: 'wallet'
        })
        onClose()
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Wallet connect error:', error)
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Custom Checkbox Component
  const CustomCheckbox = ({ 
    checked, 
    onChange, 
    children, 
    className = '' 
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    children: React.ReactNode
    className?: string
  }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
          checked 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, type: "spring" }}
            >
              <Check className="w-3 h-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <div className="text-sm text-gray-300 leading-relaxed cursor-pointer" onClick={() => onChange(!checked)}>
        {children}
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <PremiumCard variant="glass" className="relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8">
                <motion.h2 
                  key={mode}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </motion.h2>
                <p className="text-gray-400 mb-6">
                  {mode === 'login' 
                    ? 'Login to access your dashboard' 
                    : 'Start your journey in Web3 analytics'}
                </p>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <PremiumInput
                        icon={User}
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </motion.div>
                  )}
                  
                  <PremiumInput
                    icon={Mail}
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  
                  <PremiumInput
                    icon={Lock}
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <PremiumInput
                        icon={Lock}
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </motion.div>
                  )}
                  
                  {/* Remember Me / I Agree Section */}
                  <div className="space-y-3 py-2">
                    {mode === 'login' && (
                      <CustomCheckbox
                        checked={formData.rememberMe}
                        onChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
                      >
                        <span>Remember me for 30 days</span>
                      </CustomCheckbox>
                    )}
                    
                    {mode === 'register' && (
                      <CustomCheckbox
                        checked={formData.agreeToTerms}
                        onChange={(checked) => setFormData({ ...formData, agreeToTerms: checked })}
                      >
                        <span>
                          I agree to the{' '}
                          <a href="/terms" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                            Terms of Service
                          </a>
                          {' '}and{' '}
                          <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                            Privacy Policy
                          </a>
                        </span>
                      </CustomCheckbox>
                    )}
                  </div>
                  
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <PremiumButton
                      type="submit"
                      variant="gradient"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600"
                      disabled={isLoading || (mode === 'register' && !formData.agreeToTerms)}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                        </div>
                      ) : (
                        mode === 'login' ? 'Sign In' : 'Create Account'
                      )}
                    </PremiumButton>
                  </motion.div>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black-secondary text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <motion.div whileTap={{ scale: 0.98 }}>
                  <PremiumButton
                    variant="outline"
                    className="w-full border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                    onClick={handleWalletConnect}
                    disabled={isLoading || isConnecting}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnecting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      'Connect Wallet'
                    )}
                  </PremiumButton>
                </motion.div>
                
                <div className="text-center text-sm text-gray-400 mt-6">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login')
                      setError('')
                      setFormData({
                        email: '',
                        username: '',
                        password: '',
                        confirmPassword: '',
                        rememberMe: false,
                        agreeToTerms: false
                      })
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
