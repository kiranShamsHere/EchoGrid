from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from db_models import User, Message, Conversation
from manager import ConnectionManager

router = APIRouter(prefix="/users", tags=["users"])

# We'll inject the manager instance from main.py
_manager: ConnectionManager = None

def set_manager(m: ConnectionManager):
    global _manager
    _manager = m


@router.get("/online")
def get_online_users():
    if not _manager:
        return {"users": []}
    return {"users": _manager.get_online_users()}


@router.get("/all")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"username": u.username, "email": u.email} for u in users]


@router.get("/conversations/{username}")
def get_conversations(username: str, db: Session = Depends(get_db)):
    convos = db.query(Conversation).filter(
        (Conversation.participant_one == username) |
        (Conversation.participant_two == username)
    ).all()

    result = []
    for c in convos:
        other = c.participant_two if c.participant_one == username else c.participant_one

        # Get last message in this conversation
        last_msg = (
            db.query(Message)
            .filter(Message.room == c.room_id)
            .order_by(Message.created_at.desc())
            .first()
        )

        result.append({
            "room_id": c.room_id,
            "other_user": other,
            "last_message": last_msg.content if last_msg else "",
            "last_time": last_msg.created_at.strftime("%H:%M") if last_msg else "",
        })

    return result