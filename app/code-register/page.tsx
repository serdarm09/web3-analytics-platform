"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumInput } from "@/components/ui/premium-input"
import { StarBorder } from "@/components/ui/star-border"
import { Key, User, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CodeRegisterPage() {
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim() || !username.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/code-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          username: username.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Redirect to dashboard, auth context will be updated automatically
      toast.success('Welcome! Your account has been created successfully.')
      router.push('/dashboard')
      
      // Force a page reload to update auth context
      window.location.reload()

    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-accent-slate to-accent-teal rounded-full flex items-center justify-center"
          >
            <Key className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent mb-2">
            Join with Invite Code
          </h1>
          <p className="text-gray-400">
            Enter your invite code to create a verified account
          </p>
        </div>

        <PremiumCard className="p-8 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Invite Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <PremiumInput
                  type="text"
                  placeholder="Enter your invite code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="pl-10"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <PremiumInput
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="pl-10"
                  maxLength={30}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only lowercase letters, numbers, underscores, and hyphens allowed
              </p>
            </div>

            <StarBorder
              as="button"
              type="submit"
              disabled={loading || !code.trim() || !username.trim()}
              className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </StarBorder>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Verified Account Benefits</span>
              </div>
              <ul className="text-xs text-green-300/80 space-y-1">
                <li>• Full access to all platform features</li>
                <li>• Verified badge on your profile</li>
                <li>• Priority support</li>
                <li>• Advanced analytics tools</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-accent-slate hover:text-accent-teal transition-colors font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </PremiumCard>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Don't have an invite code?{' '}
            <Link 
              href="/register" 
              className="text-accent-slate hover:text-accent-teal transition-colors"
            >
              Create a regular account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
