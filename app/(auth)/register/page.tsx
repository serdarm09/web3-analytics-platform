'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Wallet, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useWallet } from '@/hooks/useWallet'

export default function RegisterPage() {
  const router = useRouter()
  const { register, user, isLoading: authLoading } = useAuth()
  const { connectWallet, address, isConnecting } = useWallet()
  
  const [formData, setFormData] = useState({
    inviteCode: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteCodeValid, setInviteCodeValid] = useState<boolean | null>(null)
  const [inviteCodeInfo, setInviteCodeInfo] = useState<any>(null)

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Validate invite code
  const validateInviteCode = async (code: string) => {
    if (!code.trim()) {
      setInviteCodeValid(null)
      setInviteCodeInfo(null)
      return
    }

    try {
      const response = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      })

      let data
      try {
        const responseText = await response.text()
        console.log('Raw response:', responseText) // Debug log
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Invite validation JSON Parse Error:', parseError)
        console.error('❌ Response status:', response.status)
        setInviteCodeValid(false)
        setInviteCodeInfo(null)
        return
      }

      if (response.ok && data.valid) {
        setInviteCodeValid(true)
        setInviteCodeInfo(data)
      } else {
        setInviteCodeValid(false)
        setInviteCodeInfo(null)
      }
    } catch (error) {
      console.error('Invite code validation error:', error)
      setInviteCodeValid(false)
      setInviteCodeInfo(null)
    }
  }

  // Handle invite code change
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setFormData(prev => ({ ...prev, inviteCode: code }))
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateInviteCode(code)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate invite code first
    if (!formData.inviteCode.trim()) {
      setError('Invite code is required')
      return
    }

    if (inviteCodeValid !== true) {
      setError('Please enter a valid invite code')
      return
    }

    // Validation
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: formData.inviteCode,
          username: formData.name,
          name: formData.name,
          email: formData.email || undefined, // Make email optional
          password: formData.password,
          registrationMethod: 'email'
        }),
      })

      let data
      try {
        const responseText = await response.text()
        console.log('Register response:', responseText) // Debug log
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Register JSON Parse Error:', parseError)
        console.error('❌ Response status:', response.status)
        throw new Error('Server returned invalid response')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Use the register function from AuthContext
      register(data.token, data.user)
      
      // Router push will be handled by AuthContext
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    setError('')
    setIsLoading(true)

    try {
      await connectWallet()
      
      // Wait a bit for the state to update
      setTimeout(async () => {
        if (address) {
          try {
            // Register with wallet
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: `User-${address.slice(0, 6)}`,
                walletAddress: address,
                registrationMethod: 'wallet'
              }),
            })

            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Wallet registration failed')
            }

            // Use the register function from AuthContext
            register(data.token, data.user)
            
            // Router push will be handled by AuthContext
          } catch (error: any) {
            setError(error.message || 'Failed to register with wallet.')
          }
        } else {
          setError('Failed to connect wallet. Please try again.')
        }
        setIsLoading(false)
      }, 1000)
    } catch (error: any) {
      setError('Failed to connect wallet. Please try again.')
      setIsLoading(false)
    }
  }

  // Custom Checkbox Component
  const CustomCheckbox = ({ 
    checked, 
    onChange, 
    children 
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    children: React.ReactNode
  }) => (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
          checked 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
      >
        {checked && <Check className="w-3 h-3" />}
      </button>
      <div className="text-sm text-gray-300 cursor-pointer leading-relaxed" onClick={() => onChange(!checked)}>
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PremiumCard variant="glass" className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Create Account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400"
              >
                Join Web3 Analytics today
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Invite Code Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <PremiumInput
                  icon={Check}
                  type="text"
                  placeholder="Invite Code (Required)"
                  value={formData.inviteCode}
                  onChange={handleInviteCodeChange}
                  required
                  className={`
                    ${inviteCodeValid === true ? 'border-green-500/50 bg-green-500/5' : ''}
                    ${inviteCodeValid === false ? 'border-red-500/50 bg-red-500/5' : ''}
                  `}
                />
                {/* Invite Code Status */}
                {inviteCodeValid === true && inviteCodeInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div className="text-green-400 text-sm">
                      ✓ Valid invite code
                    </div>
                  </motion.div>
                )}
                {inviteCodeValid === false && formData.inviteCode.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="text-red-400 text-sm">
                      ✗ Invalid or expired invite code
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <PremiumInput
                  icon={User}
                  type="text"
                  placeholder="Username"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <PremiumInput
                  icon={Mail}
                  type="email"
                  placeholder="Email address (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <PremiumInput
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <PremiumInput
                  icon={Lock}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>

              {/* Terms Agreement */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <CustomCheckbox
                  checked={formData.agreeToTerms}
                  onChange={(checked) => setFormData({ ...formData, agreeToTerms: checked })}
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </Link>
                </CustomCheckbox>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <StarBorder
                  as="button"
                  type="submit"
                  className="w-full"
                  color="#3B82F6"
                  speed="4s"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </StarBorder>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center mt-8 pt-6 border-t border-gray-800"
            >
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Need an invite code? Contact an admin for access.
              </p>
            </motion.div>
          </PremiumCard>
        </motion.div>
      </div>
    </div>
  )
}
