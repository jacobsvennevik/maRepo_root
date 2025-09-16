"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Edit, HelpCircle, Grid, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useFlashcardCarousel } from '../hooks/useFlashcards';
import CarouselCard from './CarouselCard';
import type { Flashcard, FlashcardSet } from '../types';
import { centerScrollToChild } from '../utils/centerScroll';

interface FlashcardCarouselProps {
  flashcardSet: FlashcardSet;
  projectId?: string;
  onBack: () => void;
  onEditCard?: (card: Flashcard) => void;
  onDiscardCard?: (card: Flashcard) => void;
  onAddCard?: () => void;
  onViewAll?: () => void;
}

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

const CarouselCard: React.FC<CarouselCardProps> = ({
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

  // Ensure only the centered card can stay flipped; reset when it leaves center
  useEffect(() => {
    if (!isActive && isFlipped) {
      setIsFlipped(false);
    }
  }, [isActive, isFlipped]);

  const handleFlip = () => {
    if (!isActive) return; // Only flip the centered card
    setIsFlipped(!isFlipped);
    onFlip();
  };

  const handleShowHint = () => {
    setShowCardHint(!showCardHint);
    onShowHint();
  };

  const getCardClasses = () => {
    // Centered card prominent; neighbors slightly wider (leaving/entering feel)
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
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden">
            <Card className={`h-full w-full bg-white border border-blue-100 transition-all duration-300 ${isActive ? 'shadow-xl' : 'shadow-sm'} rounded-xl`}>
              <CardContent className="p-5 h-full flex flex-col">
                {/* Top actions aligned right */}
                <div className="flex justify-end items-start gap-1 mb-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    title="Edit card"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiscard();
                    }}
                    title="Discard card"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowHint();
                    }}
                    title="Show hint"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content: centered group (vertically and horizontally) */}
                <div className="flex-1 flex flex-col items-center justify-center h-full p-2 text-center">
                  <Badge variant="secondary" className="w-fit mb-2 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wide text-[9px] font-semibold">
                    Question
                  </Badge>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2.5 leading-relaxed text-center text-balance max-w-full">
                    {card.question}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 text-center">
                    Click to reveal answer
                  </p>
                </div>

                {showCardHint && card.hints && card.hints.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg w-full">
                    <p className="text-xs md:text-sm text-blue-800">
                      💡 {card.hints[0]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className={`h-full w-full bg-white border border-green-100 ${isActive ? 'shadow-xl' : 'shadow-sm'} rounded-xl`}>
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 uppercase tracking-wide text-[9px] font-semibold">
                    Answer
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      title="Edit card"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDiscard();
                      }}
                      title="Discard card"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-sm md:text-base text-gray-900 leading-relaxed">
                    {card.answer}
                  </p>
                </div>

                {card.notes && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-xs md:text-sm text-green-800">
                      📝 {card.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FlashcardCarousel: React.FC<FlashcardCarouselProps> = ({
  flashcardSet,
  projectId,
  onBack,
  onEditCard,
  onDiscardCard,
  onAddCard,
  onViewAll
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newHint, setNewHint] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { flashcards, isLoading, error, nextCard, prevCard, goToCard, flipCard } = useFlashcardCarousel(
    flashcardSet.id, 
    projectId, 
    flashcardSet.flashcards
  );

  const scrollToCard = useCallback((index: number) => {
    const container = carouselRef.current;
    if (container) {
      const cardElement = container.children[index] as HTMLElement;
      if (cardElement) {
        centerScrollToChild(container, cardElement, 'smooth');
      }
    }
    setCurrentIndex(index);
  }, []);

  // Ensure initial centering and on resize
  useEffect(() => {
    scrollToCard(currentIndex);
    const handleResize = () => scrollToCard(currentIndex);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToCard, currentIndex]);

  const handleNext = () => {
    const flashcardsLength = Array.isArray(flashcards) ? flashcards.length : 0;
    if (currentIndex < flashcardsLength - 1) {
      const nextIndex = currentIndex + 1;
      scrollToCard(nextIndex);
      nextCard();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollToCard(prevIndex);
      prevCard();
    }
  };

  const handleCardClick = (index: number) => {
    scrollToCard(index);
    goToCard(index);
  };

  const handleFlip = () => {
    flipCard();
  };

  const handleEdit = (card: Flashcard) => {
    if (onEditCard) {
      onEditCard(card);
    }
  };

  const handleDiscard = (card: Flashcard) => {
    if (onDiscardCard) {
      onDiscardCard(card);
    }
  };

  const handleShowHint = () => {
    setShowHint(!showHint);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrev();
          break;
        case 'Enter':
        case 'f':
          event.preventDefault();
          handleFlip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, Array.isArray(flashcards) ? flashcards.length : 0]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading flashcards: {error}</p>
      </div>
    );
  }

  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No flashcards in this set yet.</p>
        <Button onClick={onAddCard} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Add First Card
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-white/50 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Decks
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {flashcardSet.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{flashcardSet.title}</h1>
            <p className="text-gray-600">{flashcardSet.description || 'Learn and review your flashcards'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500">
          <span className="w-5 h-5">📚</span>
          <span>{Array.isArray(flashcards) ? flashcards.length : 0} flashcards</span>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="lg"
            aria-label="Previous card"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white hover:scale-110 transition-all duration-200 motion-reduce:transition-none shadow-lg"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            aria-label="Next card"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white hover:scale-110 transition-all duration-200 motion-reduce:transition-none shadow-lg"
            onClick={handleNext}
            disabled={currentIndex === (Array.isArray(flashcards) ? flashcards.length : 0) - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory gap-8 px-10 md:px-16 lg:px-24 py-6 items-stretch"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {Array.isArray(flashcards) && flashcards.map((card, index) => (
              <CarouselCard
                key={card.id}
                card={card}
                isActive={index === currentIndex}
                isLeft={index === currentIndex - 1}
                isRight={index === currentIndex + 1}
                onFlip={handleFlip}
                onEdit={() => handleEdit(card)}
                onDiscard={() => handleDiscard(card)}
                onShowHint={handleShowHint}
                showHint={showHint}
              />
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="flex gap-2">
            {flashcards.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-blue-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowViewAllModal(true)}
            className="hover:scale-105 transition-transform duration-200 motion-reduce:transition-none text-gray-700 border-gray-300"
          >
            <Grid className="h-5 w-5 mr-2" />
            View All
          </Button>
          
          {/* Teal circular add button */}
          <button
            aria-label="Add card"
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* View All Modal */}
      <Dialog open={showViewAllModal} onOpenChange={setShowViewAllModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5" />
              All Flashcards in {flashcardSet.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {flashcards.map((card, index) => (
              <Card
                key={card.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-4 relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(card)} className="h-7 w-7 p-0">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDiscard(card)} className="h-7 w-7 p-0">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 pr-12">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                      {card.question}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {card.answer}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Card Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add a new flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formError && (
              <div className="text-sm text-red-600">{formError}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <Textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Enter the question" rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <Textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Enter the answer" rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hint (optional)</label>
              <Input value={newHint} onChange={(e) => setNewHint(e.target.value)} placeholder="Add a hint" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newQuestion.trim() || !newAnswer.trim()) {
                  setFormError('Please provide both a question and an answer.');
                  return;
                }
                setFormError(null);
                setShowAddModal(false);
                setNewQuestion('');
                setNewAnswer('');
                setNewHint('');
                // Delegate creation to parent if provided
                if (onAddCard) onAddCard();
              }} className="bg-teal-600 hover:bg-teal-700">
                Save Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
