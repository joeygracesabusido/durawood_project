
from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship,Index
from typing import Optional


import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)


from apps.database.databases import connectionDB

from datetime import date, datetime, timezone

from apps.models.accounting.journal_entry import JournalEntry
# from apps.models.accounting.branch import Branch
from apps.models.accounting.customer_profile import CustomerProfile

engine = connectionDB.conn()


class Sales(SQLModel, table=True):
    """This is to  Table"""
    __tablename__ = 'sales'
    id: Optional[int] = Field(default=None, primary_key=True)
    journal_entry_code_id: Optional[int] = Field(default=None, foreign_key="journal_entry.id")
    customer_profile_id: Optional[int] = Field(default=None, foreign_key="csutomer_profile.id")
    user: str = Field(default = None)
    date_updated: Optional[datetime] = Field(default=None)
    date_created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # __table_args__ = (Index("idx_account_type", "chart_of_account", unique=True),)
    # __table_args__ = (Index("idx_chart_of_account_code", "chart_of_account_code", unique=True),)



def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)

create_db_and_tables()
