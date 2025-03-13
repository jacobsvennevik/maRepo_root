// app/(dashboard)/documents/page.tsx
'use client'

import React, { useState } from 'react'
import { uploadDocument } from '@/services/documentService'

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    try {
      await uploadDocument(selectedFile, title)
      setStatusMessage('File uploaded successfully!')
      setSelectedFile(null)
      setTitle('')
    } catch (err: any) {
      setStatusMessage('Error uploading file.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Documents</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setSelectedFile(e.target.files[0])
            }
          }}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Upload
        </button>
      </form>
      {statusMessage && <p className="mt-4">{statusMessage}</p>}
    </div>
  )
}
