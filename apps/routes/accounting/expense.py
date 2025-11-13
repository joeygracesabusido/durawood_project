from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from pydantic import BaseModel
from bson import ObjectId

from apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()

from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.expense_bm import ExpenseBM
import io
import pandas as pd

api_expense = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

# ====== TEMPLATE ROUTES ======

@api_expense.get("/expense-list/", response_class=HTMLResponse)
async def expense_list_template(request: Request, username: str = Depends(get_current_user)):
    """Display expense list page"""
    return templates.TemplateResponse("accounting/expense_list.html", {"request": request})

@api_expense.get("/add-expense/", response_class=HTMLResponse)
async def add_expense_template(request: Request, username: str = Depends(get_current_user)):
    """Display add expense form"""
    return templates.TemplateResponse("accounting/add_expense.html", {"request": request})

@api_expense.get("/edit-expense/{expense_id}", response_class=HTMLResponse)
async def edit_expense_template(expense_id: str, request: Request, username: str = Depends(get_current_user)):
    """Display edit expense form"""
    try:
        obj_id = ObjectId(expense_id)
        expense = mydb.expenses.find_one({'_id': obj_id})
        
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        expense['_id'] = str(expense['_id'])
        
        return templates.TemplateResponse("accounting/edit_expense.html", {
            "request": request,
            "expense": expense
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====== API ENDPOINTS ======

@api_expense.get("/api-get-expenses/")
async def get_expenses(
    username: str = Depends(get_current_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    category: Optional[str] = None
):
    """Get expenses with optional filtering"""
    try:
        pipeline = []
        
        # Build match conditions
        match_conditions = {}
        
        if date_from and date_to:
            match_conditions["date"] = {
                "$gte": datetime.combine(date_from, datetime.min.time()),
                "$lte": datetime.combine(date_to, datetime.max.time())
            }
        
        if category:
            match_conditions["category"] = category
        
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Add sorting
        pipeline.append({"$sort": {"date": -1}})
        
        # Project fields
        pipeline.append({
            "$project": {
                "_id": 1,
                "date": { "$dateToString": { "format": "%Y-%m-%d", "date": "$date" } },
                "category": 1,
                "vendor": 1,
                "description": 1,
                "amount": 1,
                "payment_method": 1,
                "reference_no": 1,
                "remarks": 1,
                "status": 1,
                "tax_type": 1,
                "user": 1,
                "date_created": 1,
                "date_updated": 1
            }
        })
        
        result = list(mydb.expenses.aggregate(pipeline))
        
        # Convert ObjectId to string
        for expense in result:
            expense["id"] = str(expense.pop("_id"))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving expenses: {e}")

@api_expense.post("/api-add-expense/")
async def add_expense(data: ExpenseBM, username: str = Depends(get_current_user)):
    """Add new expense"""
    try:
        expense_data = {
            "date": data.date,
            "category": data.category,
            "vendor": data.vendor,
            "description": data.description,
            "amount": float(data.amount),
            "payment_method": data.payment_method,
            "reference_no": data.reference_no,
            "remarks": data.remarks,
            "status": data.status or "Approved",
            "tax_type": data.tax_type,
            "user": username,
            "date_created": datetime.utcnow(),
            "date_updated": datetime.utcnow()
        }
        
        result = mydb.expenses.insert_one(expense_data)
        
        return {
            "message": "Expense added successfully",
            "id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_expense.put("/api-update-expense/{expense_id}")
async def update_expense(expense_id: str, data: ExpenseBM, username: str = Depends(get_current_user)):
    """Update existing expense"""
    try:
        obj_id = ObjectId(expense_id)
        
        update_data = {
            "date": data.date,
            "category": data.category,
            "vendor": data.vendor,
            "description": data.description,
            "amount": float(data.amount),
            "payment_method": data.payment_method,
            "reference_no": data.reference_no,
            "remarks": data.remarks,
            "status": data.status or "Approved",
            "tax_type": data.tax_type,
            "user": username,
            "date_updated": datetime.utcnow()
        }
        
        result = mydb.expenses.update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        return {"message": "Expense updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_expense.delete("/api-delete-expense/{expense_id}")
async def delete_expense(expense_id: str, username: str = Depends(get_current_user)):
    """Delete expense"""
    try:
        obj_id = ObjectId(expense_id)
        
        result = mydb.expenses.delete_one({'_id': obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        return {"message": "Expense deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_expense.get("/api-get-expense-summary/")
async def get_expense_summary(
    username: str = Depends(get_current_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
):
    """Get expense summary by category"""
    try:
        pipeline = []
        
        # Build match conditions
        match_conditions = {}
        
        if date_from and date_to:
            match_conditions["date"] = {
                "$gte": datetime.combine(date_from, datetime.min.time()),
                "$lte": datetime.combine(date_to, datetime.max.time())
            }
        
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Group by category
        pipeline.append({
            "$group": {
                "_id": "$category",
                "total": { "$sum": "$amount" },
                "count": { "$sum": 1 }
            }
        })
        
        pipeline.append({"$sort": {"total": -1}})
        
        result = list(mydb.expenses.aggregate(pipeline))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving summary: {e}")

@api_expense.get("/api-get-expense-by-status/")
async def get_expenses_by_status(
    username: str = Depends(get_current_user),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
):
    """Get expense summary by status"""
    try:
        pipeline = []
        
        # Build match conditions
        match_conditions = {}
        
        if date_from and date_to:
            match_conditions["date"] = {
                "$gte": datetime.combine(date_from, datetime.min.time()),
                "$lte": datetime.combine(date_to, datetime.max.time())
            }
        
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Group by status
        pipeline.append({
            "$group": {
                "_id": "$status",
                "total": { "$sum": "$amount" },
                "count": { "$sum": 1 }
            }
        })
        
        result = list(mydb.expenses.aggregate(pipeline))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving status summary: {e}")

@api_expense.post("/api-upload-expenses/")
async def upload_expenses(file: UploadFile = File(...), username: str = Depends(get_current_user)):
    """Upload expenses from Excel file"""
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload an Excel file (.xlsx, .xls) or CSV file."
            )
        
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="The file is empty")
        
        # Parse Excel file
        df = pd.read_excel(io.BytesIO(contents))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file contains no data")
        
        # Clean data
        df = df.replace([float('inf'), float('-inf')], None)
        df = df.where(df.notna(), None)
        
        # Insert data
        inserted_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                expense_data = {
                    "date": pd.to_datetime(row.get('date')),
                    "category": row.get('category'),
                    "vendor": row.get('vendor'),
                    "description": row.get('description'),
                    "amount": float(row.get('amount', 0)),
                    "payment_method": row.get('payment_method'),
                    "reference_no": row.get('reference_no'),
                    "remarks": row.get('remarks'),
                    "status": row.get('status', 'Approved'),
                    "tax_type": row.get('tax_type'),
                    "user": username,
                    "date_created": datetime.utcnow(),
                    "date_updated": datetime.utcnow()
                }
                
                mydb.expenses.insert_one(expense_data)
                inserted_count += 1
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
        
        return {
            "message": f"Successfully inserted {inserted_count} expenses",
            "inserted_count": inserted_count,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_expense.get("/api-get-expense-categories/")
async def get_expense_categories(username: str = Depends(get_current_user)):
    """Get list of expense categories"""
    try:
        categories = [
            "Salaries & Wages",
            "Office Supplies",
            "Utilities",
            "Rent/Lease",
            "Transportation",
            "Meals & Entertainment",
            "Professional Services",
            "Insurance",
            "Equipment",
            "Maintenance & Repairs",
            "Advertising",
            "Travel",
            "Training & Development",
            "Software & Subscriptions",
            "Other"
        ]
        
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_expense.get("/api-autocomplete-vendor/")
async def autocomplete_vendor(term: Optional[str] = None, username: str = Depends(get_current_user)):
    """Autocomplete vendor/payee names from customers and previous expenses"""
    try:
        results = []
        search_term = term.strip().lower() if term else ""
        
        # Get unique vendors from expenses collection
        vendors = []
        try:
            vendor_list = mydb.expenses.distinct("vendor")
            # Filter out None and empty values
            vendors = [v for v in vendor_list if v and str(v).strip()]
        except Exception as e:
            print(f"Error getting vendors: {e}")
            vendors = []
        
        # Get customer names from customer_profile collection
        customers = []
        try:
            customer_profiles = mydb.customer_profile.find({})
            for profile in customer_profiles:
                if 'customer' in profile and profile['customer']:
                    customer_name = str(profile['customer']).strip()
                    if customer_name:
                        customers.append(customer_name)
        except Exception as e:
            print(f"Error getting customers: {e}")
            pass
        
        # Combine vendors and customers, remove duplicates
        all_payees = list(set(vendors + customers))
        
        # Filter and sort by relevance
        if search_term:
            filtered = [p for p in all_payees if search_term in str(p).lower()]
            # Sort by how close the match is (exact matches first)
            filtered.sort(key=lambda x: (not str(x).lower().startswith(search_term), len(str(x)), str(x).lower()))
        else:
            filtered = sorted([str(p) for p in all_payees])
        
        # Return top 10 results
        results = filtered[:10]
        
        return {
            "suggestions": results
        }
        
    except Exception as e:
        print(f"Autocomplete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
