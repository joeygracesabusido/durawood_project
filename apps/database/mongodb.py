from pymongo import MongoClient
import pymongo




#def create_mongo_client():
#    var_url = f"mongodb+srv://joeysabusido:genesis11@cluster0.r76lv.mongodb.net/admin_apps_dgc?retryWrites=true&w=majority"
#    client = MongoClient(var_url, maxPoolSize=None)
 #   conn = client['admin_apps_dgc']

# return conn


def create_mongo_client():
    import os
    var_url = os.getenv(
        "MONGO_URL",
        f"mongodb+srv://joeysabusido:genesis11@cluster0.r76lv.mongodb.net/admin_apps_dgc?retryWrites=true&w=majority",
    )  # shortcut: default keeps local dev running; set MONGO_URL in prod and rotate the password
    client = MongoClient(var_url, maxPoolSize=None)
    conn = client['durawood_project']

    return conn


# server database of MongoDB
# def create_mongo_client():
#     var_url = "mongodb://root:Genesis11@192.46.225.247:27017/durawood_project?authSource=admin"
#     client = MongoClient(var_url, maxPoolSize=None)
#     conn = client['durawood_project']

#     return conn
