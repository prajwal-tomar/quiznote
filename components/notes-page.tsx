'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Plus, Search, Upload, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface Note {
  note_id: number
  user_id: number
  note_title: string
  file_name: string
  file_path: string
  extracted_text: string
  upload_date: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  async function fetchNotes() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
    } else {
      setNotes(data || [])
    }
    setIsLoading(false)
  }

  const filteredNotes = notes.filter(note =>
    note.note_title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white font-sans">
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-8"
        >
          My Uploaded Notes
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0"
        >
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-indigo-800 bg-opacity-50 border-indigo-600 text-white placeholder-indigo-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300" />
          </div>
          <Button
            onClick={() => {/* Handle note upload */}}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload New Notes
          </Button>
        </motion.div>

        {isLoading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-xl"
          >
            Loading notes...
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.note_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-indigo-800 bg-opacity-50 border-indigo-600 text-white">
                  <CardHeader>
                    <CardTitle>{note.note_title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-indigo-300">File: {note.file_name}</p>
                    <p className="text-sm text-indigo-400">
                      Uploaded: {new Date(note.upload_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" className="border-indigo-400 text-black hover:bg-indigo-700">
                      <BookOpen className="mr-2 h-4 w-4" /> View Notes
                    </Button>
                    <Link href={`/generate-quiz/${note.note_id}`} passHref>
                      <Button className="bg-green-500 hover:bg-green-600 text-white">Generate Quiz</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}