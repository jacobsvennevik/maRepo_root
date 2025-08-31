'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock } from 'lucide-react';

interface FeaturedMindMapProps {
  mindMap: {
    title: string;
    subject: string;
    nodeCount: number;
    lastEdited: string;
  };
  getSubjectIcon: (subject: string) => string;
  onClick?: () => void;
}

/**
 * Card component for displaying the featured (most recent) mind map.
 * @param {object} props
 * @param {object} props.mindMap - Mind map data object
 * @param {function} props.getSubjectIcon - Returns subject icon string
 * @param {function} [props.onClick] - Handler for clicking the card
 */
export function FeaturedMindMap({ mindMap, getSubjectIcon, onClick }: FeaturedMindMapProps) {
  return (
    <Card 
      className="lg:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50/80 backdrop-blur-sm border-indigo-200/50 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20"></div>
          
          {/* Placeholder Mind Map Image */}
          <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
            {/* Mind Map Visualization Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Central Node */}
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">🧬</span>
                </div>
                
                {/* Branch Nodes */}
                <div className="absolute -top-8 -left-8 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs">📊</span>
                </div>
                <div className="absolute -top-8 -right-8 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs">⚛️</span>
                </div>
                <div className="absolute -bottom-8 -left-8 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs">🧪</span>
                </div>
                <div className="absolute -bottom-8 -right-8 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs">📜</span>
                </div>
                
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{zIndex: -1}}>
                  <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#8b5cf6" strokeWidth="2" opacity="0.6"/>
                  <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#8b5cf6" strokeWidth="2" opacity="0.6"/>
                  <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#8b5cf6" strokeWidth="2" opacity="0.6"/>
                  <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#8b5cf6" strokeWidth="2" opacity="0.6"/>
                </svg>
              </div>
            </div>
            
            {/* Animated Pulse Effect */}
            <div className="absolute top-4 right-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <span className="text-2xl">{getSubjectIcon(mindMap.subject)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Featured Mind Map</h2>
                  <p className="text-sm opacity-90">Your most recent creation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>{mindMap.nodeCount} nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Updated {mindMap.lastEdited}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
