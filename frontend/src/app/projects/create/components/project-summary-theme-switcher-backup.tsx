'use client';

import { useState } from 'react';
import { ProjectSetup } from '../types';
import { ProjectSummary } from './project-summary';
import { 
  ProjectSummaryColorful, 
  ProjectSummaryGlass, 
  ProjectSummaryGameified 
} from './project-summary-variants';

type VariantType = 'original' | 'colorful' | 'glass' | 'gamified';

interface ProjectSummaryWithSwitcherProps {
  setup: ProjectSetup;
  onBack: () => void;
  defaultVariant?: VariantType;
}

/**
 * BACKUP FILE - Project Summary Theme Switcher Components
 * 
 * This file contains various theme switcher implementations that were
 * saved for future reuse. These components allow users to switch between
 * different project summary variants (Original, Colorful, Glass, Gamified).
 * 
 * Available Components:
 * - ProjectSummaryWithSwitcher: Simple dropdown selector
 * - ProjectSummaryWithButtons: Button-based selector
 * - ProjectSummaryWithSettings: Settings gear with localStorage persistence
 * 
 * To reuse any of these components:
 * 1. Copy the desired component(s) to a new file
 * 2. Import in your component where you want the switcher
 * 3. Replace your ProjectSummary usage with the switcher component
 * 
 * Example usage:
 * import { ProjectSummaryWithSwitcher } from './your-new-file';
 * <ProjectSummaryWithSwitcher setup={setup} onBack={onBack} defaultVariant="colorful" />
 */

export function ProjectSummaryWithSwitcher({ 
  setup, 
  onBack, 
  defaultVariant = 'original' 
}: ProjectSummaryWithSwitcherProps) {
  const [currentVariant, setCurrentVariant] = useState<VariantType>(defaultVariant);

  const variants = {
    original: ProjectSummary,
    colorful: ProjectSummaryColorful,
    glass: ProjectSummaryGlass,
    gamified: ProjectSummaryGameified,
  };

  const CurrentComponent = variants[currentVariant];

  return (
    <div>
      {/* Simple variant selector */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 border">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Theme:
        </label>
        <select 
          value={currentVariant}
          onChange={(e) => setCurrentVariant(e.target.value as VariantType)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="original">📚 Professional</option>
          <option value="colorful">🎨 Colorful</option>
          <option value="glass">✨ Glass</option>
          <option value="gamified">🎮 Gamified</option>
        </select>
      </div>

      {/* Render selected variant */}
      <CurrentComponent setup={setup} onBack={onBack} />
    </div>
  );
}

// Alternative: Simple button switcher
export function ProjectSummaryWithButtons({ 
  setup, 
  onBack, 
  defaultVariant = 'original' 
}: ProjectSummaryWithSwitcherProps) {
  const [currentVariant, setCurrentVariant] = useState<VariantType>(defaultVariant);

  const variants = [
    { id: 'original', name: '📚 Professional', component: ProjectSummary },
    { id: 'colorful', name: '🎨 Colorful', component: ProjectSummaryColorful },
    { id: 'glass', name: '✨ Glass', component: ProjectSummaryGlass },
    { id: 'gamified', name: '🎮 Gamified', component: ProjectSummaryGameified },
  ];

  const CurrentComponent = variants.find(v => v.id === currentVariant)?.component || ProjectSummary;

  return (
    <div>
      {/* Button switcher */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 border">
        <div className="text-xs font-medium text-gray-700 mb-2">Theme:</div>
        <div className="flex flex-col space-y-1">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setCurrentVariant(variant.id as VariantType)}
              className={`text-xs px-2 py-1 rounded text-left ${
                currentVariant === variant.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Render selected variant */}
      <CurrentComponent setup={setup} onBack={onBack} />
    </div>
  );
}

// Alternative: Settings-based switcher (save preference)
export function ProjectSummaryWithSettings({ 
  setup, 
  onBack 
}: Omit<ProjectSummaryWithSwitcherProps, 'defaultVariant'>) {
  // Get saved preference from localStorage
  const [currentVariant, setCurrentVariant] = useState<VariantType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('projectSummaryTheme') as VariantType) || 'original';
    }
    return 'original';
  });

  const handleVariantChange = (newVariant: VariantType) => {
    setCurrentVariant(newVariant);
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('projectSummaryTheme', newVariant);
    }
  };

  const variants = {
    original: ProjectSummary,
    colorful: ProjectSummaryColorful,
    glass: ProjectSummaryGlass,
    gamified: ProjectSummaryGameified,
  };

  const CurrentComponent = variants[currentVariant];

  return (
    <div>
      {/* Settings gear icon */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative group">
          <button className="bg-white rounded-full p-2 shadow-lg border hover:shadow-xl transition-shadow">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Theme Preference</div>
              <div className="space-y-1">
                {[
                  { id: 'original', name: '📚 Professional', desc: 'Clean & minimal' },
                  { id: 'colorful', name: '🎨 Colorful Dashboard', desc: 'Vibrant & animated' },
                  { id: 'glass', name: '✨ Glass Morphism', desc: 'Modern & dark' },
                  { id: 'gamified', name: '🎮 Gamified', desc: 'Fun & engaging' },
                ].map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant.id as VariantType)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      currentVariant === variant.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-xs text-gray-500">{variant.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render selected variant */}
      <CurrentComponent setup={setup} onBack={onBack} />
    </div>
  );
} 