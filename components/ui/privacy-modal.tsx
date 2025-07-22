'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Lock, Eye, Server, UserCheck } from 'lucide-react'
import { PremiumButton } from './premium-button'
import { PremiumCard } from './premium-card'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function PrivacyModal({ isOpen, onClose, onAccept }: PrivacyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <PremiumCard className="glassmorphism-dark border border-white/10 shadow-2xl">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Privacy Policy & Terms</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                {/* Quick Summary */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Quick Summary
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                      <span>We collect minimal data needed for service operation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                      <span>Your wallet addresses are never shared without consent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                      <span>We use industry-standard encryption for all data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                      <span>You can delete your account and data at any time</span>
                    </li>
                  </ul>
                </div>

                {/* Data Collection */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    What We Collect
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    We collect only the information necessary to provide our services:
                  </p>
                  <ul className="space-y-2 text-gray-400 text-sm ml-6">
                    <li>• Email address (for email registration)</li>
                    <li>• Wallet address (for wallet registration)</li>
                    <li>• Username and profile information</li>
                    <li>• Portfolio and watchlist preferences</li>
                    <li>• Usage analytics (anonymized)</li>
                  </ul>
                </div>

                {/* Data Security */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-400" />
                    Data Security
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Your security is our priority. We implement industry-standard security measures including:
                    256-bit encryption, secure authentication, regular security audits, and GDPR compliance.
                  </p>
                </div>

                {/* Your Rights */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-orange-400" />
                    Your Rights
                  </h3>
                  <p className="text-gray-400 text-sm">
                    You have the right to: access your data, correct inaccuracies, delete your account,
                    export your data, and opt-out of marketing communications at any time.
                  </p>
                </div>

                {/* Terms of Service */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Server className="w-5 h-5 text-red-400" />
                    Terms of Service
                  </h3>
                  <p className="text-gray-400 text-sm">
                    By using our service, you agree to use it responsibly and in compliance with all
                    applicable laws. We reserve the right to suspend accounts that violate our terms.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Last updated: January 2025
                  </p>
                  <div className="flex gap-3">
                    <PremiumButton
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </PremiumButton>
                    <PremiumButton
                      variant="gradient"
                      onClick={onAccept}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    >
                      Accept & Continue
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}