// app/(dashboard)/chat/page.tsx
'use client'

import React, { useState } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
    // TODO: Call AI backend for response, then setMessages([...messages, response])
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">AI Chat</h2>
      <div className="mb-4 max-h-80 overflow-y-auto border p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}
