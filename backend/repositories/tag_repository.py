from sqlalchemy.orm import Session
from models.tag_model import Tag
from typing import Optional

class TagRepository:
    def get_by_name(self, db: Session, name: str) -> Optional[Tag]:
        return db.query(Tag).filter(Tag.name == name).first()

    def create(self, db: Session, name: str) -> Tag:
        db_tag = Tag(name=name)
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
        return db_tag
