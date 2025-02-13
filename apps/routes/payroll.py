from fastapi import APIRouter, Body, HTTPException, Depends, Request, Response, status, Query
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import Union, List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId



from decimal import Decimal


#from pymongo import  DESCENDING

# from apps.base_model.payroll_bm import EmployeeDetails


from datetime import datetime, timedelta, date
from  ..authentication.authenticate_user import get_current_user


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()


from ..authentication.utils import OAuth2PasswordBearerWithCookie


api_payroll = APIRouter()
templates = Jinja2Templates(directory="apps/templates")

class Employee(BaseModel):
    Company: str
    EmployeeID: str
    employee_no: str
    first_name: str
    last_name: str
    designation: str
    salary_status: str
    rate: float
    employee_status: str
    user: Optional[str] = None
    date_updated: Optional[datetime] = None
    date_created: Optional[datetime] = None

class EmployeeDetails(BaseModel):
    
    Company: Optional[str] = None
    EmployeeID: Optional[str] = None
    LastName: Optional[str] = None
    FirstName: Optional[str] = None
    MiddleName: Optional[str] = None
    Position: Optional[str] = None
    Gender: Optional[str] = None
    Salaryrate: Optional[str] = None
    TaxCode: Optional[str] = None
    TIN: Optional[str] = None
    SSSN: Optional[str] = None
    PHICN: Optional[str] = None
    HDMFN: Optional[str] = None
    Tax: Optional[float] = None
    SSS: Optional[float] = None
    PHIC: Optional[float] = None
    HDMF: Optional[float] = None
    SSSemp: Optional[float] = None
    PHICemp: Optional[float] = None
    HDMFemp: Optional[float] = None
    Allowance: Optional[float] = None
    Date_hired: Optional[datetime] = None
    id: Optional[int] = None

class EmployeeResponse(BaseModel):
    id: str
    Company: str = None
    EmployeeID: str = None
    LastName: str = None
    FirstName: str = None
    MiddleName: str = None
    Position: str = None
    Gender: str = None
    Salaryrate: float = None
    TaxCode: str = None
    TIN: str = None
    SSSN: str = None
    PHICN: str = None
    HDMFN: str = None
    Tax: float = None
    SSS: float = None
    PHIC: float = None
    SSSemp: float = None
    PHICemp: float = None
    Allowance: float = None
    Date_hired: str = None

class EmployeeResponseUpdate(BaseModel):
   
    Company: str = None
    EmployeeID: str = None
    LastName: str = None
    FirstName: str = None
    MiddleName: str = None
    Position: str = None
    Gender: str = None
    Salaryrate: float = None
    TaxCode: str = None
    TIN: str = None
    SSSN: str = None
    PHICN: str = None
    HDMFN: str = None
    Allowance: float = None
    Date_hired: str = None

# Define the response model for salary data
class SalaryData(BaseModel):
    trans_id: Optional[str] = None
    date: str
    company: str
    employee_id: str
    last_name: str
    first_name: str
    position: Optional[str] = None
    salary_rate: float
    allowance: Optional[float]
    tax_code: str
    basic_pay: float
    allowance_basic: float
    late: float
    absent: float
    overtime: float
    holiday: float
    night_diff: float
    incentives: float
    adjustme_gross: float
    gross_pay: float
    sss: float
    phic: float
    hdmf: float
    total_mandatory: float
    minimum_wage: float
    total_basic: float
    uniform: float
    rice: float
    laundry: float
    medical1: float
    medical2: float
    total_deminis: float
    after_deminimis: float
    otherforms: float
    taxable_amount: float
    with_holding_tax: float
    cash_advance: float
    other_deduction: float
    total_deduction: float
    adjustment_other: float
    net_pay: float
    gross_pay_MWE: float
    ot_minimum: float
    holiday_MWE: float
    mandatory_MWE: float
    mandatory_Taxable: float
    not_subject: float
    late_taxable: float
    id: Optional[str] = None



# Define the response model for salary data
class PayrollData(BaseModel):
    trans_id: Optional[str] = None
    date: datetime
    company: str
    employee_id: str
    last_name: str
    first_name: str
    position: Optional[str] = None
    salary_rate: float
    allowance: Optional[float]
    tax_code: str
    basic_pay: float
    allowance_basic: float
    late: float
    absent: float
    overtime: float
    holiday: float
    night_diff: float
    incentives: float
    adjustme_gross: float
    gross_pay: float
    sss: float
    phic: float
    hdmf: float
    total_mandatory: float
    minimum_wage: float
    total_basic: float
    uniform: float
    rice: float
    laundry: float
    medical1: float
    medical2: float
    total_deminis: float
    after_deminimis: float
    otherforms: float
    taxable_amount: float
    with_holding_tax: float
    cash_advance: float
    other_deduction: float
    total_deduction: float
    adjustment_other: float
    net_pay: float
    gross_pay_MWE: float
    ot_minimum: float
    holiday_MWE: float
    mandatory_MWE: float
    mandatory_Taxable: float
    not_subject: float
    late_taxable: float
    id: Optional[str] = None


# Define the response model for salary data
class MinimumData(BaseModel):
  
    CompanyName: str
    minimum_wage: float


# Define the response model for salary data
class Company(BaseModel):
  
    CompanyName: str
    Address: Optional[str]


class Details13thMonth(BaseModel):
    date: datetime
    company: str
    employee_id: str
    last_name: str
    first_name: str
    amount: float
    date_created: datetime = Field(default_factory=datetime.utcnow)

class Details13thMonthUpdate(BaseModel):
    date: datetime = None
    company: str = None
    employee_id: str = None
    last_name: str = None
    first_name: str = None
    amount: float = None


@api_payroll.post("/api-insert-company-details/")
async def insert_company_details(data: Company, username: str = Depends(get_current_user)):
    try:
        # Convert Pydantic model to dict and handle ObjectId
        payload = data.dict()

         # Check if the company already exists
        existing_company = mydb.company_details.find_one({"CompanyName": payload["CompanyName"]})
        if existing_company:
            raise HTTPException(status_code=400, detail="Company already exists")
        

        # Insert into MongoDB
        result =  mydb.company_details.insert_one(payload)
        return {"message": "Data inserted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_payroll.post("/api-insert-minimum-wage-data/")
async def insert_minimum_wage_data(data: MinimumData, username: str = Depends(get_current_user)):
    try:
        # Convert Pydantic model to dict and handle ObjectId
        payload = data.dict()

         # Check if the company already exists
        existing_company = mydb.minimum_wages.find_one({"CompanyName": payload["CompanyName"]})
        if existing_company:
            raise HTTPException(status_code=400, detail="Company already exists")
        

        # Insert into MongoDB
        result =  mydb.minimum_wages.insert_one(payload)
        return {"message": "Data inserted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_payroll.post("/api-insert-payroll-data/")
async def insert_payroll_data(data: PayrollData, username: str = Depends(get_current_user)):
    try:
        # Convert Pydantic model to dict and handle ObjectId
        payload = data.dict()
        

        # Insert into MongoDB
        result =  mydb.salary_computation_new.insert_one(payload)
        return {"message": "Data inserted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# this function is inserting 13th month
@api_payroll.post("/api-insert-13thmonth/")
async def insert_13thMonth(data: Details13thMonth, username: str = Depends(get_current_user)):
    try:
        # Convert Pydantic model to dict and handle ObjectId
        payload = data.dict()

        # Add the username to the payload
        payload['user'] = username

        # Insert into MongoDB
        result =  mydb.thirteen_month.insert_one(payload)
        return {"message": "Data inserted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@api_payroll.get('/api-list-13thmonth/')
async def get_13thMonth_list(username: str = Depends(get_current_user)):
    try:
        
        result = mydb.thirteen_month.find()
        print(result)

        month13th_data = [
                {
                "id": str(item['_id']), 
                "date": item['date'],  # Convert date to string
                "company": item['company'],
                "employee_id": str(item['employee_id']),  # Ensure employee_id is a string
                "last_name": item['last_name'],
                "first_name": item['first_name'],
                "amount": item['amount'],
                "user": item['user']
                }
                for item in result
            ]

        return month13th_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@api_payroll.put("/api-update-13thmonth/{id}")
async def api_update_13thmonth(
    id: str,
    data: Details13thMonthUpdate,
    username: str = Depends(get_current_user)
):
    try:
        # Check if the user is authorized
        if username not in ['joeysabusido', 'AVORQUEF']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not Authorized"
            )

        # Convert to ObjectId and validate
        try:
            obj_id = ObjectId(id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )

        # Prepare the update data
        update_data = {key: value for key, value in data.dict().items() if value is not None}
        update_data['user'] = username

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )

        # Update the record
        result = mydb.thirteen_month.update_one({'_id': obj_id}, {'$set': update_data})

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found or no changes made"
            )

        return {"message": "Data has been updated successfully"}

    except HTTPException as http_err:
        raise http_err

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")





@api_payroll.get("/salary-data/", response_model=List[SalaryData])
async def get_salary_data(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None ,
    company: Optional[str] = None
):
    try:
        # Convert string dates to datetime objects
        # start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        # end_dt = datetime.strptime(end_date, "%Y-%m-%d")

        # start_dt = datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
        # end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)

         # Handle date ranges
        start_dt = datetime.combine(start_date, datetime.min.time()) if start_date else None
        end_dt = datetime.combine(end_date, datetime.max.time()) if end_date else None

      

        # Create query with date range and optional company filter
        query = {
             "date": {"$gte": start_date, "$lte": end_date},
            **({"company": company} if company else {})
        }

        # Fetch and sort the results
        result = mydb.salary_computation_new.find(query).sort("last_name", 1)

        # Convert the result to a list of dictionaries with necessary fields
        salary_data_list = [
            {
                "trans_id": str(item['trans_id']),  # Ensure trans_id is a string
                "date": item['date'].strftime("%Y-%m-%d"),  # Convert date to string
                "company": item['company'],
                "employee_id": str(item['employee_id']),  # Ensure employee_id is a string
                "last_name": item['last_name'],
                "first_name": item['first_name'],
                "position": item['position'],
                "salary_rate": item['salary_rate'],
                "allowance": item['allowance'],
                "tax_code": item['tax_code'],
                "basic_pay": item['basic_pay'],
                "allowance_basic": item['allowance_basic'],
                "absent": item['absent'],
                "late": item['late'],
                "overtime": item['overtime'],
                "holiday": item['holiday'],
                "night_diff": item['night_diff'],
                "incentives": item['incentives'],
                "adjustme_gross": item['adjustme_gross'],
                "gross_pay": item['gross_pay'],
                "sss": item['sss'],
                "phic": item['phic'],
                "hdmf": item['hdmf'],
                "total_mandatory": item['total_mandatory'],
                "minimum_wage": item['minimum_wage'],
                "total_basic": item['total_basic'],
                "uniform": item['uniform'],
                "rice": item['rice'],
                "laundry": item['laundry'],
                "medical1": item['medical1'],
                "medical2": item['medical2'],
                "total_deminis": item['total_deminis'],
                "after_deminimis": item['after_deminimis'],
                "otherforms": item['otherforms'],
                "taxable_amount": item['taxable_amount'],
                "with_holding_tax": item['with_holding_tax'],
                "cash_advance": item['cash_advance'],
                "other_deduction": item['other_deduction'],
                "total_deduction": item['total_deduction'],
                "adjustment_other": item['adjustment_other'],
                "net_pay": item['net_pay'],
                "gross_pay_MWE": item['gross_pay_MWE'],
                "ot_minimum": item['ot_minimum'],
                "holiday_MWE": item['holiday_MWE'],
                "mandatory_MWE": item['mandatory_MWE'],
                "mandatory_Taxable": item['mandatory_Taxable'],
                "not_subject": item['not_subject'],
                "late_taxable": item['late_taxable'],
                "id": str(item['id']),  # Ensure id is a string
            }
            for item in result
        ]

        return salary_data_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_payroll.get('/employee-list/')
async def get_employee_list(username: str = Depends(get_current_user)):
    try:
        
        result = mydb.employee_reg.find().sort("LastName", -1)
        print(result)

        employee_data = [
                {
                "id": str(items['_id']),   
                "Company": items['Company'],
                "EmployeeID": items['EmployeeID'],
                "LastName": items['LastName'],
                "FirstName": items['FirstName'],
                "MiddleName": items['MiddleName'],
                "Position": items['Position'],
                "Gender": items['Gender'],
                "Salaryrate": items['Salaryrate'],
                "TaxCode": items['TaxCode'],
                "TIN": items['TIN'],
                "SSSN": items['SSSN'],
                "PHICN": items['PHICN'],
                "HDMFN": items['HDMFN'],
                "Tax": items['Tax'],
                "SSS": items['SSS'],
                "PHIC": items['PHIC'],
                "SSSemp": items['SSSemp'],
                "HDMFemp": items['HDMFemp'],
                "PHICemp": items['PHICemp'],
                "Allowance": items['Allowance'],
                "Date_hired": items['Date_hired'],
                }
                for items in result
            ]

        return employee_data

       
       
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_payroll.post("/api-insert-employee-details")
async def insert_employee(employee: EmployeeDetails):
    try:
        existing_id = mydb.employee_reg.find_one({"EmployeeID": employee.EmployeeID})

        if existing_id:
            raise HTTPException(status_code=400, detail="Employee ID already exists")

        result = mydb.employee_reg.insert_one(employee.dict())
        return {"message": "Employee added successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# @api_payroll.get('/api-get-employee-list')
# async def find_all_job_order(username: str = Depends(get_current_user)):
#     """This function is querying all inventory data"""

#     try:
#         if username == 'joeysabusido' or username == 'Dy':

#             result = mydb.employee_list.find().sort("last_name", -1)

#             # pipeline = [
#             #     {
#             #         "$addFields": {
#             #             "date_created": {
#             #                 "$dateFromString": {
#             #                     "dateString": "$date_created"
#             #                 }
#             #             }
#             #         }
#             #     },
#             #     {
#             #         "$sort": {
#             #             "date_created": DESCENDING
#             #         }
#             #     }
#             # ]

#             # # Fetch sorted job orders
#             # result = mydb.job_order.aggregate(pipeline)

            
#             job_order_data = [
#                 {
#                 "id": str(items['_id']),   
#                 "company": items['company'],
#                 "department": items['department'],
#                 "employee_no": items['employee_no'],
#                 "first_name": items['first_name'],
#                 "last_name": items['last_name'],
#                 "designation": items['designation'],
#                 "salary_status": items['salary_status'],
#                 "rate": items['rate'],
#                 "salary_status": items['salary_status'],
#                 "employee_status": items['employee_status'],
#                 "user": items['user'],
#                 "date_created": items['date_created'],
#                 "date_updated": items['date_updated'],

#                 }
#                 for items in result
#             ]

#             return job_order_data
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Not Authorized",
#             # headers={"WWW-Authenticate": "Basic"},
#             )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



@api_payroll.put("/api-update-employee/{id}")
async def api_update_employee(id: str,
                               data: EmployeeResponseUpdate,
                               username: str = Depends(get_current_user)):
    
    try:
        if username == 'joeysabusido' or username == 'AVORQUEF':

            obj_id = ObjectId(id)

            update_data = {

                "Company": data.Company,
                "EmployeeID": data.EmployeeID,
                "LastName": data.LastName,
                "FirstName": data.FirstName,
                "MiddleName": data.MiddleName,
                "Position": data.Position,
                "Gender": data.Gender,
                "Salaryrate": data.Salaryrate,
                "TaxCode": data.TaxCode,
                "TIN": data.TIN,
                "SSSN": data.SSSN,
                "PHICN": data.PHICN,
                "HDMFN": data.HDMFN,
                "Allowance": data.Allowance,
                "Date_hired": data.Date_hired
                # "date_updated": datetime.now().isoformat() if data.date_updated else None
               
                
            }

            result = mydb.employee_reg.update_one({'_id': obj_id}, {'$set': update_data})

            return ('Data has been Update')
    
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authorized",
            # headers={"WWW-Authenticate": "Basic"},
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_payroll.get("/api-autocomplete-employee/")
def autocomplete_employee_list(term: Optional[str] = None, username: str = Depends(get_current_user)):
    try:
        # Retrieve all employee data from the collection
        employee_data = mydb.employee_list.find()
        
        # Filter employees based on the search term
        if term:
            filtered_employee = [
                item for item in employee_data
                if term.lower() in item.get('last_name', '').lower() or term.lower() in item.get('first_name', '').lower()
            ]
        else:
            filtered_employee = []

        # Construct suggestions from filtered employees
        suggestions = [
            {
                "value": f"{item['last_name']}, {item['first_name']}",
                "id": str(item['_id']),
                "employee_no": item.get('employee_no'),
                "rate": item.get('rate'),
                "company": item.get('company'),
                "salary_status": item.get('salary_status')
            }
            for item in filtered_employee
        ]

        return suggestions

    except Exception as e:
        error_message = str(e)
        return {"error": error_message}
    

# @api_payroll.get("/api-query-employee-summary/")
# async def get_employee_summary(
#     date_from: datetime,
#     date_to: datetime,
#     company: str,
#     username: str = Depends(get_current_user)
# ):
#     try:
#         # MongoDB Aggregation Pipeline
#         pipeline = [
#             {
#                 "$match": {
#                     "date": {"$gte": date_from, "$lte": date_to},
#                     "company": company,
#                 }
#             },
#             {
#                 "$group": {
#                     "_id": "$employee_id",  # Group by employee_id
#                     "grossPaySum": {"$sum": "$gross_pay"},
#                     "totalmandatory": {"$sum": "$total_mandatory"},
#                     "totalDeminimisSum": {"$sum": "$total_deminis"},
#                     "otherFormsSum": {"$sum": "$otherforms"},
#                     "withHoldingTaxSum": {"$sum": "$with_holding_tax"},
#                      "first_name": {"$first": "$first_name"},  # Extract first_name
#                     "last_name": {"$first": "$last_name"},    # Extract last_name
#                     # "employeeDetails": {
#                     #     "$first": {
#                     #         "first_name": "$first_name",
#                     #         "last_name": "$last_name",
                           
#                     #     }
#                     # },
#                 }
#             },
#             {
#                 "$sort": {"last_name": 1}  # Optional: Sort by employee_id
#             },
#         ]

#         # Run the aggregation
#         result = list(mydb.salary_computation.aggregate(pipeline))

#         if not result:
#             return {"message": "No data found for the given filters"}

#         return {"data": result}

   
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



@api_payroll.get("/api-query-employee-summary/") # this is for 1604
async def get_employee_summary(
    date_from: datetime,
    date_to: datetime,
    company: str,
    username: str = Depends(get_current_user)
):
    # date_from1 = datetime.strptime(date_from, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
    # date_to1 = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)

    # start_dt = datetime.combine(date_from, datetime.min.time()) if date_from else None
    # end_dt = datetime.combine(date_to, datetime.max.time()) if date_to else None

    # tz = timezone("UTC")
    # start_dt = tz.localize(datetime.combine(date_from, datetime.min.time())) if date_from else None
    # end_dt = tz.localize(datetime.combine(date_to, datetime.max.time())) if date_to else None
    
    try:
        pipeline = [
            {
                "$match": {
                    "date": {"$gte": date_from, "$lte": date_to},
                    "company": company,
                }
            },
            {
                "$group": {
                    "_id": "$employee_id",
                    "grossPaySum": {"$sum": "$gross_pay"},
                    "totalmandatory": {"$sum": "$total_mandatory"},
                    "totalDeminimisSum": {"$sum": "$total_deminis"},
                    "otherFormsSum": {"$sum": "$otherforms"},
                    "withHoldingTaxSum": {"$sum": "$with_holding_tax"},
                    "first_name": {"$first": "$first_name"},
                    "last_name": {"$first": "$last_name"},
                    "employeeCount": {"$sum": 1}
                }
            },
            {
                "$lookup": {
                    "from": "thirteen_month",
                    "localField": "_id",
                    "foreignField": "employee_id",
                    "as": "thirteen_month_data"
                }
            },
            {
                "$addFields": {
                    "thirteenMonthSum": {
                        "$sum": {
                            "$map": {
                                "input": "$thirteen_month_data",
                                "as": "item",
                                "in": "$$item.amount"
                            }
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,  # Exclude ObjectId
                    "employee_id": "$_id",
                    "grossPaySum": 1,
                    "totalmandatory": 1,
                    "totalDeminimisSum": 1,
                    "otherFormsSum": 1,
                    "withHoldingTaxSum": 1,
                    "first_name": 1,
                    "last_name": 1,
                    "thirteenMonthSum": 1,
                    "employeeCount": 1
                }
            },
            {
                "$sort": {"last_name": 1}
            }
        ]

        result = list(mydb.salary_computation_new.aggregate(pipeline))

        if not result:
            return {"message": "No data found for the given filters"}

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    

@api_payroll.get("/api-query-1601c/")
async def get_employee_summary(
     date_from: datetime,
     date_to: datetime,
     company: str,
     username: str = Depends(get_current_user)
 ):
     try:
         # MongoDB Aggregation Pipeline
         pipeline = [
             {
                 "$match": {
                     "date": {"$gte": date_from, "$lte": date_to},
                     "company": company,
                 }
             },
             {
                 "$group": {
                     "_id": None,  
                     "grossPaySum": {"$sum": "$gross_pay"},
                        }

             },                    ]

         # Run the aggregation
         result = list(mydb.salary_computation_new.aggregate(pipeline))
         if not result:
             return {"message": "No data found for the given filters"}

         return {"data": result}

   
     except Exception as e:
         raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")









  




