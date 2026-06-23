"""
Servis za generisanje vektorskih reprezentacija (embeddings) teksta i
računanje semantičke sličnosti.

Primarno koristi Google Gemini embedding model (`gemini-embedding-001`).
Ako Gemini nije dostupan (nema ključa, mrežna greška, itd.) automatski se
koristi lokalni "feature hashing" fallback kako bi preporuke i dalje radile.
"""

from __future__ import annotations

import asyncio
import math
import os
import re
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_EMBED_MODEL = "gemini-embedding-001"
GEMINI_OUTPUT_DIM = 768

GEMINI_MODEL_TAG = f"gemini:{GEMINI_EMBED_MODEL}:{GEMINI_OUTPUT_DIM}"
FALLBACK_DIM = 512
FALLBACK_MODEL_TAG = f"local-hash:{FALLBACK_DIM}"

_client = None
_client_initialized = False

def _get_client():
    """Lijena inicijalizacija Gemini klijenta (vraća None ako nije moguće)."""
    global _client, _client_initialized
    if _client_initialized:
        return _client

    _client_initialized = True
    if not GEMINI_API_KEY:
        _client = None
        return None

    try:
        from google import genai

        _client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as exc:
        print(f"[Embedding_service] Gemini klijent nije inicijalizovan: {exc}")
        _client = None

    return _client

def active_model_tag() -> str:
    """Oznaka modela koji će biti korišten za nove embeddinge."""
    return GEMINI_MODEL_TAG if _get_client() is not None else FALLBACK_MODEL_TAG

_TOKEN_RE = re.compile(r"[a-zA-ZčćžšđČĆŽŠĐ0-9]+", re.UNICODE)

def _tokenize(text: str) -> List[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text or "")]

def _local_embedding(text: str, dim: int = FALLBACK_DIM) -> List[float]:
    """Deterministički "feature hashing" vektor sa L2 normalizacijom."""
    vec = [0.0] * dim
    tokens = _tokenize(text)
    if not tokens:
        return vec

    for token in tokens:
        h = hash(token)
        idx = h % dim
        sign = 1.0 if (h // dim) % 2 == 0 else -1.0
        vec[idx] += sign

    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]
    return vec

def _gemini_embedding_sync(text: str) -> Optional[List[float]]:
    client = _get_client()
    if client is None:
        return None
    try:
        from google.genai import types

        result = client.models.embed_content(
            model=GEMINI_EMBED_MODEL,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=GEMINI_OUTPUT_DIM),
        )
        return list(result.embeddings[0].values)
    except Exception as exc:
        print(f"[Embedding_service] Gemini embedding greška, koristim fallback: {exc}")
        return None

async def generate_embedding(text: str) -> tuple[List[float], str]:
    """
    Vraća (vektor, oznaka_modela). Pokušava Gemini, pa lokalni fallback.
    """
    text = (text or "").strip()
    if not text:
        return [], active_model_tag()

    embedding = await asyncio.to_thread(_gemini_embedding_sync, text)
    if embedding:
        return embedding, GEMINI_MODEL_TAG

    return _local_embedding(text), FALLBACK_MODEL_TAG

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Kosinusna sličnost dva vektora (0..1 za normalizovane, generalno -1..1)."""
    if not a or not b or len(a) != len(b):
        return 0.0

    dot = 0.0
    norm_a = 0.0
    norm_b = 0.0
    for x, y in zip(a, b):
        dot += x * y
        norm_a += x * x
        norm_b += y * y

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (math.sqrt(norm_a) * math.sqrt(norm_b))

def similarity_to_percentage(cosine: float) -> int:
    """
    Pretvara kosinusnu sličnost u intuitivan postotak (0-100).

    Tekstualni embeddinzi povezanih sadržaja obično daju kosinus ~0.4-0.85,
    pa raspon [0.25, 0.9] mapiramo na [1, 99] da postotak bude čitljiviji.
    """
    lo, hi = 0.25, 0.9
    scaled = (cosine - lo) / (hi - lo)
    pct = round(scaled * 100)
    return max(1, min(99, pct))
