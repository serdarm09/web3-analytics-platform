"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Plus, Trash2, Edit2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { toast } from "sonner"

interface Alert {
  id: string
  type: 'price_above' | 'price_below' | 'percent_change'
  asset: string
  condition: string
  value: number
  active: boolean
  triggered: boolean
  createdAt: Date
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const handleCreateAlert = () => {
    toast.info("Alert creation coming soon!")
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
    toast.success("Alert deleted")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
          <p className="text-gray-400 mt-1">
            Set custom alerts for price movements and market conditions
          </p>
        </div>
        <PremiumButton
          onClick={handleCreateAlert}
          variant="gradient"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </PremiumButton>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumCard className="glassmorphism p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold text-white">{alerts.filter(a => a.active).length}</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="glassmorphism p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Triggered Today</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="glassmorphism p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{alerts.length}</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <PremiumCard className="glassmorphism p-12 text-center">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No alerts yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first price alert to get notified about market movements
          </p>
          <PremiumButton
            onClick={handleCreateAlert}
            variant="gradient"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </PremiumButton>
        </PremiumCard>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumCard className="glassmorphism p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      alert.triggered ? 'bg-green-500/20' : 'bg-gray-700'
                    }`}>
                      <Bell className={`w-5 h-5 ${
                        alert.triggered ? 'text-green-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{alert.asset}</h3>
                      <p className="text-sm text-gray-400">
                        {alert.type === 'price_above' && 'Price above'}
                        {alert.type === 'price_below' && 'Price below'}
                        {alert.type === 'percent_change' && 'Change by'}
                        {' '}${alert.value.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PremiumBadge variant={alert.active ? "success" : "default"}>
                      {alert.active ? 'Active' : 'Inactive'}
                    </PremiumBadge>
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}