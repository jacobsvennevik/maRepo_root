import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import CreateFlashcardSetWizard from '../CreateFlashcardSetWizard'
import { axiosGeneration, axiosApi } from '@/lib/axios'

jest.mock('@/lib/axios', () => ({
  axiosGeneration: { post: jest.fn() },
  axiosApi: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}))

describe('CreateFlashcardSetWizard - Generation', () => {
  const projectId = '11111111-1111-1111-1111-111111111111'

  function setup(open = true) {
    const onOpenChange = jest.fn()
    render(
      <CreateFlashcardSetWizard
        projectId={projectId}
        open={open}
        onOpenChange={onOpenChange}
      />
    )
    return { onOpenChange }
  }

  beforeEach(() => {
    jest.resetAllMocks()
    process.env.NODE_ENV = 'test'
  })

  async function goToStep3WithFileSelected() {
    setup(true)

    // Step 1: choose files
    await waitFor(() => screen.getByText('How would you like to start?'))
    fireEvent.click(screen.getByText('Use Files'))

    // Step 2: ensure recent files are shown and select one
    await waitFor(() => screen.getByText('Recent Files'))
    // Select the first demo file provided by test-mode fallback
    const fileNodes = screen.getAllByText('Course Syllabus.pdf')
    fireEvent.click(fileNodes[0])

    // Now Next should be enabled
    fireEvent.click(screen.getByText('Next'))

    // Step 3 should be visible
    await waitFor(() => screen.getByText('Generate Flashcards'))
  }

  it('posts to generation endpoint with X-Test-Mode header in test mode', async () => {
    ;(axiosGeneration.post as jest.Mock).mockResolvedValue({ data: { deck: { suggested_title: 'Deck', suggested_description: 'Desc' }, cards: [] } })

    await goToStep3WithFileSelected()

    fireEvent.click(screen.getByText('Generate Flashcards'))

    await waitFor(() => {
      expect(axiosGeneration.post).toHaveBeenCalledWith(
        `/projects/${projectId}/flashcards/generate`,
        expect.objectContaining({ project_id: projectId, source_type: 'files' }),
        expect.objectContaining({ headers: expect.objectContaining({ 'X-Test-Mode': 'true' }) })
      )
    })
  })

  it('handles generation errors gracefully', async () => {
    ;(axiosGeneration.post as jest.Mock).mockRejectedValue(new Error('boom'))

    await goToStep3WithFileSelected()

    fireEvent.click(screen.getByText('Generate Flashcards'))

    // No throw; just ensure button returns to enabled state eventually
    await waitFor(() => expect(screen.getByText('Generate Flashcards')).toBeEnabled())
  })
})
