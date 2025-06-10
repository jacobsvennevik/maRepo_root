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
        Parse the text and extract multiple-choice questions using a more robust find-all approach.
        This method is designed to be more resilient to headers or extra text between questions.
        """
        questions = []
        
        # This pattern non-greedily captures the content between <question> and <explanation>
        # and the content of <explanation>, stopping at the next <question> or end of string.
        pattern = re.compile(r'<question>(.*?)<explanation>(.*?)(?=<question>|$)', re.DOTALL | re.IGNORECASE)

        for match in pattern.finditer(text):
            question_block = match.group(1).strip()
            explanation = match.group(2).strip()

            # The question text is everything in the block before the choices start.
            choices = self._parse_choices(question_block)
            if not choices:
                continue # Skip if no choices are found in the block.

            # Find where the choices start to isolate the question text
            question_text = question_block
            # Find the start of the first choice to isolate the question from the choice list
            first_choice_pattern = r'^([A-D])\.\s*' # A common start pattern
            for p in self.choice_patterns:
                if re.search(p, question_block, re.MULTILINE):
                    first_choice_pattern = p
                    break
            
            first_match = re.search(first_choice_pattern, question_block, re.MULTILINE)
            if first_match:
                question_text = question_block[:first_match.start()].strip()


            correct_letter = self._extract_correct_answer(explanation)
            question_type = self._determine_question_type(question_text, explanation)

            question_data = {
                'question_text': question_text,
                'choices': choices,
                'explanation': explanation,
                'question_type': question_type,
                'correct_answer': correct_letter,
                'original_correct_letter': correct_letter
            }

            if self._validate_question(question_data):
                questions.append(question_data)
                
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
                    if letter in ['A', 'B', 'C', 'D', 'E', 'F']: # Allow more choices
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
            r'Correct:\s*([A-F])',
            r'\*\*Correct:\s*([A-F])\*\*',
            r'Answer:\s*([A-F])',
            r'\*\*Answer:\s*([A-F])\*\*',
            r'([A-F])\.\s*.*?correct',
            r'([A-F])\.\s*.*?Correct',
            r'The answer is\s*([A-F])',
            r'Answer is\s*([A-F])',
            r'([A-F])\s*is correct',
            r'([A-F])\s*is the correct',
            r'([A-F])\s*is right',
            r'([A-F])\s*is the right',
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
        valid_letters = {'A', 'B', 'C', 'D', 'E', 'F'}
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
        
        # Update the letters to maintain A, B, C, D... order
        letters = [chr(ord('A') + i) for i in range(len(randomized_choices))]
        for i, choice in enumerate(randomized_choices):
            choice['letter'] = letters[i]
        
        return randomized_choices
    
    def update_explanation_with_mapping(self, explanation: str, letter_mapping: Dict[str, str]) -> str:
        """
        Update explanation text to reflect the new letter mapping after randomization.
        This will replace all standalone letters (A, B, C, D) in the explanation simultaneously.
        """
        # Create a regex pattern that matches any of the old letters as whole words.
        # e.g., \b(A|B|C|D)\b
        # We sort keys by length to prevent partial matches, e.g., matching 'C' inside 'Correct'.
        sorted_keys = sorted(letter_mapping.keys(), key=len, reverse=True)
        if not sorted_keys:
            return explanation
            
        pattern = re.compile(
            r'\b(' + '|'.join(re.escape(k) for k in sorted_keys) + r')\b'
        )

        # Use a replacer function that looks up the matched letter in the mapping.
        # The matched letter (group 0) is used as the key.
        # The `get` method provides a fallback to the original match if a key is not found.
        updated_explanation = pattern.sub(
            lambda m: letter_mapping.get(m.group(0).upper(), m.group(0)),
            explanation
        )
            
        return updated_explanation


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
    
    # Randomize choices for each question and update correct answer and explanation
    for question in questions:
        original_choices = question['choices'].copy()
        if not original_choices:
            continue

        # Find the text of the originally correct choice
        original_correct_letter = question['original_correct_letter']
        correct_choice_text = ""
        for choice in original_choices:
            if choice['original_letter'] == original_correct_letter:
                correct_choice_text = choice['text']
                break

        # Randomize the choices. The `randomized_choices` list now has new letters.
        randomized_choices = parser.randomize_choices(original_choices)

        # Create the mapping from old letter to new letter by matching text content
        letter_mapping = {}
        for r_choice in randomized_choices:
            for o_choice in original_choices:
                if o_choice['text'] == r_choice['text']:
                    letter_mapping[o_choice['original_letter']] = r_choice['letter']
                    break
        
        # Update the explanation using this new, correct mapping
        if letter_mapping:
            question['explanation'] = parser.update_explanation_with_mapping(
                question['explanation'], letter_mapping
            )

        # Find the new correct letter and set the flags
        new_correct_letter = ""
        for choice in randomized_choices:
            if choice['text'] == correct_choice_text:
                choice['is_correct'] = True
                new_correct_letter = choice['letter']
            else:
                choice['is_correct'] = False

        question['correct_answer'] = new_correct_letter
        question['choices'] = randomized_choices

    return questions 