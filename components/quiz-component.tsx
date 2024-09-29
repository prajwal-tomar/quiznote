'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface Question {
  question_id: number
  question_text: string
  answers: Array<{
    answer_id: number
    answer_text: string
  }>
}

export function QuizComponent() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResult, setQuizResult] = useState<any>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const router = useRouter()

  const searchParams = useSearchParams()
  const quizId = searchParams.get('quizId')
  const supabaseClient = useSupabaseClient()

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      console.log('Fetching quiz questions. Quiz ID:', quizId) // Debug log

      if (!quizId) {
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
      } catch (err) {
        console.error('Error fetching quiz questions:', err)
        setError(`Failed to load quiz questions: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizQuestions()
  }, [quizId, supabaseClient])

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
      setQuizResult(result)
      setQuizCompleted(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError('Failed to submit quiz. Please try again.')
    }
  }

  if (isLoading) return <div>Loading quiz...</div>
  if (error) return <div>Error: {error}</div>
  if (questions.length === 0) return <div>No questions found for this quiz.</div>

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl mb-4">{currentQuestion.question_text}</h2>
        <div className="space-y-2">
          {currentQuestion.answers.map((answer) => (
            <button
              key={answer.answer_id}
              className={`w-full text-left p-2 rounded ${
                selectedAnswer === answer.answer_id ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => handleAnswerSelect(answer.answer_id)}
            >
              {answer.answer_text}
            </button>
          ))}
        </div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={currentQuestionIndex === questions.length - 1 ? handleFinishQuiz : handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}