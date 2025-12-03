from fastapi import (
    APIRouter, Body, HTTPException, Depends, Request, Response, 
    status, UploadFile, File, Form
)
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, StreamingResponse
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
    items: str
    category: str
    terms: str
    due_date: datetime
    tax_type: str
    amount: float
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created: Optional[datetime] = datetime.utcnow()

@api_sales.put("/add-new-column-sales/")
async def add_new_column(username: str = Depends(get_current_user)):
    result = mydb.sales.update_many(
        {},
        {"$set": {"items": "CEMENT"}}  # Add new field with a default value
    )
    return {"modified_count": result.modified_count}


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
            sales_collection = mydb['sales']
            sales_collection.create_index("invoice_no", unique=True)
            
            
            insertData = {
               
                "delivery_date": data.delivery_date,
                "invoice_date": data.invoice_date,
                "invoice_no": data.invoice_no,
                "po_no": data.po_no,
                "load_no":data.load_no,
                "dr_no": data.dr_no,
                "customer": data.customer,
                "customer_id": data.customer_id,
                "category": data.category,
                "items": data.items,
                "terms": data.terms,
                "due_date": data.due_date,
                "tax_type": data.tax_type,
                "amount": data.amount,
                "user": username,
                "date_updated": datetime.now(timezone.utc),
                "date_created": datetime.now(timezone.utc),
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
async def get_sales(date_from: Optional[str] = None, date_to: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        pipeline = []
        
        # Add $match stage for date range filtering if provided
        if date_from and date_to:
            pipeline.append({
                "$match": {
                    "invoice_date": {
                        "$gte": datetime.strptime(date_from, "%Y-%m-%d"),
                        "$lte": datetime.strptime(date_to, "%Y-%m-%d")
                    }
                }
            })
        
        # Add $lookup to join with payment collection
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
                    },
                    "amount": {
                        "$ifNull": ["$amount", 0]
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
                "$sort": { "date_updated": -1 }
            },
            {
                "$project": {
                    "_id": 0,
                    "id": { "$toString": "$_id" },
                    "delivery_date": { 
                        "$cond": {
                            "if": { "$and": [{ "$ne": ["$delivery_date", None] }, { "$eq": [{ "$type": "$delivery_date" }, "date"] }] },
                            "then": { "$dateToString": { "format": "%Y-%m-%d", "date": "$delivery_date" } },
                            "else": ""
                        }
                    },
                    "invoice_date": { "$dateToString": { "format": "%Y-%m-%d", "date": "$invoice_date" } },
                    "invoice_no": 1,
                    "po_no": 1,
                    "load_no": 1,
                    "dr_no": 1,
                    "customer": 1,
                    "customer_id": 1,
                    "category": 1,
                    "items": 1,
                    "terms": 1,
                    "due_date": { "$dateToString": { "format": "%Y-%m-%d", "date": "$due_date" } },
                    "tax_type": 1,
                    "amount": 1,
                    "balance": 1,
                    "status": 1,
                    "user": 1,
                    "date_updated": 1,
                    "date_created": 1
                }
            }
        ]

        result = list(mydb.sales.aggregate(pipeline))
        return result
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
                "items": data.items,
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


@api_sales.get("/api-sales-report/", response_class=HTMLResponse)
async def api_sales_report_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Sales' in roleAuthenticate['allowed_access']:


        return templates.TemplateResponse("accounting/sales_report.html", 
                                      {"request": request})

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )

@api_sales.get("/upload-sales-report/", response_class=HTMLResponse)
async def upload_sales_report_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Sales' in roleAuthenticate['allowed_access']:


        return templates.TemplateResponse("accounting/upload_sales_report.html", 
                                      {"request": request})

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )

@api_sales.post("/upload-sales-report/")
async def upload_sales_report(file: UploadFile = File(...), username: str = Depends(get_current_user)):
    
    role = mydb.login.find_one({"email_add": username})
    if not role:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})
    if not roleAuthenticate or 'Sales' not in roleAuthenticate['allowed_access']:
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




@api_sales.get("/download-sales-template/")
async def download_sales_template(username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Sales' in roleAuthenticate['allowed_access']:
        try:
            # Define the column headers based on the user's provided pattern
            column_headers = [
                'delivery_date',
                'invoice_date',
                'invoice_no',
                'po_no',
                'load_no',
                'dr_no',
                'customer',
                'customer_id',
                'category',
                'terms',
                'due_date',
                'tax_type',
                'amount'
            ]

            # Create an empty DataFrame with only the specified columns
            df = pd.DataFrame(columns=column_headers)

            # Create an in-memory Excel file
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Sales')
            output.seek(0)

            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=sales_template.xlsx"}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized",
        )

from fastapi import Form, File, UploadFile, Depends, HTTPException, status, Body
import json

class ImportRequest(BaseModel):
    column_mapping: dict

@api_sales.post("/import-sales-data/")
async def import_sales_data(
    file: UploadFile = File(...),
    column_mapping: str = Form(...),
    username: str = Depends(get_current_user)
):
    # 1. Authorization Check
    role = mydb.login.find_one({"email_add": username})
    if not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})
    if not roleAuthenticate or 'Sales' not in roleAuthenticate['allowed_access']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized"
        )
    
    # 2. Parse column_mapping
    try:
        mapping_data = json.loads(column_mapping)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid mapping format: {str(e)}")

    # 3. Read and validate file
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="The file is empty")
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="File contains no data")

    # 4. Validate required fields are mapped
    required_fields = ['delivery_date', 'invoice_date', 'invoice_no', 'customer', 'amount', 'due_date']
    mapped_target_fields = list(mapping_data.values())
    missing_fields = [field for field in required_fields if field not in mapped_target_fields]
    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields in mapping: {', '.join(missing_fields)}"
        )

    try:
        # 5. Rename columns based on mapping (Excel_column_name -> target_field_name)
        # We need to reverse the mapping to rename from original Excel column names to our target field names
        # mapping_data is {excel_col_name: target_field_name}
        df = df.rename(columns=mapping_data)

        # 6. Validate and convert date fields
        date_fields = ['delivery_date', 'invoice_date', 'due_date']
        for field in date_fields:
            if field in df.columns:
                df[field] = pd.to_datetime(df[field], errors='coerce', format='mixed')
                if df[field].isna().any():
                    invalid_dates_rows = df[df[field].isna()]
                    first_invalid_row_index = invalid_dates_rows.index[0] + 2 # +2 for 0-based index and header row
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid date format in column '{field}' at row {first_invalid_row_index}. Please ensure dates are in a recognizable format."
                    )

        # 7. Validate amount field
        if 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            if df['amount'].isna().any():
                invalid_amounts_rows = df[df['amount'].isna()]
                first_invalid_row_index = invalid_amounts_rows.index[0] + 2 # +2 for 0-based index and header row
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid numeric value in column 'amount' at row {first_invalid_row_index}. Please ensure all amounts are valid numbers."
                )

        # 8. Check for duplicate invoice numbers in the uploaded file
        if 'invoice_no' in df.columns and df['invoice_no'].duplicated().any():
            duplicate_invoices = df[df['invoice_no'].duplicated()]['invoice_no'].unique().tolist()
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate invoice numbers found in the uploaded file: {', '.join(map(str, duplicate_invoices))}"
            )

        # 9. Check for existing invoice numbers in database and gather details
        existing_invoices_details = []
        for invoice_no in df['invoice_no'].unique():
            if pd.isna(invoice_no):
                continue
            
            if isinstance(invoice_no, float):
                invoice_no_query = str(int(invoice_no))
            else:
                invoice_no_query = str(invoice_no)

            existing_record = mydb.sales.find_one({"invoice_no": invoice_no_query})
            if existing_record:
                existing_invoices_details.append({
                    "invoice_no": invoice_no_query,
                    "customer": existing_record.get('customer', 'N/A'),
                    "invoice_date": existing_record.get('invoice_date').strftime('%Y-%m-%d') if existing_record.get('invoice_date') else 'N/A',
                    "amount": existing_record.get('amount', 0),
                    "existing_user": existing_record.get('user', 'N/A'),
                    "date_created": existing_record.get('date_created').strftime('%Y-%m-%d %H:%M:%S') if existing_record.get('date_created') else 'N/A'
                })
        
        if existing_invoices_details:
            # Format the error message with detailed information
            error_details = "\n".join([
                f"Invoice No: {d['invoice_no']}\n"
                f"- Customer: {d['customer']}\n"
                f"- Invoice Date: {d['invoice_date']}\n"
                f"- Amount: {d['amount']}\n"
                f"- Created By: {d['existing_user']}\n"
                f"- Created On: {d['date_created']}\n"
                for d in existing_invoices_details
            ])
            
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "The following invoices already exist in the database:",
                    "existing_invoices": existing_invoices_details,
                    "error_details": error_details
                }
            )

        # 10. Prepare records for insertion
        records = []
        for _, row in df.iterrows():
            record = row.where(pd.notna(row), None).to_dict()
            record.update({
                "user": username,
                "date_created": datetime.now(timezone.utc),
                "date_updated": datetime.now(timezone.utc)
            })
            records.append(record)

        # 11. Insert records into MongoDB
        result = mydb.sales.insert_many(records)

        return {
            "status": "success",
            "message": f"Successfully imported {len(result.inserted_ids)} records",
            "inserted_count": len(result.inserted_ids)
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error importing data: {str(e)}"
        )

@api_sales.get("/download-sales-report/")
async def download_sales_report(username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Sales' in roleAuthenticate['allowed_access']:
        try:
            # Query all sales data from MongoDB
            sales_data = list(mydb.sales.find({}, {'_id': 0}))  # Exclude _id field
            
            # Convert to DataFrame
            df = pd.DataFrame(sales_data)
            
            # Create an in-memory file
            output = io.BytesIO()
            
            # Save as ODS file
            df.to_excel(output, engine='openpyxl', index=False)
            output.seek(0)
            
            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=SALES.xlsx"}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized",
        )

@api_sales.get("/api-autocomplete-vendor-customer/")
async def autocomplete_vendor_customer(term: Optional[str] = None, username: str = Depends(get_current_user)):
    """Autocomplete vendor/customer names from customers and previous sales"""
    try:
        results = []
        search_term = term.strip().lower() if term else ""
        
        # Get unique customers from sales collection
        customers = []
        try:
            customer_list = mydb.sales.distinct("customer")
            # Filter out None and empty values
            customers = [c for c in customer_list if c and str(c).strip()]
        except Exception as e:
            print(f"Error getting customers from sales: {e}")
            customers = []
        
        # Get customer names from customer_profile collection
        customer_profiles = []
        try:
            profiles = mydb.customer_profile.find({})
            for profile in profiles:
                if 'bussiness_name' in profile and profile['bussiness_name']:
                    customer_name = str(profile['bussiness_name']).strip()
                    if customer_name:
                        customer_profiles.append(customer_name)
        except Exception as e:
            print(f"Error getting customers from customer_profile: {e}")
            pass
        
        # Combine all customers and remove duplicates
        all_customers = list(set(customers + customer_profiles))
        
        # Filter and sort by relevance
        if search_term:
            filtered = [c for c in all_customers if search_term in str(c).lower()]
            # Sort by how close the match is (exact matches first)
            filtered.sort(key=lambda x: (not str(x).lower().startswith(search_term), len(str(x)), str(x).lower()))
        else:
            filtered = sorted([str(c) for c in all_customers])
        
        # Return top 10 results
        results = filtered[:10]
        
        return {
            "suggestions": results
        }
        
    except Exception as e:
        print(f"Autocomplete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



