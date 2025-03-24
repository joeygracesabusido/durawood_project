import strawberry
from typing import Optional,List, Dict

from datetime import date, datetime

#from apps.views.accounting.journal_entry_views import JournalEntryViews

import re


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()

@strawberry.type
class CustomerBalance:
    customer: str
    total_balance: float

@strawberry.type
class Query:
    
    @strawberry.field
    async def get_customer_balance(
        self,
        customer: Optional[str] = None
    ) -> List[CustomerBalance]:
        try:
            pipeline = [
                {
                    "$lookup": {
                        "from": "payment",
                        "let": { "invoice_no": "$invoice_no" },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": { "$eq": ["$invoice_no", "$$invoice_no"] }
                                }
                            },
                            {
                                "$group": {
                                    "_id": "$invoice_no",
                                    "total_cash": { "$sum": "$cash_amount" },
                                    "total_2307": { "$sum": "$amount_2307" }
                                }
                            }
                        ],
                        "as": "payment_info"
                    }
                },
                {
                    "$unwind": {
                        "path": "$payment_info",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$addFields": {
                        "total_cash": { "$ifNull": ["$payment_info.total_cash", 0] },
                        "total_2307": { "$ifNull": ["$payment_info.total_2307", 0] }
                    }
                },
                {
                    "$addFields": {
                        "balance": {
                            "$subtract": ["$amount", { "$add": ["$total_cash", "$total_2307"] }]
                        }
                    }
                },
                {
                    "$match": {
                        "balance": { "$gt": 0 },
                        **({"customer": customer} if customer else {})
                    }
                },
                {
                    "$group": {
                        "_id": "$customer",
                        "total_balance": { "$sum": "$balance" }
                    }
                },
                {
                    "$sort": { "_id": 1 }
                },
                {
                    "$project": {
                        "_id": 0,
                        "customer": "$_id",
                        "total_balance": 1
                    }
                }
            ]

            result = list(mydb.sales.aggregate(pipeline))
            return [
                CustomerBalance(
                    customer=r['customer'],
                    total_balance=r['total_balance']
                ) for r in result
            ]

        except Exception as e:
            raise Exception(f"Error retrieving customer balance: {e}")
