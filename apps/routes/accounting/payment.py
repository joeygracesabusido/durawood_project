
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


api_payment = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


class paymentBM(BaseModel):

    date: datetime
    customer: str 
    customer_id: str 
    cash_amount: float
    invoice_no: str
    amount_2307: Optional[float] = None
    remarks: Optional[str]
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created: Optional[datetime] = datetime.utcnow()



@api_payment.get("/payment/", response_class=HTMLResponse)
async def api_payment_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/payment.html", 
                                      {"request": request})


@api_payment.post("/api-insert-payment/", response_model=None)
async def create_sales_transaction(data: paymentBM, username: str = Depends(get_current_user)):
    try:
        # Convert date and due_date to full datetime format
        #date_datetime = datetime.strptime(str(data.date), "%Y-%m-%d")
        #due_date_datetime = datetime.strptime(str(data.due_date), "%Y-%m-%d")

        # Ensure date_updated and date_created use current UTC timestamp
        insertData = {
           
            "date": data.date,
            "customer": data.customer,
            "customer_id": data.customer_id,
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



@api_payment.get("/api-get-payment/")
async def get_sales(username: str = Depends(get_current_user)):
    try:
        result = mydb.payment.find().sort('date', -1)

        paymentData = [{
            
            "id": str(data['_id']),
            "date": data['date'].strftime('%Y-%m-%d') if isinstance(data['date'], datetime) else data['date'],
            "customer": data['customer'],
            "customer_id": data['customer_id'],
            "invoice_no": data['invoice_no'],
            "cash_amount": data['amount'],
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

@api_payment.put("/api-update-payment/", response_model=None)
async def update_customer_profile_api(profile_id: str, data: paymentBM,username: str = Depends(get_current_user)):
    obj_id = ObjectId(profile_id)
    try:

        updateData = {

            "date": data.date,
            "customer": data.customer,
            "customer_id": data.customer_id,
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

@api_payment.get("/api-autocomplete-customer-payment/")
async def autocomplete_payment_balance(term: Optional[str] = None,username: str = Depends(get_current_user)):
	

			
        
	pipeline = [
					{
				"$lookup": {
					"from": "payments",  # The payments collection
					"localField": "invoice_no",  # Field in sales
					"foreignField": "invoice_no",  # Field in payments
					"as": "payment_info"
					}
				},
				{
					"$unwind": { "path": "$payment_info", "preserveNullAndEmptyArrays": True }
				},
				{
					"$addFields": {
						"cash_amount": { "$ifNull": ["$payment_info.cash_amount", 0] },
						"amount_2307": { "$ifNull": ["$payment_info.amount_2307", 0] }
					}
				},
				{
					"$addFields": {
						"balance": {
							"$subtract": [
								"$amount",
								{ "$add": ["$cash_amount", "$amount_2307"] }
							]
						}
					}
				},
				{
					"$project": {
						"_id": 0,
						"customer": 1,
                        "invoice_no": 1,
						"balance": 1
					}
				}
			]

	result = list(mydb.sales.aggregate(pipeline))

    return result

	

    
  
   



		

  
    
        






