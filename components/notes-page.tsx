'use client'

import { useState, useEffect } from 'react'
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Uploaded Notes</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Button onClick={() => {/* Handle note upload */}}>
          <Upload className="mr-2 h-4 w-4" /> Upload New Notes
        </Button>
      </div>

      {isLoading ? (
        <p>Loading notes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.note_id}>
              <CardHeader>
                <CardTitle>{note.note_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">File: {note.file_name}</p>
                <p className="text-sm text-gray-400">
                  Uploaded: {new Date(note.upload_date).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" /> View Notes
                </Button>
                <Link href={`/generate-quiz/${note.note_id}`} passHref>
                  <Button>Generate Quiz</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}