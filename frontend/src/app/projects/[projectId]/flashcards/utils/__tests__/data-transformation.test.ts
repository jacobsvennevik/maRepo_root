import { refreshFlashcardSets } from '../data-transformation'
import { axiosGeneration } from '@/lib/axios'

jest.mock('@/lib/axios', () => ({
  axiosGeneration: { get: jest.fn() },
}))

describe('data-transformation: refreshFlashcardSets', () => {
  beforeEach(() => {
    (axiosGeneration.get as jest.Mock).mockReset()
  })

  it('calls generation endpoint for project-scoped sets', async () => {
    ;(axiosGeneration.get as jest.Mock).mockResolvedValue({ data: { results: [] } })

    const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276'
    await refreshFlashcardSets(projectId)

    expect(axiosGeneration.get).toHaveBeenCalledWith(`projects/${projectId}/flashcard-sets/`)
  })

  it('falls back to UUID when projectId is numeric (via global hint)', async () => {
    ;(axiosGeneration.get as jest.Mock).mockResolvedValue({ data: { results: [] } })

    const uuid = '203062be-58d0-4f98-bbd4-33b4ce081276'
    ;(global as any).__activeProjectId = uuid

    await refreshFlashcardSets('1' as any)

    expect(axiosGeneration.get).toHaveBeenCalledWith(`projects/${uuid}/flashcard-sets/`)
  })
})
