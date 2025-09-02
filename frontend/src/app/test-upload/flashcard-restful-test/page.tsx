"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testRestfulFlashcardEndpoints, testFlashcardDueEndpoint } from '@/test-utils/flashcard-restful-test';

export default function FlashcardRestfulTestPage() {
  const [projectId, setProjectId] = useState('test-4-real');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('🧪 Starting RESTful flashcard endpoint tests...');
      
      // Test RESTful endpoints
      const restfulResults = await testRestfulFlashcardEndpoints(projectId);
      
      // Test due endpoint
      const dueResults = await testFlashcardDueEndpoint(projectId);
      
      setResults({
        restful: restfulResults,
        due: dueResults,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          🧪 RESTful Flashcard API Tests
        </h1>
        <p className="text-slate-600">
          Test the new RESTful flashcard endpoints with proper idempotency and authorization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project ID"
            />
          </div>
          
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '🧪 Running Tests...' : '🧪 Run RESTful Tests'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">RESTful Endpoints Test</h3>
                <pre className="bg-slate-100 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(results.restful, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Due Endpoint Test</h3>
                <pre className="bg-slate-100 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(results.due, null, 2)}
                </pre>
              </div>
              
              <div className="text-sm text-slate-600">
                <strong>Timestamp:</strong> {results.timestamp}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
