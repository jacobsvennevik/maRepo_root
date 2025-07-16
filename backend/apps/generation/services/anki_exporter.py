import genanki
import tempfile
import os
from typing import List, Optional
from django.http import HttpResponse
from backend.apps.generation.models import FlashcardSet, Flashcard


class AnkiExportService:
    """
    Service for exporting flashcard sets to Anki deck format (.apkg files).
    """
    
    # Default model IDs (should be unique per template)
    DEFAULT_MODEL_ID = 1607392319
    DEFAULT_DECK_ID_BASE = 2059400110
    
    def __init__(self):
        """Initialize the Anki export service."""
        self.model = self._create_basic_model()
    
    def _create_basic_model(self) -> genanki.Model:
        """
        Create a basic Anki note model for simple front/back flashcards.
        """
        return genanki.Model(
            model_id=self.DEFAULT_MODEL_ID,
            name='Ocean Learn Basic Model',
            fields=[
                {'name': 'Question'},
                {'name': 'Answer'},
                {'name': 'Source'},  # Optional field for document source
            ],
            templates=[
                {
                    'name': 'Basic Card',
                    'qfmt': '''
                        <div class="question">
                            {{Question}}
                        </div>
                        {{#Source}}
                        <div class="source">
                            <small>Source: {{Source}}</small>
                        </div>
                        {{/Source}}
                    ''',
                    'afmt': '''
                        <div class="question">
                            {{Question}}
                        </div>
                        <hr id="answer">
                        <div class="answer">
                            {{Answer}}
                        </div>
                        {{#Source}}
                        <div class="source">
                            <small>Source: {{Source}}</small>
                        </div>
                        {{/Source}}
                    ''',
                },
            ],
            css='''
                .card {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .question {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: #2c3e50;
                }
                .answer {
                    font-size: 16px;
                    margin-top: 15px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-left: 4px solid #007bff;
                    border-radius: 4px;
                }
                .source {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                    color: #6c757d;
                    font-style: italic;
                }
                hr {
                    border: none;
                    height: 1px;
                    background-color: #ddd;
                    margin: 20px 0;
                }
            '''
        )
    
    def _create_cloze_model(self) -> genanki.Model:
        """
        Create a cloze deletion model for fill-in-the-blank style cards.
        """
        return genanki.Model(
            model_id=self.DEFAULT_MODEL_ID + 1,
            name='Ocean Learn Cloze Model',
            fields=[
                {'name': 'Text'},
                {'name': 'Source'},
            ],
            templates=[
                {
                    'name': 'Cloze',
                    'qfmt': '''
                        <div class="cloze-question">
                            {{cloze:Text}}
                        </div>
                        {{#Source}}
                        <div class="source">
                            <small>Source: {{Source}}</small>
                        </div>
                        {{/Source}}
                    ''',
                    'afmt': '''
                        <div class="cloze-answer">
                            {{cloze:Text}}
                        </div>
                        {{#Source}}
                        <div class="source">
                            <small>Source: {{Source}}</small>
                        </div>
                        {{/Source}}
                    ''',
                },
            ],
            model_type=genanki.Model.CLOZE,
            css='''
                .card {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .cloze-question, .cloze-answer {
                    font-size: 18px;
                    margin-bottom: 15px;
                }
                .cloze {
                    background-color: #007bff;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                }
                .source {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                    color: #6c757d;
                    font-style: italic;
                }
            '''
        )
    
    def export_flashcard_set(self, flashcard_set: FlashcardSet, 
                           include_source: bool = True,
                           card_type: str = 'basic') -> bytes:
        """
        Export a flashcard set to Anki format (.apkg file).
        
        Args:
            flashcard_set: The FlashcardSet to export
            include_source: Whether to include source document information
            card_type: Type of cards to create ('basic' or 'cloze')
            
        Returns:
            bytes: The .apkg file content
        """
        # Create deck with unique ID
        deck_id = self.DEFAULT_DECK_ID_BASE + flashcard_set.id
        deck = genanki.Deck(
            deck_id=deck_id,
            name=f"{flashcard_set.title}"
        )
        
        # Choose model based on card type
        model = self.model if card_type == 'basic' else self._create_cloze_model()
        
        # Get source information
        source_info = ""
        if include_source and flashcard_set.document:
            source_info = flashcard_set.document.title or "Unknown Document"
        
        # Add flashcards to deck
        for flashcard in flashcard_set.flashcards.all():
            if card_type == 'basic':
                note = genanki.Note(
                    model=model,
                    fields=[
                        flashcard.question,
                        flashcard.answer,
                        source_info
                    ]
                )
            else:  # cloze type
                # Convert Q&A to cloze format
                cloze_text = f"{flashcard.question} {{{{c1::{flashcard.answer}}}}}"
                note = genanki.Note(
                    model=model,
                    fields=[
                        cloze_text,
                        source_info
                    ]
                )
            
            deck.add_note(note)
        
        # Generate package
        package = genanki.Package(deck)
        
        # Create temporary file to get the .apkg content
        with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as temp_file:
            package.write_to_file(temp_file.name)
            temp_file.seek(0)
            
            # Read the file content
            with open(temp_file.name, 'rb') as f:
                apkg_content = f.read()
            
            # Clean up
            os.unlink(temp_file.name)
            
            return apkg_content
    
    def export_multiple_sets(self, flashcard_sets: List[FlashcardSet],
                           deck_name: str = "Ocean Learn Combined Deck",
                           include_source: bool = True) -> bytes:
        """
        Export multiple flashcard sets to a single Anki deck.
        
        Args:
            flashcard_sets: List of FlashcardSet objects to export
            deck_name: Name for the combined deck
            include_source: Whether to include source information
            
        Returns:
            bytes: The .apkg file content
        """
        if not flashcard_sets:
            raise ValueError("No flashcard sets provided for export")
        
        # Create deck with unique ID based on first set
        deck_id = self.DEFAULT_DECK_ID_BASE + flashcard_sets[0].id + 1000
        deck = genanki.Deck(
            deck_id=deck_id,
            name=deck_name
        )
        
        # Add all flashcards from all sets
        for flashcard_set in flashcard_sets:
            source_info = ""
            if include_source and flashcard_set.document:
                source_info = f"{flashcard_set.document.title} ({flashcard_set.title})"
            elif include_source:
                source_info = flashcard_set.title
            
            for flashcard in flashcard_set.flashcards.all():
                note = genanki.Note(
                    model=self.model,
                    fields=[
                        flashcard.question,
                        flashcard.answer,
                        source_info
                    ]
                )
                deck.add_note(note)
        
        # Generate package
        package = genanki.Package(deck)
        
        # Create temporary file to get the .apkg content
        with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as temp_file:
            package.write_to_file(temp_file.name)
            
            with open(temp_file.name, 'rb') as f:
                apkg_content = f.read()
            
            os.unlink(temp_file.name)
            return apkg_content
    
    def create_http_response(self, apkg_content: bytes, 
                           filename: str = "flashcards.apkg") -> HttpResponse:
        """
        Create an HTTP response for downloading the .apkg file.
        
        Args:
            apkg_content: The .apkg file content
            filename: Name for the downloaded file
            
        Returns:
            HttpResponse: Response for file download
        """
        response = HttpResponse(
            apkg_content,
            content_type='application/apkg'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(apkg_content)
        
        return response
    
    def export_user_flashcards(self, user, include_source: bool = True) -> bytes:
        """
        Export all flashcard sets for a specific user.
        
        Args:
            user: The user whose flashcards to export
            include_source: Whether to include source information
            
        Returns:
            bytes: The .apkg file content
        """
        flashcard_sets = FlashcardSet.objects.filter(owner=user).prefetch_related('flashcards')
        
        if not flashcard_sets.exists():
            raise ValueError("No flashcard sets found for this user")
        
        return self.export_multiple_sets(
            list(flashcard_sets),
            deck_name=f"{user.username}'s Ocean Learn Flashcards",
            include_source=include_source
        ) 