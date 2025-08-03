'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Users, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'

interface InviteCode {
  id: string
  code: string
  usageLimit: number
  usageCount: number
  remainingUses: number
  isUsed: boolean
  expiresAt?: string
  createdAt: string
  createdBy: string
  usedBy: string[]
}

export default function AdminInviteCodesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [createForm, setCreateForm] = useState({
    code: '',
    usageLimit: 1,
    expiresAt: ''
  })

  // Check if user is admin (you may need to modify this logic)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user) {
      // Check if user has admin access
      const isAdmin = user.isAdmin === true || user.username === 'admin'
      if (!isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, authLoading, router])

  // Fetch invite codes
  const fetchInviteCodes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/invite-codes')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invite codes')
      }

      setInviteCodes(data.codes || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Create invite code
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: createForm.code || undefined,
          usageLimit: createForm.usageLimit,
          expiresAt: createForm.expiresAt || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite code')
      }

      setSuccess(`Invite code "${data.inviteCode.code}" created successfully!`)
      setCreateForm({ code: '', usageLimit: 1, expiresAt: '' })
      setShowCreateForm(false)
      fetchInviteCodes() // Refresh the list
    } catch (error: any) {
      setError(error.message)
    }
  }

  // Copy code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setSuccess(`Code "${code}" copied to clipboard!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to copy code')
    }
  }

  useEffect(() => {
    if (user) {
      fetchInviteCodes()
    }
  }, [user])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Invite Code Management</h1>
          <p className="text-gray-400">Create and manage invite codes for user registration</p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
          >
            {success}
          </motion.div>
        )}

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <PremiumButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Invite Code
          </PremiumButton>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <PremiumCard variant="glass" className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Create New Invite Code</h3>
              <form onSubmit={handleCreateCode} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Custom Code (optional)
                    </label>
                    <PremiumInput
                      type="text"
                      placeholder="Leave empty for random"
                      value={createForm.code}
                      onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Usage Limit
                    </label>
                    <PremiumInput
                      type="number"
                      min="1"
                      max="1000"
                      value={createForm.usageLimit}
                      onChange={(e) => setCreateForm({ ...createForm, usageLimit: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Expires At (optional)
                    </label>
                    <PremiumInput
                      type="datetime-local"
                      value={createForm.expiresAt}
                      onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <PremiumButton type="submit">
                    Create Code
                  </PremiumButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </PremiumCard>
          </motion.div>
        )}

        {/* Invite Codes List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {inviteCodes.length === 0 ? (
            <PremiumCard variant="glass" className="p-8 text-center">
              <p className="text-gray-400">No invite codes created yet.</p>
            </PremiumCard>
          ) : (
            <div className="grid gap-4">
              {inviteCodes.map((code) => (
                <PremiumCard key={code.id} variant="glass" className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="font-mono text-lg font-bold text-white bg-gray-800 px-3 py-1 rounded">
                          {code.code}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          code.remainingUses > 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {code.remainingUses > 0 ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {code.remainingUses > 0 ? 'Active' : 'Exhausted'}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {code.usageCount}/{code.usageLimit} uses
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {new Date(code.createdAt).toLocaleDateString()}
                        </div>
                        {code.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expires: {new Date(code.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          Created by: {code.createdBy}
                        </div>
                      </div>

                      {code.usedBy.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500">
                          Used by: {code.usedBy.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
