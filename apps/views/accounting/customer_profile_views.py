from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.customer_profile import CustomerProfile
from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime

from sqlalchemy import and_


from apps.base_model.customer_profile_bm import CustomerProfileBM

engine = connectionDB.conn()


class CustomerProfileViews(): # this class is for Customer

    @staticmethod
    def insert_customer_profile(item: CustomerProfileBM, user: str): # this is for inserting User
        
         # Create a dictionary from the item
        item_data = item.dict()  # Assuming item is a Pydantic model
        item_data['user'] = user
        # Create an instance of AccountType using ** unpacking
        insertData = CustomerProfile(**item_data)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def customer_profile(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(CustomerProfile)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            
   
    
    
            
    @staticmethod
    def update_customer_profile(item: CustomerProfileBM,user:str):
      
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(CustomerProfile).where(CustomerProfile.id == item.id)
                
                result = session.exec(statement).one_or_none()
                
                if result:
                    # Update the record's account_type
                   
                    result.bussiness_name = item.bussiness_name
                    result.name_of_tax_payer = item.name_of_tax_payer
                    result.tin = item.tin
                    result.address = item.address
                    result.rdo = item.rdo
                    result.tax_type = item.tax_type
                    result.description = item.description
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