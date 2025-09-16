"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, HelpCircle, X } from 'lucide-react';
import type { Flashcard } from '../types';

interface CarouselCardProps {
  card: Flashcard;
  isActive: boolean;
  isLeft: boolean;
  isRight: boolean;
  onFlip: () => void;
  onEdit: () => void;
  onDiscard: () => void;
  onShowHint: () => void;
  showHint: boolean;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  card,
  isActive,
  isLeft,
  isRight,
  onFlip,
  onEdit,
  onDiscard,
  onShowHint,
  showHint
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);

  useEffect(() => {
    if (!isActive && isFlipped) {
      setIsFlipped(false);
    }
  }, [isActive, isFlipped]);

  const handleFlip = () => {
    if (!isActive) return;
    setIsFlipped(!isFlipped);
    onFlip();
  };

  const handleShowHint = () => {
    setShowCardHint(!showCardHint);
    onShowHint();
  };

  const getCardClasses = () => {
    if (isActive) {
      return 'scale-105 opacity-100 z-30';
    } else if (isLeft) {
      return 'scale-95 opacity-65 -translate-x-6 blur-[1px] z-10';
    } else if (isRight) {
      return 'scale-95 opacity-65 translate-x-6 blur-[1px] z-10';
    }
    return 'scale-75 opacity-30 blur-[2px] z-0';
  };

  return (
    <div className={`flex-shrink-0 basis-[92%] md:basis-3/4 lg:basis-3/5 xl:basis-[55%] max-w-[980px] snap-center transition-all duration-500 ease-in-out motion-reduce:duration-0 ${getCardClasses()}`}>
      <div className="perspective-1000">
        <div
          className={`relative w-full h-60 md:h-72 transform-style-preserve-3d transition-transform duration-700 ease-in-out motion-reduce:duration-0 ${
            isFlipped ? 'rotate-y-180' : ''
          } flip-animate ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={handleFlip}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden">
            <Card className={`h-full w-full bg-white border border-blue-100 transition-all duration-300 ${isActive ? 'shadow-xl' : 'shadow-sm'} rounded-xl`}>
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-end items-start gap-1 mb-2.5">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit card">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); onDiscard(); }} title="Discard card">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100" onClick={(e) => { e.stopPropagation(); handleShowHint(); }} title="Show hint">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center h-full p-2 text-center">
                  <Badge variant="secondary" className="w-fit mb-2 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wide text-[9px] font-semibold">Question</Badge>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2.5 leading-relaxed text-center text-balance max-w-full">{card.question}</h3>
                  <p className="text-xs md:text-sm text-gray-500 text-center">Click to reveal answer</p>
                </div>

                {showCardHint && card.hints && card.hints.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg w-full">
                    <p className="text-xs md:text-sm text-blue-800">💡 {card.hints[0]}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className={`h-full w-full bg-white border border-green-100 ${isActive ? 'shadow-xl' : 'shadow-sm'} rounded-xl`}>
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 uppercase tracking-wide text-[9px] font-semibold">Answer</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit card">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100 transition-colors duration-200" onClick={(e) => { e.stopPropagation(); onDiscard(); }} title="Discard card">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm md:text-base text-gray-900 leading-relaxed">{card.answer}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;


