'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Notebook, CheckSquare, Check, X } from 'lucide-react'

interface Question {
  question_id: number
  question_text: string
  answers: Array<{
    answer_id: number
    answer_text: string
  }>
}

interface QuizComponentProps {
  quizId: string | null
}

export function QuizComponent({ quizId: initialQuizId }: QuizComponentProps) {
  const [quizId, setQuizId] = useState<string | null>(initialQuizId);
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResult, setQuizResult] = useState<any>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const router = useRouter()

  const searchParams = useSearchParams()
  const supabaseClient = useSupabaseClient()

  useEffect(() => {
    if (!quizId) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlQuizId = searchParams.get('quizId');
      console.log('QuizComponent - quizId from URL:', urlQuizId);
      setQuizId(urlQuizId);
    }
  }, [quizId]);

  useEffect(() => {
    if (!quizId) return;  // Don't fetch if quizId is not available yet

    const fetchQuizQuestions = async () => {
      console.log('Fetching quiz questions. Quiz ID:', quizId);  // Keep this log

      if (!quizId) {
        console.log('No quizId provided to QuizComponent');  // Add this log
        setError('No quiz ID provided')
        setIsLoading(false)
        return
      }

      // Ensure quizId is a valid integer
      const parsedQuizId = parseInt(quizId, 10)
      if (isNaN(parsedQuizId)) {
        setError('Invalid quiz ID')
        setIsLoading(false)
        return
      }

      try {
        const { data: questionsData, error: questionsError } = await supabaseClient
          .from('questions')
          .select(`
            question_id,
            question_text,
            answers (
              answer_id,
              answer_text
            )
          `)
          .eq('quiz_id', parsedQuizId)

        if (questionsError) throw questionsError

        console.log('Fetched questions:', questionsData) // Debug log

        if (!questionsData || questionsData.length === 0) {
          setError('No questions found for this quiz')
        } else {
          setQuestions(questionsData as Question[])
          // Set the start time when questions are loaded
          setStartTime(new Date().getTime())
        }
      } catch (err: unknown) {
        console.error('Error fetching quiz questions:', err)
        setError(`Failed to load quiz questions: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizQuestions()
  }, [quizId, supabaseClient])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswer(answerId)
    setSelectedAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQuestionIndex] = answerId
      return newAnswers
    })
  }

  const handleNextQuestion = () => {
    setSelectedAnswer(null)
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))
  }

  const handleFinishQuiz = async () => {
    if (startTime === null) {
      console.error('Start time was not set')
      return
    }

    const endTime = new Date().getTime()
    const timeTaken = Math.floor((endTime - startTime) / 1000) // time taken in seconds

    const answers = questions.map((question, index) => ({
      questionId: question.question_id,
      answerId: selectedAnswers[index] || null
    }))

    try {
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers,
          timeTaken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const result = await response.json()
      console.log(result)
      // Redirect to the results page with the result_id
      router.push(`/results?resultId=${result.quizResult.result_id}`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError('Failed to submit quiz. Please try again.')
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  if (isLoading) return <div className="text-white">Loading quiz...</div>
  if (error) return <div className="text-white">Error: {error}</div>
  if (questions.length === 0) return <div className="text-white">No questions found for this quiz.</div>

  const currentQuestion = questions[currentQuestionIndex]

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
            <span className="text-sm">Quiz in Progress</span>
            <div className="w-32 h-2 bg-indigo-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12 flex">
        <div className="w-3/4 pr-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.question_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-indigo-800 bg-opacity-50 rounded-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-bold mb-4">{currentQuestion.question_text}</h2>
              <div className="space-y-4">
                {currentQuestion.answers.map((answer) => (
                  <button
                    key={answer.answer_id}
                    onClick={() => handleAnswerSelect(answer.answer_id)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedAnswer === answer.answer_id
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-700 hover:bg-indigo-600'
                    }`}
                  >
                    {answer.answer_text}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={currentQuestionIndex === questions.length - 1 ? handleFinishQuiz : handleNextQuestion}
              disabled={selectedAnswer === null}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </motion.button>
          </div>
        </div>

        <div className="w-1/4 bg-indigo-800 bg-opacity-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Progress</h3>
          <p className="mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p className="mb-4">Time Left: {formatTime(timeLeft)}</p>
          <div className="w-full h-2 bg-indigo-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}