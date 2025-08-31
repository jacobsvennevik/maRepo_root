"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface NewMindMapCardProps {
  onClick?: () => void;
}

/**
 * Card component for creating a new mind map.
 * @param {object} props
 * @param {function} [props.onClick] - Handler for clicking the card
 */
export function NewMindMapCard({ onClick }: NewMindMapCardProps) {
  return (
    <Card
      className="bg-gradient-to-r from-emerald-50 to-blue-50/80 backdrop-blur-sm border-emerald-200/50 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative h-64">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-blue-100/20"></div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Create New Mind Map
                </h2>
                <p className="text-slate-600 mb-6">
                  Start organizing your thoughts and ideas
                </p>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-6 right-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
          </div>
          <div className="absolute bottom-6 left-6">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
          <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
