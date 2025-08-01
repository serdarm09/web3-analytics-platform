"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import {
  User,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Key,
  Mail,
  Smartphone,
  Moon,
  Sun,
  ChevronRight,
  Check,
  X,
  LogOut
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { StarBorder } from "@/components/ui/star-border"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumInput } from "@/components/ui/premium-input"
import ActivityHistory from "@/components/user/ActivityHistory"

interface UserSettings {
  profile: {
    name: string
    email: string
    username?: string
    walletAddress?: string
    avatar: string
    bio: string
  }
  appearance: {
    theme: "light" | "dark" | "system"
    language: string
    currency: string
    dateFormat: string
  }
  security: {
    twoFactor: boolean
    apiKeys: { name: string; created: Date; lastUsed: Date }[]
  }
}

const mockSettings: UserSettings = {
  profile: {
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    walletAddress: "0x1234567890123456789012345678901234567890",
    avatar: "",
    bio: "Crypto enthusiast and DeFi investor"
  },
  appearance: {
    theme: "dark",
    language: "en-US",
    currency: "USD",
    dateFormat: "MM/DD/YYYY"
  },
  security: {
    twoFactor: false,
    apiKeys: []
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(mockSettings)
  const [activeSection, setActiveSection] = useState("profile")
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.name || user.username || '',
          email: user.email || '',
          username: user.username || '',
          walletAddress: user.walletAddress || '',
          bio: prev.profile.bio
        },
        security: {
          ...prev.security,
          twoFactor: user.twoFactorEnabled || false
        }
      }))
    }
  }, [user])

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield }
  ]

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.profile.name,
          bio: settings.profile.bio,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      if (data.user) {
        // Update local auth state
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            ...data.user
          }
        }))
      }

      toast.success('Profile updated successfully')
      setUnsavedChanges(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-900/30 p-4 md:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400 mt-2">
                Manage your account preferences and settings
              </p>
            </div>
            {unsavedChanges && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <StarBorder
                  onClick={() => setUnsavedChanges(false)}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
                >
                  Cancel
                </StarBorder>
                <StarBorder
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                >
                  Save Changes
                </StarBorder>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-accent-slate/20 to-accent-teal/20 text-accent-slate border border-accent-slate/30"
                          : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{section.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  )
                })}
              </nav>
            </PremiumCard>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {settings.profile.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG or GIF. Max 2MB
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Full Name</label>
                        <PremiumInput
                          value={settings.profile.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSettings({
                              ...settings,
                              profile: { ...settings.profile, name: e.target.value }
                            })
                            setUnsavedChanges(true)
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">
                          Email
                        </label>
                        <PremiumInput
                          type="email"
                          value={settings.profile.email}
                          disabled
                          className="opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                    </div>

                    {user?.walletAddress && (
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Wallet Address</label>
                        <div className="flex items-center gap-2">
                          <PremiumInput
                            value={user.walletAddress}
                            disabled
                            className="flex-1"
                          />
                          <StarBorder
                            onClick={() => {
                              navigator.clipboard.writeText(user.walletAddress || '')
                              toast.success('Wallet address copied!')
                            }}
                            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                          >
                            Copy
                          </StarBorder>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-300">Username</label>
                      <PremiumInput
                        value={settings.profile.username || user?.username || ''}
                        disabled
                        className="opacity-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Registration Method</label>
                        <PremiumInput
                          value={user?.registrationMethod === 'wallet' ? 'Wallet' : 'Email'}
                          disabled
                          className="opacity-50 capitalize"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-300">Account Status</label>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          <span className="text-sm text-gray-300">
                            {user?.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-300">Bio</label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:border-accent-slate focus:ring-2 focus:ring-accent-slate/20 transition-all duration-200 backdrop-blur-sm resize-none"
                        rows={4}
                        value={settings.profile.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          setSettings({
                            ...settings,
                            profile: { ...settings.profile, bio: e.target.value }
                          })
                          setUnsavedChanges(true)
                        }}
                      />
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-white">Account Actions</h3>
                  <div className="space-y-3">
                  </div>
                </PremiumCard>

                {/* Activity History */}
                <div className="mt-6">
                  <ActivityHistory userId={user?.id || ''} />
                </div>
              </motion.div>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <PremiumCard>
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Appearance Settings</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "light", label: "Light", icon: Sun },
                          { value: "dark", label: "Dark", icon: Moon },
                          { value: "system", label: "System", icon: Globe }
                        ].map((theme) => {
                          const Icon = theme.icon
                          return (
                            <button
                              key={theme.value}
                              onClick={() => {
                                setSettings({
                                  ...settings,
                                  appearance: {
                                    ...settings.appearance,
                                    theme: theme.value as any
                                  }
                                })
                                setUnsavedChanges(true)
                              }}
                              className={`p-4 rounded-lg border-2 transition-colors ${
                                settings.appearance.theme === theme.value
                                  ? "border-accent-slate bg-accent-slate/10"
                                  : "border-muted"
                              }`}
                            >
                              <Icon className="h-6 w-6 mx-auto mb-2" />
                              <p className="text-sm font-medium">{theme.label}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Language</label>
                        <select
                          className="w-full px-4 py-2 rounded-lg border bg-background"
                          value={settings.appearance.language}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                language: e.target.value
                              }
                            })
                            setUnsavedChanges(true)
                          }}
                        >
                          <option value="en-US">English (US)</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Currency</label>
                        <select
                          className="w-full px-4 py-2 rounded-lg border bg-background"
                          value={settings.appearance.currency}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                currency: e.target.value
                              }
                            })
                            setUnsavedChanges(true)
                          }}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <PremiumCard>
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Security Settings</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-accent-slate" />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <StarBorder
                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3"
                      >
                        {settings.security.twoFactor ? "Manage" : "Enable"}
                      </StarBorder>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">API Keys</h3>
                      <div className="space-y-3">
                        {settings.security.apiKeys.map((key, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div>
                              <p className="font-medium">{key.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Created {key.created.toLocaleDateString()} • Last used {key.lastUsed.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}