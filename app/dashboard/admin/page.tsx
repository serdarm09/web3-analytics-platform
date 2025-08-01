"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumInput } from "@/components/ui/premium-input"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { StarBorder } from "@/components/ui/star-border"
import {
  Users,
  Key,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Wallet,
  Code,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from "lucide-react"

interface User {
  _id: string
  username: string
  email?: string
  registrationMethod: 'email' | 'wallet' | 'code'
  isVerified: boolean
  role: 'user' | 'admin'
  createdAt: string
}

interface InviteCode {
  _id: string
  code: string
  isUsed: boolean
  createdBy: {
    _id: string
    username: string
  }
  usedBy?: {
    _id: string
    username: string
  }
  expiresAt?: string
  createdAt: string
}

interface UserStats {
  totalUsers: number
  verifiedUsers: number
  adminUsers: number
  emailUsers: number
  walletUsers: number
  codeUsers: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'codes'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [codeExpiry, setCodeExpiry] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/dashboard'
    }
  }, [user])

  // Fetch users
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (userFilter && userFilter !== 'all') {
        if (userFilter === 'verified') params.append('role', 'user')
        else if (userFilter === 'admin') params.append('role', 'admin')
        else params.append('registrationMethod', userFilter)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        setUserStats(data.stats)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users')
    }
  }

  // Fetch invite codes
  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/admin/invite-codes')
      const data = await response.json()

      if (response.ok) {
        setCodes(data.codes)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch invite codes')
    }
  }

  // Initial load
  useEffect(() => {
    if (user?.role === 'admin') {
      Promise.all([fetchUsers(), fetchCodes()]).finally(() => setLoading(false))
    }
  }, [user])

  // Search/filter users
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers()
    }
  }, [searchTerm, userFilter])

  // Create invite code
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim() || undefined,
          expiresAt: codeExpiry || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invite code created successfully')
        setNewCode('')
        setCodeExpiry('')
        setShowCreateCodeModal(false)
        fetchCodes()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invite code')
    }
  }

  // Delete invite code
  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this invite code?')) return

    try {
      const response = await fetch(`/api/admin/invite-codes?id=${codeId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invite code deleted')
        fetchCodes()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invite code')
    }
  }

  // Update user
  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User updated successfully')
        fetchUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-slate/30 border-t-accent-slate rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-900/30 p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 mt-2">
              Manage users and invite codes
            </p>
          </div>
          
          <div className="flex gap-3">
            <StarBorder
              onClick={() => {
                fetchUsers()
                fetchCodes()
              }}
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </StarBorder>
          </div>
        </div>

        {/* Stats */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{userStats.totalUsers}</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{userStats.verifiedUsers}</p>
                <p className="text-xs text-gray-400">Verified</p>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{userStats.adminUsers}</p>
                <p className="text-xs text-gray-400">Admins</p>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{userStats.emailUsers}</p>
                <p className="text-xs text-gray-400">Email</p>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{userStats.walletUsers}</p>
                <p className="text-xs text-gray-400">Wallet</p>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{userStats.codeUsers}</p>
                <p className="text-xs text-gray-400">Code</p>
              </div>
            </PremiumCard>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-accent-slate to-accent-teal text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Users className="h-4 w-4" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'codes'
                ? 'bg-gradient-to-r from-accent-slate to-accent-teal text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Key className="h-4 w-4" />
            Invite Codes ({codes.length})
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Users Filters */}
              <PremiumCard className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <PremiumInput
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-gray-900/50 border-gray-600 text-white focus:outline-none focus:border-accent-slate"
                  >
                    <option value="">All Users</option>
                    <option value="verified">Verified Users</option>
                    <option value="admin">Admins</option>
                    <option value="email">Email Registration</option>
                    <option value="wallet">Wallet Registration</option>
                    <option value="code">Code Registration</option>
                  </select>
                </div>
              </PremiumCard>

              {/* Users List */}
              <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">Users</h2>
                </div>
                
                <div className="p-6">
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center text-white font-medium">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{u.username}</span>
                                {u.isVerified && (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                )}
                                {u.role === 'admin' && (
                                  <PremiumBadge>ADMIN</PremiumBadge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  {u.registrationMethod === 'email' && <Mail className="h-3 w-3" />}
                                  {u.registrationMethod === 'wallet' && <Wallet className="h-3 w-3" />}
                                  {u.registrationMethod === 'code' && <Code className="h-3 w-3" />}
                                  {u.registrationMethod}
                                </span>
                                {u.email && <span>{u.email}</span>}
                                <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateUser(u._id, { isVerified: !u.isVerified })}
                              className={`p-2 rounded-lg transition-colors ${
                                u.isVerified ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={u.isVerified ? 'Unverify' : 'Verify'}
                            >
                              {u.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleUpdateUser(u._id, { role: u.role === 'admin' ? 'user' : 'admin' })}
                                className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                                title="Toggle Admin"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                            
                            {u._id !== user._id && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.username)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {activeTab === 'codes' && (
            <motion.div
              key="codes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Create Code Button */}
              <div className="flex justify-end">
                <StarBorder
                  onClick={() => setShowCreateCodeModal(true)}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invite Code
                </StarBorder>
              </div>

              {/* Codes List */}
              <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">Invite Codes</h2>
                </div>
                
                <div className="p-6">
                  {codes.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No invite codes created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {codes.map((code) => (
                        <div
                          key={code._id}
                          className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              code.isUsed ? 'bg-gray-600' : 'bg-gradient-to-br from-accent-slate to-accent-teal'
                            }`}>
                              <Key className="h-5 w-5 text-white" />
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-medium text-white">{code.code}</span>
                                {code.isUsed ? (
                                  <PremiumBadge variant="outline">USED</PremiumBadge>
                                ) : (
                                  <PremiumBadge variant="success">ACTIVE</PremiumBadge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Created by {code.createdBy.username}</span>
                                <span>{new Date(code.createdAt).toLocaleDateString()}</span>
                                {code.expiresAt && (
                                  <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                                )}
                                {code.usedBy && (
                                  <span>Used by {code.usedBy.username}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyCode(code.code)}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                              title="Copy Code"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteCode(code._id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Delete Code"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Code Modal */}
        {showCreateCodeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Create Invite Code</h3>
              
              <form onSubmit={handleCreateCode} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Custom Code (Optional)
                  </label>
                  <PremiumInput
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="Leave empty for random code"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={codeExpiry}
                    onChange={(e) => setCodeExpiry(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-gray-900/50 border-gray-600 text-white focus:outline-none focus:border-accent-slate"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <StarBorder
                    as="button"
                    type="button"
                    onClick={() => setShowCreateCodeModal(false)}
                    className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
                  >
                    Cancel
                  </StarBorder>
                  <StarBorder
                    as="button"
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                  >
                    Create Code
                  </StarBorder>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
