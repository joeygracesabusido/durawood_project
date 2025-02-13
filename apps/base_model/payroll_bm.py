from pydantic import BaseModel
from typing import Optional

from datetime import datetime, date

class EmployeeDetails(BaseModel):
    
    Company: Optional[str] = None
    EmployeeID: Optional[str] = None
    LastName: Optional[str] = None
    FirstName: Optional[str] = None
    MiddleName: Optional[str] = None
    Position: Optional[str] = None
    Gender: Optional[str] = None
    Salaryrate: Optional[str] = None
    TaxCode: Optional[str] = None
    TIN: Optional[str] = None
    SSSN: Optional[str] = None
    PHICN: Optional[str] = None
    HDMFN: Optional[str] = None
    Tax: Optional[float] = None
    SSS: Optional[float] = None
    PHIC: Optional[float] = None
    HDMF: Optional[float] = None
    SSSemp: Optional[float] = None
    PHICemp: Optional[float] = None
    HDMFemp: Optional[float] = None
    Allowance: Optional[float] = None
    Date_hired: Optional[datetime] = None
    id: Optional[int] = None

    class Config:
        # orm_mode = True  # Enable orm_mode
        from_attributes = True  # Set from_attributes to True


    