from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from datetime import datetime, date , timedelta
from fastapi.responses import JSONResponse


from sqlalchemy.exc import SQLAlchemyError

from pydantic import BaseModel



#from bson import ObjectId

from ...authentication.authenticate_user import get_current_user

from apps.views.accounting.journal_entry_views import JournalEntryViews

api_accounting_temp= APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory="apps/templates")


@api_accounting_temp.get("/api-accounting-temp/", response_class=HTMLResponse)
async def api_ticketing(request: Request):
    return templates.TemplateResponse("accounting/insert_journal_entry.html", {"request": request})

@api_accounting_temp.get("/api-journal-entry-list-temp/", response_class=HTMLResponse)
async def api_ticketing(request: Request,username: str = Depends(get_current_user)):
    return templates.TemplateResponse("accounting/journal_entry_list.html", {"request": request})




@api_accounting_temp.post("/api-accounting-temp/", response_class=HTMLResponse)
async def insert_journal_entry(request: Request,username: str = Depends(get_current_user)):
    """This function is for posting accounting entries."""
    form = await request.form()


    # Get the current year
    current_year = datetime.now().year
    trans_date = form.get('trans_date')
    journal_type = form.get('journal_type')
    reference = form.get('reference')
    description = form.get('description')
    branch_id = form.get('branch_id')

    # If a previous reference number exists, increment it
    if journal_type == 'General Ledger':
        if reference is not None and reference != '':
        # If reference has a value, retain its value
            reference = reference
        else:
            reference_no = JournalEntryViews.get_journal_entry_by_journal_type(journal_type=journal_type)
            if reference_no:
                # Extract the last number from the reference
                ref_no = reference_no.reference  # Access the 'reference' field from the object
                last_number = int(ref_no.split('-')[-1])  # Extract the last number and convert to int
                
                # Generate the new reference number by incrementing the last number
                reference = f" GL-{current_year}-{last_number + 1}"
            else:
                # If no reference exists, start with '1'
                reference = f" GL-{current_year}-1"

    # this is for selecting General Ledger
    elif journal_type == 'Journal Voucher':
        if reference is not None and reference != '':
        # If reference has a value, retain its value
            reference = reference
        else:
            reference_no = JournalEntryViews.get_journal_entry_by_journal_type(journal_type=journal_type)
        
            if reference_no:
                # Extract the last number from the reference
                ref_no = reference_no.reference  # Access the 'reference' field from the object
                last_number = int(ref_no.split('-')[-1])  # Extract the last number and convert to int
                
                # Generate the new reference number by incrementing the last number
                reference = f" JV-{current_year}-{last_number + 1}"
            else:
                # If no reference exists, start with '1'
                reference = f" JV-{current_year}-1"

    
            

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
        # debit2 = float(debitAmount[i].replace(',', '')) if debitAmount[i] else 0
        # credit2 = float(creditAmount[i].replace(',', '')) if creditAmount[i] else 0

        debit2 = float(debitAmount[i].strip().replace(',', '') or 0)
        credit2 = float(creditAmount[i].strip().replace(',', '') or 0)


        totalD += debit2
        totalC += credit2
        result.append({
            "transdate": trans_date, 
            "journal_type": journal_type,
            "reference": reference,
            "description": description, 
            "chart_of_account": account_title[i],
            "account_code_id": account_code_id[i],
            "chart_of_account_code": account_code[i],
            "debit": debit2,
            "credit": credit2,
            "branch_id": int(branch_id),
            "user": username
            
          
        })

    totalAmount = totalD - totalC


    # print(result)

    if totalAmount == 0:
        for entry in result:
            try:
                # print(entry)
                # Insert the entry into the database
                JournalEntryViews.insert_journal_entry(**entry)
                

            except Exception as e:
                messeges = [str(e)]
                return templates.TemplateResponse("accounting/insert_journal_entry.html", 
                                                  {"request": request, "messeges": messeges})

        messeges = ["Data has been saved"]
    else:
        messeges = ["Debit and Credit Not Balanced"]

    return templates.TemplateResponse("accounting/insert_journal_entry.html", 
                                      {"request": request, "messeges": messeges})


@api_accounting_temp.get("/api-update-journal-entry-temp/{ref}", response_class=HTMLResponse)
async def api_update_inventory_html(ref: str, request: Request, username: str = Depends(get_current_user)):

    try:
        
        # print(ref)
        # return templates.TemplateResponse("accounting/insert_journal_entry.html", {"request": request})    
        journal_entry = JournalEntryViews.get_journal_entry_by_ref(reference=ref)
        
        if journal_entry:
            journal_data = [{
                "id": item.id,
                "branch_id": item.branch_id,
                "transdate": item.transdate.strftime('%Y-%m-%d'),
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
            # Convert the date object to a string

            # print(journal_data[0]['transdate'])
            # for entry in journal_data:
            #     if isinstance(entry['transdate'], date):
            #         entry['transdate'] = entry['transdate'].strftime('%Y-%m-%d')
            
            return templates.TemplateResponse("accounting/journal_entry_update.html", {"request": request,"journal_data":journal_data })
        else:
            # Handle case where item with given id is not found (optional)
            return JSONResponse(status_code=404, content={"message": "Inventory item not found"})
    
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@api_accounting_temp.post("/api-update-journal-entry-temp/{ref}", response_class=HTMLResponse)
async def update_journal_entry(ref: str, request: Request, username: str = Depends(get_current_user)):

    try:
        # Retrieve existing journal entries
        journal_entry = JournalEntryViews.get_journal_entry_by_ref(reference=ref)
        
        if journal_entry:
            journal_data = [{
                "id": item.id,
                "branch_id": item.branch_id,
                "transdate": item.transdate.strftime('%Y-%m-%d'),
                "journal_type": item.journal_type,
                "reference": item.reference,
                "description": item.description,
                "chart_of_account_code": item.chart_of_account_code,
                "chart_of_account": item.chart_of_account,
                "account_code_id": item.account_code_id,
                "debit": item.debit,
                "credit": item.credit
            } for item in journal_entry]

            # Delete the existing journal entries
           
        
        form = await request.form()
        
        current_year = datetime.now().year
        trans_date = form.get('trans_date')
        journal_type = form.get('journal_type')
        reference = form.get('reference')
        description = form.get('description')
        branch_id = form.get('branch_id')

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
                "chart_of_account": account_title[i],
                "account_code_id": account_code_id[i],
                "chart_of_account_code": account_code[i],
                "debit": debit2,
                "credit": credit2,
                "branch_id": int(branch_id),
                "user": username
                
            
            })

        totalAmount = totalD - totalC
        
       
        # print(totalD)
        # print(totalC)
        # print(totalAmount)
        for entry in result:

            print(entry['chart_of_account'])
        
        if totalAmount == 0:
            JournalEntryViews.delete_journal_entry_by_ref(reference=ref)
            for entry in result:
               
                try:
                    # print(entry)
                    JournalEntryViews.insert_journal_entry(**entry)
                except Exception as e:
                    return templates.TemplateResponse("accounting/journal_entry_update.html", 
                                                      {"request": request, "journal_data": journal_data, "messages": [str(e)]})

            messages = ["Data has been updated successfully"]
            return templates.TemplateResponse("accounting/journal_entry_update.html", 
                                               {"request": request, "journal_data": journal_data, "messages": messages})
        else:
            messages = ["Debit and credit totals do not balance"]
            return templates.TemplateResponse("accounting/journal_entry_update.html", 
                                               {"request": request, "journal_data": journal_data, "messages": messages})
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# @api_accounting_temp.post("/api-update-journal-entry-temp/{ref}", response_class=HTMLResponse)
# async def update_journal_entry(ref: str, request: Request, username: str = Depends(get_current_user)):
#     try:
#         # Retrieve existing journal entries
#         journal_entry = JournalEntryViews.get_journal_entry_by_ref(reference=ref)

#         journal_data = []
#         if journal_entry:
#             journal_data = [{
#                 "id": item.id,
#                 "branch_id": item.branch_id,
#                 "transdate": item.transdate.strftime('%Y-%m-%d'),
#                 "journal_type": item.journal_type,
#                 "reference": item.reference,
#                 "description": item.description,
#                 "chart_of_account_code": item.chart_of_account_code,
#                 "chart_of_account": item.chart_of_account,
#                 "account_code_id": item.account_code_id,
#                 "debit": item.debit,
#                 "credit": item.credit
#             } for item in journal_entry]

#         # Parse form data
#         form = await request.form()
#         trans_date = form.get('trans_date')
#         journal_type = form.get('journal_type')
#         reference = form.get('reference')
#         description = form.get('description')
#         branch_id = form.get('branch_id')

#         # Parse line items
#         account_title, debit_amount, credit_amount, account_code_id, account_code = [], [], [], [], []
#         index = 1
#         while form.get(f'accountTitle{index}') is not None:
#             account_title.append(form.get(f'accountTitle{index}'))
#             debit_amount.append(form.get(f'amount{index}', '0'))
#             credit_amount.append(form.get(f'credit_amount{index}', '0'))
#             account_code_id.append(form.get(f'account_code_id{index}'))
#             account_code.append(form.get(f'account_code{index}'))
#             index += 1

#         # Build journal entries
#         total_debit, total_credit = 0, 0
#         result = []
#         print(total_debit, total_credit)
#         for i in range(len(account_title)):
#             try:
#                 debit = float(debit_amount[i].replace(',', '')) if debit_amount[i] else 0
#                 credit = float(credit_amount[i].replace(',', '')) if credit_amount[i] else 0
#                 total_debit += debit
#                 total_credit += credit
#                 result.append({
#                     "transdate": trans_date,
#                     "journal_type": journal_type,
#                     "reference": reference,
#                     "description": description,
#                     "chart_of_account": account_title[i],
#                     "account_code_id": account_code_id[i],
#                     "chart_of_account_code": account_code[i],
#                     "debit": debit,
#                     "credit": credit,
#                     "branch_id": int(branch_id),
#                     "user": username
#                 })
#             except ValueError:
#                 return templates.TemplateResponse("accounting/journal_entry_update.html", {
#                     "request": request,
#                     "journal_data": journal_data,
#                     "messages": [f"Invalid number format at line {i + 1}."]
#                 })

#         # Validate totals
#         if total_debit != total_credit:
#             return templates.TemplateResponse("accounting/journal_entry_update.html", {
#                 "request": request,
#                 "journal_data": journal_data,
#                 "messages": ["Debit and credit totals do not balance."]
#             })

#         # Update database
#         try:
#             JournalEntryViews.delete_journal_entry_by_ref(reference=ref)
#             for entry in result:
#                 JournalEntryViews.insert_journal_entry(**entry)
#         except SQLAlchemyError as e:
#             return templates.TemplateResponse("accounting/journal_entry_update.html", {
#                 "request": request,
#                 "journal_data": journal_data,
#                 "messages": [f"Database error: {str(e)}"]
#             })

#         messages = ["Journal entry updated successfully."]
#         return templates.TemplateResponse("accounting/journal_entry_update.html", {
#             "request": request,
#             "journal_data": result,
#             "messages": messages
#         })

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
