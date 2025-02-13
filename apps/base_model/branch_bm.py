from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class BranchBM(BaseModel):

    id:  Optional[int] = None
    branch_name: str 
    address: str 
    user: Optional[str] = None
    date_updated: Optional[datetime] = None
    date_created: Optional[datetime] = None
