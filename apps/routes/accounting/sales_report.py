
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

api_sales_report = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

@api_sales_report.get("/api-sales-report/", response_class=HTMLResponse)
async def get_sales_report(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/sales_report.html", 
                                      {"request": request})
@api_sales_report.get("/api-get-sales-report/")
async def get_sales(username: str = Depends(get_current_user)):
    try:
        today = date.today()
        result = mydb.sales.find({"terms":{"$ne": "COD"}}).sort('date', -1)

        SalesData = [{
            
            "id": str(data['_id']),
            "date": data['date'].strftime('%Y-%m-%d') if isinstance(data['date'], datetime) else data['date'],
            "customer": data['customer'],
            "customer_id": data['customer_id'],
            "terms": data['terms'],
            "due_date": data['due_date'].strftime('%Y-%m-%d') if isinstance(data['due_date'], datetime) else data['due_date'],
            "invoice_no": data['invoice_no'],
            "tax_type": data['tax_type'],
            "amount": data['amount'],
          #  "status":(today- data['due_date'].strftime('%Y-%m-%d') if isinstance(data['due_date'], datetime) else data['due_date']),
		  # "status": (today - data['due_date'].date()).days if isinstance(data['due_date'], datetime) else None,
            "status": max((today - data['due_date'].date()).days, 0) if isinstance(data['due_date'], datetime) else None,
            "user": username,
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


        } for data in result

    ]
        return SalesData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_sales_report.get("/api-get-sales-report2/")
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
                            "if": { "$gt": ["$due_date", None] },
                            "then": { 
                                "$max": [{ 
                                    "$divide": [{ 
                                        "$subtract": [{ "$toLong": "$$NOW" }, { "$toLong": "$due_date" }]
                                    }, 86400000] 
                                }, 0]
                            },
                            "else": None
                        }
                    }

                }
            },
            {
                "$project": {
                    "_id": 0,
                    "delivery_date": 1,
                    "invoice_date":1,
                    "po_no":1,
                    "load_no":1,
                    "dr_no":1,
                    "customer": 1,
                    "customer_id": 1,
                    "invoice_no": 1,
                    "tax_type": 1,
                    "terms": 1,
                    "due_date": 1,
                    "amount": 1,
                    "balance": 1,
                    "status": 1,
                    "category": 1,
                }
            }
        ]

        result = list(mydb.sales.aggregate(pipeline))

        return result

       
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")






@api_sales_report.get("/api-get-sales-report-with-params/")
async def get_sales(
    username: str = Depends(get_current_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
):
    try:
        pipeline = []

        # Add $match stage for date range filtering only if both dates are provided
        if date_from and date_to:
            pipeline.append({
                "$match": {
                    "invoice_date": {
                        "$gte": datetime.combine(date_from, datetime.min.time()),
                        "$lte": datetime.combine(date_to, datetime.max.time())
                    }
                }
            })

        pipeline += [
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
                            "if": { "$gt": ["$due_date", None] },
                            "then": {
                                "$max": [{
                                    "$divide": [{
                                        "$subtract": [{ "$toLong": "$$NOW" }, { "$toLong": "$due_date" }]
                                    }, 86400000]
                                }, 0]
                            },
                            "else": None
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "delivery_date": 1,
                    "invoice_date": 1,
                    "po_no": 1,
                    "load_no": 1,
                    "dr_no": 1,
                    "customer": 1,
                    "customer_id": 1,
                    "invoice_no": 1,
                    "tax_type": 1,
                    "terms": 1,
                    "due_date": 1,
                    "amount": 1,
                    "balance": 1,
                    "status": 1,
                    "category": 1,
                }
            }
        ]

        result = list(mydb.sales.aggregate(pipeline))
        return result

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")



# @api_sales_report.get("/api-get-sales-report-with-params/")
# async def get_sales(
#     username: str = Depends(get_current_user),
#     date_from: Optional[date] = None,
#     date_to: Optional[date] = None
# ):
#     try:
#         pipeline = []
#
#         # Date range filtering based on provided values
#         match_stage = {}
#         if date_from:
#             match_stage["invoice_date"] = {"$gte": datetime.combine(date_from, datetime.min.time())}
#         if date_to:
#             if "invoice_date" in match_stage:
#                 match_stage["invoice_date"]["$lte"] = datetime.combine(date_to, datetime.max.time())
#             else:
#                 match_stage["invoice_date"] = {"$lte": datetime.combine(date_to, datetime.max.time())}
#         if match_stage:
#             pipeline.append({"$match": match_stage})
#
#         pipeline += [
#             {
#                 "$lookup": {
#                     "from": "payment",
#                     "let": { "invoice_no": "$invoice_no" },
#                     "pipeline": [
#                         {
#                             "$match": {
#                                 "$expr": { "$eq": ["$invoice_no", "$$invoice_no"] }
#                             }
#                         },
#                         {
#                             "$group": {
#                                 "_id": "$invoice_no",
#                                 "total_cash": { "$sum": "$cash_amount" },
#                                 "total_2307": { "$sum": "$amount_2307" }
#                             }
#                         }
#                     ],
#                     "as": "payment_info"
#                 }
#             },
#             {
#                 "$addFields": {
#                     "total_cash": {
#                         "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_cash", 0] }, 0]
#                     },
#                     "total_2307": {
#                         "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_2307", 0] }, 0]
#                     }
#                 }
#             },
#             {
#                 "$addFields": {
#                     "balance": {
#                         "$subtract": ["$amount", { "$add": ["$total_cash", "$total_2307"] }]
#                     },
#                     "status": {
#                         "$cond": {
#                             "if": { "$gt": ["$due_date", None] },
#                             "then": {
#                                 "$max": [{
#                                     "$divide": [{
#                                         "$subtract": [{ "$toLong": "$$NOW" }, { "$toLong": "$due_date" }]
#                                     }, 86400000]
#                                 }, 0]
#                             },
#                             "else": None
#                         }
#                     }
#                 }
#             },
#             {
#                 "$project": {
#                     "_id": 0,
#                     "delivery_date": 1,
#                     "invoice_date": 1,
#                     "po_no": 1,
#                     "load_no": 1,
#                     "dr_no": 1,
#                     "customer": 1,
#                     "customer_id": 1,
#                     "invoice_no": 1,
#                     "tax_type": 1,
#                     "terms": 1,
#                     "due_date": 1,
#                     "amount": 1,
#                     "balance": 1,
#                     "status": 1,
#                     "category": 1,
#                 }
#             }
#         ]
#
#         result = list(mydb.sales.aggregate(pipeline))
#         return result
#
#     except Exception as e:
#         raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")
#
