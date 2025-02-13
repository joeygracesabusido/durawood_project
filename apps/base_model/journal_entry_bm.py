from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class JournalEntryBM(BaseModel):
    id: Optional[int]= None
    transdate: date
    journal_type: str 
    reference: str 
    description: str
    chart_of_account_code: str 
    chart_of_account: str 
    account_code_id: int
    debit: float 
    credit: float
    branch_id: int
    user: Optional[str] = None
    date_updated: Optional[datetime]
    date_created: Optional[datetime]

    class Config:
        # orm_mode = True  # Enable orm_mode
        from_attributes = True  # Set from_attributes to True

