from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_color = Column(String(20), default="#8B5CF6")
    is_online = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sent_messages = relationship("Message", back_populates="sender")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    room = Column(String(100), nullable=False, index=True)
    type = Column(String(20), default="chat")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign key to users
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sender = relationship("User", back_populates="sent_messages")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Stores both participants as a sorted string e.g. "kiran_sara"
    room_id = Column(String(200), unique=True, nullable=False, index=True)
    participant_one = Column(String(50), nullable=False)
    participant_two = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)