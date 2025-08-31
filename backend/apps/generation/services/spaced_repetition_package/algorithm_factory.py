"""
Algorithm Factory for Spaced Repetition

This module provides a factory pattern for creating and managing
different spaced repetition algorithms.
"""

from typing import Dict, Type, Optional, Any, List
from .base_algorithm import BaseSpacedRepetitionAlgorithm
from .sm2_algorithm import SM2Algorithm
from .leitner_algorithm import LeitnerAlgorithm


class AlgorithmFactory:
    """
    Factory for creating and managing spaced repetition algorithms.
    
    This factory provides a centralized way to create algorithm instances
    and manage algorithm selection based on user preferences or card requirements.
    """
    
    def __init__(self):
        self._algorithms: Dict[str, Type[BaseSpacedRepetitionAlgorithm]] = {
            'sm2': SM2Algorithm,
            'leitner': LeitnerAlgorithm,
            'super_memo_2': SM2Algorithm,  # Alias for backward compatibility
        }
        
        self._default_algorithm = 'sm2'
    
    def get_algorithm(self, algorithm_name: str) -> BaseSpacedRepetitionAlgorithm:
        """
        Get an algorithm instance by name.
        
        Args:
            algorithm_name: Name of the algorithm to create
            
        Returns:
            Algorithm instance
            
        Raises:
            ValueError: If algorithm name is not supported
        """
        if algorithm_name not in self._algorithms:
            raise ValueError(f"Unsupported algorithm: {algorithm_name}")
        
        algorithm_class = self._algorithms[algorithm_name]
        return algorithm_class()
    
    def get_default_algorithm(self) -> BaseSpacedRepetitionAlgorithm:
        """
        Get the default algorithm instance.
        
        Returns:
            Default algorithm instance
        """
        return self.get_algorithm(self._default_algorithm)
    
    def get_available_algorithms(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all available algorithms.
        
        Returns:
            Dictionary mapping algorithm names to their metadata
        """
        algorithms_info = {}
        
        for name, algorithm_class in self._algorithms.items():
            # Create a temporary instance to get algorithm info
            temp_instance = algorithm_class()
            algorithms_info[name] = temp_instance.get_algorithm_info()
            algorithms_info[name]['is_default'] = (name == self._default_algorithm)
        
        return algorithms_info
    
    def register_algorithm(
        self, 
        name: str, 
        algorithm_class: Type[BaseSpacedRepetitionAlgorithm]
    ) -> None:
        """
        Register a new algorithm with the factory.
        
        Args:
            name: Name for the algorithm
            algorithm_class: Algorithm class to register
            
        Raises:
            ValueError: If algorithm class doesn't inherit from BaseSpacedRepetitionAlgorithm
        """
        if not issubclass(algorithm_class, BaseSpacedRepetitionAlgorithm):
            raise ValueError(
                f"Algorithm class must inherit from BaseSpacedRepetitionAlgorithm, "
                f"got {algorithm_class.__name__}"
            )
        
        self._algorithms[name] = algorithm_class
    
    def unregister_algorithm(self, name: str) -> None:
        """
        Unregister an algorithm from the factory.
        
        Args:
            name: Name of the algorithm to unregister
            
        Raises:
            ValueError: If trying to unregister the default algorithm
        """
        if name == self._default_algorithm:
            raise ValueError("Cannot unregister the default algorithm")
        
        if name in self._algorithms:
            del self._algorithms[name]
    
    def set_default_algorithm(self, name: str) -> None:
        """
        Set the default algorithm.
        
        Args:
            name: Name of the algorithm to set as default
            
        Raises:
            ValueError: If algorithm name is not supported
        """
        if name not in self._algorithms:
            raise ValueError(f"Cannot set default algorithm: {name} is not registered")
        
        self._default_algorithm = name
    
    def get_algorithm_for_card(self, flashcard) -> BaseSpacedRepetitionAlgorithm:
        """
        Get the appropriate algorithm for a specific flashcard.
        
        This method can implement logic to select algorithms based on
        card properties, user preferences, or other criteria.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Appropriate algorithm instance
        """
        # Check if the card has a specific algorithm preference
        if hasattr(flashcard, 'algorithm') and flashcard.algorithm:
            try:
                return self.get_algorithm(flashcard.algorithm)
            except ValueError:
                # Fall back to default if specified algorithm is not available
                pass
        
        # Check if the card has a profile with algorithm preference
        if hasattr(flashcard, 'flashcardprofile') and flashcard.flashcardprofile:
            profile = flashcard.flashcardprofile
            if hasattr(profile, 'preferred_algorithm') and profile.preferred_algorithm:
                try:
                    return self.get_algorithm(profile.preferred_algorithm)
                except ValueError:
                    pass
        
        # Default fallback
        return self.get_default_algorithm()
    
    def get_algorithm_comparison(self) -> Dict[str, Any]:
        """
        Get a comparison of all available algorithms.
        
        Returns:
            Dictionary with algorithm comparison data
        """
        comparison = {
            'algorithms': {},
            'summary': {
                'total_algorithms': len(self._algorithms),
                'default_algorithm': self._default_algorithm,
                'recommendations': self._generate_recommendations()
            }
        }
        
        for name, algorithm_class in self._algorithms.items():
            temp_instance = algorithm_class()
            comparison['algorithms'][name] = {
                'info': temp_instance.get_algorithm_info(),
                'features': self._extract_features(temp_instance),
                'use_cases': self._get_use_cases(name)
            }
        
        return comparison
    
    def _extract_features(self, algorithm_instance: BaseSpacedRepetitionAlgorithm) -> List[str]:
        """Extract key features from an algorithm instance."""
        features = []
        
        if hasattr(algorithm_instance, 'ease_factor'):
            features.append("Adaptive difficulty (ease factor)")
        
        if hasattr(algorithm_instance, 'repetitions'):
            features.append("Repetition counting")
        
        if hasattr(algorithm_instance, 'min_interval'):
            features.append("Configurable intervals")
        
        features.append("Quality-based scheduling")
        features.append("Progress tracking")
        
        return features
    
    def _get_use_cases(self, algorithm_name: str) -> List[str]:
        """Get recommended use cases for an algorithm."""
        use_cases = {
            'sm2': [
                "Long-term learning",
                "Academic subjects",
                "Language learning",
                "Professional development"
            ],
            'leitner': [
                "Simple memorization",
                "Beginner learners",
                "Classroom settings",
                "Quick review sessions"
            ]
        }
        
        return use_cases.get(algorithm_name, ["General learning"])
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations for algorithm selection."""
        return [
            "Use SM2 for long-term retention and complex subjects",
            "Use Leitner for simple memorization and beginners",
            "Consider user learning style when selecting algorithms",
            "Monitor performance to optimize algorithm selection"
        ]
