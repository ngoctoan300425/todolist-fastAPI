from fastapi import APIRouter, Query, status, Depends
from typing import Optional, List
from sqlalchemy.orm import Session
from schemas.todo_schema import ToDoCreate, ToDoUpdate, ToDoResponse, PaginatedToDos
from services.todo_service import ToDoService
from db.database import get_db
from core.dependencies import get_current_user
from models.user_model import User

router = APIRouter(prefix="/todos", tags=["todos"])
todo_service = ToDoService()

@router.post("", response_model=ToDoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo_in: ToDoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.create_todo(db, todo_in, current_user.id)

@router.get("", response_model=PaginatedToDos)
def get_todos(
    is_done: Optional[bool] = Query(None, description="Filter by True or False status"),
    q: Optional[str] = Query(None, description="Filter by title contents keyword"),
    sort: Optional[str] = Query(None, description="Sort direction. '-created_at' or 'created_at'"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return todo_service.get_todos(db, current_user.id, is_done, q, sort, limit, offset)

@router.get("/overdue", response_model=List[ToDoResponse])
def get_overdue_todos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.get_overdue_todos(db, current_user.id)

@router.get("/today", response_model=List[ToDoResponse])
def get_today_todos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.get_today_todos(db, current_user.id)

@router.get("/{todo_id}", response_model=ToDoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.get_todo_by_id(db, todo_id, current_user.id)

@router.put("/{todo_id}", response_model=ToDoResponse)
def update_todo(todo_id: int, todo_in: ToDoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.update_todo(db, todo_id, todo_in, current_user.id)

@router.patch("/{todo_id}", response_model=ToDoResponse)
def patch_todo(todo_id: int, todo_in: ToDoUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.patch_todo(db, todo_id, todo_in, current_user.id)

@router.post("/{todo_id}/complete", response_model=ToDoResponse)
def complete_todo(todo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.complete_todo(db, todo_id, current_user.id)

@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return todo_service.delete_todo(db, todo_id, current_user.id)
