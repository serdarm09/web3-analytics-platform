'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black-primary/80 glassmorphism-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
            <span className="text-xl font-bold text-white">Web3Analytics</span>
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
            <Link href="/login">
              <PremiumButton variant="ghost" size="sm">
                Sign In
              </PremiumButton>
            </Link>
            <Link href="/register">
              <PremiumButton variant="gradient" size="sm">
                Get Started
              </PremiumButton>
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
                <PremiumButton variant="outline" size="sm" className="w-full">
                  Sign In
                </PremiumButton>
              </Link>
              <Link href="/register" className="block">
                <PremiumButton variant="gradient" size="sm" className="w-full">
                  Get Started
                </PremiumButton>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}