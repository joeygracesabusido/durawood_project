
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


