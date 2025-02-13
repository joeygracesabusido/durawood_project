from sqlmodel import Field, Session,  create_engine,select,func,funcfilter,within_group,Relationship,Index

from apps.models.accounting.journal_entry import JournalEntry
from apps.models.accounting.account_type import AccountType
from apps.models.accounting.chart_of_account import ChartofAccount
from apps.database.databases import connectionDB
from typing import Optional, List, Dict
from datetime import date, datetime

from sqlalchemy import desc
from sqlalchemy.sql import func


from apps.base_model.journal_entry_bm import JournalEntryBM

engine = connectionDB.conn()


class JournalEntryViews(): # this class is for Type of Account

    @staticmethod
    def insert_journal_entry(**kwargs): # this is for inserting type of Account 
        
        

        # Create an instance of JournalEntry using ** unpacking
        insertData = JournalEntry(**kwargs)
        

        session = Session(engine)

        session.add(insertData)
        
        session.commit()

        session.close()

    @staticmethod
    def get_journal_entry(): # this function is to get a list of type of account
        with Session(engine) as session:
            try:
                statement = select(JournalEntry)

               
                            
                results = session.exec(statement) 

                data = results.all()
                
                return data
            except :
                return None
            
    @staticmethod
    def get_journal_entry_by_journal_type(journal_type):
        with Session(engine) as session:
            try:
                statement = select(JournalEntry).where(JournalEntry.journal_type == journal_type).order_by(desc(JournalEntry.reference))
                latest_entry = session.exec(statement).first()

                if latest_entry:
                    return latest_entry
                return None
            except Exception as e:
                print(f"An error occurred: {e}")
                return None
            
    @staticmethod
    def get_journal_entry_by_ref(reference):
        with Session(engine) as session:
            try:
                statement = select(JournalEntry).where(JournalEntry.reference.like(f'%{reference}%'))
                data = session.exec(statement).all()

                if data:
                    return data
                return None
            except Exception as e:
                print(f"An error occurred: {e}")
                return None
            
    @staticmethod
    def delete_journal_entry_by_ref(reference):
        with Session(engine) as session:
            try:
                # Query to find the entries matching the reference
                statement = select(JournalEntry).where(JournalEntry.reference.like(f'%{reference}%'))
                entries_to_delete = session.exec(statement).all()

                if entries_to_delete:
                    # Delete the found entries
                    for entry in entries_to_delete:
                        session.delete(entry)
                    session.commit()
                    return True  # Return True if deletion was successful
                return False  # Return False if no entries were found to delete
            except Exception as e:
                print(f"An error occurred: {e}")
                return False

    @staticmethod
    def get_journal_entry_by_journal_trialbal(datefrom: Optional[str] = None, dateto: Optional[str]=None) -> List[Dict]:
        with Session(engine) as session:
            try:
                # Start building the SQL statement
                statement = select(
                    ChartofAccount.chart_of_account,
                    func.sum(JournalEntry.debit).label("debit"),
                    func.sum(JournalEntry.credit).label("credit"),
                ).join(
                    JournalEntry,
                    ChartofAccount.id == JournalEntry.account_code_id
                )

                # Add date filtering if provided
                if datefrom and dateto:
                    statement = statement.where(
                        JournalEntry.transdate.between(datefrom, dateto)
                    ).group_by(ChartofAccount.id).order_by(ChartofAccount.chart_of_account_code)

                # Group by ChartofAccount.id
                statement = statement.group_by(ChartofAccount.id).order_by(ChartofAccount.chart_of_account_code)


                # Execute the statement and fetch all results
                results = session.execute(statement)
                data = results.fetchall()

                # Convert results to list of dictionaries with positive debit/credit balance
                data_as_dict = []
                for row in data:
                    debit = row.debit or 0
                    credit = row.credit or 0
                    balance = debit - credit  # Calculate the balance

                    # Assign to debit or credit based on balance
                    if balance > 0:
                        entry = {"chart_of_account": row.chart_of_account, "debit": balance, "credit": 0}
                    else:
                        entry = {"chart_of_account": row.chart_of_account, "debit": 0, "credit": abs(balance)}

                    data_as_dict.append(entry)

                return data_as_dict

            except Exception as e:
                print(f"An error occurred: {e}")
                return []
            


    @staticmethod
    def get_journal_entry_by_balance_sheet_report(datefrom: Optional[str] = None, 
                                              dateto: Optional[str] = None) -> List[Dict]:
        with Session(engine) as session:
            try:
                # Start building the SQL statement
                statement = select(
                    ChartofAccount.chart_of_account,
                    func.sum(JournalEntry.debit).label("debit"),
                    func.sum(JournalEntry.credit).label("credit"),
                    AccountType.account_type.label("account_type")  # Select account_type
                ).join(
                    JournalEntry,
                    ChartofAccount.id == JournalEntry.account_code_id
                ).join(
                    AccountType,
                    ChartofAccount.accoun_type_id == AccountType.id
                )

                # Add date filtering if provided
                if datefrom and dateto:
                    statement = statement.where(
                        JournalEntry.transdate.between(datefrom, dateto)
                    )

                # Group by ChartofAccount.id and AccountType.account_type
                statement = statement.group_by(ChartofAccount.id, AccountType.account_type)\
                                    .order_by(ChartofAccount.chart_of_account_code)

                # Execute the statement and fetch all results
                results = session.execute(statement)
                data = results.fetchall()
                
                return data

            except Exception as e:
                print(f"Error fetching journal entry data: {e}")
                return []
            

    @staticmethod
    def get_income_statement(datefrom: Optional[str] = None, 
                                              dateto: Optional[str] = None) -> List[Dict]:
        with Session(engine) as session:
            try:
                # Start building the SQL statement
                statement = select(
                    ChartofAccount.chart_of_account,
                    func.sum(JournalEntry.debit).label("debit"),
                    func.sum(JournalEntry.credit).label("credit"),
                    AccountType.account_type.label("account_type")  # Select account_type
                ).join(
                    JournalEntry,
                    ChartofAccount.id == JournalEntry.account_code_id
                ).join(
                    AccountType,
                    ChartofAccount.accoun_type_id == AccountType.id
                )

				
                #add filter for specific account types
                specific_account_types = ["Sales", "Cost of Sales/Service", 
                                           "General and Administrative Expense"]
                statement = statement.where(
                    AccountType.account_type.in_(specific_account_types)
                )


                # Add date filtering if provided
                if datefrom and dateto:
                    statement = statement.where(
                        JournalEntry.transdate.between(datefrom, dateto)
                    )

                # Group by ChartofAccount.id and AccountType.account_type
                statement = statement.group_by(ChartofAccount.id, AccountType.account_type)\
                                    .order_by(ChartofAccount.chart_of_account_code)

                # Execute the statement and fetch all results
                results = session.execute(statement)
                data = results.fetchall()
                
                return data

            except Exception as e:
                print(f"Error fetching journal entry data: {e}")
                return []




            
    @staticmethod
    def get_journal_entry_by_one_table(datefrom: Optional[str] = None, 
                                       dateto: Optional[str]=None) -> List[Dict]:# this function is to query for payroll activity
        with Session(engine) as session:
            try:
                statement = select(JournalEntry,ChartofAccount,
                                   func.sum(JournalEntry.debit).label("debit"),
                    func.sum(JournalEntry.credit).label("credit")).where(
                    (JournalEntry.account_code_id == ChartofAccount.id) 
                )

                # Add date filtering if provided
                if datefrom and dateto:
                    statement = statement.where(
                        JournalEntry.transdate.between(datefrom, dateto)
                    )

                # Group by ChartofAccount.id
                statement = statement


                # Execute the statement and fetch all results
                results = session.execute(statement)
                data = results.fetchall()

                # Convert results to list of dictionaries with positive debit/credit balance
                data_as_dict = []
                for row in data:
                    debit = row.debit or 0
                    credit = row.credit or 0
                    balance = debit - credit  # Calculate the balance

                    # Assign to debit or credit based on balance
                    if balance > 0:
                        entry = {"chart_of_account": row.chart_of_account, "debit": balance, "credit": 0}
                    else:
                        entry = {"chart_of_account": row.chart_of_account, "debit": 0, "credit": abs(balance)}

                    data_as_dict.append(entry)

                return data_as_dict

            except Exception as e:
                print(f"An error occurred: {e}")
                return []


    @staticmethod
    def insert_journal_entry2(transdate, journal_type, reference, 
                             chart_of_account, account_code_id, chart_of_account_code, 
                             debit, credit, branch_id, description, user):
        try:
            # Create a new journal entry instance (adjust according to your ORM)
            new_entry = JournalEntry(
                
                transdate=transdate,
                journal_type=journal_type,
                reference=reference,
                chart_of_account=chart_of_account,
                account_code_id=account_code_id,
                chart_of_account_code=chart_of_account_code,
                debit=debit,
                credit=credit,
                branch_id=branch_id,
                description=description,
                user = user
            )

            # Insert into the database (make sure you're using your ORM's add method)
            session = Session(engine)

            session.add(new_entry)
            
            session.commit()

            session.close()

            return new_entry  # Return the newly inserted entry

        except Exception as e:
            session.rollback()  # Rollback on error to avoid partial insertions
            # raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
