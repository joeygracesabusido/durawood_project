
from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship,Index
from typing import Optional
from decimal import Decimal


import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)


from apps.database.databases import connectionDB

from datetime import date, datetime, timezone

from apps.models.accounting.chart_of_account import ChartofAccount

from apps.models.accounting.branch import Branch


engine = connectionDB.conn()


class JournalEntry(SQLModel, table=True):
    """This is to  Table"""
    __tablename__ = 'journal_entry'
    id: Optional[int] = Field(default=None, primary_key=True)
    transdate: date = Field(default=None)
    journal_type: str = Field(default = None)
    reference: str = Field(default = None)
    description: str = Field(default = None)
    chart_of_account_code: str = Field(default = None)
    chart_of_account: str = Field(default = None)
    account_code_id: Optional[int] = Field(default=None, foreign_key="chart_of_account.id")
    debit: Decimal = Field(default=0, max_digits=20, decimal_places=2)
    credit: Decimal = Field(default=0, max_digits=20, decimal_places=2)
    branch_id:Optional[int] = Field(default=None, foreign_key="branch.id")
    user: str = Field(default = None)
    date_updated: Optional[datetime] = Field(default=None)
    date_created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
   

    # __table_args__ = (Index("idx_account_type", "chart_of_account", unique=True),)
    # __table_args__ = (Index("idx_chart_of_account_code", "chart_of_account_code", unique=True),)




def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)

create_db_and_tables()
