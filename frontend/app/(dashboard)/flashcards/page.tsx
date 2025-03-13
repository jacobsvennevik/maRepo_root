// app/(dashboard)/flashcards/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { getFlashcardSets } from '@/services/flashcardService'

export default function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const data = await getFlashcardSets()
      setFlashcardSets(data)
    }
    fetchData()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Flashcard Sets</h2>
      {flashcardSets.map((set) => (
        <div key={set.id} className="p-4 border mb-2">
          <h3 className="font-semibold">{set.title}</h3>
          <p>Document ID: {set.document}</p>
        </div>
      ))}
    </div>
  )
}
