from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.chart_of_account import ChartofAccount
from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime




from apps.base_model.chart_of_account_bm import ChartofAccountBM
from apps.models.accounting.account_type import AccountType

engine = connectionDB.conn()




class ChartofAccountViews(): # this class is for Type of Account

    @staticmethod
    def insert_chart_of_account(item: ChartofAccountBM,username: str): # this is for inserting type of Account 
        
         # Create a dictionary from the item
        item_data = item.dict()  # Assuming item is a Pydantic model
        item_data['user'] = username  # Insert the username
        
        # Create an instance of AccountType using ** unpacking
        insertData = ChartofAccount(**item_data)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def get_chart_of_account(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(ChartofAccount).order_by(ChartofAccount.chart_of_account_code)

             
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            

    @staticmethod
    def get_chart_of_account_join(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(ChartofAccount,AccountType).where \
                (ChartofAccount.accoun_type_id == AccountType.id).order_by(ChartofAccount.chart_of_account_code)    
                results = session.exec(statement) 

                data = results.all()
                
                return data

              
                
                
            except :
                return None
            
    @staticmethod
    def update_chart_of_account(id,accoun_type_id,chart_of_account,
                               chart_of_account_code,description,date_updated,user):
        """This function updates the account type in the database"""
        
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(ChartofAccount).where(ChartofAccount.id == id)
                result = session.exec(statement).one_or_none()
                
                if result:
                    # Update the record's account_type
                    result.accoun_type_id = accoun_type_id
                    result.chart_of_account = chart_of_account
                    result.chart_of_account_code = chart_of_account_code
                    result.description = description
                    result.date_updated = date_updated
                    result.user = user
                    
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