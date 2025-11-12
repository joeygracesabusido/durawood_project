from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ExpenseBM(BaseModel):
    date: datetime
    category: str
    vendor: str
    description: str
    amount: float
    payment_method: str
    reference_no: Optional[str] = None
    remarks: Optional[str] = None
    user: Optional[str] = None
    date_created: Optional[datetime] = None
    date_updated: Optional[datetime] = None
    attachments: Optional[List[str]] = None
    status: Optional[str] = "Approved"  # Approved, Pending, Rejected

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-11-12T00:00:00",
                "category": "Office Supplies",
                "vendor": "Office Depot",
                "description": "Printer ink and paper",
                "amount": 250.50,
                "payment_method": "Check",
                "reference_no": "CHK-001",
                "remarks": "Monthly office supplies",
                "status": "Approved"
            }
        }
