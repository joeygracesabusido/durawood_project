from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
from bson import ObjectId

from pymongo import ASCENDING

from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()



from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user
#from apps.base_model.customer_profile_bm import CustomerProfileBM
#from apps.views.accounting.customer_profile_views import CustomerProfileViews


class CustomerProfileBM(BaseModel):

    customer_vendor_id: str
    bussiness_name: str 
    name_of_tax_payer: str 
    tin: str
    rdo: str
    address: str
    tax_type: str
    description: str
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created:  datetime = datetime.utcnow()



api_customer_profile = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

@api_customer_profile.post("/api-insert-customer_profile/", response_model=None)
async def create_customer_profile(data: CustomerProfileBM, username: str = Depends(get_current_user)):
    try:
        customer_collection = mydb['customer_vendor_profile']
        customer_collection.create_index("customer_vendor_id", unique=True)
        dataInsert = {

            "customer_vendor_id": data.customer_vendor_id,
            "bussiness_name": data.bussiness_name,
            "name_of_tax_payer": data.name_of_tax_payer,
            "tin": data.tin,
            "rdo": data.rdo,
            "address": data.address,
            "tax_type": data.tax_type,
            "description": data.description,
            "user": username,
            "date_updated": data.date_updated,
            "date_created": data.date_created,


        }
        mydb.customer_vendor_profile.insert_one(dataInsert)

        return {"message": "Company profile created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating profile: {e}")

@api_customer_profile.get("/api-get-customer-profiles/")
async def get_customer(username: str = Depends(get_current_user)):
    try:
        result = mydb.customer_vendor_profile.find().sort('bussiness_name', -1)

        customerData = [{
            
            "id": str(data['_id']),
            "customer_vendor_id": data['customer_vendor_id'] ,
            "bussiness_name": data['bussiness_name'],
            "name_of_tax_payer": data['name_of_tax_payer'],
            "tin": data['tin'],
            "rdo": data['rdo'],
            "address": data['address'],
            "tax_type": data['tax_type'],
            "description": data['description'],
            "user": username,
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


        } for data in result

    ]
        return customerData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_customer_profile.put("/api-update-customer-profile/", response_model=None)
async def update_customer_profile_api(profile_id: str, data: CustomerProfileBM,username: str = Depends(get_current_user)):
    obj_id = ObjectId(profile_id)
    try:

        updateData = {
            
                "customer_vendor_id": data.customer_vendor_id,
                "bussiness_name": data.bussiness_name,
                "name_of_tax_payer": data.name_of_tax_payer,
                "tin": data.tin,
                "rdo": data.rdo,
                "address": data.address,
                "tax_type": data.tax_type,
                "description": data.description,
                "user": username,
                "date_updated": data.date_created,

            }
        result = mydb.customer_vendor_profile.update_one({'_id': obj_id},{'$set': updateData})
        return {"message":"Custome has been Updated"} 
    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
  


@api_customer_profile.get("/api-autocomplete-vendor-customer/")
async def autocomplete_contact(term: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        
        #contact = get_customer()

        result =  mydb.customer_vendor_profile.find().sort('bussiness_name', ASCENDING).to_list(None)

        customerData = [{
            
            "id": str(data['_id']),
            "customer_vendor_id": data['customer_vendor_id'] ,
            "bussiness_name": data['bussiness_name'],
            "name_of_tax_payer": data['name_of_tax_payer'],
            "tin": data['tin'],
            "rdo": data['rdo'],
            "address": data['address'],
            "tax_type": data['tax_type'],
            "description": data['description'],
            "user": username,
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


            } for data in result

        ]


        
        contact = customerData
        # Filter chart of accounts based on the search term
        if term:
            filtered_contact = [
                item for item in contact
                if term.lower() in item['bussiness_name'].lower() or term.lower() in item['name_of_tax_payer'].lower()
            ]
        else:
            filtered_contact = contact  # If no term is provided, return all

        # Construct suggestions from filtered chart of account data
        suggestions = [
            {
                "value": f"{item['bussiness_name']}",
                "id": item['id'],
                
            }
            for item in filtered_contact
        
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)


