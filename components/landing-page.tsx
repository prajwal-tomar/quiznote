'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import Image from 'next/image'
import { Notebook, CheckSquare, Upload, BarChart2, Brain, Zap, Users } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export function LandingPageComponent() {
  const [isMounted, setIsMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#1a237e', '#283593', '#3949ab']
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <motion.div
      className=" text-white overflow-hidden  "
      style={{ backgroundColor }}
    >
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </motion.div>
  )
}

function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Login', href: '/login' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-indigo-900 bg-opacity-50 backdrop-blur-md"
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Notebook className="w-8 h-8 text-green-400" />
          <CheckSquare className="w-6 h-6 text-green-400 absolute ml-4 mt-4" />
          <span className="text-2xl font-bold  ">QuizNote</span>
        </Link>
        <ul className="flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.li key={item.name} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href={item.href} className="text-sm hover:text-green-400 transition-colors  ">
                {item.name}
              </Link>
            </motion.li>
          ))}
          <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={user ? "/dashboard" : "/sign-up"}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors  "
            >
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </motion.li>
        </ul>
      </nav>
    </motion.header>
  )
}

function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="min-h-screenflex items-center justify-center relative overflow-hidden pt-20  "
    >
      <div className="py-20 container mx-auto px-4 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 text-center lg:text-left z-10 mb-12 lg:mb-0">
          <motion.h1
            className="text-4xl lg:text-6xl font-bold mb-6 text-white"
            variants={variants}
          >
            Your Notes, Your Quiz, Your Smarter Self.
          </motion.h1>
          <motion.p
            className="text-xl lg:text-2xl mb-8 text-indigo-200"
            variants={variants}
          >
            Upload your notes, generate personalized quizzes, and improve with every test.
          </motion.p>
          <motion.div variants={variants}>
            <Link
              href="/dashboard"
              className="bg-green-400 hover:bg-green-500 text-indigo-900 font-bold py-3 px-8 rounded-full text-lg transition-colors inline-block"
            >
              Start Quiz-ing Now
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="lg:w-1/2 mt-12 lg:mt-0"
          variants={variants}
        >
          <div className="relative w-full h-[400px] bg-indigo-800 rounded-lg shadow-2xl overflow-hidden">
            <motion.div
              className="absolute inset-2 bg-indigo-700 rounded-lg p-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <motion.div
                className="w-full h-2 bg-green-500 mb-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 2, delay: 2 }}
              />
              <motion.div
                className="bg-indigo-600 p-4 rounded-lg mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.5 }}
              >
                <h3 className="text-lg font-semibold mb-2 text-white">Question 1</h3>
                <p className="text-indigo-200">What is the capital of France?</p>
              </motion.div>
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 3 }}
              >
                {['Paris', 'London', 'Berlin', 'Madrid'].map((city, index) => (
                  <button
                    key={city}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded"
                  >
                    {city}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-50" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10" />
      </motion.div>
    </motion.section>
  )
}

function HowItWorksSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const steps = [
    {
      icon: Upload,
      title: 'Upload Your Notes',
      description: 'Drag and drop your notes or select a file from your device. We support all major file types, including PDFs, Word docs, and text files.',
    },
    {
      icon: Brain,
      title: 'AI Analyzes Your Notes',
      description: 'Our advanced AI processes your notes, identifying key concepts, important facts, and potential quiz questions.',
    },
    {
      icon: CheckSquare,
      title: 'Take Personalized Quizzes',
      description: 'Answer questions tailored to your notes and track your progress as you reinforce your learning.',
    },
  ]

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="py-20 bg-gradient-to-b from-indigo-900 to-purple-900"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center mb-12 text-white"
          variants={itemVariants}
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-indigo-800 bg-opacity-50 rounded-lg p-6 text-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <step.icon className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-indigo-200 text-lg">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: false, // Change this to false
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren", // Ensure container animates before children
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const features = [
    {
      icon: Zap,
      title: 'Instant Quiz Generation',
      description: 'Create quizzes from your notes in seconds, saving you hours of manual work.',
    },
    {
      icon: BarChart2,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and performance insights.',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Share quizzes with friends or classmates for group study sessions.',
    },
  ]

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"} // This will re-trigger animation when in view
      variants={containerVariants}
      className="py-20 bg-gradient-to-b from-purple-900 to-indigo-900"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center mb-12 text-white"
          variants={itemVariants}
        >
          Key Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-indigo-800 bg-opacity-50 rounded-lg p-6"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <feature.icon className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-indigo-200 text-lg">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function BenefitsSection() {
  const [ref, inView] = useInView({
    triggerOnce: false, // Change this to false
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren", // Ensure container animates before children
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  }

  const benefits = [
    'Improve retention and recall of important information',
    'Identify knowledge gaps and focus your study efforts',
    'Prepare more effectively for exams and presentations',
    'Save time with automated quiz generation',
    'Enhance your learning experience with AI-powered insights',
  ]

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"} // This will re-trigger animation when in view
      variants={containerVariants}
      className="py-20 bg-gradient-to-b from-indigo-900 to-purple-900"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold text-center mb-12 text-white"
          variants={itemVariants}
        >
          Benefits of Using QuizNote
        </motion.h2>
        <div className="max-w-2xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex items-center mb-6"
              variants={itemVariants}
            >
              <CheckSquare className="w-8 h-8 text-green-400 mr-4 flex-shrink-0" />
              <p className="text-xl text-white">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function CTASection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="py-20 bg-gradient-to-b from-purple-900 to-indigo-900"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold mb-6 text-white">Ready to Supercharge Your Learning?</h2>
        <p className="text-2xl mb-8 max-w-2xl mx-auto text-indigo-200">
          Join thousands of students who are already using QuizNote to ace their exams and master their subjects.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/sign-up"
            className="bg-green-400 hover:bg-green-300 text-indigo-900 font-bold py-4 px-10 rounded-full text-xl transition-colors inline-block"
          >
            Get Started for Free
          </Link>
        </motion.div>
        <p className="mt-4 text-indigo-300 text-lg">No credit card required. Start quiz-ing in minutes.</p>
      </div>
    </motion.section>
  )
}

function Footer() {
  const footerLinks = [
    { title: 'Product', items: ['Features', 'Pricing', 'FAQ', 'Support'] },
    { title: 'Company', items: ['About Us', 'Blog', 'Careers', 'Contact'] },
    { title: 'Legal', items: ['Terms of Service', 'Privacy Policy', 'Cookie Policy'] },
  ]

  return (
    <footer className="bg-indigo-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href="#" className="text-indigo-300 hover:text-green-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-indigo-300 hover:text-green-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-indigo-300 hover:text-green-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-indigo-300 hover:text-green-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-xl italic text-indigo-200 mb-4">
            "Education is not the learning of facts, but the training of the mind to think."
          </p>
          <p className="text-indigo-300">- Albert Einstein</p>
        </div>
        <div className="mt-8 text-center text-indigo-400 text-sm">
          <p>&copy; 2024 QuizNote. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}