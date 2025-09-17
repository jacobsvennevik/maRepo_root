import type { AxiosInstance } from 'axios';
import { hasDoubleSlash } from '../utils/url';

function getBaseURL(instance: AxiosInstance | { defaults?: any } | undefined): string | undefined {
  if (!instance) return undefined;
  const anyInst: any = instance as any;
  return anyInst?.defaults?.baseURL ?? anyInst?.baseURL;
}

export const urlMatchers = {
  toStartWithApi(received: string) {
    const pass = typeof received === 'string' && /\/api\/?/.test(received);
    return {
      pass,
      message: () => `expected URL to start with "/api" but got: ${received}`,
    };
  },

  toHaveNoDoubleSlash(received: string) {
    const pass = typeof received === 'string' && !hasDoubleSlash(received);
    return {
      pass,
      message: () => `expected URL to have no double slashes (except protocol), got: ${received}`,
    };
  },

  toBeSameBaseURLAs(received: AxiosInstance, other: AxiosInstance) {
    const a = getBaseURL(received);
    const b = getBaseURL(other);
    const pass = a === b;
    return {
      pass,
      message: () => `expected base URLs to match but got: ${a} != ${b}`,
    };
  },
};

export type UrlMatchers = typeof urlMatchers;

export function registerUrlMatchers() {
  expect.extend(urlMatchers as any);
}

export default { registerUrlMatchers };

