
from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship,Index
from typing import Optional


import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)


from apps.database.databases import connectionDB

from datetime import date, datetime

engine = connectionDB.conn()


class AccountType(SQLModel, table=True):
    """This is to create user Table"""
    __tablename__ = 'account_type'
    id: Optional[int] = Field(default=None, primary_key=True)
    account_type: str = Field(index=True, unique=True)
   

    __table_args__ = (Index("idx_account_type", "account_type", unique=True),)





def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)

create_db_and_tables()