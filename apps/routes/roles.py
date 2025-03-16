from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
from bson import ObjectId

from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()



from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user

api_roles = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

class rolesBM(BaseModel):
    role: str
    allowed_access: List[str]


@api_roles.get("/roles/", response_class=HTMLResponse)
async def get_sales_report(request: Request,
                                        username: str = Depends(get_current_user)):

    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    print(roleAuthenticate['allowed_access'])
    

    if 'Allowed Roles' in roleAuthenticate['allowed_access']:



        return templates.TemplateResponse("accounting/roles.html", 
                                      {"request": request})

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )




@api_roles.post("/api-insert-roles/", response_model=None)
async def create_sales_transaction(data: rolesBM, username: str = Depends(get_current_user)):
    try:

        role_collection = mydb['roles']
        role_collection.create_index("role", unique=True)
        insertData = {
           
            "role": data.role,
            "allowed_access": data.allowed_access,
            "date_updated": datetime.utcnow(),
            "date_created": datetime.utcnow(),
        }

        # Correct MongoDB insert operation
        mydb.roles.insert_one(insertData)

        return {"message": "Role has been inserted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error inserting sales: {e}")

@api_roles.get("/api-get-role/")
async def get_get(username: str = Depends(get_current_user)):

    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    #print(roleAuthenticate['allowed_access'])
    

    # if 'Allowed Roles' in roleAuthenticate['allowed_access']:


    try:
        result = mydb.roles.find().sort('role', -1)

        SalesData = [{
            
            "id": str(data['_id']), 
            "role": data['role'],
            "allowed_access": data['allowed_access'],
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


        } for data in result

    ]
        return SalesData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")


   
    #
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail= "Not Authorized ",
    #         # headers={"WWW-Authenticate": "Basic"},
    #     )
    #


@api_roles.put("/api-update-role/{profile_id}", response_model=None)
async def update_customer_profile_api(profile_id: str, data: rolesBM,username: str = Depends(get_current_user)):
    obj_id = ObjectId(profile_id)

    role = mydb.login.find_one({"email_add":username})

    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    print(roleAuthenticate['allowed_access'])
    

    if 'Allowed Roles' in roleAuthenticate['allowed_access']:

        try:

            updateData = {

                "role": data.role,
                "allowed_access": data.allowed_access,
                "date_updated": datetime.utcnow(),
                         
                  
                }
            result = mydb.roles.update_one({'_id': obj_id},{'$set': updateData})
            return {"message":"Role Data Has been Updated"} 
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

    else:
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Not Authorized ",
            # headers={"WWW-Authenticate": "Basic"},
        )




@api_roles.get("/api-autocomplete-roles/")
async def autocomplete_roles(term: Optional[str] = None, username: str = Depends(get_current_user)):

           
    try:
    
        #contact = get_customer()

        result =  mydb.roles.find({"role": { "$regex": term, "$options": "i" } })

        roleData = [{
            
            "value": data['role']

            } for data in result

        ]

        return roleData
    
    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)

  

   

