from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId

from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()



from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
#from apps.base_model.sales_bm import SalesBM
#from apps.views.accounting.sales_views import SalesViews

#from apps.views.accounting.journal_entry_views import JournalEntryViews


#from apps.views.accounting.sales_views import SalesViews

api_ar_aging_report = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

@api_ar_aging_report.get("/api-ar-aging-report/", response_class=HTMLResponse)
async def get_sales_report(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/ar_aging_report.html", 
                                      {"request": request})

@api_ar_aging_report.get("/api-get-ar-aging-report")
async def get_sales(username: str = Depends(get_current_user)):
    try:
        today = datetime.combine(date.today(), datetime.min.time())  # Convert to datetime

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
                "$addFields": {
                    "total_cash": {
                        "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_cash", 0] }, 0]
                    },
                    "total_2307": {
                        "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_2307", 0] }, 0]
                    }
                }
            },
            {
                "$addFields": {
                    "balance": {
                        "$subtract": ["$amount", { "$add": ["$total_cash", "$total_2307"] }]
                    },
                 "status": {
                        "$cond": {
                            "if": { "$gt": ["$invoice_date", None] },
                            "then": { 
                                "$max": [{ 
                                    "$divide": [{ 
                                        "$subtract": [{ "$toLong": "$$NOW" }, { "$toLong": "$invoice_date" }]
                                    }, 86400000] 
                                }, 0]
                            },
                            "else": None
                        }
                    }

                }
            },

		# filter out record where balance is greater than 0
			
                {"$match": {
					"balance": {"$gt": 0}
					}},
                {"$sort": {
                    "customer": 1, "invoice_date": 1}},
			


            {
                "$project": {
                    "_id": 0,
                    "invoice_date": 1,
                    "category": 1,
                    "customer": 1,
                    "customer_id": 1,
                    "invoice_no": 1,
                    "tax_type": 1,
                    "terms": 1,
                    "due_date": 1,
                    "amount": 1,
                    "balance": 1,
                    "status": 1
                }
            }
        ]

        result = list(mydb.sales.aggregate(pipeline))

        return result

       
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")







@api_ar_aging_report.get("/api-get-sum-ar")
async def get_sum_ar(username: str = Depends(get_current_user)):
    try:
        # Aggregate total sales amount
        sales_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_sales": {"$sum": "$amount"}
                }
            }
        ]
        sales_result = list(mydb.sales.aggregate(sales_pipeline))
        total_sales = sales_result[0]["total_sales"] if sales_result else 0

        # Aggregate total cash and 2307 from payments
        payment_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_cash": {"$sum": "$cash_amount"},
                    "total_2307": {"$sum": "$amount_2307"}
                }
            }
        ]
        payment_result = list(mydb.payment.aggregate(payment_pipeline))
        total_cash = payment_result[0]["total_cash"] if payment_result else 0
        total_2307 = payment_result[0]["total_2307"] if payment_result else 0

        # Compute balance
        balance = total_sales - (total_cash + total_2307)

        return balance

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving balance: {e}")

@api_ar_aging_report.get("/api-get-ar-report")
async def get_ar_report(username: str = Depends(get_current_user)):
    try:
 
        pipeline = [
            {
                "$lookup": {
                    "from": "payment",
                    "let": { "customer": "$customer" },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": { "$eq": ["$customer", "$$customer"] }
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
                "$addFields": {
                    "total_cash": {
                        "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_cash", 0] }, 0]
                    },
                    "total_2307": {
                        "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_2307", 0] }, 0]
                    }
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
                    "balance": {"$gt": 0}
                }
            },
            {
                "$group": {
                    "_id": "$customer",
                    "total_balance": { "$sum": "$balance" },
                    "category": { "$first": "$category" }  # Optional if you want to show the first category per customer
                }
            },
            {
                "$sort": {
                    "_id": 1  # Sort by customer name
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "customer": "$_id",
                    "total_balance": 1,
                    "category": 1  # Optional
                }
            }
        ]



        result = list(mydb.sales.aggregate(pipeline))

        return result

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

