"""
Static game data — single source of truth (mirrors frontend gameData.ts).
"""
from typing import TypedDict, Optional

CREATURE_FAMILIES = {
    "fairy_cat": {
        "id": "fairy_cat",
        "levels": [
            {"level": 1, "name_en": "Fluffy Kit",        "name_ru": "Пушистый Котёнок",   "production": {"leaves": 1,   "dew": 0,  "berries": 0}, "interval_sec": 30, "unlock_cost": {"leaves": 0}},
            {"level": 2, "name_en": "Star Kitten",        "name_ru": "Звёздный Котик",     "production": {"leaves": 3,   "dew": 0,  "berries": 0}, "interval_sec": 30},
            {"level": 3, "name_en": "Cosmic Cat",         "name_ru": "Космический Кот",    "production": {"leaves": 8,   "dew": 1,  "berries": 0}, "interval_sec": 30},
            {"level": 4, "name_en": "Celestial Feline",   "name_ru": "Небесная Кошка",     "production": {"leaves": 20,  "dew": 3,  "berries": 0}, "interval_sec": 30},
            {"level": 5, "name_en": "Divine Whisker",     "name_ru": "Божественный Мурр",  "production": {"leaves": 50,  "dew": 8,  "berries": 1}, "interval_sec": 30},
        ],
    },
    "baby_dragon": {
        "id": "baby_dragon",
        "levels": [
            {"level": 1, "name_en": "Ember Hatchling",   "name_ru": "Огненный Дракончик", "production": {"leaves": 0,   "dew": 1,  "berries": 0}, "interval_sec": 40, "unlock_cost": {"leaves": 30}},
            {"level": 2, "name_en": "Cuddle Drake",       "name_ru": "Обнимашка-Дракон",   "production": {"leaves": 0,   "dew": 3,  "berries": 0}, "interval_sec": 40},
            {"level": 3, "name_en": "Azure Dragon",       "name_ru": "Лазурный Дракон",    "production": {"leaves": 2,   "dew": 7,  "berries": 0}, "interval_sec": 40},
            {"level": 4, "name_en": "Storm Wyrm",         "name_ru": "Грозовой Вирм",      "production": {"leaves": 5,   "dew": 18, "berries": 0}, "interval_sec": 40},
            {"level": 5, "name_en": "Eternal Dragon",     "name_ru": "Вечный Дракон",      "production": {"leaves": 10,  "dew": 45, "berries": 2}, "interval_sec": 40},
        ],
    },
    "mini_unicorn": {
        "id": "mini_unicorn",
        "levels": [
            {"level": 1, "name_en": "Sparkle Foal",      "name_ru": "Искристый Жеребёнок", "production": {"leaves": 2,  "dew": 0,  "berries": 0}, "interval_sec": 35, "unlock_cost": {"leaves": 20}},
            {"level": 2, "name_en": "Rainbow Pony",       "name_ru": "Радужный Пони",        "production": {"leaves": 5,  "dew": 1,  "berries": 0}, "interval_sec": 35},
            {"level": 3, "name_en": "Crystal Unicorn",    "name_ru": "Хрустальный Единорог", "production": {"leaves": 12, "dew": 2,  "berries": 0}, "interval_sec": 35},
            {"level": 4, "name_en": "Star Unicorn",       "name_ru": "Звёздный Единорог",    "production": {"leaves": 30, "dew": 5,  "berries": 0}, "interval_sec": 35},
            {"level": 5, "name_en": "Prismatic Alicorn",  "name_ru": "Призматический Аликорн","production": {"leaves": 70, "dew": 12, "berries": 2}, "interval_sec": 35},
        ],
    },
    "forest_fox": {
        "id": "forest_fox",
        "levels": [
            {"level": 1, "name_en": "Dewdrop Fox",       "name_ru": "Росяная Лисичка",     "production": {"leaves": 1,  "dew": 1,  "berries": 0}, "interval_sec": 45, "unlock_cost": {"leaves": 50, "dew": 5}},
            {"level": 2, "name_en": "Glow Fox",          "name_ru": "Светящаяся Лиса",     "production": {"leaves": 3,  "dew": 3,  "berries": 0}, "interval_sec": 45},
            {"level": 3, "name_en": "Aurora Fox",        "name_ru": "Полярная Лиса",       "production": {"leaves": 7,  "dew": 7,  "berries": 0}, "interval_sec": 45},
            {"level": 4, "name_en": "Celestial Vixen",   "name_ru": "Небесная Лисица",     "production": {"leaves": 15, "dew": 15, "berries": 1}, "interval_sec": 45},
            {"level": 5, "name_en": "Divine Fox Spirit", "name_ru": "Дух Лисы",            "production": {"leaves": 35, "dew": 35, "berries": 3}, "interval_sec": 45},
        ],
    },
    "mushroom_sprite": {
        "id": "mushroom_sprite",
        "levels": [
            {"level": 1, "name_en": "Spore Sprite",      "name_ru": "Споровый Эльф",       "production": {"leaves": 3,  "dew": 0,  "berries": 0}, "interval_sec": 25, "unlock_cost": {"leaves": 10}},
            {"level": 2, "name_en": "Bloom Sprite",       "name_ru": "Цветочный Эльф",      "production": {"leaves": 8,  "dew": 0,  "berries": 0}, "interval_sec": 25},
            {"level": 3, "name_en": "Forest Guardian",    "name_ru": "Лесной Страж",        "production": {"leaves": 20, "dew": 2,  "berries": 0}, "interval_sec": 25},
            {"level": 4, "name_en": "Ancient Keeper",     "name_ru": "Древний Хранитель",   "production": {"leaves": 50, "dew": 5,  "berries": 0}, "interval_sec": 25},
            {"level": 5, "name_en": "Elder Spirit",       "name_ru": "Дух Старейшины",      "production": {"leaves": 120,"dew": 10, "berries": 2}, "interval_sec": 25},
        ],
    },
}

MAX_LEVEL = 5
MAX_GRID_SIZE = 40
DEFAULT_UNLOCKED_SLOTS = 15
MAX_OFFLINE_HOURS = 8

SHOP_ITEMS = {
    "buy_fairy_cat_1":    {"category": "creature", "cost": {"leaves": 0},  "creature_family": "fairy_cat",       "creature_level": 1},
    "buy_mushroom_1":     {"category": "creature", "cost": {"leaves": 10}, "creature_family": "mushroom_sprite", "creature_level": 1},
    "buy_unicorn_1":      {"category": "creature", "cost": {"leaves": 20}, "creature_family": "mini_unicorn",    "creature_level": 1},
    "buy_dragon_1":       {"category": "creature", "cost": {"leaves": 30}, "creature_family": "baby_dragon",     "creature_level": 1},
    "buy_fox_1":          {"category": "creature", "cost": {"leaves": 50, "dew": 5}, "creature_family": "forest_fox", "creature_level": 1},
    "boost_2x_60":        {"category": "booster",  "cost": {"dew": 50},   "effect": "2x_production_60min"},
    "extra_slots_5":      {"category": "slot",     "cost_stars": 50,       "slots": 5},
    "no_ads":             {"category": "cosmetic", "cost_stars": 75},
    "cosmetic_pack_moon": {"category": "cosmetic", "cost_stars": 100},
}

SUBSCRIPTION_BENEFITS = {
    "sprout":    {"multiplier": 1.2, "daily_creatures": 1, "extra_slots": 0, "no_ads": False},
    "grove":     {"multiplier": 1.5, "daily_creatures": 2, "extra_slots": 5, "no_ads": False},
    "enchanted": {"multiplier": 2.0, "daily_creatures": 5, "extra_slots": 10,"no_ads": True},
}

SUBSCRIPTION_PRICES = {
    "sprout":    150,
    "grove":     300,
    "enchanted": 500,
}

QUEST_TEMPLATES = [
    {"type": "merge",        "target_amount": 3,   "reward_leaves": 50,  "reward_dew": 5,  "reward_berries": 0},
    {"type": "merge",        "target_amount": 5,   "reward_leaves": 80,  "reward_dew": 8,  "reward_berries": 0},
    {"type": "merge",        "target_amount": 10,  "reward_leaves": 150, "reward_dew": 15, "reward_berries": 1},
    {"type": "collect",      "target_amount": 100, "reward_leaves": 100, "reward_dew": 10, "reward_berries": 0, "target_resource": "leaves"},
    {"type": "collect",      "target_amount": 50,  "reward_leaves": 0,   "reward_dew": 50, "reward_berries": 0, "target_resource": "dew"},
    {"type": "collect_type", "target_amount": 30,  "reward_leaves": 120, "reward_dew": 12, "reward_berries": 0, "target_resource": "leaves", "target_family": "fairy_cat"},
    {"type": "collect_type", "target_amount": 20,  "reward_leaves": 0,   "reward_dew": 30, "reward_berries": 0, "target_resource": "dew",    "target_family": "baby_dragon"},
]


def get_creature_def(family: str, level: int) -> dict:
    levels = CREATURE_FAMILIES.get(family, {}).get("levels", [])
    for lvl in levels:
        if lvl["level"] == level:
            return lvl
    raise ValueError(f"Unknown creature: {family} L{level}")


def get_subscription_multiplier(tier: str) -> float:
    return SUBSCRIPTION_BENEFITS.get(tier, {}).get("multiplier", 1.0)
