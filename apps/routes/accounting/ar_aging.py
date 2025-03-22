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
async def get_apiTemplate_sales_report(request: Request,
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


@api_ar_aging_report.get("/api-template-ar-aging-per-category/", response_class=HTMLResponse)
async def get_sales_report(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/ar_aging_per_category.html", 
                                      {"request": request})





 
@api_ar_aging_report.get("/api-get-ar-aging-per-category")
async def get_ar_aging_per_category(
    username: str = Depends(get_current_user),
    category: Optional[str] = None,
    date_to: Optional[str] = None  # Only "date_to", no "date_from"
):
    try:
        # Date filter only has "up to" (less than or equal)
        date_filter = {}
        if date_to:
            date_filter["$lte"] = datetime.strptime(date_to, "%Y-%m-%d")

        # Base match conditions (filters applied if provided)
        match_conditions = {
            "balance": {"$gt": 0}  # only records with unpaid balance
        }

        if category:
            match_conditions["category"] = category

        if date_to:
            match_conditions["invoice_date"] = date_filter

        pipeline = [
            {
                "$lookup": {
                    "from": "payment",
                    "let": {"invoice_no": "$invoice_no"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {"$eq": ["$invoice_no", "$$invoice_no"]}
                            }
                        },
                        {
                            "$group": {
                                "_id": "$invoice_no",
                                "total_cash": {"$sum": "$cash_amount"},
                                "total_2307": {"$sum": "$amount_2307"}
                            }
                        }
                    ],
                    "as": "payment_info"
                }
            },
            {
                "$addFields": {
                    "total_cash": {
                        "$ifNull": [{"$arrayElemAt": ["$payment_info.total_cash", 0]}, 0]
                    },
                    "total_2307": {
                        "$ifNull": [{"$arrayElemAt": ["$payment_info.total_2307", 0]}, 0]
                    }
                }
            },
            {
                "$addFields": {
                    "balance": {
                        "$subtract": ["$amount", {"$add": ["$total_cash", "$total_2307"]}]
                    },
                    "status": {
                        "$cond": {
                            "if": {"$gt": ["$invoice_date", None]},
                            "then": {
                                "$max": [{
                                    "$divide": [{
                                        "$subtract": [{"$toLong": "$$NOW"}, {"$toLong": "$invoice_date"}]
                                    }, 86400000]
                                }, 0]
                            },
                            "else": None
                        }
                    }
                }
            },
            {"$match": match_conditions},  # Apply dynamic filters (category, date_to)
            {
                "$group": {
                    "_id": { "category": "$category",
							 "customer": "$customer"
							},
                    "total_balance": {"$sum": "$balance"},
                    "details": {
                        "$push": {
                            "invoice_date": "$invoice_date",
                            "customer": "$customer",
                            "customer_id": "$customer_id",
                            "invoice_no": "$invoice_no",
                            "tax_type": "$tax_type",
                            "terms": "$terms",
                            "due_date": "$due_date",
                            "amount": "$amount",
                            "balance": "$balance",
                            "status": "$status"
                        }
                    }
                }
            },
            {"$sort": {"_id": 1}}
        ]

        result = list(mydb.sales.aggregate(pipeline))
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving AR aging report: {e}")
 




@api_ar_aging_report.get("/api-get-ar-aging-for-dashboard/")
async def get_ar_aging_per_category_dashboard(
    username: str = Depends(get_current_user),
    #date_to: Optional[str] = None,  # Accept date filter
    filter_type: Optional[str] = None  # 'today', 'month', 'year'
):
    try:
        # Build date filter
        date_filter = {}
        if filter_type:
            now = datetime.utcnow()
            if filter_type == "today":
                start_of_day = datetime(now.year, now.month, now.day)
                end_of_day = start_of_day + timedelta(days=1)
                date_filter["$gte"] = start_of_day
                date_filter["$lt"] = end_of_day

            elif filter_type == "week":
                start_of_week = now - timedelta(days=now.weekday())
                end_of_week = start_of_week + timedelta(days=7)
                date_filter["$gte"] = start_of_week
                date_filter["$lt"] = end_of_week

            elif filter_type == "month":
                start_of_month = datetime(now.year, now.month, 1)
                next_month = start_of_month.replace(month=start_of_month.month % 12 + 1, day=1)
                date_filter["$gte"] = start_of_month
                date_filter["$lt"] = next_month
            elif filter_type == "year":
                start_of_year = datetime(now.year, 1, 1)
                next_year = start_of_year.replace(year=start_of_year.year + 1)
                date_filter["$gte"] = start_of_year
                date_filter["$lt"] = next_year

            elif filter_type == "all":
                date_filter = None

        # elif date_to:
        #     date_filter["$lte"] = datetime.strptime(date_to, "%Y-%m-%d")

        # Base match conditions
        match_conditions = {"balance": {"$gt": 0}}  # Only unpaid balances
        if date_filter:
            match_conditions["invoice_date"] = date_filter

        # MongoDB aggregation pipeline
        pipeline = [
            {
                "$lookup": {
                    "from": "payment",
                    "let": {"invoice_no": "$invoice_no"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$invoice_no", "$$invoice_no"]}}},
                        {"$group": {
                            "_id": "$invoice_no",
                            "total_cash": {"$sum": "$cash_amount"},
                            "total_2307": {"$sum": "$amount_2307"}
                        }}
                    ],
                    "as": "payment_info"
                }
            },
            {
                "$addFields": {
                    "total_cash": {
                        "$ifNull": [{"$arrayElemAt": ["$payment_info.total_cash", 0]}, 0]
                    },
                    "total_2307": {
                        "$ifNull": [{"$arrayElemAt": ["$payment_info.total_2307", 0]}, 0]
                    }
                }
            },
            {
                "$addFields": {
                    "balance": {
                        "$subtract": ["$amount", {"$add": ["$total_cash", "$total_2307"]}]
                    },
                    "status": {
                        "$cond": {
                            "if": {"$gt": ["$invoice_date", None]},
                            "then": {
                                "$max": [{
                                    "$divide": [
                                        {"$subtract": [
                                            {"$toLong": "$$NOW"}, 
                                            {"$toLong": "$invoice_date"}
                                        ]},
                                        86400000  # Convert milliseconds to days
                                    ]
                                }, 0],
                            },
                            "else": None
                        }
                    }
                }
            },
            {"$match": match_conditions},
            {
                "$group": {
                    "_id": "$customer",
                    "total_balance": {"$sum": "$balance"},
                    
                    "details": {
                        "$push": {
                            "invoice_date": "$invoice_date",
                            "customer": "$customer",
                            "customer_id": "$customer_id",
                            "invoice_no": "$invoice_no",
                            "tax_type": "$tax_type",
                            "terms": "$terms",
                            "due_date": "$due_date",
                            "amount": "$amount",
                            "balance": "$balance",
                            "status": "$status",
                            "category":"$category"
                        }
                    }
                }
            },
            {"$sort": {"_id": 1}}
        ]

        result = list(mydb.sales.aggregate(pipeline))
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving AR aging report: {e}")


@api_ar_aging_report.get("/api-get-ar-aging-for-dashboard-per-category/")
async def get_ar_aging_per_category(
    username: str = Depends(get_current_user),
    #date_to: Optional[str] = None,  # Accept date filter
    filter_type: Optional[str] = None  # 'today', 'month', 'year'
):
    try:
        # Build date filter
        date_filter = {}
        if filter_type:
            now = datetime.utcnow()
            if filter_type == "today":
                start_of_day = datetime(now.year, now.month, now.day)
                end_of_day = start_of_day + timedelta(days=1)
                date_filter["$gte"] = start_of_day
                date_filter["$lt"] = end_of_day

            elif filter_type == "week":
                start_of_week = now - timedelta(days=now.weekday())
                end_of_week = start_of_week + timedelta(days=7)
                date_filter["$gte"] = start_of_week
                date_filter["$lt"] = end_of_week

            elif filter_type == "month":
                start_of_month = datetime(now.year, now.month, 1)
                next_month = start_of_month.replace(month=start_of_month.month % 12 + 1, day=1)
                date_filter["$gte"] = start_of_month
                date_filter["$lt"] = next_month
            elif filter_type == "year":
                start_of_year = datetime(now.year, 1, 1)
                next_year = start_of_year.replace(year=start_of_year.year + 1)
                date_filter["$gte"] = start_of_year
                date_filter["$lt"] = next_year

            elif filter_type == "all":
                date_filter = None

        # elif date_to:
        #     date_filter["$lte"] = datetime.strptime(date_to, "%Y-%m-%d")

        # Base match conditions
        match_conditions = {"balance": {"$gt": 0}}  # Only unpaid balances
        if date_filter:
            match_conditions["invoice_date"] = date_filter

        # MongoDB aggregation pipeline
        pipeline = [
            {
                "$lookup": {
                    "from": "payment",
                    "let": {"invoice_no": "$invoice_no"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$invoice_no", "$$invoice_no"]}}},
                        {"$group": {
                            "_id": "$invoice_no",
                            "total_cash": {"$sum": "$cash_amount"},
                            "total_2307": {"$sum": "$amount_2307"}
                        }}
                    ],
                    "as": "payment_info"
                }
            },
            {
                "$addFields": {
                    "total_cash": {
                        "$ifNull": [{"$arrayElemAt": ["$payment_info.total_cash", 0]}, 0]
                    },
                    "total_2307": {
                        "$ifNull": [{"$arrayElemAt": ["$payment_info.total_2307", 0]}, 0]
                    }
                }
            },
            {
                "$addFields": {
                    "balance": {
                        "$subtract": ["$amount", {"$add": ["$total_cash", "$total_2307"]}]
                    },
                    "status": {
                        "$cond": {
                            "if": {"$gt": ["$invoice_date", None]},
                            "then": {
                                "$max": [{
                                    "$divide": [
                                        {"$subtract": [
                                            {"$toLong": "$$NOW"}, 
                                            {"$toLong": "$invoice_date"}
                                        ]},
                                        86400000  # Convert milliseconds to days
                                    ]
                                }, 0],
                            },
                            "else": None
                        }
                    }
                }
            },
            {"$match": match_conditions},
            {
                "$group": {
                    "_id": "$category",
                    "total_balance": {"$sum": "$balance"},
                }

            },

                {
                "$project": {
                    
                    "category": "$_id",
                    "total_balance": 1,
                    "details": 1  # Optional
                }
            },

            {"$sort": {"_id": 1}}
        ]

        result = list(mydb.sales.aggregate(pipeline))
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving AR aging report: {e}")




# this function is for Customer List Template to display
@api_ar_aging_report.get("/api-template-customer-list-balance/", response_class=HTMLResponse)
async def get_sales_report(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/customer_list_with_balance.html", 
                                      {"request": request})


@api_ar_aging_report.get("/api-get-per-customer-balance")
async def get_list_customer_balance(username: str = Depends(get_current_user)):
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
                                "_id": "$invoice_no",  # Group by invoice number
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
                    "balance": { "$gt": 0 }
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
        # print(list(mydb.sales.aggregate(pipeline)))

        return result

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")


# this function is for Customer List of Transaction to Display to display
@api_ar_aging_report.get("/api-template-customer-transaction/", response_class=HTMLResponse)
async def get_temp_customer_transactions(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/customer_transaction.html", 
                                      {"request": request})







@api_ar_aging_report.get("/api-get-transaction-history")
async def get_transaction_history(
    customer: Optional[str] = None,
    username: str = Depends(get_current_user)
):
    try:
        sales_pipeline = [
            {
                "$match": {"customer": customer} if customer else {}
            },
            {
                "$project": {
                    "_id": 0,
                    "date": "$invoice_date",
                    "customer": 1,
                    "invoice_no": 1,
                    "sales_amount": "$amount",
                    "payment_amount": None,
                    "type": {"$literal": "Sales"}
                }
            }
        ]

        payment_pipeline = [
            {
                "$match": {"customer": customer} if customer else {}
            },
            {
                "$project": {
                    "_id": 0,
                    "date": "$date",
                    "customer": 1,
                    "invoice_no": 1,
                    "sales_amount": None,
                    "payment_amount": {
                        "$add": ["$cash_amount", {"$ifNull": ["$amount_2307", 0]}]
                    },
                    "type": {"$literal": "Payment"}
                }
            }
        ]

        # Fetch sales and payment data
        sales_data = list(mydb.sales.aggregate(sales_pipeline))
        payment_data = list(mydb.payment.aggregate(payment_pipeline))

        # Combine sales and payment data
        transaction_history = sales_data + payment_data

        # Sort by date in ascending order (latest last)
        transaction_history.sort(key=lambda x: x["date"], reverse=False)

        return transaction_history

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving transaction history: {e}")






@api_ar_aging_report.get("/api-get-per-customer-balance-with-params/")
async def get_list_customer_balance(
    username: str = Depends(get_current_user), 
    customer: Optional[str] = None
):
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
        return result

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

