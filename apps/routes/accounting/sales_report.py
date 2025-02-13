
from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
#from bson import ObjectId




from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
from apps.base_model.sales_bm import SalesBM
from apps.views.accounting.sales_views import SalesViews

from apps.views.accounting.journal_entry_views import JournalEntryViews


from apps.views.accounting.sales_views import SalesViews

api_sales_report = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

@api_sales_report.get("/api-sales-report/", response_class=HTMLResponse)
async def get_sales_report(request: Request,
                                        username: str = Depends(get_current_user)):
 
    return templates.TemplateResponse("accounting/sales_report.html", 
                                      {"request": request})

@api_sales_report.get("/api-get-sales-report/")
async def get_sales_report(
    datefrom: Optional[str] = None,
    dateto: Optional[str] = None,
    chart_of_account: Optional[str] = None,
    customer: Optional[str] = None,
    branch: Optional[str] = None,
    username: str = Depends(get_current_user)
):
    try:
        profiles = SalesViews.sales_report_slsp()

        # Print profiles for debugging
        # print("All profiles:", profiles)

        # Convert date strings to date objects for comparison
        if datefrom:
            try:
                datefrom = date.fromisoformat(datefrom)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid 'datefrom' format. Use 'YYYY-MM-DD'.")

        if dateto:
            try:
                dateto = date.fromisoformat(dateto)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid 'dateto' format. Use 'YYYY-MM-DD'.")


        # Ensure each profile's date is converted to a `date` object before filtering
        # for entry in profiles:
        #     try:
        #         entry['date'] = date.fromisoformat(entry['date'])
        #     except ValueError:
        #         raise HTTPException(status_code=500, detail=f"Invalid date format in data: {entry['date']}")

        # Filter profiles based on provided parameters
        filtered_profiles = [
            entry for entry in profiles
            if (datefrom is None or entry['date'] >= datefrom) and
               (dateto is None or entry['date'] <= dateto) and
               (chart_of_account is None or entry['chart_of_account'].strip() == chart_of_account.strip()) and
               (customer is None or entry['customer'].strip() == customer.strip()) and
               (branch is None or entry['branch'].strip() == branch.strip())
        ]

        # Print filtered profiles for debugging
        # print("Filtered profiles:", filtered_profiles)

        return filtered_profiles

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")
