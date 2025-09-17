import { ALL_ENDPOINT_SAMPLES, API_BASE } from '../fixtures/endpoints';
import { joinUrl } from '../utils/url';

describe('Endpoint URL Structure', () => {
  it.each(ALL_ENDPOINT_SAMPLES)('endpoint "%s" has no leading slash or double slashes', (endpoint) => {
    expect(endpoint.startsWith('/')).toBe(false);
    expect(endpoint).toHaveNoDoubleSlash();
  });

  it.each(ALL_ENDPOINT_SAMPLES)('full URL for "%s" has no double slashes', (endpoint) => {
    const full = joinUrl(API_BASE, endpoint);
    expect(full).toHaveNoDoubleSlash();
    expect(full).not.toContain('//api/');
  });
});


