from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        # rooms is a dict: room_name -> list of connected WebSockets
        # e.g. {"general": [ws1, ws2], "random": [ws3]}
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str, username: str):
        await websocket.accept()

        # Create the room if it doesn't exist yet
        if room not in self.rooms:
            self.rooms[room] = []

        self.rooms[room].append(websocket)

        # Announce to the room that someone joined
        await self.broadcast(
            room=room,
            message={
                "type": "system",
                "content": f"{username} joined the room",
                "sender": "EchoGrid",
                "room": room,
            },
            exclude=None,
        )

    async def disconnect(self, websocket: WebSocket, room: str, username: str):
        if room in self.rooms:
            self.rooms[room].remove(websocket)

            # Clean up empty rooms
            if not self.rooms[room]:
                del self.rooms[room]

        # Announce that they left
        await self.broadcast(
            room=room,
            message={
                "type": "system",
                "content": f"{username} left the room",
                "sender": "EchoGrid",
                "room": room,
            },
            exclude=None,
        )

    async def broadcast(self, room: str, message: dict, exclude: WebSocket = None):
        # Send message to every client in the room except the excluded one
        if room not in self.rooms:
            return

        for connection in self.rooms[room]:
            if connection != exclude:
                await connection.send_json(message)

    def get_room_count(self, room: str) -> int:
        # How many users are currently in a room
        return len(self.rooms.get(room, []))

    def get_all_rooms(self) -> List[str]:
        # List of all active room names
        return list(self.rooms.keys())