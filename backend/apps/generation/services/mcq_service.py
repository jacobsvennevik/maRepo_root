from typing import List, Dict
from backend.apps.generation.models import QuestionSet, Question, Choice
from backend.apps.generation.services.mcq_parser import parse_mcq_text


def save_mcq_to_db(questions_data: List[Dict], question_set: QuestionSet) -> None:
    """
    Save parsed multiple-choice questions to the database.
    
    Args:
        questions_data: List of parsed question dictionaries
        question_set: The QuestionSet instance to associate questions with
    """
    for question_data in questions_data:
        # Create the question
        question = Question.objects.create(
            question_set=question_set,
            question_text=question_data['question_text'],
            explanation=question_data['explanation'],
            question_type=question_data['question_type']
        )
        
        # Create the choices
        for choice_data in question_data['choices']:
            Choice.objects.create(
                question=question,
                choice_text=choice_data['text'],
                is_correct=choice_data['is_correct'],
                choice_letter=choice_data['letter']
            )


def create_question_set_from_text(text: str, title: str, owner, document=None) -> QuestionSet:
    """
    Create a QuestionSet from text and save all questions to the database.
    
    Args:
        text: The text containing questions in the specified format
        title: Title for the question set
        owner: User who owns the question set
        document: Optional document to associate with the question set
        
    Returns:
        The created QuestionSet instance
    """
    # Parse the questions
    questions_data = parse_mcq_text(text)
    
    # Create the question set
    question_set = QuestionSet.objects.create(
        title=title,
        owner=owner,
        document=document
    )
    
    # Save all questions to the database
    save_mcq_to_db(questions_data, question_set)
    
    return question_set


def get_questions_for_quiz(question_set: QuestionSet) -> List[Dict]:
    """
    Get questions from a QuestionSet in a format suitable for quiz display.
    
    Args:
        question_set: The QuestionSet instance
        
    Returns:
        List of question dictionaries with choices
    """
    questions = []
    
    for question in question_set.questions.all():
        choices = []
        for choice in question.choices.all():
            choices.append({
                'letter': choice.choice_letter,
                'text': choice.choice_text,
                'is_correct': choice.is_correct
            })
        
        questions.append({
            'id': question.id,
            'question_text': question.question_text,
            'choices': choices,
            'explanation': question.explanation,
            'question_type': question.question_type
        })
    
    return questions 