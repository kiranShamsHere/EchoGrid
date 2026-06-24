from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class Message(BaseModel):
    type: Literal["chat", "system", "error"]
    content: str
    sender: str
    room: str
    timestamp: str = ""

    def with_timestamp(self) -> dict:
        return {
            **self.model_dump(),
            "timestamp": datetime.utcnow().strftime("%H:%M"),
        }


class JoinRequest(BaseModel):
    username: str
    room: str