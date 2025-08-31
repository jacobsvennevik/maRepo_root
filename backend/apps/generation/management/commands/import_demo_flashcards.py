from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.apps.projects.models import Project, ProjectFlashcardSet
from backend.apps.generation.models import FlashcardSet, Flashcard
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Import demo flashcards for testing and QA'

    def add_arguments(self, parser):
        parser.add_argument(
            '--project-id',
            type=str,
            help='Specific project ID to add flashcards to'
        )
        parser.add_argument(
            '--user-email',
            type=str,
            help='User email to create flashcards for'
        )
        parser.add_argument(
            '--num-cards',
            type=int,
            default=20,
            help='Number of demo cards to create'
        )

    def handle(self, *args, **options):
        project_id = options.get('project_id')
        user_email = options.get('user_email')
        num_cards = options.get('num_cards')

        # Get or create user
        if user_email:
            user, created = User.objects.get_or_create(
                email=user_email,
                defaults={'username': user_email.split('@')[0]}
            )
            if created:
                self.stdout.write(f"Created user: {user.email}")
        else:
            # Use first available user or create demo user
            user = User.objects.first()
            if not user:
                user = User.objects.create_user(
                    username='demo_user',
                    email='demo@example.com',
                    password='demo123'
                )
                self.stdout.write("Created demo user: demo@example.com")

        # Get or create project
        if project_id:
            try:
                project = Project.objects.get(id=project_id, owner=user)
            except Project.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Project {project_id} not found for user {user.email}"))
                return
        else:
            # Create demo project if none exists
            project = Project.objects.filter(owner=user).first()
            if not project:
                project = Project.objects.create(
                    name="Demo Biology Project",
                    project_type='school',
                    owner=user,
                    course_name="Biology 101",
                    course_code="BIO101",
                    teacher_name="Dr. Smith"
                )
                self.stdout.write(f"Created demo project: {project.name}")

        # Create flashcard set
        flashcard_set, created = FlashcardSet.objects.get_or_create(
            title="Demo Flashcards",
            owner=user,
            defaults={'title': f"Demo Flashcards - {timezone.now().strftime('%Y-%m-%d')}"}
        )

        if created:
            # Link to project
            ProjectFlashcardSet.objects.create(
                project=project,
                flashcard_set=flashcard_set,
                is_primary=True
            )
            self.stdout.write(f"Created flashcard set: {flashcard_set.title}")

        # Demo flashcards data
        demo_cards = [
            {
                "question": "What is the powerhouse of the cell?",
                "answer": "Mitochondria",
                "learning_state": "new"
            },
            {
                "question": "What is the process by which plants make their own food?",
                "answer": "Photosynthesis",
                "learning_state": "new"
            },
            {
                "question": "What are the four main types of biomolecules?",
                "answer": "Carbohydrates, lipids, proteins, and nucleic acids",
                "learning_state": "new"
            },
            {
                "question": "What is the function of DNA?",
                "answer": "DNA stores and transmits genetic information",
                "learning_state": "new"
            },
            {
                "question": "What is the difference between mitosis and meiosis?",
                "answer": "Mitosis produces two identical daughter cells, while meiosis produces four genetically different cells",
                "learning_state": "new"
            },
            {
                "question": "What is the role of enzymes in biological reactions?",
                "answer": "Enzymes speed up chemical reactions by lowering activation energy",
                "learning_state": "new"
            },
            {
                "question": "What is homeostasis?",
                "answer": "The maintenance of stable internal conditions despite external changes",
                "learning_state": "new"
            },
            {
                "question": "What are the three domains of life?",
                "answer": "Bacteria, Archaea, and Eukarya",
                "learning_state": "new"
            },
            {
                "question": "What is the function of the cell membrane?",
                "answer": "The cell membrane regulates what enters and exits the cell",
                "learning_state": "new"
            },
            {
                "question": "What is the difference between prokaryotic and eukaryotic cells?",
                "answer": "Prokaryotic cells lack a nucleus and membrane-bound organelles, while eukaryotic cells have both",
                "learning_state": "new"
            },
            {
                "question": "What is the role of ribosomes in protein synthesis?",
                "answer": "Ribosomes are the sites where proteins are assembled from amino acids",
                "learning_state": "new"
            },
            {
                "question": "What is the function of the endoplasmic reticulum?",
                "answer": "The ER is involved in protein and lipid synthesis and transport",
                "learning_state": "new"
            },
            {
                "question": "What is the role of the Golgi apparatus?",
                "answer": "The Golgi apparatus packages and distributes proteins and lipids",
                "learning_state": "new"
            },
            {
                "question": "What is the function of lysosomes?",
                "answer": "Lysosomes contain digestive enzymes to break down waste and cellular debris",
                "learning_state": "new"
            },
            {
                "question": "What is the difference between aerobic and anaerobic respiration?",
                "answer": "Aerobic respiration requires oxygen and produces more ATP, while anaerobic respiration does not require oxygen and produces less ATP",
                "learning_state": "new"
            },
            {
                "question": "What is the role of ATP in cellular processes?",
                "answer": "ATP provides energy for cellular processes by releasing energy when its phosphate bonds are broken",
                "learning_state": "new"
            },
            {
                "question": "What is the function of chlorophyll in photosynthesis?",
                "answer": "Chlorophyll absorbs light energy and converts it to chemical energy",
                "learning_state": "new"
            },
            {
                "question": "What is the difference between autotrophs and heterotrophs?",
                "answer": "Autotrophs can produce their own food, while heterotrophs must consume other organisms for food",
                "learning_state": "new"
            },
            {
                "question": "What is the role of the nucleus in the cell?",
                "answer": "The nucleus contains the cell's genetic material and controls cell activities",
                "learning_state": "new"
            },
            {
                "question": "What is the function of the cytoskeleton?",
                "answer": "The cytoskeleton provides structure, support, and enables cell movement",
                "learning_state": "new"
            }
        ]

        # Create flashcards
        cards_created = 0
        for i, card_data in enumerate(demo_cards[:num_cards]):
            # Add some variety to learning states and review dates
            if i < 5:
                learning_state = "learning"
                next_review = timezone.now().date() - timedelta(days=1)  # Overdue
            elif i < 10:
                learning_state = "review"
                next_review = timezone.now().date()  # Due today
            else:
                learning_state = "new"
                next_review = None

            flashcard, created = Flashcard.objects.get_or_create(
                flashcard_set=flashcard_set,
                question=card_data["question"],
                defaults={
                    "answer": card_data["answer"],
                    "learning_state": learning_state,
                    "next_review": next_review,
                    "interval": 1 if learning_state == "learning" else 0,
                    "repetitions": 2 if learning_state == "review" else 0,
                    "ease_factor": 2.5,
                    "total_reviews": 3 if learning_state == "review" else 0,
                    "correct_reviews": 2 if learning_state == "review" else 0,
                }
            )
            
            if created:
                cards_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {cards_created} demo flashcards for project '{project.name}' "
                f"(User: {user.email})"
            )
        )
        
        # Show summary
        total_cards = flashcard_set.flashcards.count()
        due_cards = flashcard_set.flashcards.filter(next_review__lte=timezone.now().date()).count()
        learning_cards = flashcard_set.flashcards.filter(learning_state='learning').count()
        
        self.stdout.write(f"Flashcard Set Summary:")
        self.stdout.write(f"  - Total cards: {total_cards}")
        self.stdout.write(f"  - Due today: {due_cards}")
        self.stdout.write(f"  - Learning: {learning_cards}")
        self.stdout.write(f"  - Project ID: {project.id}")
        self.stdout.write(f"  - Set ID: {flashcard_set.id}") 