"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  Clock,
  Check,
  X,
  AlertTriangle
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumInput } from "@/components/ui/premium-input"

interface Alert {
  id: string
  coinName: string
  coinSymbol: string
  type: "price_above" | "price_below" | "percent_change" | "volume"
  condition: string
  targetValue: number
  currentValue: number
  isActive: boolean
  triggered: boolean
  triggeredAt?: Date
  createdAt: Date
  notification: "email" | "push" | "both"
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    coinName: "Bitcoin",
    coinSymbol: "BTC",
    type: "price_above",
    condition: "Price rises above",
    targetValue: 50000,
    currentValue: 45234.56,
    isActive: true,
    triggered: false,
    createdAt: new Date("2024-01-15"),
    notification: "both"
  },
  {
    id: "2",
    coinName: "Ethereum",
    coinSymbol: "ETH",
    type: "price_below",
    condition: "Price falls below",
    targetValue: 2000,
    currentValue: 2456.78,
    isActive: true,
    triggered: false,
    createdAt: new Date("2024-01-18"),
    notification: "email"
  },
  {
    id: "3",
    coinName: "Solana",
    coinSymbol: "SOL",
    type: "percent_change",
    condition: "24h change exceeds",
    targetValue: 10,
    currentValue: 12.67,
    isActive: true,
    triggered: true,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date("2024-01-20"),
    notification: "push"
  }
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "triggered">("all")

  const [newAlert, setNewAlert] = useState({
    coin: "",
    type: "price_above",
    value: "",
    notification: "both"
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price)
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
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

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus === "all") return true
    if (filterStatus === "active") return alert.isActive && !alert.triggered
    if (filterStatus === "triggered") return alert.triggered
    return true
  })

  const activeAlerts = alerts.filter(a => a.isActive && !a.triggered).length
  const triggeredAlerts = alerts.filter(a => a.triggered).length

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
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
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Price Alerts
              </h1>
              <p className="text-muted-foreground mt-2">
                Get notified when your target prices are reached
              </p>
            </div>
            <PremiumButton onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </PremiumButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeAlerts}</p>
              </div>
              <BellRing className="h-8 w-8 text-green-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Triggered</p>
                <p className="text-2xl font-bold">{triggeredAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </PremiumCard>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2">
          {["all", "active", "triggered"].map((status) => (
            <PremiumButton
              key={status}
              size="sm"
              variant={filterStatus === status ? "gradient" : "outline"}
              onClick={() => setFilterStatus(status as any)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === "all" && ` (${alerts.length})`}
              {status === "active" && ` (${activeAlerts})`}
              {status === "triggered" && ` (${triggeredAlerts})`}
            </PremiumButton>
          ))}
        </motion.div>

        {/* Alerts List */}
        <motion.div variants={itemVariants} className="grid gap-4">
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard className={`p-6 ${alert.triggered ? "border-orange-500/50" : ""}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        alert.triggered ? "bg-orange-500/20 text-orange-500" :
                        alert.isActive ? "bg-green-500/20 text-green-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {alert.type === "price_above" && <TrendingUp className="h-5 w-5" />}
                        {alert.type === "price_below" && <TrendingDown className="h-5 w-5" />}
                        {alert.type === "percent_change" && <Percent className="h-5 w-5" />}
                        {alert.type === "volume" && <DollarSign className="h-5 w-5" />}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {alert.coinName} ({alert.coinSymbol})
                          </h3>
                          {alert.triggered && (
                            <PremiumBadge variant="outline" className="text-orange-500 border-orange-500">
                              Triggered
                            </PremiumBadge>
                          )}
                          {!alert.isActive && !alert.triggered && (
                            <PremiumBadge variant="outline" className="text-muted-foreground">
                              Paused
                            </PremiumBadge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {alert.condition} {alert.type === "percent_change" ? `${alert.targetValue}%` : formatPrice(alert.targetValue)}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Current: <span className="font-medium text-foreground">
                              {alert.type === "percent_change" ? `${alert.currentValue}%` : formatPrice(alert.currentValue)}
                            </span>
                          </span>
                          {alert.triggered && alert.triggeredAt && (
                            <span className="text-muted-foreground">
                              Triggered {new Date(alert.triggeredAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <PremiumBadge variant="outline" className="text-xs">
                            {alert.notification === "both" ? "Email & Push" :
                             alert.notification === "email" ? "Email" : "Push"}
                          </PremiumBadge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.triggered && (
                        <PremiumButton
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAlert(alert.id)}
                        >
                          {alert.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </PremiumButton>
                      )}
                      <PremiumButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingAlert(alert)}
                      >
                        <Edit className="h-4 w-4" />
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus === "all" ? "Create your first price alert to get started" :
               filterStatus === "active" ? "No active alerts at the moment" :
               "No triggered alerts yet"}
            </p>
            {filterStatus === "all" && (
              <PremiumButton onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </PremiumButton>
            )}
          </motion.div>
        )}

        {/* Alert Tips */}
        <motion.div variants={itemVariants}>
          <PremiumCard className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-500" />
              Pro Tips for Price Alerts
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Set multiple alerts at different price levels to track support and resistance</li>
              <li>• Use percentage-based alerts for volatile cryptocurrencies</li>
              <li>• Combine price alerts with volume alerts for better trading signals</li>
              <li>• Review and update your alerts regularly based on market conditions</li>
            </ul>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </div>
  )
}