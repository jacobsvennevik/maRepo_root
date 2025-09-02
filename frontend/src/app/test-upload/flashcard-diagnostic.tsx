'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { runFlashcardDiagnostics, createMockPayload, testFlashcardGeneration } from '@/test-utils/flashcard-diagnostic';

export default function FlashcardDiagnosticPage() {
  const [projectId, setProjectId] = useState('test-project-123');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>(null);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    addResult('🚀 Starting flashcard generation diagnostics...');
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        logs.push(message);
        addResult(message);
        originalLog(...args);
      };

      await runFlashcardDiagnostics(projectId);
      
      console.log = originalLog;
      addResult('✅ Diagnostics completed successfully');
      
    } catch (error) {
      addResult(`❌ Error running diagnostics: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testSingleEndpoint = async () => {
    setIsRunning(true);
    addResult('🧪 Testing single endpoint...');
    
    try {
      const mockPayload = createMockPayload();
      const result = await testFlashcardGeneration(projectId, mockPayload);
      
      if (result.success) {
        addResult('✅ Single endpoint test passed');
        setTestResults(result.response);
      } else {
        addResult(`❌ Single endpoint test failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Error testing endpoint: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setTestResults(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600">🔍 Flashcard Generation Diagnostics</h1>
        <p className="text-gray-600 mt-2">
          Test and debug the flashcard generation API endpoints
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Configure the test parameters and run diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectId">Project ID (for testing)</Label>
            <Input
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter project ID for testing"
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Running...' : '🚀 Run Full Diagnostics'}
            </Button>
            
            <Button 
              onClick={testSingleEndpoint} 
              disabled={isRunning}
              variant="outline"
            >
              {isRunning ? 'Testing...' : '🧪 Test Single Endpoint'}
            </Button>
            
            <Button 
              onClick={clearResults} 
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Response from the flashcard generation endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Logs</CardTitle>
          <CardDescription>
            Real-time logs from the diagnostic tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-auto font-mono text-sm">
            {results.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run diagnostics to see results.</div>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What This Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>✅ <strong>Endpoint Accessibility:</strong> Verifies the API endpoint is reachable</div>
          <div>✅ <strong>Mock Mode:</strong> Tests if mock data generation is working</div>
          <div>✅ <strong>Response Structure:</strong> Validates the API response format</div>
          <div>✅ <strong>Error Handling:</strong> Tests error scenarios and responses</div>
          <div>✅ <strong>Authentication:</strong> Verifies token-based auth is working</div>
        </CardContent>
      </Card>
    </div>
  );
}
