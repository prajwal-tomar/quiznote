'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { Notebook, CheckSquare, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export function NoteUploadPageComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  })

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim() !== '') {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    if (!user) {
      setError('You must be logged in to upload notes.')
      console.log("hello")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Extract text from the file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      })

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { extractedText } = await response.json()

      // Upload file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('notes')
        .upload(`${user.id}/${Date.now()}_${file.name}`, file)

      if (storageError) throw storageError

      // Store note information in the 'notes' table
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          note_title: file.name,
          file_name: file.name,
          file_path: storageData.path,
          extracted_text: extractedText,
          upload_date: new Date().toISOString()
        })
        .select()

      if (noteError) throw noteError
      if (!noteData || noteData.length === 0) throw new Error('Failed to insert note data')

      const noteId = noteData[0].note_id

      // Add tags to the note
      if (tags.length > 0) {
        const { error: tagError } = await supabase.from('tags')
          .upsert(tags.map(tag => ({ tag_name: tag })), { onConflict: 'tag_name' })
        if (tagError) throw tagError

        const { data: existingTags, error: existingTagsError } = await supabase
          .from('tags')
          .select('tag_id, tag_name')
          .in('tag_name', tags)

        if (existingTagsError) throw existingTagsError
        if (!existingTags) throw new Error('Failed to fetch existing tags')

        const noteTagInserts = existingTags.map(tag => ({
          note_id: noteData[0].note_id,
          tag_id: tag.tag_id
        }))

        const { error: noteTagError } = await supabase
          .from('note_tags')
          .insert(noteTagInserts)

        if (noteTagError) throw noteTagError
      }

      // Success! Redirect to the review notes page with the note ID
      router.push(`/review-notes?noteId=${noteId}`)
    } catch (error) {
      console.error('Error uploading note:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while uploading your note. Please try again.')
    } finally {
      setIsUploading(false)
    }
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
            <Link href="/" className="text-sm hover:text-green-400 transition-colors">
              Back to Home
            </Link>
            <Link href="/login" className="text-sm hover:text-green-400 transition-colors">
              Login
            </Link>
            <Link href="/help" className="text-sm hover:text-green-400 transition-colors">
              Help
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-8"
        >
          Upload Your Notes to Get Started!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-indigo-500 rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-green-500 bg-indigo-800 bg-opacity-50' : 'hover:border-green-500 hover:bg-indigo-800 hover:bg-opacity-25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
            <p className="text-xl mb-2">
              {file ? file.name : "Drag your notes here or click to upload"}
            </p>
            <p className="text-sm text-indigo-300">We support PDF, DOCX, TXT</p>
          </div>

          <div className="mt-6">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Add tags (optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-indigo-700 text-white px-2 py-1 rounded-full text-sm flex items-center">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 focus:outline-none">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={addTag}
              placeholder="Add tags (e.g., 'Biology', 'Chapter 5') and press Enter"
              className="w-full px-3 py-2 bg-indigo-800 bg-opacity-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full transition-colors ${
              (!file || isUploading) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isUploading ? 'Generating Quiz...' : 'Generate Quiz'}
          </motion.button>

          {isUploading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="mt-4 h-2 bg-green-500 rounded-full"
            />
          )}
        </motion.div>
      </main>
    </div>
  )
}