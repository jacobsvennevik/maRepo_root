"""
Management command to backfill FlashcardProfile records for existing flashcards.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.apps.generation.models import Flashcard, FlashcardProfile, Topic, Principle


class Command(BaseCommand):
    help = 'Backfill FlashcardProfile records for existing flashcards'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating records',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of flashcards to process in each batch',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        batch_size = options['batch_size']

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting flashcard profile backfill (dry_run={dry_run}, batch_size={batch_size})"
            )
        )

        # Get all flashcards without profiles
        flashcards_without_profiles = Flashcard.objects.filter(
            flashcardprofile__isnull=True
        ).select_related('flashcard_set')

        total_flashcards = flashcards_without_profiles.count()
        self.stdout.write(f"Found {total_flashcards} flashcards without profiles")

        if total_flashcards == 0:
            self.stdout.write(self.style.SUCCESS("No flashcards need profiles. All done!"))
            return

        # Create default topics and principles if they don't exist
        default_topic, _ = Topic.objects.get_or_create(
            name="General",
            defaults={'name': "General"}
        )

        default_principle, _ = Principle.objects.get_or_create(
            name="Basic Recall",
            topic=default_topic,
            defaults={'name': "Basic Recall", 'topic': default_topic}
        )

        profiles_created = 0
        profiles_skipped = 0

        # Process in batches
        for i in range(0, total_flashcards, batch_size):
            batch = flashcards_without_profiles[i:i + batch_size]
            
            if dry_run:
                self.stdout.write(f"Would process batch {i//batch_size + 1}: {len(batch)} flashcards")
                continue

            with transaction.atomic():
                for flashcard in batch:
                    try:
                        # Try to infer topic from flashcard set title
                        inferred_topic = self._infer_topic_from_title(flashcard.flashcard_set.title)
                        topic, _ = Topic.objects.get_or_create(
                            name=inferred_topic,
                            defaults={'name': inferred_topic}
                        )

                        # Try to infer principle from question content
                        inferred_principle = self._infer_principle_from_content(flashcard.question)
                        principle, _ = Principle.objects.get_or_create(
                            name=inferred_principle,
                            topic=topic,
                            defaults={'name': inferred_principle, 'topic': topic}
                        )

                        # Create profile
                        profile = FlashcardProfile.objects.create(
                            flashcard=flashcard,
                            topic=topic,
                            principle=principle,
                            difficulty_est=1.0,  # Default difficulty
                            surface_features={
                                'inferred': True,
                                'source': 'backfill_command',
                                'flashcard_set_title': flashcard.flashcard_set.title,
                            }
                        )
                        profiles_created += 1

                    except Exception as e:
                        self.stdout.write(
                            self.style.WARNING(
                                f"Failed to create profile for flashcard {flashcard.id}: {e}"
                            )
                        )
                        profiles_skipped += 1

            self.stdout.write(f"Processed batch {i//batch_size + 1}")

        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f"DRY RUN: Would create {total_flashcards} profiles"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created {profiles_created} profiles, skipped {profiles_skipped}"
                )
            )

    def _infer_topic_from_title(self, title):
        """Infer topic from flashcard set title."""
        if not title or title == "Untitled Flashcard Set":
            return "General"
        
        # Simple heuristics for topic inference
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['math', 'calculus', 'algebra']):
            return "Mathematics"
        elif any(word in title_lower for word in ['science', 'physics', 'chemistry', 'biology']):
            return "Science"
        elif any(word in title_lower for word in ['history', 'politics', 'geography']):
            return "History & Social Sciences"
        elif any(word in title_lower for word in ['language', 'english', 'spanish', 'french']):
            return "Languages"
        elif any(word in title_lower for word in ['programming', 'coding', 'computer']):
            return "Computer Science"
        else:
            return "General"

    def _infer_principle_from_content(self, question):
        """Infer principle from question content."""
        if not question:
            return "Basic Recall"
        
        question_lower = question.lower()
        
        # Simple heuristics for principle inference
        if any(word in question_lower for word in ['define', 'what is', 'meaning']):
            return "Definition"
        elif any(word in question_lower for word in ['compare', 'difference', 'similar']):
            return "Comparison"
        elif any(word in question_lower for word in ['explain', 'how', 'why']):
            return "Explanation"
        elif any(word in question_lower for word in ['calculate', 'solve', 'compute']):
            return "Computation"
        elif any(word in question_lower for word in ['example', 'instance']):
            return "Examples"
        else:
            return "Basic Recall"
