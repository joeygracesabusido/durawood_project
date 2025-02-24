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
                            "if": { "$gt": ["$date", None] },
                            "then": { 
                                "$max": [{ 
                                    "$divide": [{ 
                                        "$subtract": [{ "$toLong": "$$NOW" }, { "$toLong": "$date" }]
                                    }, 86400000] 
                                }, 0]
                            },
                            "else": None
                        }
                    }

                }
            },

		# filter out record where balance is greater than 0
			{
				"$match": {
					"balance": {"$gt": 0}
					}
			},


            {
                "$project": {
                    "_id": 0,
                    "date": 1,
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


