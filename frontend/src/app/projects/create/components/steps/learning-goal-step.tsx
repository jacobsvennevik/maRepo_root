'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Target, CheckCircle } from "lucide-react";

interface LearningGoalStepProps {
  learningGoal: string;
  onLearningGoalChange: (goal: string) => void;
}

interface SubGoal {
  id: string;
  text: string;
  completed: boolean;
}

export function LearningGoalStep({ learningGoal, onLearningGoalChange }: LearningGoalStepProps) {
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [newSubGoal, setNewSubGoal] = useState('');
  const [showSubGoalInput, setShowSubGoalInput] = useState(false);

  const handleAddSubGoal = () => {
    if (newSubGoal.trim()) {
      setSubGoals(prev => [...prev, {
        id: Date.now().toString(),
        text: newSubGoal.trim(),
        completed: false
      }]);
      setNewSubGoal('');
      setShowSubGoalInput(false);
    }
  };

  const handleToggleSubGoal = (id: string) => {
    setSubGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const handleRemoveSubGoal = (id: string) => {
    setSubGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubGoal();
    }
  };

  const completedSubGoals = subGoals.filter(goal => goal.completed).length;
  const totalSubGoals = subGoals.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">What do you want to achieve?</h3>
        <p className="text-slate-600 text-sm">Define your main learning goal and break it down into smaller objectives</p>
      </div>

      {/* Main Learning Goal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-slate-900">Main Learning Goal</h4>
        </div>
        
        <Textarea
          value={learningGoal}
          onChange={(e) => onLearningGoalChange(e.target.value)}
          placeholder="Describe what you want to learn and achieve. For example: 'Master JavaScript fundamentals and build a complete web application' or 'Learn conversational Spanish to travel comfortably in Spanish-speaking countries'"
          rows={4}
          className="resize-none"
        />
        
        {learningGoal && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Your goal:</strong> {learningGoal}
            </p>
          </div>
        )}
      </div>

      {/* Sub-Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-slate-900">Learning Objectives</h4>
          </div>
          {!showSubGoalInput && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubGoalInput(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Objective
            </Button>
          )}
        </div>

        {/* Add Sub-Goal Form */}
        {showSubGoalInput && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add a specific learning objective
                </label>
                <Textarea
                  value={newSubGoal}
                  onChange={(e) => setNewSubGoal(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 'Complete JavaScript basics course' or 'Learn 100 common Spanish phrases'"
                  rows={2}
                  className="resize-none"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddSubGoal}
                  disabled={!newSubGoal.trim()}
                  size="sm"
                >
                  Add Objective
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubGoalInput(false);
                    setNewSubGoal('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sub-Goals List */}
        {subGoals.length > 0 && (
          <div className="space-y-3">
            {subGoals.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  goal.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  onClick={() => handleToggleSubGoal(goal.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    goal.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 hover:border-green-400'
                  }`}
                >
                  {goal.completed && <CheckCircle className="h-3 w-3" />}
                </button>
                
                <span
                  className={`flex-1 text-sm ${
                    goal.completed
                      ? 'text-green-800 line-through'
                      : 'text-slate-700'
                  }`}
                >
                  {goal.text}
                </span>
                
                <button
                  onClick={() => handleRemoveSubGoal(goal.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Progress Summary */}
        {totalSubGoals > 0 && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm text-slate-600">
                {completedSubGoals} of {totalSubGoals} objectives
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSubGoals / totalSubGoals) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">💡 Tips for setting effective learning goals:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific about what you want to learn</li>
          <li>• Break down large goals into smaller, manageable objectives</li>
          <li>• Set realistic timelines for each objective</li>
          <li>• Focus on practical skills you can apply</li>
        </ul>
      </div>
    </div>
  );
} 