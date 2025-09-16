# Diagnostic Models for Pre-Lecture Readiness Checks
from django.db import models
from django.conf import settings
from django.utils import timezone
from backend.apps.pdf_service.django_models import Document
from backend.apps.projects.models import Project
import uuid


class DiagnosticSession(models.Model):
    """
    A diagnostic session for pre-lecture readiness checks.
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    ]
    
    DELIVERY_MODE_CHOICES = [
        ('IMMEDIATE', 'Immediate Feedback'),
        ('DEFERRED_FEEDBACK', 'Deferred Feedback'),
    ]
    
    QUESTIONS_ORDER_CHOICES = [
        ('FIXED', 'Fixed Order'),
        ('SCRAMBLED', 'Scrambled Order'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='diagnostic_sessions')
    topic = models.CharField(max_length=255, null=True, blank=True)
    content_source = models.ForeignKey(Document, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='DRAFT')
    delivery_mode = models.CharField(max_length=18, choices=DELIVERY_MODE_CHOICES, default='DEFERRED_FEEDBACK')
    scheduled_for = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    time_limit_sec = models.PositiveIntegerField(null=True, blank=True)
    max_questions = models.PositiveSmallIntegerField(default=3)
    questions_order = models.CharField(max_length=10, choices=QUESTIONS_ORDER_CHOICES, default='SCRAMBLED')
    seed = models.IntegerField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_diagnostics')
    variant = models.CharField(max_length=1, default='A')
    feature_flag_key = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional test style configuration (MVP)
    # Example IDs: "mcq_quiz", "mixed_checkpoint", "stem_problem_set"
    test_style = models.CharField(max_length=64, null=True, blank=True)
    # Small JSON object with overrides; ignored keys are allowed
    style_config_override = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['scheduled_for', 'due_at']),
            models.Index(fields=['created_by', 'created_at']),
        ]
    
    def __str__(self):
        return f"Diagnostic: {self.topic or 'Untitled'} ({self.project.name})"
    
    @property
    def is_open(self):
        """Check if session is currently open for responses."""
        now = timezone.now()
        if self.status != 'OPEN':
            return False
        if self.scheduled_for and now < self.scheduled_for:
            return False
        if self.due_at and now > self.due_at:
            return False
        return True
    
    @property
    def participation_rate(self):
        """Calculate participation rate based on project members."""
        if not hasattr(self.project, 'members'):
            return 0.0
        total_members = self.project.members.count()
        if total_members == 0:
            return 0.0
        responses = DiagnosticResponse.objects.filter(
            session=self
        ).values('user').distinct().count()
        return responses / total_members


class DiagnosticQuestion(models.Model):
    """
    A question within a diagnostic session.
    """
    TYPE_CHOICES = [
        ('MCQ', 'Multiple Choice'),
        ('SHORT_ANSWER', 'Short Answer'),
        ('PRINCIPLE', 'Principle'),
    ]
    
    BLOOM_LEVEL_CHOICES = [
        ('Remember', 'Remember'),
        ('Understand', 'Understand'),
        ('Apply', 'Apply'),
        ('Analyze', 'Analyze'),
        ('Evaluate', 'Evaluate'),
        ('Create', 'Create'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(DiagnosticSession, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=14, choices=TYPE_CHOICES)
    text = models.TextField()
    choices = models.JSONField(null=True, blank=True)  # For MCQ: ["A", "B", "C", "D"]
    correct_choice_index = models.IntegerField(null=True, blank=True)  # For MCQ: 0, 1, 2, 3
    acceptable_answers = models.JSONField(null=True, blank=True)  # For SA/Principle: regex patterns or literals
    explanation = models.TextField(blank=True)
    difficulty = models.PositiveSmallIntegerField(default=2, choices=[(i, str(i)) for i in range(1, 6)])
    bloom_level = models.CharField(max_length=16, choices=BLOOM_LEVEL_CHOICES, blank=True)
    concept_id = models.CharField(max_length=64, blank=True)
    source_anchor = models.JSONField(null=True, blank=True)  # Document reference
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'type']),
            models.Index(fields=['concept_id']),
            models.Index(fields=['difficulty']),
        ]
    
    def __str__(self):
        return f"{self.type}: {self.text[:50]}..."
    
    def get_correct_answer(self):
        """Get the correct answer based on question type."""
        if self.type == 'MCQ' and self.choices and self.correct_choice_index is not None:
            return self.choices[self.correct_choice_index]
        return None


class DiagnosticResponse(models.Model):
    """
    A student's response to a diagnostic question.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(DiagnosticSession, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(DiagnosticQuestion, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='diagnostic_responses')
    answer_text = models.TextField(null=True, blank=True)
    selected_choice_index = models.IntegerField(null=True, blank=True)
    confidence = models.PositiveSmallIntegerField()  # 0-100
    is_correct = models.BooleanField(default=False)
    score = models.FloatField(default=0.0)  # 0.0 to 1.0
    brier_component = models.FloatField(default=0.0)  # Calibration metric
    latency_ms = models.IntegerField(default=0)
    attempt_no = models.PositiveSmallIntegerField(default=1)
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    feedback_shown_at = models.DateTimeField(null=True, blank=True)
    meta = models.JSONField(default=dict)  # Device info, etc.
    
    class Meta:
        unique_together = ('user', 'question', 'attempt_no')
        indexes = [
            models.Index(fields=['session', 'user']),
            models.Index(fields=['question']),
            models.Index(fields=['user', 'submitted_at']),
            models.Index(fields=['is_correct', 'confidence']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.question.text[:30]}..."
    
    @property
    def response_time_seconds(self):
        """Calculate response time in seconds."""
        if self.started_at and self.submitted_at:
            return (self.submitted_at - self.started_at).total_seconds()
        return 0
    
    @property
    def is_overconfident(self):
        """Check if user was overconfident (high confidence but wrong answer)."""
        return self.confidence >= 60 and not self.is_correct
    
    @property
    def is_underconfident(self):
        """Check if user was underconfident (low confidence but correct answer)."""
        return self.confidence < 40 and self.is_correct


class DiagnosticAnalytics(models.Model):
    """
    Aggregated analytics for a diagnostic session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(DiagnosticSession, on_delete=models.CASCADE, related_name='analytics')
    
    # Participation metrics
    total_participants = models.PositiveIntegerField(default=0)
    participation_rate = models.FloatField(default=0.0)  # 0.0 to 1.0
    
    # Performance metrics
    average_score = models.FloatField(default=0.0)  # 0.0 to 1.0
    median_confidence = models.FloatField(default=0.0)  # 0.0 to 100.0
    overconfidence_rate = models.FloatField(default=0.0)  # 0.0 to 1.0
    
    # Calibration metrics
    brier_score = models.FloatField(default=0.0)
    
    # Concept-level analytics
    concept_analytics = models.JSONField(default=dict)  # Per-concept breakdown
    
    # Generated insights
    top_misconceptions = models.JSONField(default=list)
    talking_points = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Diagnostic Analytics"
        indexes = [
            models.Index(fields=['session', 'created_at']),
        ]
    
    def __str__(self):
        return f"Analytics for {self.session}"
    
    def update_analytics(self):
        """Recalculate all analytics from current responses."""
        responses = self.session.responses.all()
        if not responses.exists():
            return
        
        # Basic metrics
        unique_users = responses.values('user').distinct().count()
        self.total_participants = unique_users
        
        # Calculate participation rate
        if hasattr(self.session.project, 'members'):
            total_members = self.session.project.members.count()
            self.participation_rate = unique_users / total_members if total_members > 0 else 0.0
        
        # Performance metrics
        scores = [r.score for r in responses]
        self.average_score = sum(scores) / len(scores) if scores else 0.0
        
        confidences = [r.confidence for r in responses]
        if confidences:
            confidences.sort()
            mid = len(confidences) // 2
            self.median_confidence = (confidences[mid] + confidences[~mid]) / 2 if len(confidences) % 2 == 0 else confidences[mid]
        
        # Overconfidence rate
        overconfident = responses.filter(confidence__gte=60, is_correct=False).count()
        self.overconfidence_rate = overconfident / len(responses) if responses.exists() else 0.0
        
        # Brier score
        brier_components = [r.brier_component for r in responses]
        self.brier_score = sum(brier_components) / len(brier_components) if brier_components else 0.0
        
        # Concept analytics
        self.concept_analytics = self._calculate_concept_analytics(responses)
        
        # Generate insights
        self.top_misconceptions = self._generate_misconceptions(responses)
        self.talking_points = self._generate_talking_points(responses)
        
        self.save()
    
    def _calculate_concept_analytics(self, responses):
        """Calculate analytics per concept."""
        concept_data = {}
        for response in responses:
            concept = response.question.concept_id or 'unknown'
            if concept not in concept_data:
                concept_data[concept] = {
                    'total_responses': 0,
                    'correct_responses': 0,
                    'avg_confidence': 0.0,
                    'avg_score': 0.0,
                    'brier_components': []
                }
            
            data = concept_data[concept]
            data['total_responses'] += 1
            data['correct_responses'] += 1 if response.is_correct else 0
            data['avg_confidence'] += response.confidence
            data['avg_score'] += response.score
            data['brier_components'].append(response.brier_component)
        
        # Calculate averages
        for concept, data in concept_data.items():
            if data['total_responses'] > 0:
                data['avg_confidence'] /= data['total_responses']
                data['avg_score'] /= data['total_responses']
                data['accuracy'] = data['correct_responses'] / data['total_responses']
                data['avg_brier'] = sum(data['brier_components']) / len(data['brier_components'])
                del data['brier_components']  # Clean up
        
        return concept_data
    
    def _generate_misconceptions(self, responses):
        """Generate list of top misconceptions."""
        misconceptions = []
        concept_data = self.concept_analytics
        
        for concept, data in concept_data.items():
            if data['accuracy'] < 0.7:  # Less than 70% accuracy
                misconceptions.append({
                    'concept': concept,
                    'accuracy': data['accuracy'],
                    'total_responses': data['total_responses'],
                    'avg_confidence': data['avg_confidence']
                })
        
        # Sort by accuracy (worst first)
        misconceptions.sort(key=lambda x: x['accuracy'])
        return misconceptions[:5]  # Top 5 misconceptions
    
    def _generate_talking_points(self, responses):
        """Generate talking points for instructors."""
        talking_points = []
        
        # Add participation insights
        if self.participation_rate < 0.8:
            talking_points.append({
                'type': 'participation',
                'message': f'Only {self.participation_rate:.1%} of students completed the diagnostic. Consider making it required or offering incentives.',
                'priority': 'high'
            })
        
        # Add performance insights
        if self.average_score < 0.5:
            talking_points.append({
                'type': 'performance',
                'message': f'Average score was {self.average_score:.1%}. Students may need additional preparation or the content may be too advanced.',
                'priority': 'high'
            })
        
        # Add calibration insights
        if self.overconfidence_rate > 0.4:
            talking_points.append({
                'type': 'calibration',
                'message': f'{self.overconfidence_rate:.1%} of students were overconfident. This suggests a need for better self-assessment skills.',
                'priority': 'medium'
            })
        
        # Add concept-specific insights
        for misconception in self.top_misconceptions[:3]:
            talking_points.append({
                'type': 'concept',
                'message': f'Students struggled with {misconception["concept"]} (accuracy: {misconception["accuracy"]:.1%}). Consider reviewing this concept.',
                'priority': 'high'
            })
        
        return talking_points
