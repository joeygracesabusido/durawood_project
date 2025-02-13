from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.company_profile import CompanyProfile
from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime

from sqlalchemy import and_


from apps.base_model.company_profile_bm import CompanyProfileBM

engine = connectionDB.conn()


class CompanyProfileViews(): # this class is for User

    @staticmethod
    def insert_company_profile(item: CompanyProfileBM, user: str): # this is for inserting User
        
         # Create a dictionary from the item
        item_data = item.dict()  # Assuming item is a Pydantic model
        item_data['user'] = user
        # Create an instance of AccountType using ** unpacking
        insertData = CompanyProfile(**item_data)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def company_profile(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(CompanyProfile)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            
   
    
    
            
    @staticmethod
    def update_company_profile(item: CompanyProfileBM,user:str):
      
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(CompanyProfile).where(CompanyProfile.id == item.id)
                
                result = session.exec(statement).one_or_none()
                
                if result:
                    # Update the record's account_type
                   
                    result.company_name = item.company_name
                    result.address = item.address
                    result.tin = item.tin
                    result.rdo = item.rdo
                    result.type_of_bussiness = item.type_of_bussiness
                    result.financial_year_end = item.financial_year_end
                    result.user = user
                    result.date_updated = item.date_updated
                    
                    # Commit the changes
                    session.add(result)
                    session.commit()
                    
                    # Optionally refresh the instance
                    session.refresh(result)
                    return True  # Update was successful
                else:
                    return False  # Record not found
            except Exception as e:
                # Handle any exceptions that occur
                print(f"An error occurred: {e}")
                return None