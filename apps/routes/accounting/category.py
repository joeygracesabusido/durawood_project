
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


api_category = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


class categoryBM(BaseModel):

    
    category: str
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created: Optional[datetime] = datetime.utcnow()



@api_category.get("/category/", response_class=HTMLResponse)
async def api_payment_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
 

        return templates.TemplateResponse("accounting/payment.html", 
                                      {"request": request})
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not Authorized",
    )



@api_category.get("/collection-list/", response_class=HTMLResponse)
async def api_collection_list_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/payment_list.html", 
                                      {"request": request})

@api_category.get("/update-collection-transaction/{id}", response_class=HTMLResponse)
async def api_collection_list_template(request: Request,
                                       id: str,
                                       username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
        # Convert id to ObjectId
        obj_id = ObjectId(id)

        # Query for the specific inventory item
        item = mydb.payment.find_one({'_id': obj_id})

        if item:
            # Convert ObjectId to string and prepare data for template
            collectionData = {
                "id": str(item['_id']),
                "date":item['date'].strftime('%Y-%m-%d') if isinstance(item['date'], datetime) else item['date'],
                "customer": item['customer'],
                "customer_id": item['customer_id'],
                "invoice_no": item['invoice_no'],
                "cr_no": item['cr_no'],
                "cash_amount": item['cash_amount'],
                "amount_2307": item['amount_2307'],
                "remarks": item['remarks'],
                "user": item['user'],
                "date_created": item['date_created'],
                "date_updated": item['date_updated']
            }

            return templates.TemplateResponse(
                "accounting/collection_update.html",
                {"request": request, "collectionData": collectionData}
            )
        else:
            return JSONResponse(status_code=404, content={"message": "Payment item not found"})

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not Authorized",
    )





@api_category.post("/api-insert-payment/", response_model=None)
async def create_sales_transaction(data: categoryBM, username: str = Depends(get_current_user)):

    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
        
        try:
            # Convert date and due_date to full datetime format
            #date_datetime = datetime.strptime(str(data.date), "%Y-%m-%d")
            #due_date_datetime = datetime.strptime(str(data.due_date), "%Y-%m-%d")

            # Ensure date_updated and date_created use current UTC timestamp
            insertData = {
            
                "date": data.date,
                "customer": data.customer,
                "customer_id": data.customer_id,
                "cr_no": data.cr_no,
                "invoice_no": data.invoice_no,
                "cash_amount": data.cash_amount,
                "amount_2307": data.amount_2307,
                "remarks": data.remarks,
                "user": username,
                "date_updated": datetime.utcnow(),
                "date_created": datetime.utcnow(),
            }

            # Correct MongoDB insert operation
            mydb.payment.insert_one(insertData)

            return {"message": "Payment has been inserted successfully"}

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error inserting sales: {e}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not Authorized",
    )




@api_category.get("/api-get-payment/")
async def get_sales(username: str = Depends(get_current_user)):
    try:
        result = mydb.payment.find().sort('date', -1)

        paymentData = [{
            
            "id": str(data['_id']),
            "date": data['date'].strftime('%Y-%m-%d') if isinstance(data['date'], datetime) else data['date'],
            "customer": data['customer'],
            "customer_id": data['customer_id'],
            "cr_no": data['cr_no'],
            "invoice_no": data['invoice_no'],
            "cash_amount": data['cash_amount'],
            "amount_2307": data['amount_2307'],
            "remarks": data['remarks'],
            "user": username,
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


        } for data in result

    ]
        return paymentData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_category.put("/api-update-payment/{id}", response_model=None)
async def update_customer_profile_api(id: str, data: categoryBM,username: str = Depends(get_current_user)):
    obj_id = ObjectId(id)
    try:

        updateData = {

            "date": data.date,
            "customer": data.customer,
            "customer_id": data.customer_id,
            "cr_no": data.cr_no,
            "invoice_no": data.invoice_no,
            "cash_amount": data.cash_amount,
            "amount_2307": data.amount_2307,
            "remarks": data.remarks,
            "user": username,
            "date_updated": data.date_updated,
                     
              
            }
        result = mydb.payment.update_one({'_id': obj_id},{'$set': updateData})
        return {"message":"Payment Data Has been Updated"} 
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")


