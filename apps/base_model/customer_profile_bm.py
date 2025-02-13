from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class CustomerProfileBM(BaseModel):

    id: Optional[int] = None
    bussiness_name: str 
    name_of_tax_payer: str 
    tin: str
    rdo: str
    address: str
    tax_type: str
    description: str
    user: Optional[str] = None
    date_updated: Optional[datetime] = None
    date_created:  Optional[datetime] = None
