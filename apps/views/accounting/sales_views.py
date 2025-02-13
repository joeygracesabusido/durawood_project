from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.sales import Sales
from apps.models.accounting.journal_entry import JournalEntry
from apps.models.accounting.customer_profile import CustomerProfile
from apps.models.accounting.branch import Branch
from apps.models.accounting.chart_of_account import ChartofAccount

from apps.database.databases import connectionDB
from typing import Optional
from datetime import date, datetime

from sqlalchemy import and_


from apps.base_model.sales_bm import SalesBM

engine = connectionDB.conn()




class SalesViews(): # this class is for Customer

    @staticmethod
    def insert_sales(**kwargs):  # Accepts kwargs for JournalEntry
        session = Session(engine)

        try:
            # Create an instance of JournalEntry using **kwargs
            insertJournal = JournalEntry(**kwargs)

            # Add and commit the JournalEntry to get its ID
            session.add(insertJournal)
            session.commit()

            # Optionally refresh the session to get the generated ID
            session.refresh(insertJournal)

            # Return the JournalEntry object (or its ID)
            return {"journal_entry": insertJournal, "journal_entry_id": insertJournal.id,"user":insertJournal.user}

        except Exception as e:
            session.rollback()  # Rollback on error
            raise e  # Optionally raise an error or handle it as needed

        finally:
            session.close()  # Always close the session


    @staticmethod
    def insert_sales_from_journal(customer_id,**kwargs):  # Accepts kwargs for JournalEntry
        session = Session(engine)
        
        try:
          
            result = SalesViews.insert_sales(**kwargs)
            
            # Access the journal entry ID from the result
            journal_entry_id = result['journal_entry_id']
            user_name = result['user']
            
            
            print(f"Inserted Journal Entry ID: {journal_entry_id}")
           

            insertData = Sales(
                journal_entry_code_id=journal_entry_id,
                customer_profile_id=customer_id,
                user=user_name
            )

            session.add(insertData)
            session.commit()

        except Exception as e:
            session.rollback()
            raise e  # Optionally handle the error as needed
        finally:
            session.close()
    @staticmethod
    def sales_list(): # this function is to get a list of Sales
        with Session(engine) as session:
            try:
                statement = select(Sales)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
    
    def sales_report_slsp():
        with Session(engine) as session:
            try:
                # Adjust the query to join JournalEntry and Sales properly
                statement = select(JournalEntry, Sales,Branch, ChartofAccount, CustomerProfile) \
                    .join(Sales, Sales.journal_entry_code_id == JournalEntry.id) \
                    .join(Branch, JournalEntry.branch_id == Branch.id)\
                    .join(ChartofAccount,JournalEntry.account_code_id == ChartofAccount.id)\
                      .join(CustomerProfile, Sales.customer_profile_id == CustomerProfile.id)  # Correct the second join

                # Execute the query
                result = session.execute(statement).all()

               
                report = [
                    {
                        "date": journal.transdate,
                        "branch": branch.branch_name,
                        "reference": journal.reference,
                        "customer": customer.bussiness_name,
                        "tin": customer.tin,
                        "tax_type": customer.tax_type,
                        "chart_of_account": ChartofAccount.chart_of_account,
                        "description": journal.description,
                        "debit_amount": journal.debit,
                        "credit_amount": journal.credit
                    }
                    for journal, sales,branch,ChartofAccount, customer in result
                ]

                return report

            except Exception as e:
                # Return None or handle the error
                print(f"Error occurred: {e}")
                return None

   
    
    
            
    @staticmethod
    def update_sales(item: SalesBM,user:str,date_update:datetime):
      
        with Session(engine) as session:
            try:
                # Find the record to update
                statement = select(Sales).where(Sales.id == item.id)
                
                result = session.exec(statement).one_or_none()
                
                if result:
                    # Update the record's account_type
                   
                    result.journal_entry_code_id = item.journal_entry_code_id
                    result.customer_profile_id = item.customer_profile_id
                    result.user = user
                    result.date_updated = date_update
                    
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
