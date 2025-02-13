from sqlmodel import Field, Session, SQLModel, create_engine,select,func,funcfilter,within_group,Relationship,Index
from typing import Optional


import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)


from apps.database.databases import connectionDB

from datetime import date, datetime, timezone



engine = connectionDB.conn()


class CustomerProfile(SQLModel, table=True):
    """This is to create customer Table"""
    __tablename__ = 'csutomer_profile'
    id: Optional[int] = Field(default=None, primary_key=True)
    bussiness_name: str = Field(index=True, unique=True)
    name_of_tax_payer: str = Field(default=None) 
    tin: str = Field(index=True, unique=True)
    rdo: str = Field(default = None)
    address: str = Field(default = None)
    tax_type: str = Field(default = None)
    description: str = Field(default = None)
    user: str = Field(default = None)
    date_updated: Optional[datetime] = Field(default=None)
    date_created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
   

    __table_args__ = (Index("idx_bussiness_name", "bussiness_name", unique=True),)
    __table_args__ = (Index("idx_tin", "tin", unique=True),)
   
def create_db_and_tables():
    
    SQLModel.metadata.create_all(engine)

#create_db_and_tables()
