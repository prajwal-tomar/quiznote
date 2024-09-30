'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Notebook, CheckSquare, Menu, X } from 'lucide-react'

export function HeaderComponent() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Upload Notes', href: '/upload' },
    { name: 'My Quizzes', href: '/quizzes' },
    { name: 'Profile', href: '/profile' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-indigo-900 bg-opacity-90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Notebook className="w-8 h-8 text-green-400" />
            <CheckSquare className="w-6 h-6 text-green-400 absolute ml-4 mt-4" />
            <span className="text-2xl font-bold text-white">QuizNote</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? 'text-green-400 font-semibold'
                    : 'text-white hover:text-green-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm"
            >
              Start Quiz
            </motion.button>
          </div>
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? 'text-green-400 font-semibold'
                    : 'text-white hover:text-green-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm"
            >
              Start Quiz
            </motion.button>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}