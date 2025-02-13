from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status, File, UploadFile
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional

#from bson import ObjectId


#from pymongo import  DESCENDING


from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.chart_of_account_bm import ChartofAccountBM, ChartofAccountUpdateRequest
from apps.views.accounting.chart_of_account_views import ChartofAccountViews



api_chart_of_account = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


@api_chart_of_account.post('/api-insert-chart-of-account/')
async def insert_chart_of_account(items:ChartofAccountBM, username: str = Depends(get_current_user)):

    
    try:
        ChartofAccountViews.insert_chart_of_account(items,username)
        return {"message": "Account type added successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# @api_chart_of_account.post('/api-get-chart-of-account/')
# async def get_chart_of_accout_api(items:ChartofAccountBM, username: str = Depends(get_current_user)):

    
#     try:
#         ChartofAccountViews.insert_chart_of_account(items,username)
#         return {"message": "Account type added successfully"}
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@api_chart_of_account.get('/api-get-chart-of-accounts/', response_model=List[ChartofAccountBM])
async def get_chart_of_accounts(username: str = Depends(get_current_user)):
    try:
        # Call the method to get the list of chart of accounts
        chart_of_accounts = ChartofAccountViews.get_chart_of_account()
        
        if chart_of_accounts is None:
            raise HTTPException(status_code=404, detail="No chart of accounts found")
        
        return chart_of_accounts

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#, response_model=List[ChartofAccountBM]
@api_chart_of_account.get('/api-get-chart-of-accounts2/')
async def get_chart_of_accounts(username: str = Depends(get_current_user)):
    try:
        # Call the method to get the list of chart of accounts
        chart_of_accounts = ChartofAccountViews.get_chart_of_account_join()

        
        return [{
            "id": chart.id,
            "account_type": type.account_type,
            "chart_of_account_code": chart.chart_of_account_code,
            "chart_of_account": chart.chart_of_account,
           
        } for chart, type in chart_of_accounts]
            
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# response_model=List[dict]
@api_chart_of_account.get("/api-autocomplete-chart-of-account/")
async def autocomplete_chart_of_account(term: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        # Retrieve all chart of account data from the database
        chart_of_accounts = ChartofAccountViews.get_chart_of_account()
        
        # Filter chart of accounts based on the search term
        if term:
            filtered_coa = [
                item for item in chart_of_accounts
                if term.lower() in item.chart_of_account.lower()
            ]
        else:
            filtered_coa = chart_of_accounts  # If no term is provided, return all

        # Construct suggestions from filtered chart of account data
        suggestions = [
            {
                "value": f"{item.chart_of_account}",
                "id": item.id,
                "chart_of_account_code": item.chart_of_account_code,
                "description": item.description,
                "account_type_id": item.accoun_type_id,
                "user": item.user,
                "date_created": item.date_created,
                "date_updated": item.date_updated
            }
            for item in filtered_coa
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)


@api_chart_of_account.post("/api/import_chart_of_account")
async def import_chart_of_account(file: UploadFile = File(...)):
    if file.content_type not in ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Process the file (e.g., parse the CSV or Excel)
    content = await file.read()
    # Handle the file content here
    
    return {"message": "File uploaded successfully!"}


@api_chart_of_account.put('/api-update-chart-account/{id}', response_model=None)
async def update_chart_of_account(
    id: int,
    item: ChartofAccountUpdateRequest,
    username: str = Depends(get_current_user)
):
    """
    API endpoint to update Chart of Account details.
    """
    try:
        # Call the static method to update the record
        updated = ChartofAccountViews.update_chart_of_account(
            id=id,
            accoun_type_id=item.accoun_type_id,
            chart_of_account=item.chart_of_account,
            chart_of_account_code=item.chart_of_account_code,
            description=item.description,
            date_updated=item.date_updated,
            user=username
        )
        
        if updated:
            return {"message": "Chart of Account updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Chart of Account not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# @api_chart_of_account.put('/api-update-account-type/{id}',response_model=None)
# async def update_account_type(
#         id: int,
#         item: ChartofAccountBM,
#         username: str = Depends(get_current_user)
#     ):
#     """
#     API endpoint to update account type details.
#     """
#     try:
#         # Call the `update_account_type` method from the views
#         ChartofAccountViews.update_chart_of_account(item=item)
        
       
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
# @api_chart_of_account.put("/api-update-chart-account/{item_id}", response_model=None)
# async def update_chart_of_account(item_id: int, item: ChartofAccountBM, username: str = Depends(get_current_user)):
#     item.id = item_id
#     updated_coa = ChartofAccountViews.update_chart_of_account(item, user=username)
#     if updated_coa:
#         return {"message": "Chart of Account updated successfully"}
#     else:
#         raise HTTPException(status_code=404, detail="Chart of Account not found")


    
    



  




