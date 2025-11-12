#!/usr/bin/env python3
"""Test script to verify autocomplete data and API endpoint"""

import sys
sys.path.insert(0, '/home/jerome-sabusido/Desktop/Project/durawood_project')

from apps.database.databases import mydb

def test_database_connection():
    """Test database connection and data availability"""
    print("=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)
    
    try:
        # Test basic connection
        collections = mydb.list_collection_names()
        print(f"✓ Database connected. Collections: {collections}")
        
        # Check expenses collection
        print("\n--- EXPENSES COLLECTION ---")
        expenses_count = mydb.expenses.count_documents({})
        print(f"Total expenses: {expenses_count}")
        
        if expenses_count > 0:
            # Get sample expenses with vendor field
            sample_expenses = mydb.expenses.find({"vendor": {"$exists": True, "$ne": None}}, {"vendor": 1}).limit(5)
            vendors = []
            for exp in sample_expenses:
                if 'vendor' in exp and exp['vendor']:
                    vendors.append(exp['vendor'])
            print(f"Sample vendors: {vendors}")
            
            # Get all distinct vendors
            all_vendors = mydb.expenses.distinct("vendor")
            print(f"Distinct vendors count: {len(all_vendors)}")
            print(f"Vendors: {all_vendors[:10]}")  # Show first 10
        
        # Check customer_profile collection
        print("\n--- CUSTOMER_PROFILE COLLECTION ---")
        customer_count = mydb.customer_profile.count_documents({})
        print(f"Total customer profiles: {customer_count}")
        
        if customer_count > 0:
            # Get sample customers
            sample_customers = mydb.customer_profile.find({"customer": {"$exists": True, "$ne": None}}, {"customer": 1}).limit(5)
            customers = []
            for cust in sample_customers:
                if 'customer' in cust and cust['customer']:
                    customers.append(cust['customer'])
            print(f"Sample customers: {customers}")
        
        print("\n" + "=" * 60)
        if expenses_count == 0 and customer_count == 0:
            print("⚠ WARNING: No data found in either collection!")
            print("Autocomplete will have nothing to suggest.")
            print("Add some expenses or customers to test autocomplete.")
        else:
            print("✓ Data is available for autocomplete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database_connection()
