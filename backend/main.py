from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from manager import ConnectionManager
from models import Message, JoinRequest
from database import SessionLocal
from db_models import Message, User
from models import Message as EchoMessage
from database import engine
from db_models import Base
from routers.auth_router import router as auth_router
from routers.messages_router import router as messages_router

import json

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router)
app.include_router(messages_router)
# ... rest of file unchanged

# Allow the React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()


@app.get("/")
async def root():
    return {"app": "EchoGrid", "status": "running"}


@app.get("/rooms")
async def get_rooms():
    return {
        "rooms": manager.get_all_rooms(),
        "counts": {
            room: manager.get_room_count(room)
            for room in manager.get_all_rooms()
        }
    }


@app.websocket("/ws/{room}/{username}")
async def websocket_endpoint(
    websocket: WebSocket,
    room: str,
    username: str
):
    await manager.connect(websocket, room, username)

    # Load and send message history to the newly joined user
    db = SessionLocal()
    try:
        history = (
            db.query(Message)
            .filter(Message.room == room)
            .order_by(Message.created_at.asc())
            .limit(50)
            .all()
        )
        for msg in history:
            await websocket.send_json({
                "type": "chat",
                "content": msg.content,
                "sender": msg.sender.username,
                "room": msg.room,
                "timestamp": msg.created_at.strftime("%H:%M"),
            })
    finally:
        db.close()

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "content": "Invalid message format",
                    "sender": "EchoGrid",
                    "room": room,
                    "timestamp": "",
                })
                continue

            # Build message
            message = EchoMessage(
                type="chat",
                content=data.get("content", ""),
                sender=username,
                room=room,
            )

            # Save to database
            db = SessionLocal()
            try:
                user = db.query(User).filter(
                    User.username == username
                ).first()

                if user:
                    db_message = Message(
                        content=message.content,
                        room=room,
                        type="chat",
                        sender_id=user.id,
                    )
                    db.add(db_message)
                    db.commit()
            finally:
                db.close()

            # Broadcast to room
            await manager.broadcast(
                room=room,
                message=message.with_timestamp(),
                exclude=None,
            )

    except WebSocketDisconnect:
        await manager.disconnect(websocket, room, username)