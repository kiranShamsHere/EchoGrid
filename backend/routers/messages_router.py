from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from db_models import Message, User
from auth import decode_token

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/{room}")
def get_room_messages(room: str, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(Message.room == room)
        .order_by(Message.created_at.asc())
        .limit(50)
        .all()
    )

    return [
        {
            "type": "chat",
            "content": msg.content,
            "sender": msg.sender.username,
            "room": msg.room,
            "timestamp": msg.created_at.strftime("%H:%M"),
        }
        for msg in messages
    ]