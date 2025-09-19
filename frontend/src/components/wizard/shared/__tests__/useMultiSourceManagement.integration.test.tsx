import { renderHook, act, waitFor } from '@testing-library/react'
import useMultiSourceManagement from '../useMultiSourceManagement'

jest.mock('@/lib/projectApi', () => ({ getProjectScoped: jest.fn() }))
const { getProjectScoped } = jest.requireMock('@/lib/projectApi') as { getProjectScoped: jest.Mock }

describe('useMultiSourceManagement - integration', () => {
  const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276'

  beforeEach(() => {
    getProjectScoped.mockReset()
    process.env.NODE_ENV = 'test'
  })

  it('calls expected project-scoped paths for flashcards/files/study-materials', async () => {
    getProjectScoped
      .mockResolvedValueOnce({ data: [] }) // flashcard-sets
      .mockResolvedValueOnce({ data: [] }) // files
      .mockResolvedValueOnce({ data: [] }) // study-materials

    renderHook(() => useMultiSourceManagement({ projectId, autoLoad: true }))

    await waitFor(() => expect(getProjectScoped).toHaveBeenCalledTimes(3))

    const calls = getProjectScoped.mock.calls.map((c: any[]) => c[0])
    expect(calls).toContain('flashcard-sets/')
    expect(calls).toContain('files/')
    expect(calls).toContain('study-materials/')
  })

  it('returns empty arrays on network error in test mode', async () => {
    const netErr: any = new Error('Network Error')
    netErr.code = 'ERR_NETWORK'
    getProjectScoped
      .mockRejectedValueOnce(netErr)
      .mockRejectedValueOnce(netErr)
      .mockRejectedValueOnce(netErr)

    const { result } = renderHook(() => useMultiSourceManagement({ projectId, autoLoad: true }))

    await waitFor(() => expect(getProjectScoped).toHaveBeenCalledTimes(3))

    expect(result.current.flashcards).toEqual([])
    expect(result.current.files).toEqual([])
    expect(result.current.studyMaterials).toEqual([])
  })
})
