
from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional, Dict
from pydantic import BaseModel
from bson import ObjectId




from datetime import datetime, timedelta, date
from apps.authentication.authenticate_user import get_current_user


from  apps.database.mongodb import create_mongo_client
mydb = create_mongo_client()


api_category = APIRouter()
templates = Jinja2Templates(directory="apps/templates")


class categoryBM(BaseModel):

    
    category: str
    user: Optional[str] = None
    date_updated: datetime =  datetime.utcnow()
    date_created: Optional[datetime] = datetime.utcnow()



@api_category.get("/category/", response_class=HTMLResponse)
async def api_payment_template(request: Request,
                                        username: str = Depends(get_current_user)):
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Payment' in roleAuthenticate['allowed_access']:
 

        return templates.TemplateResponse("accounting/category.html", 
                                      {"request": request})
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not Authorized",
    )



@api_category.post("/api-insert-category/", response_model=None)
async def create_category_transaction(data: categoryBM, username: str = Depends(get_current_user)):

    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Category' in roleAuthenticate['allowed_access']:
        
        try:
            category_coll = mydb['category']
            category_coll.create_index("category", unique=True)
            
            insertData = {
            
                "category": data.category,
                "user": username,
                "date_updated": datetime.utcnow(),
                "date_created": datetime.utcnow(),
            }

            # Correct MongoDB insert operation
            mydb.category.insert_one(insertData)

            return {"message": "Category has been inserted successfully"}

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error inserting sales: {e}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not Authorized",
    )




@api_category.get("/api-get-category/")
async def get_category(username: str = Depends(get_current_user)):
    try:
        result = mydb.category.find().sort('date', -1)

        paymentData = [{
            "category": data['category'],
            "user": username,
            "date_updated": data['date_updated'],
            "date_created": data['date_created'],


        } for data in result

    ]
        return paymentData
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

@api_category.put("/api-update-category/{id}", response_model=None)
async def update_category_api(id: str, data: categoryBM,username: str = Depends(get_current_user)):
    obj_id = ObjectId(id)
    role = mydb.login.find_one({"email_add": username})
    roleAuthenticate = mydb.roles.find_one({'role': role['role']})

    if 'Category' in roleAuthenticate['allowed_access']:
 

        try:

            updateData = {

                "category": data.category,
                "user": username,
                "date_updated": data.date_updated,
                         
                  
                }
            result = mydb.category.update_one({'_id': obj_id},{'$set': updateData})
            return {"message":"Payment Data Has been Updated"} 
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Error retrieving profiles: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not Authorized",
    )

@api_category.get("/api-autocomplete-category/")
async def autocomplete_category(term: Optional[str] = None):
    try:
        
        

        result =  mydb.category.find({"category": { "$regex": term,"$options": "i" }} )

        categoryData = [{
            
            "value": data['category'],           

            } for data in result

        ]


        
    
        return categoryData

    except Exception as e:
        error_message = str(e)
        raise HTTPException(status_code=500, detail=error_message)



