from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from db_models import User
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Request schemas ──────────────────────────────────────────
class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Response schema ──────────────────────────────────────────
class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str


# ── Signup ───────────────────────────────────────────────────
@router.post("/signup", response_model=AuthResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    # Check username taken
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Check email taken
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate username length
    if len(body.username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters"
        )

    # Validate password length
    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )

    # Create user
    user = User(
        username=body.username.lower().strip(),
        email=body.email.lower().strip(),
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue token
    token = create_access_token({"sub": user.username, "email": user.email})

    return AuthResponse(
        access_token=token,
        username=user.username,
        email=user.email,
    )


# ── Login ────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Issue token
    token = create_access_token({"sub": user.username, "email": user.email})

    return AuthResponse(
        access_token=token,
        username=user.username,
        email=user.email,
    )


# ── Me (get current user from token) ─────────────────────────
@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    from auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user.username, "email": user.email}