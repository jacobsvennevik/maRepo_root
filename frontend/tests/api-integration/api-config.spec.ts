import { axiosApi, axiosGeneration } from '@/lib/axios';
import { inspectAxios } from '../utils/axiosInspect';

describe('API Config', () => {
  it('axiosApi has sane defaults', () => {
    const info = inspectAxios(axiosApi as any);
    expect(info.baseURL).toBeDefined();
    expect(String(info.baseURL)).toHaveNoDoubleSlash();
  });

  it('axiosGeneration has sane defaults', () => {
    const info = inspectAxios(axiosGeneration as any);
    expect(info.baseURL).toBeDefined();
    expect(String(info.baseURL)).toHaveNoDoubleSlash();
  });

  it('axios instances intentionally differ: data API vs generation API', () => {
    // axiosApi -> http://localhost:8000/api/
    // axiosGeneration -> http://localhost:8000/generation/api/
    expect(axiosApi as any).not.toBeSameBaseURLAs(axiosGeneration as any);
  });
});


