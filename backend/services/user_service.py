from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user_model import User
from schemas.user_schema import UserCreate, Token
from repositories.user_repository import UserRepository
from core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

user_repo = UserRepository()

class UserService:
    def register_user(self, db: Session, user: UserCreate) -> User:
        db_user = user_repo.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        return user_repo.create_user(db, user=user)

    def authenticate_user(self, db: Session, user: UserCreate) -> Token:
        db_user = user_repo.get_user_by_email(db, email=user.email)
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user.id)}, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")
