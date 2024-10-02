import { NoteUploadPageComponent } from '@/components/note-upload-page'
import { ProtectedRoute } from '@/components/protected-route'
import React from 'react'

export default function DashboardPage() {
  return (
    <div>
      <ProtectedRoute>
      <NoteUploadPageComponent />
      </ProtectedRoute>
      </div>
  )
}
