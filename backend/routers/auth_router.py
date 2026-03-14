from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from schemas.user_schema import UserCreate, UserResponse, Token
from services.user_service import UserService
from db.database import get_db
from core.dependencies import get_current_user
from models.user_model import User

router = APIRouter(prefix="/auth", tags=["auth"])
user_service = UserService()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return user_service.register_user(db, user_in)

@router.post("/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    return user_service.authenticate_user(db, user_in)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
