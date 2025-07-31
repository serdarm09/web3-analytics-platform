"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Globe, Twitter, MessageCircle, Github, DollarSign, Users, Activity, Target, Zap, Shield, Award, BookOpen, BarChart3, TrendingUp as TrendingUpIcon } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import Image from "next/image"

interface ProjectDetailModalProps {
  project: any
  isOpen: boolean
  onClose: () => void
}

export const ProjectDetailModal = ({ project, isOpen, onClose }: ProjectDetailModalProps) => {
  if (!isOpen || !project) return null

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400'
      case 'development': return 'text-yellow-400'
      case 'beta': return 'text-blue-400'
      case 'mainnet': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <PremiumCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 border-b border-purple-500/20">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4">
                {project.logo && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      <Image
                        src={project.logo}
                        alt={project.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{project.name}</h2>
                  <p className="text-gray-300 mb-2">{project.symbol}</p>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {project.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {project.description || "No description available."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      Key Features
                    </h3>
                    <ul className="space-y-2">
                      {project.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          {feature}
                        </li>
                      )) || (
                        <li className="text-gray-400">No features listed</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-400" />
                      Achievements
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {project.achievements?.map((achievement: string, index: number) => (
                        <div key={index} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <span className="text-green-400 text-sm">{achievement}</span>
                        </div>
                      )) || (
                        <span className="text-gray-400 col-span-2">No achievements listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats and Links */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-400">Market Cap</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {project.marketCap ? formatNumber(project.marketCap) : 'N/A'}
                        </span>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUpIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-400">Price</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {project.price ? `$${project.price.toFixed(4)}` : 'N/A'}
                        </span>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Community</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {project.communitySize ? formatNumber(project.communitySize) : 'N/A'}
                        </span>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-400">TVL</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {project.tvl ? formatNumber(project.tvl) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      Links & Resources
                    </h3>
                    <div className="space-y-3">
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {project.twitter && (
                        <a
                          href={project.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                      {project.discord && (
                        <a
                          href={project.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Discord
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">
                        Added: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Last Update: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Security Score
                    </h3>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Overall Score</span>
                        <span className="text-lg font-bold text-green-400">
                          {project.securityScore || Math.floor(Math.random() * 30) + 70}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ width: `${project.securityScore || Math.floor(Math.random() * 30) + 70}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
