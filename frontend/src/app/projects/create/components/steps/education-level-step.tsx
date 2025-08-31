import { RadioCardGroup, type RadioCardOption } from "./shared";

interface EducationLevelStepProps {
  testLevel: string;
  onTestLevelChange: (level: string) => void;
}

export function EducationLevelStep({
  testLevel,
  onTestLevelChange,
}: EducationLevelStepProps) {
  const educationOptions = [
    { value: 'high-school', label: 'High School', description: 'Secondary education level' },
    { value: 'university', label: 'University', description: 'Undergraduate level' },
    { value: 'graduate', label: 'Graduate', description: 'Postgraduate level' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {educationOptions.map((option) => (
          <div 
            key={option.value} 
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
              testLevel === option.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onTestLevelChange(option.value)}
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{option.label}</div>
              <p className="text-xs text-gray-600 mt-1">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
