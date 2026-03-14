from typing import List, Optional
from sqlalchemy.orm import Session
from models.todo_model import Todo
from schemas.todo_schema import ToDoCreate, ToDoUpdate

class ToDoRepository:
    def get_all(self, db: Session, owner_id: int, is_done: Optional[bool] = None, q: Optional[str] = None, sort: Optional[str] = None, limit: int = 10, offset: int = 0) -> tuple[List[Todo], int]:
        query = db.query(Todo).filter(Todo.owner_id == owner_id)

        if is_done is not None:
            query = query.filter(Todo.is_done == is_done)
        
        if q:
            query = query.filter(Todo.title.ilike(f"%{q}%"))

        if sort == "created_at":
            query = query.order_by(Todo.created_at.asc())
        elif sort == "-created_at":
            query = query.order_by(Todo.created_at.desc())

        total = query.count()
        items = query.offset(offset).limit(limit).all()
        
        return items, total
        
    def get_by_id(self, db: Session, todo_id: int, owner_id: int) -> Optional[Todo]:
        return db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == owner_id).first()

    def create(self, db: Session, todo_in: ToDoCreate, owner_id: int) -> Todo:
        db_todo = Todo(
            title=todo_in.title,
            description=todo_in.description,
            is_done=todo_in.is_done,
            owner_id=owner_id
        )
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return db_todo

    def update(self, db: Session, todo_id: int, todo_in: ToDoUpdate, owner_id: int) -> Optional[Todo]:
        db_todo = self.get_by_id(db, todo_id, owner_id)
        if not db_todo:
            return None
            
        update_data = todo_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_todo, key, value)
            
        db.commit()
        db.refresh(db_todo)
        return db_todo

    def delete(self, db: Session, todo_id: int, owner_id: int) -> bool:
        db_todo = self.get_by_id(db, todo_id, owner_id)
        if not db_todo:
            return False
        db.delete(db_todo)
        db.commit()
        return True
