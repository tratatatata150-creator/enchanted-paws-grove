"""
Core game logic — operates on game_state dicts, no DB access.
"""
import json
import time
import random
import string
from typing import Optional
from .game_data import (
    CREATURE_FAMILIES, MAX_LEVEL, MAX_GRID_SIZE, DEFAULT_UNLOCKED_SLOTS,
    MAX_OFFLINE_HOURS, QUEST_TEMPLATES, get_creature_def, get_subscription_multiplier,
    SHOP_ITEMS,
)


# ─── IDs ──────────────────────────────────────────────────────────────────────
def make_creature_id() -> str:
    chars = string.ascii_lowercase + string.digits
    return "c_" + "".join(random.choices(chars, k=10)) + f"_{int(time.time()*1000)%100000}"


def make_referral_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


# ─── Default state ─────────────────────────────────────────────────────────────
def default_game_state(lang: str = "en") -> dict:
    grid = [None] * MAX_GRID_SIZE
    grid[0] = _new_creature("fairy_cat", 1)
    grid[1] = _new_creature("fairy_cat", 1)
    grid[2] = _new_creature("mushroom_sprite", 1)

    return {
        "grid": grid,
        "unlockedSlots": DEFAULT_UNLOCKED_SLOTS,
        "resources": {"leaves": 10, "dew": 0, "berries": 0},
        "level": 1,
        "experience": 0,
        "lastOnline": int(time.time() * 1000),
        "catchupBonus": {"leaves": 0, "dew": 0, "berries": 0},
        "discoveredCreatures": [
            {"family": "fairy_cat",       "level": 1, "discoveredAt": int(time.time() * 1000), "totalMerged": 0},
            {"family": "mushroom_sprite", "level": 1, "discoveredAt": int(time.time() * 1000), "totalMerged": 0},
        ],
        "buildings": [],
        "dailyQuests": generate_daily_quests(),
        "questLastReset": int(time.time() * 1000),
        "totalMerges": 0,
        "referralCode": "",  # set externally
        "referralCount": 0,
        "subscription": "none",
        "noAds": False,
    }


def _new_creature(family: str, level: int) -> dict:
    return {
        "id": make_creature_id(),
        "family": family,
        "level": level,
        "lastCollected": int(time.time() * 1000),
        "pendingResources": {"leaves": 0, "dew": 0, "berries": 0},
        "isCollecting": False,
    }


# ─── Offline bonus calculation ────────────────────────────────────────────────
def calculate_offline_bonus(state: dict, current_time_ms: int) -> dict:
    last_online = state.get("lastOnline", current_time_ms)
    offline_ms = min(current_time_ms - last_online, MAX_OFFLINE_HOURS * 3600 * 1000)
    if offline_ms < 30_000:
        return {"leaves": 0, "dew": 0, "berries": 0}

    offline_sec = offline_ms / 1000
    sub = state.get("subscription", "none")
    mult = get_subscription_multiplier(sub)

    leaves = dew = berries = 0
    for creature in state.get("grid", []):
        if not creature:
            continue
        try:
            cdef = get_creature_def(creature["family"], creature["level"])
        except ValueError:
            continue
        prod = cdef["production"]
        interval = cdef["interval_sec"]
        ticks = int(offline_sec / interval)
        leaves  += prod["leaves"]  * ticks
        dew     += prod["dew"]     * ticks
        berries += prod["berries"] * ticks

    return {
        "leaves":  int(leaves  * mult),
        "dew":     int(dew     * mult),
        "berries": int(berries * mult),
    }


# ─── Merge ─────────────────────────────────────────────────────────────────────
def perform_merge(state: dict, from_id: str, to_id: str) -> tuple[dict, dict]:
    """
    Returns (updated_state, merge_result).
    Raises ValueError with user-friendly message on failure.
    """
    grid = state["grid"]

    from_idx = next((i for i, c in enumerate(grid) if c and c["id"] == from_id), None)
    to_idx   = next((i for i, c in enumerate(grid) if c and c["id"] == to_id), None)

    if from_idx is None or to_idx is None:
        raise ValueError("Creature not found")

    from_c = grid[from_idx]
    to_c   = grid[to_idx]

    if from_c["family"] != to_c["family"] or from_c["level"] != to_c["level"]:
        raise ValueError("Creatures must be the same type and level to merge")

    if from_c["level"] >= MAX_LEVEL:
        raise ValueError("Already at max level")

    new_level = from_c["level"] + 1
    new_creature = _new_creature(from_c["family"], new_level)

    # Replace to_idx, clear from_idx
    new_grid = list(grid)
    new_grid[to_idx] = new_creature
    new_grid[from_idx] = None

    # XP
    xp_gained = new_level * 10
    exp = state.get("experience", 0) + xp_gained
    lvl = state.get("level", 1)
    while exp >= _xp_for_level(lvl + 1):
        exp -= _xp_for_level(lvl + 1)
        lvl += 1

    # Update collection
    disc = list(state.get("discoveredCreatures", []))
    existing = next((d for d in disc if d["family"] == from_c["family"] and d["level"] == new_level), None)
    if existing:
        existing["totalMerged"] += 1
    else:
        disc.append({
            "family": from_c["family"],
            "level": new_level,
            "discoveredAt": int(time.time() * 1000),
            "totalMerged": 1,
        })

    # Update quests
    quests = _update_quest_progress(state.get("dailyQuests", []), "merge", 1)

    new_state = {
        **state,
        "grid": new_grid,
        "experience": exp,
        "level": lvl,
        "totalMerges": state.get("totalMerges", 0) + 1,
        "discoveredCreatures": disc,
        "dailyQuests": quests,
    }

    result = {
        "newCreatureId": new_creature["id"],
        "newLevel": new_level,
        "xpGained": xp_gained,
    }

    return new_state, result


# ─── Collect ───────────────────────────────────────────────────────────────────
def perform_collect(state: dict, creature_id: str) -> tuple[dict, dict]:
    grid = state["grid"]
    idx = next((i for i, c in enumerate(grid) if c and c["id"] == creature_id), None)
    if idx is None:
        raise ValueError("Creature not found")

    creature = grid[idx]
    try:
        cdef = get_creature_def(creature["family"], creature["level"])
    except ValueError:
        raise ValueError("Invalid creature type")

    now_ms = int(time.time() * 1000)
    elapsed_sec = (now_ms - creature["lastCollected"]) / 1000
    ticks = int(elapsed_sec / cdef["interval_sec"])

    if ticks == 0:
        return state, {"leaves": 0, "dew": 0, "berries": 0}

    prod = cdef["production"]
    sub = state.get("subscription", "none")
    mult = get_subscription_multiplier(sub)

    earned = {
        "leaves":  int(prod["leaves"]  * ticks * mult),
        "dew":     int(prod["dew"]     * ticks * mult),
        "berries": int(prod["berries"] * ticks * mult),
    }

    # Building bonuses
    buildings = state.get("buildings", [])
    for b in buildings:
        if b.get("defId") == "cozy_cottage":
            earned["leaves"] = int(earned["leaves"] * 1.10)
        if b.get("defId") == "crystal_tower":
            earned["dew"] = int(earned["dew"] * 1.15)
        if b.get("defId") == "mushroom_hut":
            earned["leaves"] += 1
            earned["dew"] += 1

    resources = dict(state.get("resources", {}))
    resources["leaves"]  = resources.get("leaves",  0) + earned["leaves"]
    resources["dew"]     = resources.get("dew",     0) + earned["dew"]
    resources["berries"] = resources.get("berries", 0) + earned["berries"]

    new_grid = list(grid)
    new_grid[idx] = {**creature, "lastCollected": now_ms, "isCollecting": False}

    quests = _update_quest_progress(
        state.get("dailyQuests", []),
        "collect",
        earned["leaves"] + earned["dew"],
        creature["family"],
        earned,
    )

    new_state = {**state, "grid": new_grid, "resources": resources, "dailyQuests": quests}
    return new_state, earned


# ─── Shop ──────────────────────────────────────────────────────────────────────
def perform_buy(state: dict, item_id: str) -> tuple[dict, dict]:
    item = SHOP_ITEMS.get(item_id)
    if not item:
        raise ValueError("Unknown item")

    if item.get("cost_stars"):
        # Stars items are handled by payment flow, not here
        raise ValueError("Use payment flow for Stars items")

    cost = item.get("cost", {})
    resources = dict(state.get("resources", {}))

    # Check afford
    for res, amt in cost.items():
        if resources.get(res, 0) < amt:
            raise ValueError(f"Not enough {res}")

    # Deduct
    for res, amt in cost.items():
        resources[res] = resources.get(res, 0) - amt

    result = {}

    if item["category"] == "creature":
        # Find empty slot
        grid = list(state.get("grid", [None] * MAX_GRID_SIZE))
        unlocked = state.get("unlockedSlots", DEFAULT_UNLOCKED_SLOTS)
        empty_idx = next((i for i, c in enumerate(grid) if c is None and i < unlocked), None)
        if empty_idx is None:
            raise ValueError("No free slot")

        creature = _new_creature(item["creature_family"], item["creature_level"])
        grid[empty_idx] = creature

        disc = list(state.get("discoveredCreatures", []))
        if not any(d["family"] == item["creature_family"] and d["level"] == item["creature_level"] for d in disc):
            disc.append({
                "family": item["creature_family"],
                "level": item["creature_level"],
                "discoveredAt": int(time.time() * 1000),
                "totalMerged": 0,
            })

        new_state = {**state, "grid": grid, "resources": resources, "discoveredCreatures": disc}
        result = {"success": True, "newCreatureId": creature["id"], "message": "Creature added!"}
        return new_state, result

    elif item["category"] == "booster":
        new_state = {**state, "resources": resources}
        result = {"success": True, "message": "Booster applied!"}
        return new_state, result

    return state, {"success": False, "message": "Unknown category"}


def apply_stars_purchase(state: dict, item_id: str) -> dict:
    """Apply effects of a Stars-paid item to state."""
    item = SHOP_ITEMS.get(item_id)
    if not item:
        return state

    new_state = dict(state)

    if item["category"] == "slot":
        new_state["unlockedSlots"] = min(
            MAX_GRID_SIZE,
            new_state.get("unlockedSlots", DEFAULT_UNLOCKED_SLOTS) + item.get("slots", 5)
        )
    elif item["category"] == "cosmetic" and item_id == "no_ads":
        new_state["noAds"] = True

    return new_state


# ─── Daily Quests ──────────────────────────────────────────────────────────────
def generate_daily_quests(count: int = 4) -> list[dict]:
    """Pick random quests from templates."""
    templates = random.sample(QUEST_TEMPLATES, min(count, len(QUEST_TEMPLATES)))
    quests = []
    for tmpl in templates:
        q_id = "q_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        quest = {
            "id": q_id,
            "type": tmpl["type"],
            "targetAmount": tmpl["target_amount"],
            "currentAmount": 0,
            "rewardLeaves": tmpl["reward_leaves"],
            "rewardDew": tmpl["reward_dew"],
            "rewardBerries": tmpl["reward_berries"],
            "completed": False,
            "claimedAt": None,
        }
        if "target_resource" in tmpl:
            quest["targetResource"] = tmpl["target_resource"]
        if "target_family" in tmpl:
            quest["targetFamily"] = tmpl["target_family"]
        quests.append(quest)
    return quests


def refresh_quests_if_needed(state: dict) -> dict:
    now_ms = int(time.time() * 1000)
    last_reset = state.get("questLastReset", 0)
    if now_ms - last_reset > 24 * 3600 * 1000:
        return {
            **state,
            "dailyQuests": generate_daily_quests(),
            "questLastReset": now_ms,
        }
    return state


def _update_quest_progress(
    quests: list, event_type: str, amount: int,
    family: str = "", resources: dict = None
) -> list:
    resources = resources or {}
    updated = []
    for q in quests:
        if q.get("completed") or q.get("claimedAt"):
            updated.append(q)
            continue

        q = dict(q)
        if q["type"] == "merge" and event_type == "merge":
            q["currentAmount"] = min(q["currentAmount"] + amount, q["targetAmount"])
        elif q["type"] == "collect" and event_type == "collect":
            res_key = q.get("targetResource", "leaves")
            earned = resources.get(res_key, 0)
            q["currentAmount"] = min(q["currentAmount"] + earned, q["targetAmount"])
        elif q["type"] == "collect_type" and event_type == "collect" and q.get("targetFamily") == family:
            res_key = q.get("targetResource", "leaves")
            earned = resources.get(res_key, 0)
            q["currentAmount"] = min(q["currentAmount"] + earned, q["targetAmount"])

        q["completed"] = q["currentAmount"] >= q["targetAmount"]
        updated.append(q)
    return updated


def claim_quest(state: dict, quest_id: str) -> tuple[dict, dict]:
    quests = list(state.get("dailyQuests", []))
    quest = next((q for q in quests if q["id"] == quest_id), None)

    if not quest:
        raise ValueError("Quest not found")
    if not quest.get("completed"):
        raise ValueError("Quest not yet completed")
    if quest.get("claimedAt"):
        raise ValueError("Already claimed")

    reward = {
        "leaves":  quest.get("rewardLeaves", 0),
        "dew":     quest.get("rewardDew", 0),
        "berries": quest.get("rewardBerries", 0),
    }

    resources = dict(state.get("resources", {}))
    resources["leaves"]  = resources.get("leaves",  0) + reward["leaves"]
    resources["dew"]     = resources.get("dew",     0) + reward["dew"]
    resources["berries"] = resources.get("berries", 0) + reward["berries"]

    updated_quests = [
        {**q, "claimedAt": int(time.time() * 1000)} if q["id"] == quest_id else q
        for q in quests
    ]

    new_state = {**state, "resources": resources, "dailyQuests": updated_quests}
    return new_state, reward


# ─── Referral reward ───────────────────────────────────────────────────────────
def apply_referral_reward(state: dict) -> dict:
    """Give the referred user a free Fluffy Kit."""
    grid = list(state.get("grid", [None] * MAX_GRID_SIZE))
    unlocked = state.get("unlockedSlots", DEFAULT_UNLOCKED_SLOTS)
    empty_idx = next((i for i, c in enumerate(grid) if c is None and i < unlocked), None)

    if empty_idx is not None:
        creature = _new_creature("fairy_cat", 1)
        grid[empty_idx] = creature
        return {**state, "grid": grid}

    # No slot — give leaves instead
    resources = dict(state.get("resources", {}))
    resources["leaves"] = resources.get("leaves", 0) + 50
    return {**state, "resources": resources}


def apply_referrer_reward(state: dict) -> dict:
    """Give the referrer a bonus too."""
    grid = list(state.get("grid", [None] * MAX_GRID_SIZE))
    unlocked = state.get("unlockedSlots", DEFAULT_UNLOCKED_SLOTS)
    empty_idx = next((i for i, c in enumerate(grid) if c is None and i < unlocked), None)

    if empty_idx is not None:
        creature = _new_creature("fairy_cat", 1)
        grid[empty_idx] = creature
        return {**state, "grid": grid, "referralCount": state.get("referralCount", 0) + 1}

    resources = dict(state.get("resources", {}))
    resources["leaves"] = resources.get("leaves", 0) + 50
    return {**state, "resources": resources, "referralCount": state.get("referralCount", 0) + 1}


# ─── Helpers ───────────────────────────────────────────────────────────────────
def _xp_for_level(level: int) -> int:
    return int(100 * (1.4 ** (level - 1)))
