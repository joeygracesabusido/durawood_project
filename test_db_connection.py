
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

def test_mongo_connection():
    var_url = "mongodb://root:Genesis11@192.46.225.247:27017/durawood_project?authSource=admin"
    try:
        client = MongoClient(var_url, serverSelectionTimeoutMS=5000)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("MongoDB connection successful.")
        conn = client['durawood_project']
        print(f"Collections in durawood_project: {conn.list_collection_names()}")
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_mongo_connection()
