'use client';

import { Button } from "@/components/ui/button";
import { Droplets, Navigation, Sparkles, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

interface OceanHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Header component for the overview page with ocean-themed styling.
 * @param {object} props
 * @param {string} [props.title] - The main title text
 * @param {string} [props.subtitle] - The subtitle text
 */
export function OceanHeader({ 
  title = "Learning Voyage", 
  subtitle = "Navigate through your educational journey" 
}: OceanHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        </div>
        <p className="text-slate-600">{subtitle}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
          <Navigation className="h-4 w-4" />
          Set Course
        </Button>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 shadow-lg">
          <Sparkles className="h-4 w-4" />
          Start Voyage
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

OceanHeader.propTypes = {
  title: PropTypes.string,
} 