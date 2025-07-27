import { 
  cleanupLocalStorage, 
  registerUpload, 
  cleanupOnAbandon,
  isCleanupInProgress,
  getCleanupQueueLength
} from '../cleanup-utils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.showToast
const mockShowToast = jest.fn();
Object.defineProperty(window, 'showToast', {
  value: mockShowToast,
  writable: true
});

// Mock fetch
global.fetch = jest.fn();

describe('cleanup-utils (simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.key.mockClear();
    
    // Reset global state
    (window as any).__cleanupInProgress = false;
    (window as any).__cleanupQueue = [];
    (window as any).__uploads = [];
  });

  describe('registerUpload', () => {
    it('should register AbortController for cleanup', () => {
      const mockController = { abort: jest.fn() };
      registerUpload(mockController);
      
      expect((window as any).__uploads).toContain(mockController);
    });

    it('should initialize uploads array if not exists', () => {
      delete (window as any).__uploads;
      const mockController = { abort: jest.fn() };
      
      registerUpload(mockController);
      
      expect((window as any).__uploads).toEqual([mockController]);
    });
  });

  describe('cleanupLocalStorage', () => {
    it('should remove project creation localStorage keys', () => {
      // Mock localStorage to have some keys
      localStorageMock.key
        .mockReturnValueOnce('project-setup-guided-setup')
        .mockReturnValueOnce('draft_123')
        .mockReturnValueOnce('other-key')
        .mockReturnValue(null);

      cleanupLocalStorage();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('project-setup-guided-setup');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('draft_123');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-key');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      expect(() => cleanupLocalStorage()).not.toThrow();
    });

    it('should handle storage quota exceeded', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      cleanupLocalStorage();

      expect(mockShowToast).toHaveBeenCalledWith(
        'Storage limit reached. Please clear some data and try again.',
        'error'
      );
    });
  });

  describe('cleanupOnAbandon', () => {
    it('should abort uploads and cleanup immediately', async () => {
      const mockController1 = { abort: jest.fn() };
      const mockController2 = { abort: jest.fn() };
      
      (window as any).__uploads = [mockController1, mockController2];
      
      // Mock localStorage
      localStorageMock.key.mockReturnValue(null);

      await cleanupOnAbandon('123');

      expect(mockController1.abort).toHaveBeenCalled();
      expect(mockController2.abort).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('draft_123');
    });

    it('should handle localStorage errors in cleanupOnAbandon', async () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw
      await expect(cleanupOnAbandon('123')).resolves.not.toThrow();
    });
  });

  describe('state tracking', () => {
    it('should track cleanup progress state', () => {
      expect(isCleanupInProgress()).toBe(false);
      
      (window as any).__cleanupInProgress = true;
      expect(isCleanupInProgress()).toBe(true);
    });

    it('should track cleanup queue length', () => {
      expect(getCleanupQueueLength()).toBe(0);
      
      (window as any).__cleanupQueue = [1, 2, 3];
      expect(getCleanupQueueLength()).toBe(3);
    });
  });

  describe('localStorage quota checking', () => {
    it('should handle localStorage access errors', () => {
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Access denied');
      });

      // Should not throw
      expect(() => cleanupLocalStorage()).not.toThrow();
    });
  });
}); 