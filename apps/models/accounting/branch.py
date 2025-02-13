from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship,Index
from typing import Optional


import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)


from apps.database.databases import connectionDB

from datetime import date, datetime, timezone

from apps.models.accounting.account_type import AccountType

engine = connectionDB.conn()


class Branch(SQLModel, table=True):
    """This is to create user Table"""
    __tablename__ = 'branch'
    id: Optional[int] = Field(default=None, primary_key=True)
    branch_name: str = Field(index=True, unique=True)
    address: str = Field(default = None)
    user: str = Field(default = None)
    date_updated: Optional[datetime] = Field(default=None)
    date_created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
   

    __table_args__ = (Index("idx_branch_name", "branch_name", unique=True),)
   
def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)

create_db_and_tables()



