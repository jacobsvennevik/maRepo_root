import { axiosApi, axiosGeneration } from '@/lib/axios';
import { joinUrl } from '../utils/url';
import { PROJECT_ENDPOINTS } from '../fixtures/endpoints';

describe('Axios Instance Usage', () => {
  const projectId = 'test-project-123';
  const E = PROJECT_ENDPOINTS(projectId);

  it('builds consistent URLs for common endpoints', () => {
    const urlApi = joinUrl((axiosApi.defaults as any).baseURL, E.flashcardSets);
    const urlGen = joinUrl((axiosGeneration.defaults as any).baseURL, E.flashcardSets);
    expect(urlApi).toHaveNoDoubleSlash();
    expect(urlGen).toHaveNoDoubleSlash();
  });
});


