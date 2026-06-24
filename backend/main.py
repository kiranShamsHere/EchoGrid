from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from manager import ConnectionManager
from models import Message, JoinRequest
import json

app = FastAPI()

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
    # Step 1 — connect and announce
    await manager.connect(websocket, room, username)

    try:
        while True:
            # Step 2 — wait for incoming message
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

            # Step 3 — build and validate the message
            message = Message(
                type="chat",
                content=data.get("content", ""),
                sender=username,
                room=room,
            )

            # Step 4 — broadcast to everyone in the room
            await manager.broadcast(
                room=room,
                message=message.with_timestamp(),
                exclude=None,
            )

    except WebSocketDisconnect:
        # Step 5 — clean up on disconnect
        await manager.disconnect(websocket, room, username)