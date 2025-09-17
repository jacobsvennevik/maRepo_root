import type { ExpectExtendMap } from '@jest/expect';
import { registerUrlMatchers, urlMatchers } from '../matchers/urlMatchers';

// Register custom matchers
registerUrlMatchers();

// Type augmentation for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWithApi(): R;
      toHaveNoDoubleSlash(): R;
      toBeSameBaseURLAs(other: any): R;
    }
  }
}

export {};

