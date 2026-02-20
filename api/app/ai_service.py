"""
AI-powered creature name generation using Groq (fast, cheap).
Falls back to predefined names if Groq is unavailable.
"""
import random
from typing import Optional
from .config import get_settings

# Predefined fallback names by family and level
FALLBACK_NAMES = {
    "fairy_cat": {
        1: ["Mochi", "Pixie", "Starling", "Fluffpaw", "Dewwhisker"],
        2: ["Sparklepurr", "Moonbeam", "Glimmerkit", "Twinkle", "Stardust"],
        3: ["Astralis", "Lumikki", "Celestine", "Nebulina", "Cosmica"],
        4: ["Seraphim", "Aurorawhisker", "Ethereal", "Solatrix", "Luminary"],
        5: ["Divinus", "Omnipurr", "Starweaver", "Eternawhisk", "Prismatica"],
    },
    "baby_dragon": {
        1: ["Cindersnap", "Emberpuff", "Smoky", "Flicker", "Ashling"],
        2: ["Cuddleflame", "Warmwing", "Hugscale", "Snugdrake", "Cozyfire"],
        3: ["Sapphirewing", "Azurion", "Crystalbreath", "Lapis", "Cobaltus"],
        4: ["Thunderclaw", "Stormrider", "Voltscale", "Tempestus", "Galewing"],
        5: ["Aeternicus", "Celestidrak", "Omnifire", "Eternalis", "Primordius"],
    },
    "mini_unicorn": {
        1: ["Twinkletrot", "Stardancer", "Glimmerhoof", "Sparkle", "Rosydust"],
        2: ["Rainbowmane", "Prismhoof", "Chromagleam", "Iridessa", "Spectria"],
        3: ["Crystallia", "Diamondhorn", "Gemspark", "Luminara", "Brilliance"],
        4: ["Solarhorn", "Astralis", "Cosmicshine", "Stellaris", "Zenith"],
        5: ["Prismachron", "Eternicorn", "Alicoria", "Omnilux", "Prismatica"],
    },
    "forest_fox": {
        1: ["Dewdancer", "Morningmist", "Fernpaw", "Leafwhisk", "Dewberry"],
        2: ["Glowpelt", "Shimmersnout", "Lumifox", "Radiara", "Lightfoot"],
        3: ["Borealis", "Polarstream", "Auroraflame", "Northglow", "Solstice"],
        4: ["Starlance", "Celestipaw", "Aetherix", "Novafox", "Lunarkin"],
        5: ["Spiritweave", "Divinum", "Omnifox", "Astralkin", "Eternapaw"],
    },
    "mushroom_sprite": {
        1: ["Puffcap", "Sporeling", "Mossy", "Fungina", "Bloomspore"],
        2: ["Blossomcap", "Petalshroom", "Florasprite", "Dewbloom", "Lilyspore"],
        3: ["Sylvanus", "Verdantkeeper", "Forestsoul", "Mossguard", "Terralis"],
        4: ["Eldergrove", "Ancientcap", "Timelessoak", "Primeval", "Ageless"],
        5: ["Ethergrove", "Primordialis", "Spiritmoss", "Eternawood", "Omniverde"],
    },
}


async def generate_creature_name(family: str, level: int, lang: str = "en") -> str:
    """
    Try to generate a name with Groq; fall back to predefined list.
    """
    settings = get_settings()

    if settings.groq_api_key:
        try:
            name = await _groq_generate_name(family, level, lang, settings.groq_api_key)
            if name:
                return name
        except Exception:
            pass

    return _fallback_name(family, level)


def _fallback_name(family: str, level: int) -> str:
    names = FALLBACK_NAMES.get(family, {}).get(level, [])
    if names:
        return random.choice(names)
    return f"Mystery {family.replace('_', ' ').title()} Lv{level}"


async def _groq_generate_name(family: str, level: int, lang: str, api_key: str) -> Optional[str]:
    """
    Call Groq API to generate a cute fantasy creature name.
    Uses llama3-8b-instruct which is very fast and cheap.
    """
    try:
        import httpx

        family_desc = family.replace("_", " ")
        level_adj = ["tiny", "cute", "glowing", "radiant", "divine"][min(level - 1, 4)]

        prompt = (
            f"Generate ONE creative, cute fantasy name (2-3 words, no explanation) "
            f"for a {level_adj} level {level} {family_desc} creature in a magical forest game. "
            f"Language: {'Russian' if lang.startswith('ru') else 'English'}. "
            f"Just the name, nothing else."
        )

        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 20,
                    "temperature": 0.9,
                },
            )

            if resp.status_code == 200:
                data = resp.json()
                name = data["choices"][0]["message"]["content"].strip()
                # Clean up — remove quotes if any
                name = name.strip('"\'').strip()
                if 2 <= len(name) <= 40:
                    return name

    except Exception:
        pass

    return None
