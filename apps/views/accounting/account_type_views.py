from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.account_type import AccountType
from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime


from apps.base_model.type_of_account_bm import AccountTypeBM

engine = connectionDB.conn()


class TypeofAccountViews(): # this class is for Type of Account

    @staticmethod
    def insert_type_of_account(item: AccountTypeBM): # this is for inserting type of Account 
        
         # Create a dictionary from the item
        item_data = item.dict()  # Assuming item is a Pydantic model
        
        # Create an instance of AccountType using ** unpacking
        insertData = AccountType(**item_data)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def get_account_type(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(AccountType).order_by(AccountType.account_type)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            
    @staticmethod
    def update_account_type(item_id: int, new_account_type: str):
        """This function updates the account type in the database"""
        
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(AccountType).where(AccountType.id == item_id)
                result = session.exec(statement).one_or_none()
                
                if result:
                    # Update the record's account_type
                    result.account_type = new_account_type
                    
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