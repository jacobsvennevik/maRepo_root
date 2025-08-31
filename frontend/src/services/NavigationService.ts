import { useRouter } from 'next/navigation'

export class NavigationService {
  static async navigateWithCleanup(
    router: ReturnType<typeof useRouter>,
    path: string,
    cleanupFn?: () => Promise<void>
  ) {
    try {
      // Perform cleanup in background, don't block navigation
      if (cleanupFn) {
        cleanupFn().catch(error => {
          console.warn('Cleanup failed:', error)
        })
      }
      
      // Navigate immediately
      router.push(path)
    } catch (error) {
      console.error('Navigation failed:', error)
      throw error
    }
  }
} 