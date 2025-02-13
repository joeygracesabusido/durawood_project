from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class CompanyProfileBM(BaseModel):


    id: Optional[int] = None
    company_name: str 
    tin: str
    address: str 
    rdo: str 
    type_of_bussiness: str 
    financial_year_end: str
    user: Optional[str] = None
    date_updated: Optional[datetime] = None
    date_created: Optional[datetime] = None
   
