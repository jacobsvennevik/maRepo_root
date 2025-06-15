import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, X, Lightbulb } from "lucide-react";

interface LearningGoalStepProps {
  learningGoal: string;
  subGoals: string[];
  onLearningGoalChange: (goal: string) => void;
  onSubGoalsChange: (subGoals: string[]) => void;
}

export function LearningGoalStep({
  learningGoal,
  subGoals,
  onLearningGoalChange,
  onSubGoalsChange
}: LearningGoalStepProps) {
  const [showSubGoalInput, setShowSubGoalInput] = useState(false);
  const [newSubGoal, setNewSubGoal] = useState('');

  const handleAddSubGoal = () => {
    if (newSubGoal.trim()) {
      onSubGoalsChange([...subGoals, newSubGoal.trim()]);
      setNewSubGoal('');
      setShowSubGoalInput(false);
    }
  };

  const handleRemoveSubGoal = (index: number) => {
    onSubGoalsChange(subGoals.filter((_, i) => i !== index));
  };

  const goalExamples = [
    "Master React fundamentals and build a complete web application",
    "Learn Python for data analysis and create meaningful visualizations",
    "Develop proficiency in digital marketing and launch a successful campaign",
    "Acquire conversational Spanish skills for travel and business",
    "Build a portfolio of design projects showcasing various styles and techniques"
  ];

  return (
    <div className="space-y-6">
      {/* Main Learning Goal */}
      <div className="space-y-4">
        <Label htmlFor="learningGoal" className="text-sm sm:text-base font-medium">
          What do you want to achieve? *
        </Label>
        <Textarea
          id="learningGoal"
          placeholder="Describe your main learning goal in detail..."
          value={learningGoal}
          onChange={(e) => onLearningGoalChange(e.target.value)}
          className="min-h-[120px] text-base"
        />
        <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Lightbulb className="inline h-4 w-4 mr-1" />
          Be specific about what you want to learn and how you'll measure success.
        </div>
      </div>

      {/* Sub-Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm sm:text-base font-medium">
            Break into sub-goals (optional)
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSubGoalInput(!showSubGoalInput)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Sub-goal</span>
          </Button>
        </div>

        {showSubGoalInput && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <Label className="text-sm font-medium">Add Sub-goal</Label>
            <div className="flex space-x-2">
              <Textarea
                placeholder="e.g., Complete React basics course"
                value={newSubGoal}
                onChange={(e) => setNewSubGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubGoal()}
                className="min-h-[60px]"
              />
              <div className="flex flex-col space-y-2">
                <Button onClick={handleAddSubGoal} size="sm">
                  Add
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowSubGoalInput(false);
                    setNewSubGoal('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-goals List */}
        {subGoals.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sub-goals ({subGoals.length})</Label>
            <div className="space-y-2">
              {subGoals.map((subGoal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{subGoal}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubGoal(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Goal Examples</Label>
        <div className="grid grid-cols-1 gap-2">
          {goalExamples.map((example, index) => (
            <div 
              key={index}
              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onLearningGoalChange(example)}
            >
              <p className="text-sm text-gray-700">{example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 