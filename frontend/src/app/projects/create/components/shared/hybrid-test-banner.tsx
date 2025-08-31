import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Zap, Database, FileText } from 'lucide-react';

interface HybridTestBannerProps {
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function HybridTestBanner({ 
  title = "Hybrid Test Mode", 
  description = "Using mock data processed through real backend",
  showDetails = true 
}: HybridTestBannerProps) {
  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <TestTube className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-yellow-800">{title}</h3>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                Hybrid Mode
              </Badge>
            </div>
            
            <p className="text-sm text-yellow-700 mb-3">
              {description}
            </p>
            
            {showDetails && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-yellow-600">
                  <Database className="h-3 w-3" />
                  <span>Mock data provides reliable test content</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-600">
                  <Zap className="h-3 w-3" />
                  <span>Real backend processes the data through AI pipeline</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-600">
                  <FileText className="h-3 w-3" />
                  <span>Fallback to pure mock data if backend unavailable</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 