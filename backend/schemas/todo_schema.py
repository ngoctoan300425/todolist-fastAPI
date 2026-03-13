from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ToDoBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100, description="Title of the ToDo")
    description: Optional[str] = None
    is_done: bool = False

class ToDoCreate(ToDoBase):
    pass

class ToDoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    is_done: Optional[bool] = None

class ToDoResponse(ToDoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedToDos(BaseModel):
    items: List[ToDoResponse]
    total: int
    limit: int
    offset: int
