from db.database import Base
from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship

# Association table for many-to-many relationship between Todo and Tag
todo_tags = Table(
    "todo_tags",
    Base.metadata,
    Column("todo_id", Integer, ForeignKey("todos.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)

    todos = relationship("Todo", secondary=todo_tags, back_populates="tags")
