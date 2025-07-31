'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, FileText } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { toast } from 'sonner'

interface CreatePortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePortfolio?: (data: { name: string; description?: string }) => Promise<void>
  onPortfolioCreated?: (portfolio: any) => void
}

export default function CreatePortfolioModal({ 
  isOpen, 
  onClose, 
  onCreatePortfolio, 
  onPortfolioCreated 
}: CreatePortfolioModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Portfolio name is required')
      return
    }

    setIsLoading(true)
    try {
      if (onCreatePortfolio) {
        await onCreatePortfolio({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        })
      } else if (onPortfolioCreated) {
        // Create portfolio via API
        const response = await fetch('/api/portfolios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create portfolio')
        }

        const newPortfolio = await response.json()
        onPortfolioCreated(newPortfolio)
      }
      
      // Reset form and close modal
      setFormData({ name: '', description: '' })
      onClose()
    } catch (error) {
      console.error('Error creating portfolio:', error)
      toast.error('Failed to create portfolio')
    } finally {
      setIsLoading(false)
    }
  }

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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <PremiumCard className="glassmorphism p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-accent-slate" />
                  Create New Portfolio
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Portfolio Name *
                  </label>
                  <PremiumInput
                    id="name"
                    type="text"
                    placeholder="e.g., My Crypto Portfolio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading}
                    required
                    icon={Wallet}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <PremiumInput
                    id="description"
                    type="text"
                    placeholder="e.g., Long-term holdings"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isLoading}
                    icon={FileText}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <PremiumButton
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </PremiumButton>
                  <PremiumButton
                    type="submit"
                    variant="gradient"
                    disabled={isLoading || !formData.name.trim()}
                    className="flex-1"
                  >
                    {isLoading ? 'Creating...' : 'Create Portfolio'}
                  </PremiumButton>
                </div>
              </form>
            </PremiumCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}