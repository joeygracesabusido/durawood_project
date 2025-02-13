from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId





from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.journal_entry_bm import JournalEntryBM
from apps.views.accounting.journal_entry_views import JournalEntryViews


class JournalEntryRequest(BaseModel):
  
    transdate: str
    journal_type: str
    reference: str
    chart_of_account: str
    account_code_id: int
    chart_of_account_code: str
    debit: float
    credit: float
    branch_id: int
    description: Optional[str] = None
    user: Optional[str] = None




api_journale_entry = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


@api_journale_entry.get('/api-get-journal-entry-list/', response_model=List[JournalEntryBM])
async def get_journal_entry(username: str = Depends(get_current_user)):
    try:

        if username:
           
            # Call the method to get the list of chart of accounts
            jorunal_entry = JournalEntryViews.get_journal_entry()
            return jorunal_entry
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized",
            # headers={"WWW-Authenticate": "Basic"},
            )
                

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_journale_entry.get('/api-get-journal-entry-by-ref/', response_model=List[JournalEntryBM])
async def get_journal_entry_by_ref(ref: str, username: str = Depends(get_current_user)):
    try:
        # Call the method to get the journal entry
        jv_entries = JournalEntryViews.get_journal_entry_by_ref(reference=ref)

        if not jv_entries:
            raise HTTPException(status_code=404, detail="No journal voucher found")
        
        # Convert the SQLAlchemy result to a list of Pydantic models
        return [JournalEntryBM.from_orm(entry) for entry in jv_entries]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_journale_entry.get('/api-get-journal-entry-by-ref2/')
async def get_journal_entry_by_ref2(ref: str, username: str = Depends(get_current_user)):
    try:
        # Call the method to get the journal entry
        journal_entry = JournalEntryViews.get_journal_entry_by_ref(reference=ref)
        
        if journal_entry:
            journal_data = [{
                    "id": item.id,
                    "transdate": item.transdate,
                    "journal_type": item.journal_type,
                    "reference": item.reference,
                    "description":item.description,
                    "chart_of_account_code": item.chart_of_account_code,
                    "chart_of_account": item.chart_of_account,
                    "account_code_id": item.account_code_id,
                    "debit": item.debit,
                    "credit": item.credit
                }
                for item in journal_entry 
                ]
            return journal_data

    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_journale_entry.get('/trial-balance-report/')
async def api_get_journal_entry_trial_balance(
    datefrom: Optional[str] = None ,
    dateto: Optional[str] = None 
):
    try:
        # Call the static method
        data = JournalEntryViews.get_journal_entry_by_journal_trialbal(datefrom, dateto)
        if data is None:
            raise HTTPException(status_code=404, detail="No data found for the given date range.")
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_journale_entry.get('/trial-balance-report2/')
async def api_get_trialBalance(
    datefrom: Optional[str] = None,
    dateto: Optional[str] = None
) -> List[Dict]:
    try:
        # Call the static method
        data =  JournalEntryViews.get_journal_entry_by_one_table(datefrom, dateto)
        
        if not data:
            raise HTTPException(status_code=404, detail="No data found for the given date range.")
        
        return {"data": data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_journale_entry.delete("/api-delete-journal-entry-temp/{ref}", response_class=HTMLResponse)
async def delete_journal_entry(ref: str, request: Request, username: str = Depends(get_current_user)):

    try:
       
        JournalEntryViews.delete_journal_entry_by_ref(reference=ref)
        return('Data has been deleted')

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_journale_entry.post("/insert-journal-entry-import/", response_model=JournalEntryBM)
async def insert_journal_entry(entry: JournalEntryBM, username: str = Depends(get_current_user)):
    try:
        # Convert Pydantic model to a dictionary
        entry_data = entry.dict()
        # Call the static method to insert data
        inserted_entry = JournalEntryViews.insert_journal_entry(**entry_data)
        return inserted_entry
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    

@api_journale_entry.post("/api-insert-journal-entry-import2/")
async def insert_journal_entry2(entry: JournalEntryRequest, username: str = Depends(get_current_user)):
    try:
        # Validate transdate format
        try:
            transdate = datetime.strptime(entry.transdate, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

        new_entry = JournalEntryViews.insert_journal_entry2(
            transdate=transdate,
            journal_type=entry.journal_type,
            reference=entry.reference,
            chart_of_account=entry.chart_of_account,
            account_code_id=entry.account_code_id,
            chart_of_account_code=entry.chart_of_account_code,
            debit=entry.debit,
            credit=entry.credit,
            branch_id=entry.branch_id,
            description=entry.description,
            user=username
        )
        return {
            "status": "success",
            "message": "Journal entry inserted successfully.",
            "data": new_entry
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    



  




