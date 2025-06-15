import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X } from "lucide-react";
import { FocusAreaOption } from '../../types';
import { FOCUS_AREA_CATEGORIES } from '../../constants';

interface FocusAreasStepProps {
  focusAreas: string[];
  customFocusArea?: string;
  onFocusAreasChange: (areas: string[]) => void;
  onCustomFocusAreaChange: (area: string) => void;
  focusAreaOptions: FocusAreaOption[];
}

export function FocusAreasStep({
  focusAreas,
  customFocusArea,
  onFocusAreasChange,
  onCustomFocusAreaChange,
  focusAreaOptions
}: FocusAreasStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCustomArea, setNewCustomArea] = useState('');

  const handleFocusAreaToggle = (areaValue: string) => {
    if (areaValue === 'custom') {
      setShowCustomInput(true);
      return;
    }

    const newFocusAreas = focusAreas.includes(areaValue)
      ? focusAreas.filter(area => area !== areaValue)
      : [...focusAreas, areaValue];
    
    onFocusAreasChange(newFocusAreas);
  };

  const handleAddCustomArea = () => {
    if (newCustomArea.trim()) {
      onFocusAreasChange([...focusAreas, newCustomArea.trim()]);
      onCustomFocusAreaChange(newCustomArea.trim());
      setNewCustomArea('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveFocusArea = (areaToRemove: string) => {
    onFocusAreasChange(focusAreas.filter(area => area !== areaToRemove));
  };

  const filteredOptions = focusAreaOptions.filter(option => {
    const matchesSearch = option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || option.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSelectedFocusAreaLabels = () => {
    return focusAreas.map(area => {
      const option = focusAreaOptions.find(opt => opt.value === area);
      return option ? option.label : area;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search focus areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['All', ...FOCUS_AREA_CATEGORIES].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Focus Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredOptions.map((option) => {
          const isSelected = focusAreas.includes(option.value);
          const IconComponent = option.icon;
          
          return (
            <div
              key={option.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
              onClick={() => handleFocusAreaToggle(option.value)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{option.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  <span className="text-xs text-gray-500 mt-2 inline-block">{option.category}</span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Focus Area Input */}
      {showCustomInput && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <Label className="text-sm font-medium">Add Custom Focus Area</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your custom focus area..."
              value={newCustomArea}
              onChange={(e) => setNewCustomArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomArea()}
            />
            <Button onClick={handleAddCustomArea} size="sm">
              Add
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowCustomInput(false);
                setNewCustomArea('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Selected Focus Areas */}
      {focusAreas.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Selected Focus Areas ({focusAreas.length})</Label>
          <div className="flex flex-wrap gap-2">
            {getSelectedFocusAreaLabels().map((label, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <span>{label}</span>
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleRemoveFocusArea(focusAreas[index])}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 