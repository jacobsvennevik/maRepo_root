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
    return {
        "cards": [
            {"question": "Define overfitting.", "answer": "Model learns noise, not signal.", "tags": ["ml", "general"]},
            {"question": "What is precision?", "answer": "TP / (TP + FP)", "tags": ["metrics"]},
        ]
    }


MOCK_REGISTRY = {
    Task.SYLLABUS: mock_syllabus,
    Task.TEST: mock_tests,
    Task.CONTENT: mock_content,
    Task.FLASHCARDS: mock_flashcards,
}


