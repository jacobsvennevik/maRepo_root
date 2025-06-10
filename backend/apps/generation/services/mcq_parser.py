import re
import random
from typing import List, Dict, Tuple


class MCQParser:
    """
    Flexible parser for multiple-choice questions in various formats.
    """
    
    def __init__(self):
        # More flexible patterns for different question formats
        self.question_patterns = [
            r'<question>\s*(.*?)(?=<explanation>|<question>|$)',
            r'<q>\s*(.*?)(?=<e>|<q>|$)',
            r'Question:\s*(.*?)(?=Answer:|Explanation:|$)',
            r'Q[0-9]*\.?\s*(.*?)(?=A[0-9]*\.|Answer:|Explanation:|$)',
            r'^\d+\.\s*(.*?)(?=A[0-9]*\.|Answer:|Explanation:|$)',
        ]
        self.explanation_patterns = [
            r'<explanation>\s*(.*?)(?=<question>|$)',
            r'<e>\s*(.*?)(?=<q>|$)',
            r'Explanation:\s*(.*?)(?=<question>|$)',
            r'Answer:\s*(.*?)(?=<question>|$)',
        ]
        self.choice_patterns = [
            r'^([A-D])\.\s*(.*?)$',
            r'^([A-D])\s*\)\s*(.*?)$',
            r'^([A-D])\s*\)\s*(.*?)$',
            r'^([A-D])\s*-\s*(.*?)$',
            r'^([A-D])\s*:\s*(.*?)$',
        ]
    
    def parse_questions(self, text: str) -> List[Dict]:
        """
        Parse the text and extract multiple-choice questions.
        
        Args:
            text: The input text containing questions in various formats
            
        Returns:
            List of dictionaries containing parsed questions
        """
        questions = []
        
        # Try different parsing strategies
        parsed_questions = []
        
        # Strategy 1: Split by question markers
        for pattern in self.question_patterns:
            sections = re.split(r'(?=<question>|<q>|Question:|Q[0-9]*\.?|^\d+\.)', text, flags=re.MULTILINE)
            if len(sections) > 1:
                parsed_questions.extend(self._parse_sections(sections))
                break
        
        # Strategy 2: If no questions found, try to find questions by looking for choice patterns
        if not parsed_questions:
            parsed_questions = self._parse_by_choices(text)
        
        # Clean and validate questions
        for question_data in parsed_questions:
            if self._validate_question(question_data):
                questions.append(question_data)
        
        return questions
    
    def _parse_sections(self, sections: List[str]) -> List[Dict]:
        """
        Parse sections into questions.
        
        Args:
            sections: List of text sections
            
        Returns:
            List of question dictionaries
        """
        questions = []
        
        for section in sections:
            if not section.strip():
                continue
            
            # Extract question text using multiple patterns
            question_text = None
            for pattern in self.question_patterns:
                match = re.search(pattern, section, re.DOTALL | re.IGNORECASE)
                if match:
                    question_text = match.group(1).strip()
                    break
            
            if not question_text:
                continue
            
            # Extract explanation using multiple patterns
            explanation = ""
            for pattern in self.explanation_patterns:
                match = re.search(pattern, section, re.DOTALL | re.IGNORECASE)
                if match:
                    explanation = match.group(1).strip()
                    break
            
            # Parse choices from question text
            choices = self._parse_choices(question_text)
            
            if choices:
                # Determine correct answer from explanation
                correct_letter = self._extract_correct_answer(explanation)
                
                # Store the original correct answer before randomization
                original_correct_letter = correct_letter
                
                # Determine question type based on content
                question_type = self._determine_question_type(question_text, explanation)
                
                questions.append({
                    'question_text': question_text,
                    'choices': choices,
                    'explanation': explanation,
                    'question_type': question_type,
                    'correct_answer': correct_letter,
                    'original_correct_letter': original_correct_letter
                })
        
        return questions
    
    def _parse_by_choices(self, text: str) -> List[Dict]:
        """
        Parse questions by looking for choice patterns when no clear question markers are found.
        
        Args:
            text: The input text
            
        Returns:
            List of question dictionaries
        """
        questions = []
        
        # Split text into potential question blocks
        # Look for patterns that indicate question boundaries
        blocks = re.split(r'\n\s*\n', text)
        
        for block in blocks:
            if not block.strip():
                continue
            
            # Look for choice patterns in the block
            choices = self._parse_choices(block)
            
            if len(choices) >= 2:  # At least 2 choices to be a valid MCQ
                # Extract question text (everything before the first choice)
                lines = block.split('\n')
                question_lines = []
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Check if this line contains a choice
                    is_choice = False
                    for pattern in self.choice_patterns:
                        if re.match(pattern, line, re.IGNORECASE):
                            is_choice = True
                            break
                    
                    if is_choice:
                        break
                    
                    question_lines.append(line)
                
                question_text = '\n'.join(question_lines).strip()
                
                if question_text:
                    # Try to find explanation in the same block or next block
                    explanation = self._find_explanation(block, text)
                    
                    # Determine correct answer
                    correct_letter = self._extract_correct_answer(explanation)
                    original_correct_letter = correct_letter
                    
                    # Determine question type
                    question_type = self._determine_question_type(question_text, explanation)
                    
                    questions.append({
                        'question_text': question_text,
                        'choices': choices,
                        'explanation': explanation,
                        'question_type': question_type,
                        'correct_answer': correct_letter,
                        'original_correct_letter': original_correct_letter
                    })
        
        return questions
    
    def _parse_choices(self, question_text: str) -> List[Dict]:
        """
        Parse choices from the question text using multiple patterns.
        
        Args:
            question_text: The full question text including choices
            
        Returns:
            List of choice dictionaries
        """
        choices = []
        lines = question_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try multiple choice patterns
            for pattern in self.choice_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    letter = match.group(1).upper()
                    choice_text = match.group(2).strip()
                    
                    # Validate that it's a valid choice letter
                    if letter in ['A', 'B', 'C', 'D']:
                        choices.append({
                            'letter': letter,
                            'text': choice_text,
                            'is_correct': False,  # Will be set later
                            'original_letter': letter  # Keep track of original letter
                        })
                    break
        
        return choices
    
    def _find_explanation(self, block: str, full_text: str) -> str:
        """
        Find explanation text for a question.
        
        Args:
            block: The current question block
            full_text: The full text content
            
        Returns:
            Explanation text
        """
        # Look for explanation patterns in the block
        for pattern in self.explanation_patterns:
            match = re.search(pattern, block, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # If not found in block, look for explanation after the block
        block_end = full_text.find(block) + len(block)
        remaining_text = full_text[block_end:]
        
        # Look for explanation in the remaining text
        for pattern in self.explanation_patterns:
            match = re.search(pattern, remaining_text, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return ""
    
    def _extract_correct_answer(self, explanation: str) -> str:
        """
        Extract the correct answer letter from the explanation using multiple patterns.
        
        Args:
            explanation: The explanation text
            
        Returns:
            The correct answer letter (A, B, C, or D)
        """
        # Look for various patterns indicating correct answers
        patterns = [
            r'Correct:\s*([A-D])',
            r'\*\*Correct:\s*([A-D])\*\*',
            r'Answer:\s*([A-D])',
            r'\*\*Answer:\s*([A-D])\*\*',
            r'([A-D])\.\s*.*?correct',
            r'([A-D])\.\s*.*?Correct',
            r'The answer is\s*([A-D])',
            r'Answer is\s*([A-D])',
            r'([A-D])\s*is correct',
            r'([A-D])\s*is the correct',
            r'([A-D])\s*is right',
            r'([A-D])\s*is the right',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, explanation, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        
        # If no pattern found, return None
        return None
    
    def _determine_question_type(self, question_text: str, explanation: str) -> str:
        """
        Determine the type of question based on content.
        
        Args:
            question_text: The question text
            explanation: The explanation text
            
        Returns:
            Question type string
        """
        text_lower = (question_text + " " + explanation).lower()
        
        if any(word in text_lower for word in ['policy', 'practice', 'application', 'real-world', 'policymaker', 'tech company', 'uses', 'creates', 'implements']):
            return 'application'
        elif any(word in text_lower for word in ['why', 'cause', 'effect', 'account', 'explain', 'tend to', 'accounts for', 'what accounts for']):
            return 'cause_effect'
        elif any(word in text_lower for word in ['method', 'procedure', 'justify', 'why do researchers', 'exposure condition', 'unlikely to be fully explained', 'researchers use']):
            return 'methods'
        else:
            return 'memory'
    
    def _validate_question(self, question_data: Dict) -> bool:
        """
        Validate that a question has all required components.
        
        Args:
            question_data: The question dictionary
            
        Returns:
            True if valid, False otherwise
        """
        # Check if question has text
        if not question_data.get('question_text', '').strip():
            return False
        
        # Check if question has at least 2 choices
        choices = question_data.get('choices', [])
        if len(choices) < 2:
            return False
        
        # Check if all choices have valid letters
        valid_letters = {'A', 'B', 'C', 'D'}
        choice_letters = {choice['letter'] for choice in choices}
        
        if not choice_letters.issubset(valid_letters):
            return False
        
        return True
    
    def randomize_choices(self, choices: List[Dict]) -> List[Dict]:
        """
        Randomize the order of choices while preserving correctness.
        
        Args:
            choices: List of choice dictionaries
            
        Returns:
            Randomized list of choices with updated letters
        """
        # Create a copy to avoid modifying the original
        randomized_choices = choices.copy()
        
        # Shuffle the choices
        random.shuffle(randomized_choices)
        
        # Update the letters to maintain A, B, C, D order
        letters = ['A', 'B', 'C', 'D']
        for i, choice in enumerate(randomized_choices):
            choice['letter'] = letters[i]
        
        return randomized_choices


def parse_mcq_text(text: str) -> List[Dict]:
    """
    Convenience function to parse MCQ text.
    
    Args:
        text: The input text containing questions
        
    Returns:
        List of parsed questions
    """
    parser = MCQParser()
    questions = parser.parse_questions(text)
    
    # Randomize choices for each question and update correct answer
    for question in questions:
        original_correct_letter = question['original_correct_letter']
        
        # Find the choice that was originally correct
        original_correct_choice = None
        for choice in question['choices']:
            if choice['original_letter'] == original_correct_letter:
                original_correct_choice = choice
                break
        
        # Randomize the choices
        question['choices'] = parser.randomize_choices(question['choices'])
        
        # Update the correct answer based on the new letter of the originally correct choice
        if original_correct_choice:
            for choice in question['choices']:
                if choice['text'] == original_correct_choice['text']:
                    choice['is_correct'] = True
                    question['correct_answer'] = choice['letter']
                    break
    
    return questions 