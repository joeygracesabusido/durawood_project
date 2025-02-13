import strawberry
from typing import Optional,List, Dict

from datetime import date, datetime

#from apps.views.accounting.journal_entry_views import JournalEntryViews

import re


from  ..database.mongodb import create_mongo_client
mydb = create_mongo_client()




@strawberry.type
class User:
   

    fullname: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    created: Optional[str] = None


@strawberry.type
class EmployeeDetailsQuery:
    _id: Optional[str] = None
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    division: Optional[str] = None
    position: Optional[str] = None
    status: bool
    created: Optional[datetime] = None
    updated: Optional[str] = None

@strawberry.type
class EmployeeDetailsgraph:
    _id: Optional[str] = None
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
    Date_hired: Optional[date] = None
    id: Optional[int] = None



@strawberry.type
class BSDetailsQuery:
   
    chart_of_account: Optional[str] = None
    amount: Optional[float] = None
    account_type : Optional[str] = None



@strawberry.type
class AccountTypeDetails:
    account_type: str
    details: List[BSDetailsQuery]

@strawberry.type
class IncomeStatementEntry:
    chart_of_account: str
    debit: float
    credit: float
    amount: float

@strawberry.type
class IncomeStatement:
    account_type: str
    entries: List[IncomeStatementEntry] 
   


@strawberry.type
class CompanyDetails:
    CompanyName: str
    Address: Optional[str] = None

@strawberry.type
class SSSRange:
    employee_share : Optional[float] = None
    ss_provident_emp: Optional[float] = None

@strawberry.type
class MinimumWageDetails:
    _id: Optional[str] = None
    CompanyName : Optional[str] = None
    minimum_wage: Optional[float] = None
  
    

@strawberry.type
class Query:


    
   
    
   
    @strawberry.field
    async def employee_autocomplete(self, search_term:str) -> List[EmployeeDetailsgraph]:

        #Use regex for case-insensitive search in MongoDB
        regex = re.compile(search_term, re.IGNORECASE)

      

        employee_collection = mydb['employee_reg']
        employe_data = employee_collection.find({
             '$or': [
            {'LastName': {'$regex': regex}},
            {'FirstName': {'$regex': regex}}
        ]
        })



        return [EmployeeDetailsgraph(
            _id = str(i['_id']),
            Company = i['Company'],
            EmployeeID = i['EmployeeID'],
            LastName = i['LastName'],
            FirstName = i['FirstName'],
            MiddleName = i['MiddleName'],
            Position = i['Position'],
            Gender = i['Gender'],
            Salaryrate = i['Salaryrate'],
            TaxCode = i['TaxCode'],
            Allowance = i['Allowance']
            
        ) for i in employe_data 

        ]

    
    @strawberry.field
    def get_contribution_by_range(self, value: float) -> Optional[SSSRange]:
        """This is for getting the sss contri with in the range of thier salary"""
        sss_collection = mydb['sss_table']


        document = sss_collection.find_one({"rate_from": {"$lte": value}, "rate_to": {"$gte": value}})
       
        if document:
            return SSSRange(
            
                employee_share=document['employee_share'],
                ss_provident_emp=document["ss_provident_emp"],
               
            )
        return None
    

    @strawberry.field
    async def minimumwages_per_comp(self, search_term:str) -> List[MinimumWageDetails]:

        #Use regex for case-insensitive search in MongoDB
        regex = re.compile(search_term, re.IGNORECASE)

      

        company_collection = mydb['minimum_wages']
        mwe_data = company_collection.find({
          
            'CompanyName': {'$regex': regex},
    
        })

        return [MinimumWageDetails(
            _id = str(i['_id']),
            CompanyName = i['CompanyName'],
            minimum_wage = i['minimum_wage']
            
        ) for i in mwe_data 

        ]


       

        


            
            
        





