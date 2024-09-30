'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Notebook, CheckSquare, ArrowRight } from 'lucide-react'
import { Bar, Pie } from 'react-chartjs-2'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
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

interface QuizResult {
  result_id: number
  quiz_id: number
  user_id: string
  score: number
  attempt_date: string
  time_taken: number
  feedback: string
}

export function ResultsDashboardComponent() {
  const [activeTab, setActiveTab] = useState('results')
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const resultId = searchParams.get('resultId')
  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (!resultId) {
        setError('No result ID provided')
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('result_id', resultId)
          .single()

        if (error) throw error

        setQuizResult(data)
        console.log(data)
      } catch (err) {
        console.error('Error fetching quiz result:', err)
        setError('Failed to fetch quiz result')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizResult()
  }, [resultId, supabase])

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  if (!quizResult) {
    return <div className="text-center mt-8">No quiz result found</div>
  }

  const questionBreakdownData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [quizResult.score, 5 - quizResult.score],
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
            <span className="text-6xl font-bold text-green-400">{quizResult.score}/5</span>
            <p className="text-xl mt-2">Overall Score</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Quiz Details</h2>
              <p>Attempt Date: {new Date(quizResult.attempt_date).toLocaleString()}</p>
              <p>Time Taken: {quizResult.time_taken} seconds</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Feedback</h2>
              <p>{quizResult.feedback}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Question Breakdown</h2>
            <div className="h-64">
              <Pie data={questionBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
              onClick={() => router.push(`/quiz?quizId=${quizResult.quiz_id}`)}
            >
              Retake Quiz <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center"
              onClick={() => router.push('/notes')}
            >
              Back to Notes <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}