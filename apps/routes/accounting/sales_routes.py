from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
from bson import ObjectId




from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user


from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()


api_sales = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


class SalesBM(BaseModel):

    delivery_date: datetime
    invoice_date: datetime
    invoice_no: str
    po_no: str
    load_no: str
    dr_no: str
    customer: str 
    customer_id: str
    category: str
    terms: str
    due_date: datetime
    tax_type: str
    amount: float
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created: Optional[datetime] = datetime.utcnow()



@api_sales.get("/sales/", response_class=HTMLResponse)
async def api_chart_of_account_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    print(roleAuthenticate['allowed_access'])
    

    if 'Sales' in roleAuthenticate['allowed_access']:


        return templates.TemplateResponse("accounting/sales.html", 
                                      {"request": request})

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )




@api_sales.post("/api-insert-sales/", response_model=None)
async def create_sales_transaction(data: SalesBM, username: str = Depends(get_current_user)):

    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Sales' in roleAuthenticate['allowed_access']:

        try:
            # Convert date and due_date to full datetime format
            #date_datetime = datetime.strptime(str(data.date), "%Y-%m-%d")
            #due_date_datetime = datetime.strptime(str(data.due_date), "%Y-%m-%d")

            # Ensure date_updated and date_created use current UTC timestamp
            insertData = {
               
                "delivery_date": data.delivery_date,
                "invoice_date": data.invoice_date,
                "invoice_no": data.invoice_no,
                "po_no": data.po_no,
                "load_no":data.po_no,
                "dr_no": data.dr_no,
                "customer": data.customer,
                "customer_id": data.customer_id,
                "category": data.category,
                "terms": data.terms,
                "due_date": data.due_date,
                "tax_type": data.tax_type,
                "amount": data.amount,
                "user": username,
                "date_updated": datetime.utcnow(),
                "date_created": datetime.utcnow(),
            }

            # Correct MongoDB insert operation
            mydb.sales.insert_one(insertData)

            return {"message": "Sales has been inserted successfully"}

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error inserting sales: {e}")

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )



@api_sales.get("/api-get-sales/")
async def get_sales(username: str = Depends(get_current_user)):
    try:
        result = mydb.sales.find().sort('date', -1)

        SalesData = [{
            
            "id": str(data['_id']),
            "delivery_date": data['delivery_date'].strftime('%Y-%m-%d') if isinstance(data['delivery_date'], datetime) else data['delivery_date'],
            
            "invoice_date": data['invoice_date'].strftime('%Y-%m-%d') if isinstance(data['invoice_date'], datetime) else data['invoice_date'],
            "invoice_no": data['invoice_no'],

            "po_no": data['po_no'],
            "load_no": data['load_no'],
            "dr_no": data['dr_no'],
            "customer": data['customer'],
            "customer_id": data['customer_id'],
            "category": data['category'],
            "terms": data['terms'],
            "due_date": data['due_date'].strftime('%Y-%m-%d') if isinstance(data['due_date'], datetime) else data['due_date'],
            "tax_type": data['tax_type'],
            "amount": data['amount'],
            "user": data['user'],
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

    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    

    if 'Sales' in roleAuthenticate['allowed_access']:

        try:

            updateData = {

                "delivery_date": data.delivery_date,
                "invoice_date": data.invoice_date,
                "invoice_no": data.invoice_no,
                "po_no": data.po_no,
                "load_no":data.load_no,
                "dr_no": data.dr_no,
                "customer": data.customer,
                "customer_id": data.customer_id,
                "category": data.category,
                "terms": data.terms,
                "due_date": data.due_date,
                "tax_type": data.tax_type,
                "amount": data.amount,
                "user": username,
                "date_updated": datetime.utcnow(),
                "date_created": datetime.utcnow(), 
                  
                }
            result = mydb.sales.update_one({'_id': obj_id},{'$set': updateData})
            return {"message":"Sales Data Has been Updated"} 
        except Exception as e:

            raise HTTPException(status_code=500, detail=str(e))
    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )

@api_sales.get("/api-get-sum-sales/")
async def get_sales_dashboard(
    filter: str = "today", 
    username: str = Depends(get_current_user)
):
    try:
        # Get current date and time
        now = datetime.utcnow()

        # sales_cursor = 0

        # Define date filter range
        if filter == "today":
            start_date = datetime(now.year, now.month, now.day)
            end_date = start_date + timedelta(days=1)

        elif filter == "week":
            start_date = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
            end_date = start_date + timedelta(days=7)

        elif filter == "month":
            start_date = datetime(now.year, now.month, 1)
            if now.month == 12:
                end_date = datetime(now.year + 1, 1, 1)
            else:
                end_date = datetime(now.year, now.month + 1, 1)

        elif filter == "year":
            start_date = datetime(now.year, 1, 1)
            end_date = datetime(now.year + 1, 1, 1)

        elif filter == "all":
            start_date = None
            end_date = None
            
            sales_cursor = mydb.sales.find()

        else:
            raise HTTPException(status_code=400, detail="Invalid filter. Use 'today', 'week', or 'month'.")


        if filter != "all":

            # Query sales within the date range
            sales_cursor = mydb.sales.find({
                "invoice_date": {"$gte": start_date, "$lt": end_date}
            })

        # Calculate total amount
        total_amount = sum(sale.get("amount", 0) for sale in sales_cursor)

        return total_amount

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sales data: {e}")



