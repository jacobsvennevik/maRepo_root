import { Loader2, Sparkles } from "lucide-react";

interface AILoadingProps {
  message?: string;
  subMessage?: string;
  variant?: 'blue' | 'purple' | 'green';
}

export function AILoading({ 
  message = "Analyzing your files...", 
  subMessage = "Extracting topics, dates, and test types",
  variant = 'blue'
}: AILoadingProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      subText: 'text-blue-700',
      icon: 'text-blue-600',
      dots: 'bg-blue-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      subText: 'text-purple-700',
      icon: 'text-purple-600',
      dots: 'bg-purple-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      subText: 'text-green-700',
      icon: 'text-green-600',
      dots: 'bg-green-500'
    }
  };

  const colorScheme = colors[variant];

  return (
    <div className={`flex items-center justify-center p-6 ${colorScheme.bg} border ${colorScheme.border} rounded-lg`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-purple-500 flex items-center justify-center">
            <Loader2 className="h-2 w-2 animate-spin text-purple-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-medium ${colorScheme.text}`}>{message}</p>
            <div className="flex gap-1">
              <div className={`w-1 h-1 rounded-full ${colorScheme.dots} animate-pulse`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-1 h-1 rounded-full ${colorScheme.dots} animate-pulse`} style={{ animationDelay: '200ms' }}></div>
              <div className={`w-1 h-1 rounded-full ${colorScheme.dots} animate-pulse`} style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
          <p className={`text-xs ${colorScheme.subText}`}>{subMessage}</p>
        </div>
      </div>
    </div>
  );
} 