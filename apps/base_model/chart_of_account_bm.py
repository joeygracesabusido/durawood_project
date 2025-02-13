from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ChartofAccountBM(BaseModel):
    id: Optional[int] = None  # Make id optional
    chart_of_account_code: str 
    chart_of_account: str 
    accoun_type_id: Optional[int] = None
    description: Optional[str] = None  # Make description optional
    user: Optional[str] = None  # Make user optional
    date_updated: Optional[datetime] = None  # Make date_updated optional
    date_created: Optional[datetime] = None  # Make date_created optional

# Define a Pydantic model for the input data
class ChartofAccountUpdateRequest(BaseModel):
    accoun_type_id: int
    chart_of_account: str
    chart_of_account_code: str
    description: Optional[str]
    date_updated: Optional[datetime] = None
    user: str
    
   
