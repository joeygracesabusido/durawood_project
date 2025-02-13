from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId




from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.purchases_bm import PurchasesBM


from apps.views.accounting.journal_entry_views import JournalEntryViews


from apps.views.accounting.purchases_views import PurchaseViews

api_purchases = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

@api_purchases.get("/purchase/", response_class=HTMLResponse)
async def api_chart_of_account_template(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/purchases.html", 
                                      {"request": request})


@api_purchases.post("/purchase/", response_class=HTMLResponse)
async def api_sales_transaction(request: Request,
                                        username: str = Depends(get_current_user)):
    """This function is for posting accounting entries."""
    form = await request.form()

    # Get the current year
    current_year = datetime.now().year
    trans_date = form.get('trans_date')
    journal_type = form.get('journal_type')
    reference = form.get('reference')
    description = form.get('description')
    branch_id = form.get('branch_id')

    
    
    # this is for selecting General Ledger
    if journal_type == 'Purchases':
         
         reference_no = JournalEntryViews.get_journal_entry_by_journal_type(journal_type=journal_type)

         if reference_no:
             # Extract the last number from the reference
            #  ref_no = reference_no.reference  # Access the 'reference' field from the object
            #  last_number = int(ref_no.split('-')[-1])  # Extract the last number and convert to int

            ref_no = reference_no.reference  # Example: 'Sales-2024-10'
            parts = ref_no.split('-')
            last_number = int(parts[-1])  # Extract the last number part
            reference = f"Purchases-{current_year}-{last_number + 1}"  # Increment the number
            
             # Generate the new reference number by incrementing the last number
            #  reference = f" Sales-{current_year}-{last_number + 1}"
         else:
             # If no reference exists, start with '1'
             reference = f" Purchases-{current_year}-1"
    
            

    account_title = []
    debitAmount = []
    creditAmount = []
    account_code_id = []
    account_code = []
    index = 1

    while form.get(f'accountTitle{index}') is not None:
        account_title.append(form.get(f'accountTitle{index}'))
        debitAmount.append(form.get(f'amount{index}'))
        creditAmount.append(form.get(f'credit_amount{index}'))
        account_code_id.append(form.get(f'chart_of_account_id{index}'))
        account_code.append(form.get(f'account_code{index}'))
        index += 1

    # Prepare the data for insertion
    totalD = 0
    totalC = 0
    result = []

    for i in range(len(account_title)):
        debit2 = float(debitAmount[i].replace(',', '')) if debitAmount[i] else 0
        credit2 = float(creditAmount[i].replace(',', '')) if creditAmount[i] else 0
        totalD += debit2
        totalC += credit2
        result.append({
            "transdate": trans_date, 
            "journal_type": journal_type,
            "reference": reference,
            "description": description, 
            "user": username,
            "chart_of_account": account_title[i],
            "account_code_id": account_code_id[i],
            "chart_of_account_code": account_code[i],
            "branch_id": int(branch_id),
            "debit": debit2,
            "credit": credit2,
            
            
          
        })

    totalAmount = totalD - totalC


    # print(result)
    messeges = []

    print(result)

    if totalAmount == 0:
        for entry in result:
            item = form.get('supplier_id')

            
            
            PurchaseViews.insert_purchases_from_journal(customer_id=item,**entry)
         
        messeges = ["Data Has been Save"]
        return templates.TemplateResponse("accounting/purchases.html", 
                                                 {"request": request, "messeges": messeges})


    else:
        messeges = ["Debit and Credit Not Balanced"]

    return templates.TemplateResponse("accounting/sales.html", 
                                      {"request": request, "messeges": messeges})





@api_purchases.post("/api-create-purchase/", response_model=None)
async def create_purchases(item: PurchasesBM, username: str = Depends(get_current_user)):
    try:
        PurchaseViews.insert_purchases(item, user=username)
        return {"message": "Purchases Transaction created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating profile: {e}")

@api_purchases.get("/api-get-purchases-list/", response_model=List[PurchasesBM])
async def get_sales(username: str = Depends(get_current_user)):
    try:
        profiles = PurchaseViews.get
        return profiles
    
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_purchases.put("/api-update-purchases-transaction/", response_model=None)
async def update_sales_trans(profile_id: int, item: PurchasesBM,username: str = Depends(get_current_user)):
    item.id = profile_id
    updated_profile = PurchaseViews.update_purchases(item, user=username,date_update=datetime.now)
    if updated_profile:
        return {"message": "Sales Transaction updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Profile not found")
    




