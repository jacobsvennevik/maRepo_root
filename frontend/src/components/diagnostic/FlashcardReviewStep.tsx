import * as React from 'react';
import type { UseFormReturn } from 'react-hook-form';

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  tags: string[];
};

export type FlashcardDeckForm = {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
};

type Props = {
  cards: ReviewCard[];
  form: UseFormReturn<FlashcardDeckForm>;
  mockMode?: boolean;
  suggestedTitle?: string;
  suggestedDescription?: string;
};

export default function FlashcardReviewStep(props: Props) {
  const { cards, form, mockMode, suggestedTitle, suggestedDescription } = props;

  // Ensure we always have an array
  const safeCards: ReviewCard[] = Array.isArray(cards) ? cards : [];

  // Initialize form values once if empty (don't fight RHF controlled state)
  React.useEffect(() => {
    const v = form.getValues();
    const needsTitle = !v.title && suggestedTitle;
    const needsDesc = !v.description && suggestedDescription;

    if (needsTitle || needsDesc) {
      form.reset({
        title: needsTitle ? suggestedTitle! : v.title,
        description: needsDesc ? suggestedDescription! : v.description,
        difficulty: (v.difficulty ?? 'medium') as FlashcardDeckForm['difficulty'],
        language: v.language ?? 'en',
      }, { keepDirty: false, keepTouched: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedTitle, suggestedDescription]);

  const [showAll, setShowAll] = React.useState(false);
  const displayed = showAll ? safeCards : safeCards.slice(0, 10);

  // Simple derived stats
  const total = safeCards.length;
  const uniqueTags = React.useMemo(() => {
    const set = new Set<string>();
    safeCards.forEach(c => (c.tags || []).forEach(t => set.add(t)));
    return set.size;
  }, [safeCards]);

  return (
    <div className="space-y-6">
      {/* Mock Mode Banner */}
      {mockMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-sm text-yellow-800">
              Mock mode is ON — these flashcards are examples to preview the flow.
            </span>
          </div>
        </div>
      )}

      {/* Deck Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Deck Title</label>
          <input
            className="w-full border rounded-lg p-2"
            {...form.register('title')}
            placeholder="e.g., Key Concepts from Uploaded Materials"
          />
        </div>

        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm font-medium">Difficulty</label>
          <select className="w-full border rounded-lg p-2" {...form.register('difficulty')}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full border rounded-lg p-2"
            rows={3}
            {...form.register('description')}
            placeholder="Short summary of what this deck covers…"
          />
        </div>
      </section>

      {/* Summary Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-2xl p-4 text-center">
          <div className="text-sm opacity-70">Total Cards</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="border rounded-2xl p-4 text-center">
          <div className="text-sm opacity-70">Previewed</div>
          <div className="text-2xl font-semibold">{displayed.length}</div>
        </div>
        <div className="border rounded-2xl p-4 text-center">
          <div className="text-sm opacity-70">Unique Tags</div>
          <div className="text-2xl font-semibold">{uniqueTags}</div>
        </div>
        <div className="border rounded-2xl p-4 text-center">
          <div className="text-sm opacity-70">Language</div>
          <div className="text-2xl font-semibold">{form.watch('language') || 'en'}</div>
        </div>
      </section>

      {/* Cards Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Preview</h3>
          {total > 10 && (
            <button
              type="button"
              onClick={() => setShowAll(s => !s)}
              className="text-sm underline"
            >
              {showAll ? 'Show first 10' : `Show all (${total})`}
            </button>
          )}
        </div>
        <ul className="divide-y rounded-lg border">
          {displayed.map((c) => (
            <li key={c.id} className="p-3">
              <div className="font-medium">{c.front}</div>
              <div className="text-sm opacity-80">{c.back}</div>
              {Array.isArray(c.tags) && c.tags.length > 0 && (
                <div className="mt-1 text-xs opacity-60">{c.tags.join(' • ')}</div>
              )}
            </li>
          ))}
          {displayed.length === 0 && (
            <li className="p-3 text-sm opacity-70">No cards to preview yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
