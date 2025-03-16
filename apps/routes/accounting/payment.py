
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
    invoice_no: str
    cr_no: str
    cash_amount: float
    amount_2307: Optional[float] = None
    remarks: Optional[str]
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created: Optional[datetime] = datetime.utcnow()
    payment_method: str


@api_payment.put("/add-new-column-payment/")
async def add_new_column(username: str = Depends(get_current_user)):
    result = mydb.payment.update_many(
        {},
        {"$set": {"payment_method": "Cash"}}  # Add new field with a default value
    )
    return {"modified_count": result.modified_count}





@api_payment.get("/payment/", response_class=HTMLResponse)
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



@api_payment.get("/collection-list/", response_class=HTMLResponse)
async def api_collection_list_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/payment_list.html", 
                                      {"request": request})

@api_payment.get("/update-collection-transaction/{id}", response_class=HTMLResponse)
async def api_collection_list_template(request: Request,
                                       id: str,
                                       username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Update Payment' in roleAuthenticate['allowed_access']:
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
                "date_updated": item['date_updated'],
                "payment_method": item['payment_method']
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





@api_payment.post("/api-insert-payment/", response_model=None)
async def create_sales_transaction(data: paymentBM, username: str = Depends(get_current_user)):
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
                "payment_method": data.payment_method
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




@api_payment.get("/api-get-payment/")
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
            "user": data['user'],
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],
            "payment_method": data['payment_method']

        } for data in result

    ]
        return paymentData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_payment.put("/api-update-payment/{id}", response_model=None)
async def update_customer_profile_api(id: str, data: paymentBM,username: str = Depends(get_current_user)):
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
            "payment_method": data.payment_method        
              
            }
        result = mydb.payment.update_one({'_id': obj_id},{'$set': updateData})
        return {"message":"Payment Data Has been Updated"} 
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")


@api_payment.get("/api-autocomplete-customer-payment/")
async def autocomplete_payment_balance(term: Optional[str] = None,username: str = Depends(get_current_user)):
    try:


        # pipeline = [
        #         {
        #             "$lookup": {
        #                 "from": "payment",
        #                 "let": { "invoice_no": "$invoice_no" },
        #                 "pipeline": [
        #                     {
        #                         "$match": {
        #                             "$expr": { "$eq": ["$invoice_no", "$$invoice_no"] }
        #                         }
        #                     },
        #                     {
        #                         "$group": {
        #                             "_id": "$invoice_no",
        #                             "total_cash": { "$sum": "$cash_amount" },
        #                             "total_2307": { "$sum": "$amount_2307" }
        #                         }
        #                     }
        #                 ],
        #                 "as": "payment_info"
        #             }
        #         },
        #         {
        #             "$addFields": {
        #                 "total_cash": {
        #                     "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_cash", 0] }, 0]
        #                 },
        #                 "total_2307": {
        #                     "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_2307", 0] }, 0]
        #                 }
        #             }
        #         },
        #         {
        #             "$addFields": {
        #                 "balance": {
        #                     "$subtract": ["$amount", { "$add": ["$total_cash", "$total_2307"] }]
        #                 }
        #             }
        #         },
        #         {
        #             "$project": {
        #                 "_id": 0,
        #                 "customer": 1,
        #                 "customer_id": 1,
        #                 "invoice_no": 1,
        #                 "balance": 1
        #             }
        #         }
        #     ]
        #

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
                        }
                    }
                },
                {
                    "$match": {
                        "balance": { "$gt": 0 }  # 🔥 This filters out invoices with a balance of 0 or less
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "customer": 1,
                        "customer_id": 1,
                        "invoice_no": 1,
                        "balance": 1
                    }
                }
            ]

	     
        result = list(mydb.sales.aggregate(pipeline))
        print(result)
        # Ensure 'customer' field exists before filtering
        if term:
            filtered_contact = [
                item for item in result
                if term.lower() in item.get('customer', '').lower() or term.lower() in item.get('invoice_no', '').lower()
            ]
        else:
            filtered_contact = result  # If no term is provided, return all

        suggestions = [
            {
                "value": f"{item.get('customer', 'Unknown')} - Invoice: {item.get('invoice_no')} - Balance: {item.get('balance', 0):,.2f}",  # Avoid KeyError
			    "customer": item.get('customer'),
				"customer_id": item.get('customer_id'),
				"invoice_no": item.get('invoice_no'),
                "balance": item.get('balance')  # Ensure balance is present
            }
            for item in filtered_contact
        ]

        return suggestions


    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")
    
@api_payment.get("/api-get-sum-payment/")
async def get_payment_dashboard(
    filter: str = "today", 
    username: str = Depends(get_current_user)
):
    try:
        # Get current date and time
        now = datetime.utcnow()
        
        query = {}
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

            

        else:
            raise HTTPException(status_code=400, detail="Invalid filter. Use 'today', 'week', or 'month'.")


        if filter != 'all':
        

            # Query sales within the date range
            query = {
                "date": {"$gte": start_date, "$lt": end_date}
            }
        
        payment_cursor = mydb.payment.find(query)

        # Calculate total amount
        total_amount = sum(payment.get("cash_amount", 0) + payment.get("amount_2307", 0) for payment in payment_cursor)

        return total_amount

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sales data: {e}")


 
   



		

  
    
        






