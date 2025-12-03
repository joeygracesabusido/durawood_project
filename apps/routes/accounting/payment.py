
from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status, UploadFile, File, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
from bson import ObjectId
import io
import pandas as pd
import json

from datetime import datetime, timedelta, date, timezone
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
 
    return templates.TemplateResponse("accounting/payment_list_new.html", 
                                      {"request": request})

@api_payment.get("/upload-collection/", response_class=HTMLResponse)
async def upload_collection_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
        return templates.TemplateResponse("accounting/upload_collection.html", 
                                      {"request": request})
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized",
        )

@api_payment.post("/upload-collection/")
async def upload_collection_file(file: UploadFile = File(...), username: str = Depends(get_current_user)):
    
    role = mydb.login.find_one({"email_add": username})
    if not role:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})
    if not roleAuthenticate or 'Payment' not in roleAuthenticate['allowed_access']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not Authorized",
            )

    try:
        # Validate file extension
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload an Excel file (.xlsx, .xls) or CSV file."
            )

        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=400, 
                detail="The file is empty"
            )

        # Parse Excel file
        df = pd.read_excel(io.BytesIO(contents))
        
        # Validate DataFrame
        if df.empty:
            raise HTTPException(
                status_code=400, 
                detail="The uploaded file contains no data"
            )

        # Convert numeric columns to float where possible
        numeric_columns = df.select_dtypes(include=['int64', 'float64']).columns
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Replace infinite and NaN values with None
        df = df.replace([float('inf'), float('-inf')], None)
        df = df.where(df.notna(), None)
        
        # Get preview data with cleaned values
        preview_data = []
        for _, row in df.head(5).iterrows():
            row_dict = {}
            for col in df.columns:
                val = row[col]
                if val is None or (isinstance(val, float) and not -1e308 < val < 1e308):
                    row_dict[col] = None
                else:
                    row_dict[col] = val
            preview_data.append(row_dict)
        
        # Prepare response with status wrapper
        column_info = {
            "filename": file.filename,
            "columns": list(df.columns),
            "row_count": len(df),
            "preview": preview_data
        }
        
        return {"status": "success", "data": column_info}

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400, 
            detail="The file contains no data"
        )
    except pd.errors.ParserError as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Could not parse Excel file: {str(e)}"
        )
    except Exception as e:
        print(f"Upload error: {str(e)}")  # Log the error server-side
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing file: {str(e)}"
        )

@api_payment.post("/import-collection-data/")
async def import_collection_data(
    file: UploadFile = File(...),
    column_mapping: str = Form(...),
    username: str = Depends(get_current_user)
):
    role = mydb.login.find_one({"email_add": username})
    if not role or 'Payment' not in mydb.roles.find_one({'role': role['role']})['allowed_access']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized"
        )
    
    try:
        mapping_data = json.loads(column_mapping)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid mapping format: {str(e)}")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="File contains no data")

    required_fields = ['date', 'customer', 'customer_id', 'invoice_no', 'cash_amount']
    missing_fields = [field for field in required_fields if field not in mapping_data.values()]
    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )

    try:
        reverse_mapping = {v: k for k, v in mapping_data.items()}
        df = df.rename(columns=reverse_mapping)

        # Process dates
        try:
            df['date'] = pd.to_datetime(df['date'], format='mixed')
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date format in date column: {str(e)}"
            )

        # Process amounts
        try:
            df['cash_amount'] = pd.to_numeric(df['cash_amount'])
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid numeric values in cash_amount column: {str(e)}"
            )

        # Optional amount field
        if 'amount_2307' in df.columns:
            try:
                df['amount_2307'] = pd.to_numeric(df['amount_2307'])
            except Exception:
                pass

        # Check for existing collection records by cr_no if available
        if 'cr_no' in df.columns:
            existing = []
            for cr_no in df['cr_no'].unique():
                if df['cr_no'].isnull().sum() == 0 and mydb.payment.find_one({"cr_no": cr_no}):
                    existing.append(cr_no)
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"Collection receipt numbers already exist: {', '.join(map(str, existing))}"
                )

        # Prepare and insert records
        records = []
        for _, row in df.iterrows():
            record = row.where(pd.notnull(row), None).to_dict()
            record.update({
                'user': username,
                'date_created': datetime.now(timezone.utc),
                'date_updated': datetime.now(timezone.utc),
                'payment_method': record.get('payment_method', 'Cash')
            })
            records.append(record)

        result = mydb.payment.insert_many(records)

        return {
            "status": "success",
            "message": f"Successfully imported {len(result.inserted_ids)} collection records"
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing import: {str(e)}"
        )

@api_payment.get("/download-collection-template/")
async def download_collection_template(username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
        try:
            # Define the column headers based on the collection fields
            column_headers = [
                'date',
                'customer',
                'customer_id',
                'invoice_no',
                'cr_no',
                'cash_amount',
                'amount_2307',
                'payment_method',
                'remarks'
            ]

            # Create an empty DataFrame with only the specified columns
            df = pd.DataFrame(columns=column_headers)

            # Create an in-memory Excel file
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Collections')
            output.seek(0)

            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=collection.xlsx"}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized",
        )

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



@api_payment.post("/api-insert-payment-batch/", response_model=None)
async def create_payments_batch(data: List[paymentBM], username: str = Depends(get_current_user)):
    """Insert multiple payment documents in a single request.

    Expects a JSON array of paymentBM objects.
    """
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
        try:
            if not isinstance(data, list) or len(data) == 0:
                raise HTTPException(status_code=400, detail="No payment items provided")

            insert_docs = []
            for item in data:
                # Build insert document per item
                insertData = {
                    "date": item.date,
                    "customer": item.customer,
                    "customer_id": item.customer_id,
                    "cr_no": item.cr_no,
                    "invoice_no": item.invoice_no,
                    "cash_amount": item.cash_amount,
                    "amount_2307": item.amount_2307,
                    "remarks": item.remarks,
                    "user": username,
                    "date_updated": datetime.utcnow(),
                    "date_created": datetime.utcnow(),
                    "payment_method": item.payment_method
                }
                insert_docs.append(insertData)

            # Insert all at once
            mydb.payment.insert_many(insert_docs)

            return {"message": f"{len(insert_docs)} payments have been inserted successfully"}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error inserting payments batch: {e}")

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


# @api_payment.get("/api-autocomplete-customer-payment/")
# async def autocomplete_payment_balance(term: Optional[str] = None,username: str = Depends(get_current_user)):
#     try:


#         # pipeline = [
#         #         {
#         #             "$lookup": {
#         #                 "from": "payment",
#         #                 "let": { "invoice_no": "$invoice_no" },
#         #                 "pipeline": [
#         #                     {
#         #                         "$match": {
#         #                             "$expr": { "$eq": ["$invoice_no", "$$invoice_no"] }
#         #                         }
#         #                     },
#         #                     {
#         #                         "$group": {
#         #                             "_id": "$invoice_no",
#         #                             "total_cash": { "$sum": "$cash_amount" },
#         #                             "total_2307": { "$sum": "$amount_2307" }
#         #                         }
#         #                     }
#         #                 ],
#         #                 "as": "payment_info"
#         #             }
#         #         },
#         #         {
#         #             "$addFields": {
#         #                 "total_cash": {
#         #                     "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_cash", 0] }, 0]
#         #                 },
#         #                 "total_2307": {
#         #                     "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_2307", 0] }, 0]
#         #                 }
#         #             }
#         #         },
#         #         {
#         #             "$addFields": {
#         #                 "balance": {
#         #                     "$subtract": ["$amount", { "$add": ["$total_cash", "$total_2307"] }]
#         #                 }
#         #             }
#         #         },
#         #         {
#         #             "$project": {
#         #                 "_id": 0,
#         #                 "customer": 1,
#         #                 "customer_id": 1,
#         #                 "invoice_no": 1,
#         #                 "balance": 1
#         #             }
#         #         }
#         #     ]
#         #

#         pipeline = [
#                 {
#                     "$lookup": {
#                         "from": "payment",
#                         "let": { "invoice_no": "$invoice_no" },
#                         "pipeline": [
#                             {
#                                 "$match": {
#                                     "$expr": { "$eq": ["$invoice_no", "$$invoice_no"] }
#                                 }
#                             },
#                             {
#                                 "$group": {
#                                     "_id": "$invoice_no",
#                                     "total_cash": { "$sum": "$cash_amount" },
#                                     "total_2307": { "$sum": "$amount_2307" }
#                                 }
#                             }
#                         ],
#                         "as": "payment_info"
#                     }
#                 },
#                 {
#                     "$addFields": {
#                         "total_cash": {
#                             "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_cash", 0] }, 0]
#                         },
#                         "total_2307": {
#                             "$ifNull": [{ "$arrayElemAt": ["$payment_info.total_2307", 0] }, 0]
#                         }
#                     }
#                 },
#                 {
#                     "$addFields": {
#                         "balance": {
#                             "$subtract": ["$amount", { "$add": ["$total_cash", "$total_2307"] }]
#                         }
#                     }
#                 },
#                 {
#                     "$match": {
#                         "balance": { "$gt": 0 }  # 🔥 This filters out invoices with a balance of 0 or less
#                     }
#                 },
#                 {
#                     "$project": {
#                         "_id": 0,
#                         "customer": 1,
#                         "customer_id": 1,
#                         "invoice_no": 1,
#                         "balance": 1
#                     }
#                 }
#             ]

	     
#         result = list(mydb.sales.aggregate(pipeline))
#         # print(result)
#         # Ensure 'customer' field exists before filtering
#         if term:
#             filtered_contact = [
#                 item for item in result
#                 if term.lower() in item.get('customer', '').lower() or term.lower() in item.get('invoice_no', '').lower()
#             ]
#         else:
#             filtered_contact = result  # If no term is provided, return all

#         suggestions = [
#             {
#                 "value": f"{item.get('customer', 'Unknown')} - Invoice: {item.get('invoice_no')} - Balance: {item.get('balance', 0):,.2f}",  # Avoid KeyError
# 			    "customer": item.get('customer'),
# 				"customer_id": item.get('customer_id'),
# 				"invoice_no": item.get('invoice_no'),
#                 "balance": item.get('balance')  # Ensure balance is present
#             }
#             for item in filtered_contact
#         ]

#         return suggestions


#     except Exception as e:
#         raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_payment.get("/api-autocomplete-customer-payment/")
async def autocomplete_payment_balance(
    term: Optional[str] = None,
    username: str = Depends(get_current_user)
):
    try:
        match_stage = {
            "$match": {
                "balance": { "$gt": 0 }
            }
        }

        # Optional term filter using regex (if provided)
        if term:
            match_stage["$match"]["$or"] = [
                { "customer": { "$regex": term, "$options": "i" } },
                { "invoice_no": { "$regex": term, "$options": "i" } }
            ]

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
            match_stage,
            {
                "$project": {
                    "_id": 0,
                    "customer": 1,
                    "customer_id": 1,
                    "invoice_no": 1,
                    "balance": 1
                }
            },
            {
                "$limit": 20  # Limit results to 20 matches for performance
            }
        ]

        result = list(mydb.sales.aggregate(pipeline))

        suggestions = [
            {
                "value": f"{item.get('customer', 'Unknown')} - Invoice: {item.get('invoice_no')} - Balance: {item.get('balance', 0):,.2f}",
                "customer": item.get("customer"),
                "customer_id": item.get("customer_id"),
                "invoice_no": item.get("invoice_no"),
                "balance": item.get("balance")
            }
            for item in result
        ]

        return suggestions

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving payment suggestions: {e}")

    
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


 
   


@api_payment.get("/api-get-payment-with-params/")
async def get_sales(
    username: str = Depends(get_current_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
):
    try:
        # Build the filter based on the provided dates
        filter_conditions = {}
        if date_from:
            filter_conditions["date"] = {"$gte": datetime.combine(date_from, datetime.min.time())}
        if date_to:
            if "date" in filter_conditions:
                filter_conditions["date"]["$lte"] = datetime.combine(date_to, datetime.max.time())
            else:
                filter_conditions["date"] = {"$lte": datetime.combine(date_to, datetime.max.time())}
        
        # Query the database with the filter
        result = mydb.payment.find(filter_conditions).sort('date', 1)

        paymentData = [{
            "id": str(data['_id']),
            "date": data['date'].strftime('%Y-%m-%d') if isinstance(data['date'], datetime) else data['date'],
            "customer": data.get('customer'),
            "customer_id": data.get('customer_id'),
            "cr_no": data.get('cr_no'),
            "invoice_no": data.get('invoice_no'),
            "cash_amount": data.get('cash_amount'),
            "amount_2307": data.get('amount_2307'),
            "remarks": data.get('remarks'),
            "user": data.get('user'),
            "date_updated": data.get('date_updated'),
            "date_created": data.get('date_created'),
            "payment_method": data.get('payment_method')
        } for data in result]

        return paymentData

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving payments: {e}")


@api_payment.get("/payment-transaction/", response_class=HTMLResponse)
async def api_payment_transaction_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/payment_transaction.html", 
                                      {"request": request})


		

  
    
        






