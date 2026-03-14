from typing import Optional, List
from sqlalchemy.orm import Session
from schemas.todo_schema import ToDoCreate, ToDoUpdate, ToDoResponse, PaginatedToDos
from repositories.todo_repository import ToDoRepository
from fastapi import HTTPException

todo_repo = ToDoRepository()

class ToDoService:
    def get_todos(self, db: Session, owner_id: int, is_done: Optional[bool], q: Optional[str], sort: Optional[str], limit: int, offset: int) -> PaginatedToDos:
        items, total = todo_repo.get_all(db, owner_id, is_done, q, sort, limit, offset)
        return PaginatedToDos(
            items=items,
            total=total,
            limit=limit,
            offset=offset
        )

    def get_todo_by_id(self, db: Session, todo_id: int, owner_id: int) -> ToDoResponse:
        todo = todo_repo.get_by_id(db, todo_id, owner_id)
        if not todo:
            raise HTTPException(status_code=404, detail="ToDo not found")
        return todo

    def create_todo(self, db: Session, todo_in: ToDoCreate, owner_id: int) -> ToDoResponse:
        return todo_repo.create(db, todo_in, owner_id)

    def update_todo(self, db: Session, todo_id: int, todo_in: ToDoCreate, owner_id: int) -> ToDoResponse:
        # Full object replacement expected on PUT except server overrides defaults
        update_data = ToDoUpdate(title=todo_in.title, description=todo_in.description, is_done=todo_in.is_done)
        updated = todo_repo.update(db, todo_id, update_data, owner_id)
        if not updated:
            raise HTTPException(status_code=404, detail="ToDo not found")
        return updated

    def patch_todo(self, db: Session, todo_id: int, todo_in: ToDoUpdate, owner_id: int) -> ToDoResponse:
        updated = todo_repo.update(db, todo_id, todo_in, owner_id)
        if not updated:
            raise HTTPException(status_code=404, detail="ToDo not found")
        return updated

    def complete_todo(self, db: Session, todo_id: int, owner_id: int) -> ToDoResponse:
        updated = todo_repo.update(db, todo_id, ToDoUpdate(is_done=True), owner_id)
        if not updated:
            raise HTTPException(status_code=404, detail="ToDo not found")
        return updated

    def delete_todo(self, db: Session, todo_id: int, owner_id: int) -> dict:
        deleted = todo_repo.delete(db, todo_id, owner_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="ToDo not found")
        return {"message": "ToDo deleted successfully"}
