import strawberry
from typing import Optional,List, Dict

from datetime import date, datetime

from apps.views.accounting.journal_entry_views import JournalEntryViews

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
    def get_balance_sheet_details(
        self, 
        datefrom: Optional[str] = None, 
        dateto: Optional[str] = None
    ) -> List[BSDetailsQuery]:
        data = JournalEntryViews.get_journal_entry_by_balance_sheet_report(datefrom, dateto)
        
        # Ensure data is iterable
        # print(data)
        # print(data['account_type'])
        account_type = []
        details = []
        for d in data:
            d_data = {}
            
            if not d[3] in account_type:
                account_type.append(d[3])
                d_data['account_type'] = d[3] # i add
                d_data['chart_account'] =  d[0]
                d_data['debit'] = d[1]
                d_data['credit'] = d[2]
                details.append(d_data)
            else:
                d_data['account_type'] = d[3] # i add
                d_data['chart_account'] =  d[0]
                d_data['debit'] = d[1]
                d_data['credit'] = d[2]
                details.append(d_data)

                # CurrentAsset: [
                #     {
                #     chart_of_ccount: cash,
                #     debit: 0,
                #     credit: 0
                #     },
                #                         {
                #     chart_of_ccount: cash,
                #     debit: 0,
                #     credit: 0
                #     }
                # ],
                # Liabilities: [
                #                         {
                #     chart_of_ccount: cash,
                #     debit: 0,
                #     credit: 0
                #     },
                #                         {
                #     chart_of_ccount: cash,
                #     debit: 0,
                #     credit: 0
                #     }
                # ]
        print(account_type)
        print(details)
        
        # Filter details for "Current Asset" account type and print them
        current_asset_details = [detail for detail in details if detail['account_type'] == 'Current Asset']
        print("Current Asset Details:", current_asset_details)

        # Build and return the result
        result = []

        result = [
            BSDetailsQuery(
                chart_of_account=detail['chart_account'],
                amount=detail['debit'] - detail['credit'],
                account_type=detail['account_type']
            )
            for detail in current_asset_details
        ]
        return result
    
    @strawberry.field
    def get_balance_sheet_details2(
        self, 
        datefrom: Optional[str] = None, 
        dateto: Optional[str] = None
    ) -> List[BSDetailsQuery]:
        data = JournalEntryViews.get_journal_entry_by_balance_sheet_report(datefrom, dateto)
        
        if not data:
            return []

        # Dictionary to group details by account type
        account_type_details = {}

        for d in data:
            # Ensure that d contains the necessary elements
            if len(d) < 4:
                continue

            # Unpack values and assign to respective fields
            account_type = d[3]
            chart_account = d[0]
            debit = d[1]
            credit = d[2]

            # Initialize the list for each new account type
            if account_type not in account_type_details:
                account_type_details[account_type] = []

            # Append details for each account type
            account_type_details[account_type].append({
                'chart_account': chart_account,
                'debit': debit,
                'credit': credit
            })

        # Flatten the details into a list of BSDetailsQuery objects
        result = []
        for account_type, details in account_type_details.items():
            for detail in details:
                result.append(
                    BSDetailsQuery(
                        chart_of_account=detail['chart_account'],
                        amount=detail['debit'] - detail['credit'],
                        account_type=account_type
                    )
                )

        # Print for debugging purposes
        print("Account Types:", account_type_details.keys())
        print("Details by Account Type:", account_type_details)

        return result
    
    @strawberry.field
    def get_balance_sheet_details3(
        self, 
        datefrom: Optional[str] = None, 
        dateto: Optional[str] = None
    ) -> List[AccountTypeDetails]:
        data = JournalEntryViews.get_journal_entry_by_balance_sheet_report(datefrom, dateto)
        
        if not data:
            return []

        account_type_details = {}

        for d in data:
            if len(d) < 4:
                continue

            account_type = d[3]
            chart_account = d[0]
            debit = d[1]
            credit = d[2]

            if account_type not in account_type_details:
                account_type_details[account_type] = []

            account_type_details[account_type].append(
                BSDetailsQuery(
                    chart_of_account=chart_account,
                    amount=debit - credit,
                    account_type=account_type
                )
            )

        result = [
            AccountTypeDetails(
                account_type=account_type,
                details=details
            )
            for account_type, details in account_type_details.items()
        ]

        return result
    
    # @strawberry.field
    # def get_income_statement_report(
    #     self, 
    #     datefrom: Optional[str] = None, 
    #     dateto: Optional[str] = None
    # ) -> List[IncomeStatement]:
        

    #     data = JournalEntryViews.get_income_statement(datefrom, dateto)

    #     grouped_data = {}

    #     # Populate the grouped_data with entries
    #     for row in data:
    #         account_type = row[3]  # Assuming this is the account type
    #         chart_of_account = row[0]
    #         debit = row[1]
    #         credit = row[2]
    #         amount = debit - credit

    #          # Initialize the list if the account_type key does not exist
    #         if account_type not in grouped_data:
    #             grouped_data[account_type] = []

    #         # Append the entry to the corresponding account type
    #         grouped_data[account_type].append({
    #             "chart_of_account": chart_of_account,
    #             "amount": amount,
    #         })

    #         # Convert the grouped data into a list of IncomeStatement
    #         return [
    #             IncomeStatement(
    #                 account_type=account_type,
    #                 entries=entries
    #             ) for account_type, entries in grouped_data.items()
    #     ]

    #     # return [
    #     #             IncomeStatement(
    #     #                 account_type=row[3],
    #     #                 chart_of_account=row[0],
    #     #                 amount = row[1] - row[2]
                        
    #     #             ) for row in data
    #     #         ]
    @strawberry.field
    def get_income_statement_report(
        self, 
        datefrom: Optional[str] = None, 
        dateto: Optional[str] = None
    ) -> List[IncomeStatement]:
        
        data = JournalEntryViews.get_income_statement(datefrom, dateto)

        grouped_data = {}

        # Populate the grouped_data with entries
        for row in data:
            account_type = row[3]  # Assuming this is the account type
            chart_of_account = row[0]
            debit = row[1]
            credit = row[2]
            amount = credit - debit

            # Initialize the list if the account_type key does not exist
            if account_type not in grouped_data:
                grouped_data[account_type] = []

            # Append the entry to the corresponding account type
            grouped_data[account_type].append(IncomeStatementEntry(  # Change to use the class
                chart_of_account=chart_of_account,
                debit=debit,
                credit=credit,
                amount=amount,
            ))

        # Convert the grouped data into a list of IncomeStatement
        return [
            IncomeStatement(
                account_type=account_type,
                entries=entries
            ) for account_type, entries in grouped_data.items()
        ]
    
    @strawberry.field
    async def company_autocomplete(self, search_term:str) -> List[CompanyDetails]:

        #Use regex for case-insensitive search in MongoDB
        regex = re.compile(search_term, re.IGNORECASE)

        company_collection = mydb['company_details']
    
        # Corrected the query and async execution
        company_data = company_collection.find({
            'CompanyName': {'$regex': regex}
        })
        

        # employee_collection = mydb['employee_list']
        # employe_data = employee_collection.find({
        #      '$or': [
        #     {'last_name': {'$regex': regex}},
        #     {'first_name': {'$regex': regex}}
        # ]
        # })



        return [CompanyDetails(
           
            CompanyName = i['CompanyName'],
            Address = i['Address']
            
        ) for i in company_data 

        ]
    


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


       

        


            
            
        





