'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Wallet, Check, AlertCircle, CheckCircle } from 'lucide-react'
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
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false
  })

  // Real-time validation
  useEffect(() => {
    const errors = { email: '', username: '', password: '', confirmPassword: '' }
    
    if (touchedFields.email && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Geçerli bir e-posta adresi girin'
      }
    }
    
    if (mode === 'register') {
      if (touchedFields.username && formData.username && formData.username.length < 3) {
        errors.username = 'En az 3 karakter olmalıdır'
      }
      
      if (touchedFields.password && formData.password && formData.password.length < 6) {
        errors.password = 'En az 6 karakter olmalıdır'
      }
      
      if (touchedFields.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Şifreler eşleşmiyor'
      }
    }
    
    setFieldErrors(errors)
  }, [formData, touchedFields, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'register') {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError('Lütfen geçerli bir e-posta adresi girin')
          setIsLoading(false)
          return
        }

        // Username validation
        if (formData.username.length < 3) {
          setError('Kullanıcı adı en az 3 karakter olmalıdır')
          setIsLoading(false)
          return
        }

        // Password validation
        if (formData.password.length < 6) {
          setError('Şifre en az 6 karakter olmalıdır')
          setIsLoading(false)
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Şifreler eşleşmiyor')
          setIsLoading(false)
          return
        }
        
        if (!formData.agreeToTerms) {
          setError('Lütfen Kullanım Koşulları ve Gizlilik Politikasını kabul edin')
          setIsLoading(false)
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
        // Login validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError('Lütfen geçerli bir e-posta adresi girin')
          setIsLoading(false)
          return
        }

        if (!formData.password) {
          setError('Lütfen şifrenizi girin')
          setIsLoading(false)
          return
        }

        await login({
          email: formData.email,
          password: formData.password,
          loginMethod: 'email'
        })
        onClose()
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      // Handle specific error messages from API
      if (error.message.includes('already exists') || error.message.includes('already taken')) {
        if (error.message.includes('email')) {
          setError('Bu e-posta adresi zaten kullanılıyor')
        } else if (error.message.includes('username')) {
          setError('Bu kullanıcı adı zaten alınmış')
        } else {
          setError('Bu bilgiler zaten kullanılıyor')
        }
      } else if (error.message.includes('Invalid email or password')) {
        setError('E-posta veya şifre hatalı')
      } else if (error.message.includes('required')) {
        setError('Lütfen tüm zorunlu alanları doldurun')
      } else {
        setError(error.message || 'Kimlik doğrulama başarısız. Lütfen tekrar deneyin.')
      }
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <PremiumCard variant="glass" className="relative overflow-hidden border border-gray-800 shadow-2xl shadow-blue-500/20">
              {/* Background gradient decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-all z-10 hover:rotate-90 duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 relative z-10">
                <div className="text-center mb-8">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {mode === 'login' ? (
                        <Lock className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </motion.div>
                  <motion.h2 
                    key={mode}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    {mode === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
                  </motion.h2>
                  <p className="text-gray-400">
                    {mode === 'login' 
                      ? 'Web3 analitik platformuna giriş yapın' 
                      : 'Web3 dünyasında analitiğe başlayın'}
                  </p>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm backdrop-blur-sm flex items-center gap-2"
                  >
                    <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3" />
                    </div>
                    <span>{error}</span>
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
                        placeholder="Kullanıcı Adı"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
                      />
                    </motion.div>
                  )}
                  
                  <PremiumInput
                    icon={Mail}
                    type="email"
                    placeholder="E-posta Adresi"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
                  />
                  
                  <PremiumInput
                    icon={Lock}
                    type="password"
                    placeholder="Şifre"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
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
                        placeholder="Şifre Tekrar"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                      />
                    </motion.div>
                  )}
                  
                  {/* Remember Me / I Agree Section */}
                  <div className="space-y-3 py-2">
                    {mode === 'login' && (
                      <div className="flex items-center justify-between">
                        <CustomCheckbox
                          checked={formData.rememberMe}
                          onChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
                        >
                          <span>Beni 30 gün boyunca hatırla</span>
                        </CustomCheckbox>
                        <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                          Şifremi unuttum
                        </a>
                      </div>
                    )}
                    
                    {mode === 'register' && (
                      <CustomCheckbox
                        checked={formData.agreeToTerms}
                        onChange={(checked) => setFormData({ ...formData, agreeToTerms: checked })}
                      >
                        <span>
                          <a href="/terms" className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank">
                            Kullanım Koşulları
                          </a>
                          {' '}ve{' '}
                          <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank">
                            Gizlilik Politikası
                          </a>
                          'nı kabul ediyorum
                        </span>
                      </CustomCheckbox>
                    )}
                  </div>
                  
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <PremiumButton
                      type="submit"
                      variant="gradient"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all"
                      disabled={isLoading || (mode === 'register' && !formData.agreeToTerms)}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{mode === 'login' ? 'Giriş Yapılıyor...' : 'Hesap Oluşturuluyor...'}</span>
                        </div>
                      ) : (
                        mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'
                      )}
                    </PremiumButton>
                  </motion.div>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black-secondary text-gray-400">Veya şununla devam et</span>
                  </div>
                </div>
                
                <motion.div whileTap={{ scale: 0.98 }}>
                  <PremiumButton
                    variant="outline"
                    className="w-full border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 group transition-all hover:shadow-lg hover:shadow-purple-500/10"
                    onClick={handleWalletConnect}
                    disabled={isLoading || isConnecting}
                  >
                    <Wallet className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    {isConnecting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                        <span>Bağlanıyor...</span>
                      </div>
                    ) : (
                      'Cüzdan Bağla'
                    )}
                  </PremiumButton>
                </motion.div>
                
                <div className="text-center text-sm text-gray-400 mt-6">
                  {mode === 'login' ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
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
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 transition-all font-medium underline underline-offset-2"
                  >
                    {mode === 'login' ? 'Üye Ol' : 'Giriş Yap'}
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
