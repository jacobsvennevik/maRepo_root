import { render, act, waitFor } from '@testing-library/react'
import React from 'react'
import ProjectFlashcards from '../page'

jest.mock('next/navigation', () => ({
  useParams: () => ({ projectId: '203062be-58d0-4f98-bbd4-33b4ce081276' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}))

jest.mock('../hooks/use-project-flashcards', () => ({
  useProjectFlashcards: () => ({ flashcardSets: [], stats: { total_sets:0, total_cards:0, due_today:0, learning_cards:0, mastered_cards:0, average_accuracy:0 }, isLoading: false, error: null })
}))

describe('ProjectFlashcards - persistence', () => {
  it('stores activeProjectId on load', async () => {
    const setItem = jest.fn()
    const storageMock = {
      getItem: jest.fn(),
      setItem,
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    }
    // @ts-ignore
    global.localStorage = storageMock
    // @ts-ignore
    global.window = { ...(global.window || {}), localStorage: storageMock }

    act(() => {
      render(<ProjectFlashcards />)
    })

    await waitFor(() => {
      expect(setItem).toHaveBeenCalledWith('activeProjectId', '203062be-58d0-4f98-bbd4-33b4ce081276')
    })
  })
})
