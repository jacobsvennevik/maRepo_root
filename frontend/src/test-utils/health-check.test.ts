/**
 * Health Check Tests - Run these FIRST to ensure backend is available
 * These would have caught the "backend not running" issue immediately
 */

describe('Application Health Checks', () => {
  it('backend should be running and accessible', async () => {
    const response = await fetch('http://localhost:8000/api/');
    expect([200, 401]).toContain(response.status); // 200 = working, 401 = auth required
  }, 10000);

  it('generation API should be available', async () => {
    const response = await fetch('http://localhost:8000/generation/api/');
    expect([200, 401]).toContain(response.status); // Should get success or auth error, not connection error  
  }, 10000);

  it('all required services should be running', async () => {
    // This test would fail immediately if backend is down
    const checks = await Promise.allSettled([
      fetch('http://localhost:8000/api/'),
      fetch('http://localhost:8000/generation/api/'),
      fetch('http://localhost:3000/_next/static/')
    ]);

    const failures = checks.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.error('❌ Service health check failures:');
      failures.forEach((failure, i) => {
        console.error(`Service ${i}: ${(failure as any).reason}`);
      });
    }

    expect(failures).toHaveLength(0);
  });
});
