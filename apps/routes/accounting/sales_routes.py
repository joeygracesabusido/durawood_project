from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId




from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user


from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()


api_sales = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


class SalesBM(BaseModel):

    date: datetime
    customer: str 
    customer_id: str 
    invoice_no: str
    terms: str
    due_date: datetime
    tax_type: str
    amount: str
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created:  datetime = datetime.utcnow()



@api_sales.get("/sales/", response_class=HTMLResponse)
async def api_chart_of_account_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/sales.html", 
                                      {"request": request})

@api_sales.post("/api-insert-sales/", response_model=None)
async def create_customer_profile(data: SalesBM, username: str = Depends(get_current_user)):
    try:
        customer_collection = mydb['sales']
        dataInsert = {

            "date": data.date,
            "customer": data.customer,
            "customer_id": data.customer_id,
            "invoice_no": data.invoice_no,
            "terms": data.terms,
            "due_date": data.due_date,
            "tax_type": data.tax_type,
            "amount": data.amount,
            "user": username,
            "date_updated": data.date_updated,
            "date_created": data.date_created,


        }
        mydb.sales.insert_one(dataInsert)

        return {"message": "Sales Transaction created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating profile: {e}")

@api_sales.get("/api-get-sales/")
async def get_sales(username: str = Depends(get_current_user)):
    try:
        result = mydb.sales.find().sort('bussiness_name', -1)

        SalesData = [{
            
            "id": str(data['_id']),
            "date": data['date'] ,
            "customer": data['customer'],
            "customer_id": data['customer_id'],
            "terms": data['terms'],
            "due_date": data['due_date'],
            "invocie_no": data['invoice_no'],
            "tax_type": data['tax_type'],
            "amount": data['amount'],
            "user": username,
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


        } for data in result

    ]
        return SalesData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_sales.put("/api-update-sales/", response_model=None)
async def update_customer_profile_api(profile_id: str, data: SalesBM,username: str = Depends(get_current_user)):
    obj_id = ObjectId(profile_id)
    try:

        updateData = {

            "date": data.date,
            "customer": data.customer,
            "customer_id": data.customer_id,
            "terms": data.terms,
            "due_date": data. due_date,
            "invoice_no": data.invoice_no,
            "tax_type": data.tax_type,
            "amount": data.amount,
            "user": username,
            "date_updated": data.date_updated,
            "date_created": data.date_created,


            
              
            }
        result = mydb.customer_vendor_profile.update_one({'_id': obj_id},{'$set': updateData})
        return {"message":"Custome has been Updated"} 
    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))

