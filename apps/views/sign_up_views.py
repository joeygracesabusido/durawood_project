from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.company_profile import CompanyProfile
from apps.models.user import User
from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime

from sqlalchemy import and_


from apps.base_model.user_bm import UserBM

engine = connectionDB.conn()


class UserViews(): # this class is for User

    @staticmethod
    def insert_user(item: UserBM, hashed_password: str): # this is for inserting User
        
         # Create a dictionary from the item
        item_data = item.dict()  # Assuming item is a Pydantic model
        item_data['hashed_password'] = hashed_password
        # Create an instance of AccountType using ** unpacking
        insertData = User(**item_data)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def get_user(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(User)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            
    @staticmethod
    def get_user_for_login(username: str):
        """This function retrieves a list of active users based on the username."""
        with Session(engine) as session:
            try:
                # Use and_ from SQLAlchemy to combine multiple conditions
                statement = select(User).where(
                    and_(User.username == username, User.is_active == True)
                )

                results = session.exec(statement)
                data = results.one()
                
                return data
            except Exception as e:
                print(f"An error occurred: {e}")
                return None
    
    @staticmethod
    def get_user_details(username: str):
        """This function retrieves a list of active users based on the username."""
        with Session(engine) as session:
            try:
                # Use and_ from SQLAlchemy to combine multiple conditions
                statement = select(User.full_name, User.role).where(
                    and_(User.username == username, User.is_active == True)
                )

                statement2 = select(CompanyProfile)        
                results2 = session.exec(statement2).one()

                

                results = session.exec(statement).one()
                data = {'full_name':results.full_name, 'role':results.role.value, 'company_name': results2.company_name}
                
                return data
            except Exception as e:
                print(f"An error occurred: {e}")
                return None
            
    @staticmethod
    def update_user(username: str, is_active: bool):
        """This function updates the account type in the database"""
        
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(User).where(User.username == username)
                result = session.exec(statement).one_or_none()
                
                if result:
                    # Update the record's account_type
                    result.is_active = is_active
                    
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