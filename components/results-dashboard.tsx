'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Notebook, CheckSquare, ArrowRight } from 'lucide-react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

export function ResultsDashboardComponent() {
  const [activeTab, setActiveTab] = useState('results')

  // Mock data - replace with actual quiz results
  const overallScore = 85
  const categoryScores = [
    { name: 'Photosynthesis', score: 90 },
    { name: 'Cell Respiration', score: 80 },
  ]
  const strengths = ['Light-dependent reactions', 'Calvin cycle']
  const weakAreas = ['Electron transport chain', 'Krebs cycle']
  const progressData = {
    labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
    datasets: [
      {
        label: 'Score',
        data: [70, 75, 80, 85],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }
  const questionBreakdownData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white font-sans">
      <header className="bg-indigo-900 bg-opacity-50 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Notebook className="w-8 h-8 text-green-400" />
            <CheckSquare className="w-6 h-6 text-green-400 absolute ml-4 mt-4" />
            <span className="text-2xl font-bold">QuizNote</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('results')}
              className={`text-sm transition-colors ${
                activeTab === 'results' ? 'text-green-400' : 'hover:text-green-400'
              }`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`text-sm transition-colors ${
                activeTab === 'review' ? 'text-green-400' : 'hover:text-green-400'
              }`}
            >
              Review Answers
            </button>
            <button
              onClick={() => setActiveTab('tryAgain')}
              className={`text-sm transition-colors ${
                activeTab === 'tryAgain' ? 'text-green-400' : 'hover:text-green-400'
              }`}
            >
              Try Again
            </button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-indigo-800 bg-opacity-50 rounded-lg p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-center mb-8">Quiz Results</h1>
          <div className="text-center mb-8">
            <span className="text-6xl font-bold text-green-400">{overallScore}%</span>
            <p className="text-xl mt-2">Overall Score</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Category Breakdown</h2>
              {categoryScores.map((category, index) => (
                <div key={index} className="mb-4">
                  <p className="text-lg">{category.name}: {category.score}%</p>
                  <div className="w-full h-2 bg-indigo-700 rounded-full mt-2">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${category.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Detailed Insights</h2>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Strengths</h3>
                <ul className="list-disc list-inside">
                  {strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Areas for Improvement</h3>
                <ul className="list-disc list-inside">
                  {weakAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Performance Over Time</h2>
              <div className="h-64">
                <Bar data={progressData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Question Breakdown</h2>
              <div className="h-64">
                <Pie data={questionBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
            >
              Retake Quiz <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
            >
              Review Answers <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
            >
              Upload New Notes <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}