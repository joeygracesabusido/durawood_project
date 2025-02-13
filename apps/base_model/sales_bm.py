from pydantic import BaseModel
from typing import Optional

from datetime import datetime

class SalesBM(BaseModel):
    
    id: Optional[int] = None
    journal_entry_code_id: Optional[int] 
    customer_profile_id: Optional[int]
    user: Optional[str] = None
    date_updated: Optional[datetime] = None
    date_created: Optional[datetime] = None

    class Config:
        # orm_mode = True  # Enable orm_mode
        from_attributes = True  # Set from_attributes to True


    