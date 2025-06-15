'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Wand2, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuidedSetup } from './components/guided-setup';
import { CustomSetup } from './components/custom-setup';

type SetupMode = 'selection' | 'guided' | 'custom';

export default function CreateProject() {
  const [setupMode, setSetupMode] = useState<SetupMode>('selection');

  const handleModeSelect = (mode: 'guided' | 'custom') => {
    setSetupMode(mode);
  };

  const handleBack = () => {
    setSetupMode('selection');
  };

  if (setupMode === 'guided') {
    return <GuidedSetup onBack={handleBack} />;
  }

  if (setupMode === 'custom') {
    return <CustomSetup onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-4 sm:mb-6 lg:mb-8">
          <Link href="/projects" className="hover:text-blue-600 flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Projects
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Create New Project
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            Choose how you'd like to set up your new learning project. We'll help you get started with the right configuration.
          </p>
        </div>

        {/* Setup Mode Selection */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Guided Setup Card */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group cursor-pointer"
                onClick={() => handleModeSelect('guided')}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-slate-900">Guided Setup</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                Let us guide you through a personalized setup process. Answer a few questions and we'll create the perfect project configuration for your learning goals.
              </p>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Step-by-step questionnaire
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  AI-powered recommendations
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Personalized learning plan
                </div>
              </div>
              <div className="mt-4 sm:mt-6">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base">
                  Start Guided Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Setup Card */}
          <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group cursor-pointer"
                onClick={() => handleModeSelect('custom')}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-slate-900">Custom Setup</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                Take full control over your project configuration. Manually set up all aspects of your learning project exactly how you want it.
              </p>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Full configuration control
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Advanced settings
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Custom learning paths
                </div>
              </div>
              <div className="mt-4 sm:mt-6">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 text-sm sm:text-base">
                  Start Custom Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 sm:mt-10 lg:mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            You can always modify your project settings later in the project dashboard.
          </p>
        </div>
      </div>
    </div>
  );
} 