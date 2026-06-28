from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}
        self.online_users: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, room: str, username: str):
        await websocket.accept()

        if room not in self.rooms:
            self.rooms[room] = []

        self.rooms[room].append(websocket)
        self.online_users[username] = websocket

        # Announce to others — exclude the joining user
        await self.broadcast(
            room=room,
            message={
                "type": "system",
                "content": f"{username} joined the room",
                "sender": "EchoGrid",
                "room": room,
                "timestamp": "",
            },
            exclude=websocket,
        )

        # Broadcast updated room count to everyone including joiner
        await self.broadcast(
            room=room,
            message={
                "type": "room_info",
                "count": self.get_room_count(room),
                "room": room,
                "sender": "EchoGrid",
                "content": "",
                "timestamp": "",
            },
            exclude=None,
        )

    async def disconnect(self, websocket: WebSocket, room: str, username: str):
        if room in self.rooms:
            self.rooms[room].remove(websocket)
            if not self.rooms[room]:
                del self.rooms[room]

        if self.online_users.get(username) == websocket:
            del self.online_users[username]

        # Announce to remaining users
        await self.broadcast(
            room=room,
            message={
                "type": "system",
                "content": f"{username} left the room",
                "sender": "EchoGrid",
                "room": room,
                "timestamp": "",
            },
            exclude=None,
        )

        # Broadcast updated count to remaining users
        await self.broadcast(
            room=room,
            message={
                "type": "room_info",
                "count": self.get_room_count(room),
                "room": room,
                "sender": "EchoGrid",
                "content": "",
                "timestamp": "",
            },
            exclude=None,
        )

    async def broadcast(self, room: str, message: dict, exclude: WebSocket = None):
        if room not in self.rooms:
            return
        for connection in self.rooms[room]:
            if connection != exclude:
                await connection.send_json(message)

    def get_room_count(self, room: str) -> int:
        return len(self.rooms.get(room, []))

    def get_all_rooms(self) -> List[str]:
        return list(self.rooms.keys())

    def get_online_users(self) -> List[str]:
        return list(self.online_users.keys())