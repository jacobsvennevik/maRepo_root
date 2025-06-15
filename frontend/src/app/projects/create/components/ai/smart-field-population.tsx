import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lightbulb, 
  Target, 
  Clock, 
  BookOpen,
  CheckCircle,
  Zap
} from "lucide-react";

interface SmartSuggestion {
  id: string;
  field: string;
  currentValue: string;
  suggestedValue: string;
  reason: string;
  confidence: number;
  applied: boolean;
}

interface SmartFieldPopulationProps {
  detectedTopics: string[];
  detectedTestTypes: string[];
  detectedDates: any[];
  currentSetup: any;
  onApplySuggestion: (field: string, value: string) => void;
  onDismiss: () => void;
}

export function SmartFieldPopulation({
  detectedTopics,
  detectedTestTypes,
  detectedDates,
  currentSetup,
  onApplySuggestion,
  onDismiss
}: SmartFieldPopulationProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  // Generate smart suggestions based on detected data
  useEffect(() => {
    const newSuggestions: SmartSuggestion[] = [];

    // Timeline suggestions
    if (detectedDates.length > 0 && !currentSetup.timeframe) {
      const hasMultipleDates = detectedDates.length >= 2;
      const hasExams = detectedDates.some((date: any) => date.type === 'exam');
      
      if (hasMultipleDates && hasExams) {
        newSuggestions.push({
          id: 'timeline-1',
          field: 'timeframe',
          currentValue: 'Not set',
          suggestedValue: '3-months',
          reason: 'Multiple exam dates detected - 3-month timeline recommended',
          confidence: 90,
          applied: false
        });
      } else if (hasExams) {
        newSuggestions.push({
          id: 'timeline-2',
          field: 'timeframe',
          currentValue: 'Not set',
          suggestedValue: '1-month',
          reason: 'Exam detected - 1-month intensive timeline',
          confidence: 85,
          applied: false
        });
      }
    }

    // Study frequency suggestions
    if (detectedTestTypes.length > 0 && !currentSetup.studyFrequency) {
      const hasMultipleTypes = detectedTestTypes.length >= 2;
      const hasEssay = detectedTestTypes.some((type: string) => type.toLowerCase().includes('essay'));
      
      if (hasMultipleTypes) {
        newSuggestions.push({
          id: 'frequency-1',
          field: 'studyFrequency',
          currentValue: 'Not set',
          suggestedValue: 'daily',
          reason: 'Multiple test types detected - daily practice recommended',
          confidence: 88,
          applied: false
        });
      } else if (hasEssay) {
        newSuggestions.push({
          id: 'frequency-2',
          field: 'studyFrequency',
          currentValue: 'Not set',
          suggestedValue: 'weekly',
          reason: 'Essay-based tests - weekly writing practice',
          confidence: 82,
          applied: false
        });
      }
    }

    // Goal suggestions
    if (detectedTopics.length > 0 && !currentSetup.goal) {
      const mainTopics = detectedTopics.slice(0, 2).join(' and ');
      newSuggestions.push({
        id: 'goal-1',
        field: 'goal',
        currentValue: 'Not set',
        suggestedValue: `Master ${mainTopics} concepts and achieve strong performance in all assessments`,
        reason: `Based on detected topics: ${mainTopics}`,
        confidence: 85,
        applied: false
      });
    }

    // Collaboration suggestions
    if (detectedTestTypes.length > 0 && !currentSetup.collaboration) {
      const hasGroupWork = detectedTestTypes.some((type: string) => 
        type.toLowerCase().includes('presentation') || type.toLowerCase().includes('group')
      );
      
      if (hasGroupWork) {
        newSuggestions.push({
          id: 'collab-1',
          field: 'collaboration',
          currentValue: 'Not set',
          suggestedValue: 'study-group',
          reason: 'Group presentations detected - study group recommended',
          confidence: 87,
          applied: false
        });
      } else {
        newSuggestions.push({
          id: 'collab-2',
          field: 'collaboration',
          currentValue: 'Not set',
          suggestedValue: 'individual',
          reason: 'Individual test formats - solo study recommended',
          confidence: 80,
          applied: false
        });
      }
    }

    setSuggestions(newSuggestions);
  }, [detectedTopics, detectedTestTypes, detectedDates, currentSetup]);

  const handleApplySuggestion = (suggestion: SmartSuggestion) => {
    onApplySuggestion(suggestion.field, suggestion.suggestedValue);
    setAppliedSuggestions(prev => [...prev, suggestion.id]);
    
    // Mark as applied
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id 
          ? { ...s, applied: true }
          : s
      )
    );
  };

  const handleApplyAll = () => {
    suggestions.forEach(suggestion => {
      if (!appliedSuggestions.includes(suggestion.id)) {
        onApplySuggestion(suggestion.field, suggestion.suggestedValue);
      }
    });
    setAppliedSuggestions(suggestions.map(s => s.id));
    onDismiss();
  };

  if (suggestions.length === 0) return null;

  const unappliedSuggestions = suggestions.filter(s => !appliedSuggestions.includes(s.id));

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg text-green-900">
            Smart Field Suggestions
          </CardTitle>
        </div>
        <p className="text-sm text-green-700">
          We've detected patterns in your data and suggest filling these fields:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-green-900 capitalize">
                  {suggestion.field.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {suggestion.confidence}% confidence
                </Badge>
                {appliedSuggestions.includes(suggestion.id) && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Applied
                  </Badge>
                )}
              </div>
              <p className="text-xs text-green-700 mb-1">{suggestion.reason}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Current: {suggestion.currentValue}</span>
                <span className="text-xs text-gray-400">→</span>
                <span className="text-xs font-medium text-green-800">{suggestion.suggestedValue}</span>
              </div>
            </div>
            {!appliedSuggestions.includes(suggestion.id) && (
              <Button
                size="sm"
                onClick={() => handleApplySuggestion(suggestion)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Apply
              </Button>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {unappliedSuggestions.length > 0 && (
            <Button 
              onClick={handleApplyAll}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Apply All ({unappliedSuggestions.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 