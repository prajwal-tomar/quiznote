'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Notebook, CheckSquare, ArrowRight, Loader } from 'lucide-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export function NoteReviewPageComponent() {
  const [noteContent, setNoteContent] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('noteId')

  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchNoteContent = async () => {
      if (!noteId) {
        setError('No note ID provided')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/notes/${noteId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch note content')
        }
        const data = await response.json()
        setNoteContent(data.extracted_text)
        setNoteTitle(data.note_title)
      } catch (err) {
        setError('Error fetching note content')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNoteContent()
  }, [noteId])

  const handleGenerateQuiz = async () => {
    console.log('Generating quiz for noteId:', noteId);
    setIsGeneratingQuiz(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No active session')
      setIsGeneratingQuiz(false)
      return
    }

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ noteId }),
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate quiz: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!data.quiz.quiz_id) { 
        throw new Error('Quiz ID not found in the response');
      }

      console.log('Navigating to quiz with ID:', data.quiz.quiz_id);
      window.location.href = `/quiz?quizId=${data.quiz.quiz_id}`;
    } catch (error) {
      console.error('Error generating quiz:', error)
      let errorMessage = 'Failed to generate quiz. Please try again.'
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`
      }
      setError(errorMessage)
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
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
          <h1 className="text-4xl font-bold text-center mb-4">Review Your Notes</h1>
          <p className="text-center text-xl mb-8">
            Take a moment to review your notes before we generate your quiz. Make sure all the important information is included.
          </p>

          <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{noteTitle}</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm max-h-[400px] overflow-y-auto">
              {noteContent}
            </pre>
          </div>

          <div className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center text-lg mb-4"
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
            >
              {isGeneratingQuiz ? (
                <>
                  Generating Quiz <Loader className="ml-2 w-5 h-5 animate-spin" />
                </>
              ) : (
                <>
                  Generate Quiz <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </motion.button>

            {isGeneratingQuiz && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 10 }}
                className="w-64 h-2 bg-green-500 rounded-full mt-4"
              />
            )}

            {error && (
              <p className="text-red-500 mt-4">{error}</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}