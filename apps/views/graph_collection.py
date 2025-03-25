import strawberry
from typing import Optional,List, Dict

from datetime import date, datetime

#from apps.views.accounting.journal_entry_views import JournalEntryViews

import re


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()

@strawberry.type
class PaymentList:
    id: str
    date: datetime
    customer: str 
    customer_id: str 
    invoice_no: str
    cr_no: str
    cash_amount: float
    amount_2307: float
    remarks: str
    user: str
    date_updated: datetime
    date_created: datetime
    payment_method: str


@strawberry.type
class Query:
    
    @strawberry.field
    async def get_collection_list(
        self
    ) -> List[PaymentList]:
        try:
            result = mydb.payment.find().sort("date_update", -1)


            return [
                PaymentList(
                    id=str(r['_id']),
                    date=r['date'],
                    customer=r['customer'],
                    customer_id=r['customer_id'],
                    invoice_no=r['invoice_no'],
                    cr_no=r['cr_no'],
                    cash_amount=r['cash_amount'],
                    amount_2307=r['amount_2307'],
                    remarks=r['remarks'],
                    user=r['user'],
                    payment_method=r['payment_method'],
                    date_updated=r['date_updated'],
                    date_created=r['date_created']

                ) for r in result
            ]

        except Exception as e:
            raise Exception(f"Error retrieving customer balance: {e}")
