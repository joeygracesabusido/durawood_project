from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.branch import Branch
from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime

from sqlalchemy import and_


from apps.base_model.branch_bm import BranchBM

engine = connectionDB.conn()


class BranchViews(): # this class is for User

    @staticmethod
    def insert_branch(item: BranchBM, user: str): # this is for inserting Branch
        
         # Create a dictionary from the item
        item_data = item.dict()  # Assuming item is a Pydantic model
        item_data['user'] = user
        # Create an instance of AccountType using ** unpacking
        insertData = Branch(**item_data)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def get_branch(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(Branch)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            
   
    
    
            
    @staticmethod
    def update_branch(item: BranchBM,user: str):
      
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(Branch).where(Branch.id == item.id)
                result = session.exec(statement).one_or_none()

                # item_data = item.dict()  # Assuming item is a Pydantic model
                # item_data['user'] = user
                
                if result:
                    # Update the record's account_type
                   
                 
                    result.branch_name = item.branch_name
                    result.address = item.address
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