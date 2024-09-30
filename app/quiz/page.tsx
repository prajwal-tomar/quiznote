'use client'

import { QuizComponent } from '@/components/quiz-component'
import { useSearchParams } from 'next/navigation'

export default function QuizPage() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('quizId')
  
  console.log('QuizPage - quizId from searchParams:', quizId);  // Add this log

  return <QuizComponent quizId={quizId} />
}