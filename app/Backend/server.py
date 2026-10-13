from fastapi import FastAPI, APIRouter, Header, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Annotated
from datetime import datetime, timezone, timedelta, date
import uuid
import httpx

from emergentintegrations.llm.chat import LlmChat, UserMessage
import content

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
GEMINI_MODEL = "gemini-3-flash-preview"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
COIN_CORRECT = 10
COIN_WIN = 50
COIN_STREAK = 20
COIN_LESSON = 100
START_COINS = 200
PASS_BAR = 0.8  # %80 baraj

JOKERS = {
    "joker_50_50": {"id": "joker_50_50", "name": "%50 Eleme", "desc": "2 yanlış şıkkı siler", "cost": 30, "icon": "scissors"},
    "joker_extra_time": {"id": "joker_extra_time", "name": "Ekstra Zaman", "desc": "Süreye +10 saniye ekler", "cost": 25, "icon": "clock"},
    "joker_double_chance": {"id": "joker_double_chance", "name": "Çift Hak", "desc": "Yanlışta ikinci şans verir", "cost": 40, "icon": "heart"},
    "joker_hint": {"id": "joker_hint", "name": "AI İpucu", "desc": "Türkçe mantık ipucu verir", "cost": 20, "icon": "lightbulb"},
}

BOT_NAMES = ["Elif", "Mert", "Zeynep", "Can", "Deniz", "Ece", "Burak", "Selin", "Kaan", "Aslı"]
BOT_ACCURACY = {"A1": 0.65, "A2": 0.6, "B1": 0.58, "B2": 0.55, "C1": 0.5}


def now_utc():
    return datetime.now(timezone.utc)


def new_user_doc(email, name, picture):
    return {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": email,
        "display_name": name or (email.split("@")[0] if email else "Oyuncu"),
        "avatar_url": picture or "",
        "level": None,
        "placement_done": False,
        "coins": START_COINS,
        "streak_count": 0,
        "last_streak_date": None,
        "inventory": {k: 1 for k in JOKERS},  # start with 1 of each
        "created_at": now_utc(),
    }


def public_user(u):
    return {
        "user_id": u["user_id"],
        "email": u["email"],
        "display_name": u["display_name"],
        "avatar_url": u.get("avatar_url", ""),
        "level": u.get("level"),
        "placement_done": u.get("placement_done", False),
        "coins": u.get("coins", 0),
        "streak_count": u.get("streak_count", 0),
        "inventory": u.get("inventory", {}),
    }


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class SessionRequest(BaseModel):
    session_id: str


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@api_router.post("/auth/session")
async def auth_session(req: SessionRequest):
    async with httpx.AsyncClient(timeout=15) as cx:
        resp = await cx.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": req.session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = resp.json()
    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture")
    session_token = data.get("session_token")

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = new_user_doc(email, name, picture)
        await db.users.insert_one(dict(user))
    else:
        # keep latest picture/name
        await db.users.update_one({"email": email}, {"$set": {"display_name": user.get("display_name") or name, "avatar_url": user.get("avatar_url") or picture}})

    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user["user_id"],
        "created_at": now_utc(),
        "expires_at": now_utc() + timedelta(days=7),
    })
    return {"session_token": session_token, "user": public_user(user)}


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return {"user": public_user(user)}


@api_router.post("/auth/logout")
async def auth_logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Profile / Streak
# ---------------------------------------------------------------------------
@api_router.get("/me/profile")
async def me_profile(user=Depends(get_current_user)):
    return {"user": public_user(user)}


@api_router.post("/streak/claim")
async def streak_claim(user=Depends(get_current_user)):
    today = now_utc().date()
    last = user.get("last_streak_date")
    if last:
        last_date = date.fromisoformat(last) if isinstance(last, str) else last
    else:
        last_date = None

    if last_date == today:
        return {"claimed": False, "streak_count": user.get("streak_count", 0), "coins": user.get("coins", 0), "message": "Bugünkü seri ödülünü zaten aldın!"}

    if last_date == today - timedelta(days=1):
        streak = user.get("streak_count", 0) + 1
    else:
        streak = 1

    coins = user.get("coins", 0) + COIN_STREAK
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"streak_count": streak, "last_streak_date": today.isoformat(), "coins": coins}})
    return {"claimed": True, "streak_count": streak, "coins": coins, "reward": COIN_STREAK, "message": f"{streak} günlük seri! +{COIN_STREAK} coin 🔥"}


# ---------------------------------------------------------------------------
# Placement test
# ---------------------------------------------------------------------------
@api_router.get("/placement/questions")
async def placement_questions(user=Depends(get_current_user)):
    return {"questions": [{"id": q["id"], "prompt": q["prompt"], "options": q["options"]} for q in content.PLACEMENT]}


class PlacementSubmit(BaseModel):
    answers: Dict[str, str]  # question_id -> selected option


@api_router.post("/placement/submit")
async def placement_submit(req: PlacementSubmit, user=Depends(get_current_user)):
    score_by_level = {"A1": 0, "A2": 0, "B1": 0, "B2": 0, "C1": 0}
    correct = 0
    for q in content.PLACEMENT:
        if req.answers.get(q["id"]) == q["answer"]:
            correct += 1
            score_by_level[q["level"]] += 1

    # Determine the highest level where the user got both questions right, walking down.
    level = "A1"
    for lv in ["A1", "A2", "B1", "B2", "C1"]:
        if score_by_level[lv] >= 1:
            level = lv
    # refine by total correct
    if correct >= 9:
        level = "C1"
    elif correct >= 7:
        level = "B2"
    elif correct >= 5:
        level = "B1"
    elif correct >= 3:
        level = "A2"
    else:
        level = "A1"

    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"level": level, "placement_done": True}})
    return {"level": level, "correct": correct, "total": len(content.PLACEMENT)}


@api_router.post("/placement/skip")
async def placement_skip(user=Depends(get_current_user)):
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"level": "A1", "placement_done": True}})
    return {"level": "A1"}


# ---------------------------------------------------------------------------
# Lessons
# ---------------------------------------------------------------------------
@api_router.get("/lessons")
async def lessons(user=Depends(get_current_user)):
    progress = await db.lesson_progress.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(500)
    done_ids = {p["unit_id"] for p in progress if p.get("is_completed")}
    user_level = user.get("level") or "A1"
    level_rank = content.LEVELS.index(user_level)

    units = sorted(content.UNITS, key=lambda u: (content.LEVELS.index(u["level"]), u["order"]))
    out = []
    prev_done = True
    for i, u in enumerate(units):
        completed = u["id"] in done_ids
        u_level_rank = content.LEVELS.index(u["level"])
        # unlocked if its level <= user level AND previous unit completed (or first)
        unlocked = (u_level_rank <= level_rank) and (i == 0 or prev_done or completed)
        out.append({
            "id": u["id"], "level": u["level"], "order": u["order"],
            "title": u["title"], "desc": u["desc"],
            "completed": completed, "unlocked": unlocked,
            "score": next((p.get("quiz_score") for p in progress if p["unit_id"] == u["id"]), None),
        })
        prev_done = completed
    return {"units": out, "user_level": user_level}


@api_router.get("/lessons/{unit_id}")
async def lesson_detail(unit_id: str, user=Depends(get_current_user)):
    unit = next((u for u in content.UNITS if u["id"] == unit_id), None)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    quiz = content.get_quiz_questions(unit)
    return {"unit": {"id": unit["id"], "level": unit["level"], "title": unit["title"], "desc": unit["desc"], "teach": unit["teach"]}, "quiz": quiz}


class LessonComplete(BaseModel):
    unit_id: str
    correct: int
    total: int


@api_router.post("/lessons/complete")
async def lesson_complete(req: LessonComplete, user=Depends(get_current_user)):
    unit = next((u for u in content.UNITS if u["id"] == req.unit_id), None)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    ratio = (req.correct / req.total) if req.total else 0
    passed = ratio >= PASS_BAR
    reward = 0
    coins = user.get("coins", 0)
    if passed:
        existing = await db.lesson_progress.find_one({"user_id": user["user_id"], "unit_id": req.unit_id, "is_completed": True})
        if not existing:
            reward = COIN_LESSON
            coins += reward
        await db.lesson_progress.update_one(
            {"user_id": user["user_id"], "unit_id": req.unit_id},
            {"$set": {"is_completed": True, "quiz_score": round(ratio * 100), "updated_at": now_utc()}},
            upsert=True,
        )
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"coins": coins}})
    return {"passed": passed, "score": round(ratio * 100), "pass_bar": int(PASS_BAR * 100), "reward": reward, "coins": coins}


# ---------------------------------------------------------------------------
# Store / Inventory
# ---------------------------------------------------------------------------
@api_router.get("/store/items")
async def store_items(user=Depends(get_current_user)):
    return {"items": list(JOKERS.values()), "coins": user.get("coins", 0), "inventory": user.get("inventory", {})}


class BuyRequest(BaseModel):
    joker_id: str
    quantity: int = 1


@api_router.post("/store/buy")
async def store_buy(req: BuyRequest, user=Depends(get_current_user)):
    joker = JOKERS.get(req.joker_id)
    if not joker:
        raise HTTPException(status_code=404, detail="Joker not found")
    qty = max(1, req.quantity)
    cost = joker["cost"] * qty
    coins = user.get("coins", 0)
    if coins < cost:
        raise HTTPException(status_code=400, detail="Yetersiz coin")
    coins -= cost
    inv = user.get("inventory", {})
    inv[req.joker_id] = inv.get(req.joker_id, 0) + qty
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"coins": coins, "inventory": inv}})
    return {"coins": coins, "inventory": inv, "bought": req.joker_id, "quantity": qty}


class UseJokerRequest(BaseModel):
    joker_id: str


@api_router.post("/joker/use")
async def joker_use(req: UseJokerRequest, user=Depends(get_current_user)):
    inv = user.get("inventory", {})
    if inv.get(req.joker_id, 0) <= 0:
        raise HTTPException(status_code=400, detail="Bu jokerden yok")
    inv[req.joker_id] -= 1
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"inventory": inv}})
    return {"inventory": inv, "used": req.joker_id}


# ---------------------------------------------------------------------------
# Matchmaking / Battle
# ---------------------------------------------------------------------------
@api_router.post("/match/start")
async def match_start(user=Depends(get_current_user)):
    level = user.get("level") or "A1"
    questions = content.get_match_questions(level)
    match_id = f"match_{uuid.uuid4().hex[:10]}"
    bot_name = random.choice(BOT_NAMES)
    bot = {
        "name": bot_name,
        "avatar_url": "",
        "accuracy": BOT_ACCURACY.get(level, 0.55),
        "is_bot": True,
    }
    await db.matches.insert_one({
        "match_id": match_id,
        "player1_id": user["user_id"],
        "player2_id": f"bot_{bot_name}",
        "level": level,
        "status": "active",
        "winner_id": None,
        "coins_earned": 0,
        "created_at": now_utc(),
    })
    return {"match_id": match_id, "level": level, "opponent": bot, "questions": questions, "max_jokers": 2}


class MatchFinish(BaseModel):
    match_id: str
    player_correct: int
    opponent_correct: int
    player_score: int
    opponent_score: int


@api_router.post("/match/finish")
async def match_finish(req: MatchFinish, user=Depends(get_current_user)):
    won = req.player_score >= req.opponent_score and req.player_score > 0 or req.player_score > req.opponent_score
    won = req.player_score > req.opponent_score or (req.player_score == req.opponent_score and req.player_correct >= req.opponent_correct)
    coins = user.get("coins", 0)
    earned = req.player_correct * COIN_CORRECT
    if won:
        earned += COIN_WIN
    coins += earned
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"coins": coins}})
    await db.matches.update_one({"match_id": req.match_id}, {"$set": {"status": "finished", "winner_id": user["user_id"] if won else req.match_id, "coins_earned": earned, "finished_at": now_utc()}})
    return {"won": won, "coins_earned": earned, "coins": coins}


# ---------------------------------------------------------------------------
# AI: hint + chat (Gemini 3 Flash)
# ---------------------------------------------------------------------------
async def gemini_reply(session_id: str, system_message: str, user_text: str) -> str:
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system_message).with_model("gemini", GEMINI_MODEL)
    resp = await chat.send_message(UserMessage(text=user_text))
    return resp if isinstance(resp, str) else str(resp)


class HintRequest(BaseModel):
    prompt: str
    options: Optional[List[str]] = None
    qtype: Optional[str] = None


@api_router.post("/ai/hint")
async def ai_hint(req: HintRequest, user=Depends(get_current_user)):
    level = user.get("level") or "A1"
    system = (
        "Sen bir İngilizce öğretmeni asistanısın. Türkçe konuşan bir öğrenciye, verilen İngilizce soru için "
        "KISA (en fazla 2 cümle) bir Türkçe MANTIK ipucu ver. ASLA doğru cevabı doğrudan söyleme; sadece nasıl "
        "düşünmesi gerektiğine dair yol göster. Enerjik ve cesaretlendirici ol."
    )
    opts = f"\nŞıklar: {', '.join(req.options)}" if req.options else ""
    text = f"Öğrenci seviyesi: {level}. Soru: {req.prompt}{opts}\nBu soru için kısa bir Türkçe ipucu ver."
    try:
        hint = await gemini_reply(f"hint_{user['user_id']}_{uuid.uuid4().hex[:6]}", system, text)
    except Exception as e:
        logger.error(f"hint error: {e}")
        hint = "İpucu şu an alınamadı, cümlenin yapısına ve zamanına dikkat et!"
    return {"hint": hint.strip()}


class ChatRequest(BaseModel):
    session_id: str
    message: str


@api_router.post("/ai/chat")
async def ai_chat(req: ChatRequest, user=Depends(get_current_user)):
    level = user.get("level") or "A1"
    level_style = {
        "A1": "Çok basit kelimeler ve kısa cümleler kullan.",
        "A2": "Basit ama biraz daha uzun cümleler kullan.",
        "B1": "Orta seviye, günlük ve iş İngilizcesi kullan.",
        "B2": "Akıcı ve çeşitli yapılar kullan.",
        "C1": "Zengin kelime hazinesi, deyimler ve karmaşık yapılar kullan.",
    }[level]
    system = (
        "You are a friendly, energetic English conversation partner for a Turkish learner. "
        f"The learner's level is {level}. {level_style} "
        "Reply in ENGLISH, keep it natural and conversational (1-3 sentences), and always ask a follow-up question to keep the chat going. "
        "If the learner's last message has an English grammar or vocabulary mistake, add EXACTLY ONE short correction on a NEW last line in this format: "
        "(Grammar Note: <kısa Türkçe açıklama>). If there is no mistake, do NOT add any Grammar Note line."
    )
    # persist user message
    await db.chat_messages.insert_one({"user_id": user["user_id"], "session_id": req.session_id, "role": "user", "text": req.message, "created_at": now_utc()})
    try:
        reply = await gemini_reply(f"chat_{req.session_id}", system, req.message)
    except Exception as e:
        logger.error(f"chat error: {e}")
        reply = "Sorry, I had a little hiccup! Can you say that again?"
    await db.chat_messages.insert_one({"user_id": user["user_id"], "session_id": req.session_id, "role": "assistant", "text": reply, "created_at": now_utc()})
    return {"reply": reply.strip()}


@api_router.get("/ai/chat/history")
async def chat_history(session_id: str, user=Depends(get_current_user)):
    msgs = await db.chat_messages.find({"user_id": user["user_id"], "session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return {"messages": [{"role": m["role"], "text": m["text"]} for m in msgs]}


@api_router.get("/")
async def root():
    return {"message": "English Clash & Learn API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("user_id")
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.lesson_progress.create_index([("user_id", 1), ("unit_id", 1)])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
