import os
import random
from ..api_client import Task


def _seeded_random(payload: dict) -> random.Random:
    seed_env = os.getenv("MOCK_SEED", "0")
    try:
        base = int(seed_env or "0")
    except ValueError:
        base = 0
    key = str(payload.get("title") or payload.get("content") or "")
    return random.Random(base + (hash(key) % 10000))


def mock_syllabus(payload: dict) -> dict:
    rnd = _seeded_random(payload)
    topics = payload.get("topics") or ["Foundations", "Data", "Models", "Evaluation"]
    modules = []
    for i, t in enumerate(topics):
        modules.append({
            "name": f"Module {i+1}: {t}",
            "duration_hours": rnd.choice([2, 3, 4]),
            "objectives": [f"Understand {t}", f"Apply {t}"],
            "topics": [t, f"Advanced {t}"],
            "prerequisites": ["Basics"],
            "assessment": {"type": rnd.choice(["quiz", "assignment"]), "weight": rnd.choice([10, 20])},
        })
    return {
        "title": payload.get("title") or "Mock Syllabus",
        "modules": modules,
        "total_hours": sum(m["duration_hours"] for m in modules),
        "bloom_levels": ["Remember", "Understand", "Apply"],
    }


def mock_tests(payload: dict) -> dict:
    rnd = _seeded_random(payload)
    items = [
        {
            "type": "mcq",
            "question": "What is the primary benefit of tokenization?",
            "options": ["Speed", "Normalization", "Segmentation", "Parsing"],
            "answer_index": rnd.choice([1, 2]),
            "explanation": "Segmentation or normalization of text for downstream models.",
            "difficulty": rnd.choice(["easy", "medium", "hard"]),
            "tags": ["nlp-basics"],
        },
        {
            "type": "written",
            "prompt": "Explain the difference between precision and recall.",
            "rubric": ["defines both", "contrasts trade-offs", "gives example"],
            "difficulty": rnd.choice(["medium", "hard"]),
            "tags": ["metrics"],
        },
    ]
    return {"items": items}


def mock_content(payload: dict) -> dict:
    content = (payload.get("content") or "").strip()
    summary = content[:160] + ("..." if len(content) > 160 else "")
    return {
        "summary": summary or "High-level abstract of the provided content.",
        "keywords": ["nlp", "models", "training"],
        "entities": [{"text": "BERT", "type": "Model"}],
        "concepts": [{"name": "Tokenization", "description": "Split text into tokens for modeling."}],
        "sections": [
            {"title": "1. Introduction", "start": 0, "end": 1200, "key_points": ["Motivation", "Overview"]}
        ],
    }


def mock_flashcards(payload: dict) -> dict:
    """Return comprehensive language model flashcards for testing."""
    return {
        "cards": [
            {
                "question": "What two core problems do language models target?",
                "answer": "Belonging: decide if a sequence is a sentence of language L. Continuation: predict the most likely next item given a segment. ",
                "concept_id": "role-of-language-models",
                "difficulty": "medium",
                "bloom_level": "analyze",
                "card_type": "definition",
                "theme": "Language models",
                "related_concepts": ["belonging-problem", "continuation-problem", "causal-language-modeling"],
                "hints": ["Think membership vs. next-step."],
                "examples": ["\"Cork is extracted → from.\""],
                "common_misconceptions": ["Assuming language models only translate text."],
                "learning_objective": "Distinguish belonging and continuation problems."
            },
            {
                "question": "What is the belonging (membership) problem in language modeling?",
                "answer": "Determine whether a given sequence is a sentence of language L. ",
                "concept_id": "belonging-problem",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "definition",
                "theme": "Language models",
                "related_concepts": ["role-of-language-models", "continuation-problem"],
                "hints": ["Is this sequence valid in L?"],
                "examples": ["Judge if a sentence conforms to L."],
                "common_misconceptions": ["Confusing grammaticality with topic relevance."],
                "learning_objective": "Explain the belonging problem."
            },
            {
                "question": "What does the continuation problem ask a language model to do?",
                "answer": "Given a segment, predict the most likely next item (token or sequence) in language L. ",
                "concept_id": "continuation-problem",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "definition",
                "theme": "Continuation",
                "related_concepts": ["role-of-language-models", "causal-language-modeling", "masked-language-modeling"],
                "hints": ["Focus on 'what comes next'."],
                "examples": ["\"Cork is extracted → from.\""],
                "common_misconceptions": ["Thinking continuation requires labeled data."],
                "learning_objective": "Define the continuation problem."
            },
            {
                "question": "Why is self-supervised learning suited to language modeling?",
                "answer": "It needs no manual labels: remove the next segment and ask the model to predict it using raw running texts, enabling much larger training sets than annotated ones. ",
                "concept_id": "self-supervised-learning",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Training",
                "related_concepts": ["colossal-datasets", "cross-entropy-loss", "forward-pass"],
                "hints": ["Think 'create targets from context'."],
                "examples": ["Mask or drop next item, predict it."],
                "common_misconceptions": ["Equating self-supervision with weak supervision."],
                "learning_objective": "Analyze why self-supervision scales for LMs."
            },
            {
                "question": "Cross-entropy for one-hot target y and prediction y^ is {{ – Σ_i y[i] log(y^[i]) }}; with true index i, the individual loss becomes {{ –log(y^[i]) }}.",
                "answer": "In next-token classification, minimizing cross-entropy reduces the negative log-probability of the correct item. Lower loss indicates better performance. ",
                "concept_id": "cross-entropy-loss",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "cloze",
                "theme": "Loss & metrics",
                "related_concepts": ["one-hot-targets", "softmax-normalization"],
                "hints": ["Use the one-hot target to pick one term."],
                "examples": ["Loss for correct index i is –log(y^[i])."],
                "common_misconceptions": ["Averaging losses before softmax."],
                "learning_objective": "Explain cross-entropy in LM training."
            },
            {
                "question": "What does softmax enforce on the output vector y^?",
                "answer": "Each component lies in [0,1] and the components sum to 1 across the vocabulary, making y^ a probability distribution. ",
                "concept_id": "softmax-normalization",
                "difficulty": "medium",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Loss & metrics",
                "related_concepts": ["cross-entropy-loss", "predicted-item-argmax"],
                "hints": ["Normalization across classes."],
                "examples": ["Two classes: p1 + p2 = 1."],
                "common_misconceptions": ["Treating logits as probabilities."],
                "learning_objective": "Interpret softmax-normalized outputs."
            },
            {
                "question": "How is the predicted next item selected from y^?",
                "answer": "Choose the index with the highest value (argmax) in the softmax-normalized output vector. ",
                "concept_id": "predicted-item-argmax",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "application",
                "theme": "Continuation",
                "related_concepts": ["softmax-normalization", "cross-entropy-loss"],
                "hints": ["Think highest probability index."],
                "examples": ["max(y^) gives the next token."],
                "common_misconceptions": ["Sampling is required for prediction."],
                "learning_objective": "Apply argmax to pick the next token."
            },
            {
                "question": "What is learned during pre-training of a language model?",
                "answer": "General linguistic regularities by solving continuation tasks on colossal text corpora, yielding vector-space representations useful for downstream tuning. ",
                "concept_id": "pretraining-phase",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Pretrain & tune",
                "related_concepts": ["fine-tuning-phase", "causal-language-modeling"],
                "hints": ["General, not task-specific."],
                "examples": ["Train on raw web text as LM."],
                "common_misconceptions": ["Pre-training requires labels."],
                "learning_objective": "Analyze goals of pre-training."
            },
            {
                "question": "What happens during fine-tuning after pre-training?",
                "answer": "Continue training to solve a supervised downstream task (e.g., NER, inference) using smaller annotated datasets, adapting the pre-trained model. ",
                "concept_id": "fine-tuning-phase",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "application",
                "theme": "Pretrain & tune",
                "related_concepts": ["pretraining-phase", "global-vs-selective-tuning"],
                "hints": ["Task-specific adaptation."],
                "examples": ["Tune LM for emotion detection."],
                "common_misconceptions": ["Fine-tuning rebuilds the model from scratch."],
                "learning_objective": "Apply fine-tuning for a downstream task."
            },
            {
                "question": "Contrast global and selective tuning strategies.",
                "answer": "Global: allow all model weights to adjust. Selective: adjust only designated layers or an added task-specific layer/head. ",
                "concept_id": "global-vs-selective-tuning",
                "difficulty": "hard",
                "bloom_level": "evaluate",
                "card_type": "comparison",
                "theme": "Pretrain & tune",
                "related_concepts": ["fine-tuning-phase", "pretraining-phase"],
                "hints": ["Scope of weight updates."],
                "examples": ["Freeze encoder; train added layer."],
                "common_misconceptions": ["Selective tuning equals zero learning in the base model."],
                "learning_objective": "Evaluate tuning scopes for adaptation."
            },
            {
                "question": "Define causal language modeling (CLM).",
                "answer": "Given a segment, predict the next item (next-token prediction) to solve the continuation problem. ",
                "concept_id": "causal-language-modeling",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "definition",
                "theme": "Tasks",
                "related_concepts": ["continuation-problem", "masked-language-modeling"],
                "hints": ["Left-to-right prediction."],
                "examples": ["\"Cork is extracted → from.\""],
                "common_misconceptions": ["CLM fills random masked tokens."],
                "learning_objective": "Define CLM and its goal."
            },
            {
                "question": "How does masked language modeling (MLM) train a model?",
                "answer": "Randomly mask or replace tokens in a sentence and train the model to predict the original tokens at those positions. ",
                "concept_id": "masked-language-modeling",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "application",
                "theme": "Tasks",
                "related_concepts": ["causal-language-modeling", "cross-entropy-loss"],
                "hints": ["Predict masked tokens."],
                "examples": ["\"I looked at my [MASK] … [MASK] was late.\""],
                "common_misconceptions": ["MLM always predicts the next token only."],
                "learning_objective": "Apply MLM to reconstruct masked tokens."
            },
            {
                "question": "What is Next Sentence Prediction (NSP)?",
                "answer": "Given two sentences, indicate whether the second can be the continuation of the first. ",
                "concept_id": "next-sentence-prediction",
                "difficulty": "medium",
                "bloom_level": "analyze",
                "card_type": "definition",
                "theme": "Tasks",
                "related_concepts": ["continuation-problem", "sentence-warping"],
                "hints": ["Sentence-level continuity."],
                "examples": ["Decide if S2 follows S1."],
                "common_misconceptions": ["NSP predicts token identities."],
                "learning_objective": "Explain NSP as a sequence-level task."
            },
            {
                "question": "What is the token deletion objective?",
                "answer": "Delete tokens (e.g., randomly) and train the model to predict the missing items from the remaining context. ",
                "concept_id": "token-deletion",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Tasks",
                "related_concepts": ["masked-language-modeling", "sentence-warping"],
                "hints": ["Recover removed items."],
                "examples": ["Predict dropped words from context."],
                "common_misconceptions": ["Token deletion equals simple truncation."],
                "learning_objective": "Analyze deletion-based training signals."
            },
            {
                "question": "What is the 'sentence warping' objective?",
                "answer": "Deform sentences by moving tokens (e.g., start from a random word) and train the model to resolve or handle the distorted order. ",
                "concept_id": "sentence-warping",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Tasks",
                "related_concepts": ["next-sentence-prediction", "token-deletion"],
                "hints": ["Reordering challenge."],
                "examples": ["Tokens shifted from the beginning to the end."],
                "common_misconceptions": ["Warping only shuffles characters."],
                "learning_objective": "Analyze sequence deformation objectives."
            },
            {
                "question": "What is transfer learning and why use it here?",
                "answer": "Applying knowledge learned in solving one problem to another to mitigate scarce annotated data for the target task. ",
                "concept_id": "transfer-learning-definition",
                "difficulty": "medium",
                "bloom_level": "analyze",
                "card_type": "definition",
                "theme": "Transfer",
                "related_concepts": ["cross-lingual-transfer", "domain-adaptation"],
                "hints": ["Reuse knowledge across tasks."],
                "examples": ["Use LM pretraining to aid NER."],
                "common_misconceptions": ["Transfer requires identical tasks and data."],
                "learning_objective": "Explain transfer learning's role in data scarcity."
            },
            {
                "question": "Describe cross-lingual transfer.",
                "answer": "Same task across languages: train where annotations are abundant (e.g., English), then apply to a language with fewer labels (e.g., Portuguese). ",
                "concept_id": "cross-lingual-transfer",
                "difficulty": "hard",
                "bloom_level": "evaluate",
                "card_type": "application",
                "theme": "Transfer",
                "related_concepts": ["transfer-learning-definition", "domain-adaptation"],
                "hints": ["Same task, different language."],
                "examples": ["POS tagger English → Portuguese."],
                "common_misconceptions": ["Cross-lingual equals translation."],
                "learning_objective": "Apply transfer across languages."
            },
            {
                "question": "What is domain adaptation in transfer learning?",
                "answer": "Same task across domains: train in a rich domain (e.g., news) and apply to a scarce domain (e.g., legal texts). ",
                "concept_id": "domain-adaptation",
                "difficulty": "hard",
                "bloom_level": "evaluate",
                "card_type": "application",
                "theme": "Transfer",
                "related_concepts": ["transfer-learning-definition", "cross-lingual-transfer"],
                "hints": ["Same task, different domain."],
                "examples": ["NER from news → legal."],
                "common_misconceptions": ["Domain adaptation changes the task."],
                "learning_objective": "Apply transfer across domains."
            },
            {
                "question": "How does multi-task learning differ from sequential transfer?",
                "answer": "Multi-task: merge datasets and train one model on different tasks simultaneously. Sequential transfer: train on one task, then continue training focused on a second task. ",
                "concept_id": "multi-task-learning",
                "difficulty": "expert",
                "bloom_level": "evaluate",
                "card_type": "comparison",
                "theme": "Transfer",
                "related_concepts": ["sequential-transfer-learning", "transfer-learning-definition"],
                "hints": ["Simultaneous vs. staged training."],
                "examples": ["Sentiment + trend detection vs. LM → NER."],
                "common_misconceptions": ["Assuming both approaches are interchangeable."],
                "learning_objective": "Evaluate simultaneous vs. staged transfer."
            },
            {
                "question": "What is sequential transfer learning?",
                "answer": "Train in two phases: first on one task; then continue training with emphasis on a second task in the same language/domain. ",
                "concept_id": "sequential-transfer-learning",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Transfer",
                "related_concepts": ["multi-task-learning", "pretraining-phase"],
                "hints": ["Two-phase curriculum."],
                "examples": ["Language modeling → NER."],
                "common_misconceptions": ["It requires changing model architecture."],
                "learning_objective": "Analyze staged transfer setups."
            },
            {
                "question": "Why rely on colossal training datasets for language models?",
                "answer": "Annotated data are scarce; running texts from the web provide vast self-supervised training corpora for modeling linguistic regularities. ",
                "concept_id": "colossal-datasets",
                "difficulty": "medium",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Data",
                "related_concepts": ["self-supervised-learning", "pretraining-phase"],
                "hints": ["Think availability vs. labels."],
                "examples": ["Collect raw text at scale."],
                "common_misconceptions": ["Bigger datasets always fix poor objectives."],
                "learning_objective": "Justify large-scale unlabeled training."
            },
            {
                "question": "What kinds of tasks are cited as uses of language models?",
                "answer": "Answer questions, fill questionnaires, dialogue, text generation, and even creating fake news are mentioned as applications. ",
                "concept_id": "applications-of-lms",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "definition",
                "theme": "Applications",
                "related_concepts": ["pretraining-phase", "fine-tuning-phase"],
                "hints": ["Think outputs beyond next-token."],
                "examples": ["Dialogue systems; auto text writing."],
                "common_misconceptions": ["Only classification is possible."],
                "learning_objective": "Identify applications named in the content."
            },
            {
                "question": "What is computed in the forward pass during training?",
                "answer": "The model processes inputs to produce an output vector y^ (e.g., next-token distribution), which is then compared to the target via a loss. ",
                "concept_id": "forward-pass",
                "difficulty": "medium",
                "bloom_level": "apply",
                "card_type": "application",
                "theme": "Training",
                "related_concepts": ["cross-entropy-loss", "softmax-normalization"],
                "hints": ["From inputs to predictions."],
                "examples": ["Compute y^ then loss L(y^, y)."],
                "common_misconceptions": ["Forward pass updates weights."],
                "learning_objective": "Apply the notion of a forward pass."
            },
            {
                "question": "What is the purpose of the backward pass?",
                "answer": "Compute gradients of the loss with respect to parameters and propagate them to enable weight updates that reduce the loss. ",
                "concept_id": "backward-pass",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "analysis",
                "theme": "Training",
                "related_concepts": ["forward-pass", "cross-entropy-loss"],
                "hints": ["From loss to gradients."],
                "examples": ["Backprop after computing loss."],
                "common_misconceptions": ["Backward pass produces predictions."],
                "learning_objective": "Analyze the role of backpropagation."
            }
        ]
    }


MOCK_REGISTRY = {
    Task.SYLLABUS: mock_syllabus,
    Task.TEST: mock_tests,
    Task.CONTENT: mock_content,
    Task.FLASHCARDS: mock_flashcards,
}


