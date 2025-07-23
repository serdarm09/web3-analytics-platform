'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, BarChart3, TrendingUp, Home, ArrowRight } from 'lucide-react'
import { StarBorder } from '@/components/ui/star-border'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black-primary/80 glassmorphism-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Logo Icon Container */}
            <motion.div 
              className="relative w-10 h-10 flex items-center justify-center"
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 via-gray-600/20 to-gray-700/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              
              {/* Main logo container */}
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-2 border border-gray-600/30 group-hover:border-gray-500/50 transition-all duration-300 overflow-hidden">
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  animate={isHovered ? {
                    scale: [1, 1.5, 2],
                    opacity: [0.3, 0.1, 0]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                
                {/* Icon */}
                <motion.div className="relative flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                  
                  {/* Animated bars */}
                  <motion.div className="absolute inset-0 flex items-end justify-center gap-0.5">
                    {[0.3, 0.7, 0.5, 0.9].map((height, i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-gray-300/60"
                        animate={{
                          height: isHovered ? `${height * 16}px` : '2px',
                          opacity: isHovered ? 1 : 0
                        }}
                        transition={{ 
                          delay: i * 0.1,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Logo Text */}
            <div className="flex flex-col">
              <motion.span 
                className="text-xl font-bold"
                animate={{
                  backgroundImage: isHovered 
                    ? "linear-gradient(to right, #60a5fa, #ffffff, #a78bfa)"
                    : "linear-gradient(to right, #ffffff, #e5e7eb, #dbeafe)"
                }}
                style={{
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
                transition={{ duration: 0.3 }}
              >
                {isHovered ? "Analytics Pro" : "Web3Analytics"}
              </motion.span>
              <motion.span 
                className="text-xs text-gray-500/70 group-hover:text-gray-400 transition-colors duration-300 -mt-1"
                animate={{ opacity: isHovered ? 1 : 0.7 }}
              >
                Powered by 0xBenzen
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white-secondary hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-comfortable">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                
              </motion.div>
            </Link>
            <Link href="/login">
              <StarBorder 
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                Sign In
              </StarBorder>
            </Link>
            <Link href="/register">
              <StarBorder 
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 border-gray-600 text-white shadow hover:bg-primary/90 h-8 px-3"
              >
                Get Started
              </StarBorder>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-gray-primary border-t border-gray-border"
        >
          <div className="container-comfortable py-6 space-y-relaxed">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-white-secondary hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              Landing Page
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-white-secondary hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-6 space-y-compact border-t border-gray-border">
              <Link href="/login" className="block">
                <StarBorder 
                  className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                >
                  Sign In
                </StarBorder>
              </Link>
              <Link href="/register" className="block">
                <StarBorder 
                  className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 border-gray-600 text-white shadow hover:bg-primary/90 h-8 px-3"
                >
                  Get Started
                </StarBorder>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}