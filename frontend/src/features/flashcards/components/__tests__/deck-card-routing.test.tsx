import { render, screen } from '@testing-library/react'
import React from 'react'
import { DeckCard } from '../../components/deck-card'
import type { FlashcardSet } from '../../types'

jest.mock('next/link', () => {
  return ({ href, children }: any) => <a href={href} data-testid="link">{children}</a>
})

describe('DeckCard routing', () => {
  const deck: FlashcardSet = {
    id: 9,
    title: 'Test Set',
    description: 'desc',
    owner: 1, // user id, not a project id
    difficulty_level: 'INTERMEDIATE',
    target_audience: '',
    estimated_study_time: 10,
    tags: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    flashcard_count: 0,
    is_public: false,
    study_stats: { total_cards: 0, due_cards: 0, mastered_cards: 0, learning_cards: 0, review_cards: 0, retention_rate: 0, streak_days: 0, next_review: '2024-01-01T00:00:00Z' },
    flashcards: [],
    learning_objectives: [],
    themes: [],
  }

  it('uses provided projectId for link, not deck.owner', () => {
    const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276'
    render(<DeckCard deck={deck} projectId={projectId} />)

    const links = screen.getAllByTestId('link')
    const studyLink = links.find(a => (a as HTMLAnchorElement).href.includes('/flashcards/')) as HTMLAnchorElement

    expect(studyLink).toBeTruthy()
    expect(studyLink.getAttribute('href')).toBe(`/projects/${projectId}/flashcards/${deck.id}`)
  })
})
