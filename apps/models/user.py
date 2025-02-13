
from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship,Index
from typing import Optional


import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)


from database.databases import connectionDB

from datetime import date, datetime, timezone

engine = connectionDB.conn()


from enum import Enum

class UserRole(str, Enum):
    DEVELOPER = 'developer'
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class User(SQLModel, table=True):
    """This is to create user Table"""
    __tablename__ = 'user'
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str = Field(nullable=False)
    email_add: str = Field(nullable=False)
    full_name: str = Field(max_length=70, default=None)
    role: UserRole = Field(sa_column_kwargs={"nullable": False})
    is_active: bool = Field(default=False)
    date_updated: Optional[datetime] = Field(default=None)
    date_created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (Index("idx_user_unique", "username", unique=True),)
    __table_args__ = (Index("idx_full_name", "full_name", unique=True),)





def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)

create_db_and_tables()